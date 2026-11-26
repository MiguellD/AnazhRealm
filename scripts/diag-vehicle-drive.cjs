// diag-vehicle-drive.cjs — DAS LAB-FAHRPROFIL FÜHRT: die drive-Reise Lab-Formel → Buch → Host-Profil, ohne zweiten
// Wahrheits-Satz und ohne zweiten Fahr-Pfad; A statisch und numerisch (Node), B im lebenden Draht (Browser, Foundry an,
// Null-Renderer). Jede Zeile trägt ihr Soll im Namen ihres Checks, der Selbst-Test je Verdikt einen Täter.
// Gefallen in w12-fahrzeug-decke (Zwillinge, die Messung lebt weiter): A1 (kein FAHR-Literal, kein carPhys in der Shell) steht
// in der Rückkehr-Wand gate:altlasten · A3 und B-b/H7 (GT ≠ Supersport) richtet gate:garage-labor G9 an der Fahrt: jede Gattung
// ihr Tempo · B-c die Emergenz war ein Literal-Zwilling von FAHR.hostEmergent, das Profil aus der Substanz misst der Playtest
// (gelaende-boden V18150Ride), die Absenz des Alt-Wagens der Playtest (werkstatt Rezept-Katalog c) · B-e das Fahr-Gefühl:
// Achse, v·ω und Schwimmwinkel am Kern gate:fahr-leben K9 (die Welt fährt ihn, S1 Labor = Welt; das Bild folgt der Gier,
// V18150Ride), der Rad-Kontakt Station R (p75 ≤ 0,03 m statt 0,12).
//   node scripts/diag-vehicle-drive.cjs [--selftest]
const {
    statikServer,
    hauptLauf,
    nullWelt,
    pruefer,
    wandEnde,
    selbsttestEnde,
    studioKern,
    ausDatei,
    fehlerText,
    SELBSTTEST,
    stammLib,
    ROOT,
    path,
} = require("./lib/welt-boot.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");
const { rasterDreieck } = require("./lib/kronen-linse.cjs");

const server = statikServer();

const { errs, check } = pruefer();

// ── DIE DIVERGENZ-LINSE: welche drive-Skalare weichen vom Soll ab? (===, byte) ──
const DRIVE_KEYS = ["topSpeedMul", "kAcc", "kBrake", "mass", "vmax"];
function driveDiverges(fp, expected) {
    const out = [];
    for (const k of DRIVE_KEYS) if (!fp || !Number.isFinite(fp[k]) || fp[k] !== expected[k]) out.push(k);
    if (!fp || !fp.spring || fp.spring.k !== expected.spring.k || fp.spring.c !== expected.spring.c) out.push("spring");
    return out;
}

// ── B2 — DAS FAHR-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test lesen sie —
// die Linse ist beweisbar nicht-vakuoes). Rueckgabe: Liste der Verstoesse (leer = gruen).
function driveVerdict(d) {
    const out = [];
    if (!d || d.spawned !== true) out.push("spawn");
    if (!d || d.mounted !== true) out.push("mount");
    if (!d || !(d.dist > 1)) out.push("dist<=1m"); // die stehende Probe: > 1 m nach N Fahr-Ticks
    // der Reiter auf dem Sitz (jeder Sim-Schritt, ±0,05 m: gate:fahr-leben `inDerLuft`) und nie gegen sein eigenes Gefährt (der
    // riddenId-Skip: Playtest V18150Ride `collisionRests`) — beide standen hier bis w12-fahrzeug-decke ein zweites Mal
    if (!d || !Number.isFinite(d.blockerMax) || d.blockerMax > 8) out.push("blocker");
    if (!d || d.flatFoundry !== true || d.flatBauplan !== true) out.push("flat"); // die EINE Flat-Quelle der Instanz
    if (!d || !(d.snapDist > 1)) out.push("persist"); // der Snapshot traegt die Fahrt
    // DONOR-ABSCHIED: Sitz == exportDrive.sitz-Formel UND != Wagen-Donor-
    // Anker; Blocker-Huelle == exportDrive.huelle-Laenge (> 3 m — die 2.1-m-Donor-
    // Box KANN das nicht liefern). Beide beweisen KONSUM des Kerns + ABSENZ des Donors.
    if (!d || d.sitzKern !== true) out.push("sitzKern");
    if (!d || d.huelleKern !== true) out.push("huelleKern");
    return out;
}

// ── B-f (W5) — DAS STAND-VERDIKT: ein geparkter Wagen steht auf der Ebene seiner vier Räder (`_fahrzeugStand`), gemessen
// an der GERENDERTEN Matrix (`_archEntryWorldMatrix`) gegen das Boden-Gesetz: spalt ≤ 0,12 m (der größte |Rad-Spalt|
// über alle Hang-Proben), proben ≥ 4 (längs UND quer geparkt, sonst leer).
const STAND = { spaltM: 0.12, probenMin: 4 };
function standVerdict(s) {
    const out = [];
    if (!s || !(s.proben >= STAND.probenMin)) return [`proben ${(s?.proben) || 0}`];
    if (!(s.spaltM <= STAND.spaltM)) out.push(`spalt ${(s.spaltM || 0).toFixed(3)} m`);
    return out;
}

// ── B-g (mensch-zahlen, Karte 2 mensch.fahrzeug.form#1) — DAS FORM-VERDIKT: derselbe GT nach Rezept und mit schwerem Stempel
// (Radstand, Spur, Dach am oberen Rand), gelesen am Fahr-Satz des Ritts (`_fahrSatz`: was der Fahr-Schritt fährt). Der Stempel
// baut die Form, nie den Motor (vehicle-core carPhys `motor`): die Leistung [W] = aLeist × Masse bleibt die des Rezepts. Befund
// 22.11. (GTX 1050, Wiese): Masse × 1,896, Leistung × 1,896 — jede Form zog gleich, Tempo nach 6 s Vollgas × 1,0009.
function formVerdict(f) {
    if (!f || !(f.masseQ > 1.05)) return [`der Stempel wiegt nicht (Masse × ${f && f.masseQ})`];
    return Math.abs(f.wattQ - 1) < 1e-9 ? [] : [`der Stempel baut einen anderen Motor ein (Leistung × ${f.wattQ.toFixed(4)} bei Masse × ${f.masseQ.toFixed(4)})`];
}

// ── B-i DIE SCHEIBE (fahrzeug-gestalt#1): das Glas des Wagens liest das EINE Gesetz der Scheibe (welt-licht `scheibe`, wie das
// Fenster der Häuser) — Fresnel nach Schlick mit dem F₀ der Zeile glas der schmiede (n → F₀ ≈ 0,04 je Fläche), der Spiegel der
// Welt steht voll im Bild, der Körper nach der Deckkraft. Am Kopf von main trug das Wagenglas KEIN Gesetz (Deckkraft 0,42 als
// Spiegel-Anteil, ausgeglichen mit Klarlack und Umgebung × 3): ROT „Scheiben ohne Gesetz“. Eine eigene Zahl (F₀ ≠ Zeile) und
// ein F₀, der der Zeile nicht folgt (die Zeile mit halber Brechkraft lässt ihn stehen), heißen je beim Namen.
function scheibeVerdict(s) {
    if (!s || !(s.durch > 0)) return [`der gestellte Wagen zeichnet keine Scheibe (durchsichtige Stoffe: ${s && s.durch})`];
    const out = [];
    if (s.mit < s.durch) out.push(`Scheiben ohne Gesetz: ${s.durch - s.mit} von ${s.durch} (die Deckkraft trägt den Spiegel)`);
    if (!(s.abw < 1e-4)) out.push(`das F₀ der Scheibe ist eine eigene Zahl (Abstand zur Zeile glas ${s.abw})`);
    if (s.folgt !== true) out.push("das F₀ folgt der Zeile glas nicht (die halbe Brechkraft lässt es stehen)");
    return out;
}

// ── B-j DER REIFEN UNTER SEINER LAST (fahrzeug-gestalt#1): der Reifen des gestellten Wagens (die Rad-Blätter bis an den Umfang)
// rollt nicht mit der Felge (sein Aufstand bliebe sonst nicht unten), liegt unter der Nabe als Sehne auf der Ebene der Vorlage
// (≥ 2 cm breit: eine Fläche, keine Kante) und steht um dz = W / kz frei — W die Last des Fahr-Satzes, mit der das Rad im
// Boden einsinkt. Am Kopf von main rollte der Reifen mit, stand kreisrund auf EINER Ecke und federte nicht (dz 0 statt 12,7 mm).
function reifenVerdict(t) {
    if (!t || !(t.blaetter > 0)) return [`der gestellte Wagen zeichnet keinen Reifen (Rad-Blätter am Umfang: ${t && t.blaetter})`];
    const out = [];
    if (t.rollt > 0) out.push(`der Reifen rollt mit der Felge (${t.rollt} von ${t.blaetter} Blättern — sein Aufstand wandert)`);
    if (!(t.sehne >= 0.02)) out.push(`der Reifen steht auf einer Kante statt auf einer Fläche (Sehne ${t.sehne} m)`);
    if (!(Math.abs(t.aufstand) < 1e-3)) out.push(`der Aufstand liegt neben der Ebene der Räder (${t.aufstand} m)`);
    if (!(Math.abs(t.dzMesh - t.dzGesetz) <= 5e-4 + 0.03 * t.dzGesetz))
        out.push(`der Reifen federt nicht nach seiner Last (frei ${t.dzMesh} m, Gesetz W / kz ${t.dzGesetz} m)`);
    return out;
}

// ── A6 DIE REIBELLIPSE JE ACHSE (fahrzeug.K1, w28-reibellipse), am Kern je Rezept. Im Bogen (20 m/s, Einschlag 0,25, 1,5 s ohne
// Gas) voll gebremst und in der Kehre unter Handbremse (15 m/s, Einschlag 0,6, 1 s) tragen die Reifen höchstens μ·g (der
// Rollwiderstand liegt außerhalb des Reifens: abgezogen). DIE HANDBREMSE sperrt nur das Heck: ihr Zug über dem Ausrollen
// (geradeaus aus 20 m/s, 0,25 s) liegt im Band des Gesetzes der gesperrten Hinterachse — höchstens μ·g·b/L (das Heck trägt
// beim Bremsen weniger als am Stand), mindestens die Hälfte davon (sie greift). Am Kopf von main (ee5c80d4, der EINE Kreis des
// Wagens aus vorrat5-bremsweg) zog sie 0,88–0,90 μ·g — so stark wie die Vollbremsung, am Deckel beider Achsen — und in der
// Kehre trugen die Reifen 1,013–1,023 μ·g. Geradeaus 25 → 0 m/s bremst er wie vorher: der Weg am Mitschnitt von main ±1 %.
const ELLIPSE = { bogen: 1.01, weg: 0.01, hand: [0.5, 1] };
const ELLIPSE_WEG_VORHER = { gt: 31.27, supersport: 36.74, limousine: 31.27, kompakt_fwd: 31.27, suv: 31.27 };
function ellipseMessung(VC) {
    const dt = 1 / 60;
    const m = {};
    const r3 = (x) => Math.round(x * 1000) / 1000;
    for (const pid of Object.keys(VC.PRESETS)) {
        const G = VC.fahrGesetz(VC.exportDrive({ ...VC.DEFAULT_P, ...VC.presetPatch(pid) }));
        const mug = G.maxGrip * G.grip * G.g;
        const fahr = (v, e, n, je) => {
            const z = Object.assign(VC.fahrZustand(0, 0, 0), { vlong: v });
            for (let i = 0; i < n && Math.hypot(z.vlong, z.vlat) > 3; i++) {
                VC.fahrKraefte(z, e(i), G, dt);
                if (je) je(z, i);
            }
            return z;
        };
        let bogen = 0;
        const reifen = (z) => (bogen = Math.max(bogen, Math.hypot(z.aLong + G.reibung, z.aLat) / mug));
        fahr(20, (i) => (i < 90 ? { steer: 0.25 } : { steer: 0.25, brake: 1 }), 150, (z, i) => i >= 90 && reifen(z));
        fahr(15, () => ({ steer: 0.6, hand: true }), 60, reifen);
        const zug = (hand) => (20 - fahr(20, () => ({ hand }), 15).vlong) / (15 * dt);
        const hand = (zug(true) - zug(false)) / (mug * (G.b / G.L));
        const z = Object.assign(VC.fahrZustand(0, 0, 0), { vlong: 25 });
        for (let n = 0; z.vlong > 0.05 && n < 2000; n++) VC.fahrKraefte(z, { brake: 1 }, G, dt);
        m[pid] = { bogen: r3(bogen), hand: r3(hand), weg: Math.round(Math.hypot(z.x, z.z) * 100) / 100 };
    }
    return m;
}
function ellipseVerdict(m) {
    const out = [];
    for (const [pid, w] of Object.entries(ELLIPSE_WEG_VORHER)) {
        const e = m && m[pid];
        if (!e) out.push(`${pid} fehlt`);
        else if (!(e.bogen <= ELLIPSE.bogen)) out.push(`${pid} bogen ${e.bogen} μ·g`);
        else if (!(e.hand >= ELLIPSE.hand[0] && e.hand <= ELLIPSE.hand[1])) out.push(`${pid} Handbremse ${e.hand} μ·g·b/L`);
        else if (!(Math.abs(e.weg / w - 1) <= ELLIPSE.weg)) out.push(`${pid} weg ${e.weg} m gegen ${w}`);
    }
    return out;
}

// ── A7/B-h DIE GATTUNGEN (fahrzeug-gattungen, Karte 2 mensch.fahrzeug.gestalt#1): welche Gattungen eine Stadt fährt, ist Gesetz
// des Fahrzeug-Kerns (vehicle-core `GATTUNGEN` · `flotte`). Gezählt wird, was in der Stadt des Messorts stadt-voll wirklich
// STEHT oder FÄHRT (die Wagen ihres Verkehrs, B-h) — nie, was der Kern kann; jede Stelle des Stamms mit eigener Typ-Liste (ein
// Feld nur aus Rezept-Namen, A7) heißt beim Namen. Bis fahrzeug-gattungen fuhr die Stadt aus der Tafel `VERKEHR.wagen`
// (Kleinwagen, Limousine, SUV): 3 Gattungen.
const GATTUNG = { min: 5 };
function gattungVerdict(g) {
    const out = [];
    if (!g || !(g.kern >= GATTUNG.min)) out.push(`der Kern trägt ${g && g.kern} Gattungen (Soll ≥ ${GATTUNG.min})`);
    if (g && g.stadt != null && !(g.stadt >= GATTUNG.min)) out.push(`die Stadt fährt ${g.stadt} Gattungen (Soll ≥ ${GATTUNG.min})`);
    for (const t of (g && g.tafeln) || []) out.push(`eigene Typ-Liste ${t}`);
    return out;
}
// die Felder aus lauter Rezept-Namen (≥ 2) je Datei und Zeile: `quellen` { datei: text }, `ids` die Gattungen des Kerns
function typTafeln(quellen, ids) {
    const kenn = new Set(ids);
    const out = [];
    for (const [datei, t] of Object.entries(quellen))
        for (const m of t.matchAll(/\[\s*(?:"[\w-]+"\s*,\s*)+"[\w-]+"\s*,?\s*\]/g)) {
            const namen = [...m[0].matchAll(/"([\w-]+)"/g)].map((x) => x[1]);
            if (namen.length >= 2 && namen.every((n) => kenn.has(n)))
                out.push(`${datei}:${t.slice(0, m.index).split("\n").length} ${m[0].replace(/\s+/g, " ")}`);
        }
    return out;
}
function stammQuellen() {
    const fs = require("fs");
    const dir = path.join(ROOT, "stamm");
    return Object.fromEntries(
        fs.readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => ["stamm/" + f, fs.readFileSync(path.join(dir, f), "utf8")])
    );
}
// ── A7 DER UMRISS DER GATTUNG (fahrzeug-gattungen): zwei Gattungen, die das Auge als EINEN Wagen liest, sind eine. Gemessen am
// Bau des Kerns (`buildInstance`, die feine Stufe — derselbe Bau, den die Welt zeichnet): der Seitenriss je Gattung als Raster
// {leer, Karosse, Glas} auf 2 cm; zwei Risse liegen am Boden und an EINEM Ende (Bug, dann Heck) aufeinander, die Abweichung
// ist der Anteil der belegten Zellen mit verschiedener Klasse — an dem Ende, an dem sie größer ist. Unter `UMRISS.zwilling`
// liest das Paar als ein Wagen. Der Täter: der Transporter des WIP (vier Türen, Glas rundum, Dach 1,75) wich vom SUV 0,288 ab —
// im Bild der Wiese ein zweiter SUV; die engsten Paare der fünf alten Gattungen stehen bei 0,327 (GT · Supersport) und 0,368
// (GT · Limousine), der Kasten (`kasten`, Dach 2,0) bei 0,570. Gezählt werden die LESBAREN Gattungen (Zwillinge fallen in eine).
// DIE ZWEI SEITEN (derselbe Riss von der Gegenseite, auf demselben Gitter): ein Wagen liest von links wie von rechts. Blech zeigt
// EINE Seite (der Renderer zeichnet es nicht, wo es vom Auge wegblickt), Glas beide — ein Feld, das als Glas gebaut war und
// Blech trägt, steht an einer Wagenseite als LOCH. Der Täter: die Wand des Kastens als EINE Fläche (4 957 von 21 244 Zellen
// verschieden, 23 %; im Bild der Wiese von der Gegenseite ein offenes Gerippe); die fünf alten Gattungen weichen ≤ `UMRISS.seite` ab.
const UMRISS = { px: 0.02, zwilling: 0.3, seite: 0.02 };
const UMRISS_MUTANTE = { tueren: 4, kasten: false, dach: 1.75, guertel: 0.95, radstand: 3.2, ueberhangV: 0.6, ueberhangH: 0.78 };
function seitenRiss(K, id, ov, gegen) {
    const T3 = global.THREE;
    const g = K.buildInstance(id, 7, 0, ov);
    g.updateMatrixWorld(true);
    const tris = [];
    const v = new T3.Vector3();
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
    g.traverse((o) => {
        if (!o.isMesh) return;
        const pos = o.geometry.attributes.position, idx = o.geometry.index;
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        const kl = m.transparent && m.opacity < 0.6 ? 2 : 1; // 2 = Glas, 1 = Karosse (Blech, Rad, Anbau)
        const P = [];
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            P.push([v.x, v.y, v.z]);
            u0 = Math.min(u0, v.x), u1 = Math.max(u1, v.x), v0 = Math.min(v0, v.y), v1 = Math.max(v1, v.y);
        }
        const n = idx ? idx.count : pos.count;
        for (let i = 0; i < n; i += 3) tris.push([P[idx ? idx.getX(i) : i], P[idx ? idx.getX(i + 1) : i + 1], P[idx ? idx.getX(i + 2) : i + 2], kl, m.side === T3.FrontSide]);
    });
    const px = UMRISS.px, W = Math.ceil((u1 - u0) / px) + 1, H = Math.ceil((v1 - v0) / px) + 1;
    const kl = new Uint8Array(W * H), tief = new Float32Array(W * H).fill(-Infinity);
    const s = gegen ? -1 : 1; // das Auge steht auf +z (die rechte Wagenseite) oder, `gegen`, auf −z — dasselbe Gitter (x, y)
    const R = { u0, v0, r: px, nu: W, nv: H }; // das EINE Dreiecks-Raster (kronen-linse `rasterDreieck`), der Tiefen-Puffer wählt
    for (const [A, B, C, k, einseitig] of tris) {
        const fl = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
        if (einseitig && fl * s < 0) continue; // einseitiges Blech, das vom Auge wegblickt, zeichnet niemand
        rasterDreieck(A[0], A[1], B[0], B[1], C[0], C[1], R, (o, w0, w1, w2) => {
            const t = s * (w0 * A[2] + w1 * B[2] + w2 * C[2]); // die Fläche am nächsten zum Auge gewinnt
            if (t > tief[o]) (tief[o] = t), (kl[o] = k);
        }, 1e-6);
    }
    return { W, H, kl, glas: kl.reduce((s, k) => s + (k === 2), 0), belegt: kl.reduce((s, k) => s + (k > 0), 0) };
}
function rissAbweichung(a, b) {
    let schlimm = 0;
    for (const amBug of [true, false]) {
        const da = amBug ? a.W : 0, db = amBug ? b.W : 0; // der Bug ist der rechte Rand des Risses (+x), das Heck der linke
        let versch = 0, belegt = 0;
        for (let y = 0; y < Math.max(a.H, b.H); y++)
            for (let x = Math.min(-da, -db); x < Math.max(a.W - da, b.W - db); x++) {
                const xa = x + da, xb = x + db;
                const ka = xa >= 0 && xa < a.W && y < a.H ? a.kl[y * a.W + xa] : 0;
                const kb = xb >= 0 && xb < b.W && y < b.H ? b.kl[y * b.W + xb] : 0;
                if (ka || kb) belegt++, (versch += ka !== kb);
            }
        schlimm = Math.max(schlimm, belegt ? versch / belegt : 0);
    }
    return schlimm;
}
// der Anteil der belegten Zellen, die von der einen Seite anders lesen als von der anderen (dasselbe Gitter)
function seitenAbweichung(a, b) {
    let versch = 0, belegt = 0;
    for (let i = 0; i < a.kl.length; i++) if (a.kl[i] || b.kl[i]) belegt++, (versch += a.kl[i] !== b.kl[i]);
    return a.kl.length === b.kl.length && belegt ? versch / belegt : NaN;
}
// die Zwillinge beim Namen und die Zahl der lesbaren Gattungen: `paare` [{ a, b, abw }] über alle Paare von `namen`;
// `seiten` { id: Anteil } — jede Gattung liest von beiden Seiten gleich
function umrissVerdict(namen, paare, seiten) {
    const out = [];
    for (const n of namen) {
        const a = seiten && seiten[n];
        if (!Number.isFinite(a)) out.push(`die Seiten von ${n} sind ungemessen`);
        else if (a > UMRISS.seite) out.push(`LOCH: ${n} liest von links anders als von rechts (${(100 * a).toFixed(1)} % der Zellen, Soll ≤ ${100 * UMRISS.seite} %)`);
    }
    const haupt = Object.fromEntries(namen.map((n) => [n, n]));
    const wurzel = (n) => (haupt[n] === n ? n : (haupt[n] = wurzel(haupt[n])));
    if (paare.length !== (namen.length * (namen.length - 1)) / 2) out.push(`der Umriss maß ${paare.length} Paare von ${(namen.length * (namen.length - 1)) / 2}`);
    for (const p of paare) {
        if (!Number.isFinite(p.abw)) out.push(`der Umriss ${p.a} · ${p.b} ist ungemessen`);
        else if (p.abw < UMRISS.zwilling) {
            out.push(`ZWILLING: ${p.b} liest als ${p.a} (Abweichung des Seitenrisses ${p.abw.toFixed(3)}, Soll ≥ ${UMRISS.zwilling})`);
            haupt[wurzel(p.b)] = wurzel(p.a);
        }
    }
    const lesbar = new Set(namen.map(wurzel)).size;
    if (!(lesbar >= GATTUNG.min)) out.push(`der Kern trägt ${lesbar} lesbare Gattungen (Soll ≥ ${GATTUNG.min})`);
    return out;
}
function umrissMessen(K, ids, ovJe) {
    const risse = ids.map((id) => seitenRiss(K, id, ovJe && ovJe[id]));
    const seiten = Object.fromEntries(ids.map((id, i) => [id, seitenAbweichung(risse[i], seitenRiss(K, id, ovJe && ovJe[id], true))]));
    const paare = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) paare.push({ a: ids[i], b: ids[j], abw: rissAbweichung(risse[i], risse[j]) });
    return { risse, paare, seiten };
}

// ── A8 DAS GESETZ DER KABINE (fahrzeug-gattungen): der Gürtel bleibt `glasMin` unter dem Dach. Die Regler-Bänder sind je Art
// absolut (der Kasten weitete `guertel` bis 1,2 und `dach` bis 2,1) — erst ihre Beziehung trägt den Bau: bei Gürtel = Dach
// teilt die Kabine durch null (der GT am Rand 1,2: nicht-endliche Werte in den Puffern, gate:regler-wirkt nannte ihn als
// BRICHT), darüber stülpt sie sich um und baut endlich — den Umsturz sieht kein NaN-Zähler. Gemessen an jeder Gattung an
// jeder Ecke des Regler-Paars (die Ränder aus `PARAMS_BY_KIND`, dazu jeder Rand am Rezept-Maß des anderen): die Glas-Höhe des
// geformten P (Leser: `epocheForm`, der EINE Durchgang jedes Baus) und die Puffer des Baus (Leser: `buildInstance`).
const KABINE = { glasMin: 0.1, eps: 1e-9 };
function nichtEndlich(g) {
    let n = 0;
    if (!g) return NaN;
    g.traverse((o) => {
        if (!o.geometry) return;
        for (const k in o.geometry.attributes) for (const w of o.geometry.attributes[k].array) if (!Number.isFinite(w)) n++;
    });
    return n;
}
function kabineMessen(K) {
    const band = (id) => K.PARAMS_BY_KIND.vehicle.find((p) => p.id === id);
    const [G, D] = [band("guertel"), band("dach")];
    const faelle = [];
    for (const id of K.GATTUNGEN)
        for (const g of [null, G.min, G.max])
            for (const d of [null, D.min, D.max]) {
                if (g == null && d == null) continue;
                const ov = Object.assign({}, g != null && { guertel: g }, d != null && { dach: d });
                const P = K.epocheForm(Object.assign({}, K.DEFAULT_P, K.BASE_P, K.PRESETS[id].s, K.PRESETS[id].fx, ov));
                faelle.push({ id, ov, glas: P.dach - P.guertel, nan: nichtEndlich(K.buildInstance(id, 7, 1, ov)) });
            }
    return faelle;
}
function kabineVerdict(faelle, gattungen) {
    const rot = [];
    for (const f of faelle || []) {
        const wo = `${f.id} ${Object.entries(f.ov)
            .map(([k, v]) => `${k}=${v}`)
            .join(" ")}`;
        if (!(f.glas >= KABINE.glasMin - KABINE.eps)) rot.push(`KABINE: ${wo} — Glas-Höhe ${Number(f.glas).toFixed(3)} m (Soll ≥ ${KABINE.glasMin})`);
        if (!(f.nan === 0)) rot.push(`KABINE: ${wo} — der Bau trägt ${f.nan} nicht-endliche Werte`);
    }
    const soll = 8 * (gattungen || []).length;
    if (!soll || (faelle || []).length !== soll) rot.push(`das Gesetz der Kabine maß ${(faelle || []).length} Ecken von ${soll}`);
    return rot;
}

// ── A9 DIE URSACHE DES RUMPFS (fahrzeug-gattung): das Boot ist eine FUNKTION seines Wassers und seiner Last, kein Kasten. Gemessen
// am BAU (Leser: `buildInstance`, derselbe Bau, den der Wirt am Anleger stempelt), nie an der Zahl des Gesetzes: das Gewässer
// mit Hs 0,1 m (der See hinter dem Schilf) gegen Hs 0,5 m (die offene See) — der Rumpf wird höher (der Bord steht über der
// Welle) und trägt mehr Gänge (der Klinker: ≥ 3× die Ecken); die Last 200 gegen 400 kg — der Rumpf wird um ≥ 1 Ducht länger
// (der Kahn: 1,43 m Raum je Sitzendem, Keweloh 1995). Der Täter, den die Linse beim Namen nennt: ein Eingang, den der Rumpf
// nicht liest (die Gestalt bleibt dieselbe, wie immer das Wasser ist).
const RUMPF = { hoeher: 1.3, ecken: 3, laenger: 1.2 };
function rumpfMass(K, ov) {
    const g = K.buildInstance("boot", 7, 0, ov);
    const lo = [1e9, 1e9],
        hi = [-1e9, -1e9];
    let ecken = 0;
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.isMesh) return;
        const p = o.geometry.attributes.position,
            e = o.matrixWorld.elements;
        ecken += p.count;
        for (let i = 0; i < p.count; i++) {
            const [x, y, z] = [p.getX(i), p.getY(i), p.getZ(i)];
            const wx = e[0] * x + e[4] * y + e[8] * z + e[12],
                wy = e[1] * x + e[5] * y + e[9] * z + e[13];
            lo[0] = Math.min(lo[0], wx);
            hi[0] = Math.max(hi[0], wx);
            lo[1] = Math.min(lo[1], wy);
            hi[1] = Math.max(hi[1], wy);
        }
    });
    return { laenge: hi[0] - lo[0], hoehe: hi[1] - lo[1], ecken };
}
function rumpfMessen(K) {
    return { see: rumpfMass(K, { welle: 0.1, last: 200 }), offen: rumpfMass(K, { welle: 0.5, last: 200 }), schwer: rumpfMass(K, { welle: 0.1, last: 400 }) };
}
function rumpfVerdict(m) {
    const rot = [];
    if (!m || !m.see) return ["der Rumpf ist ungemessen"];
    if (!(m.offen.hoehe >= RUMPF.hoeher * m.see.hoehe))
        rot.push(`RUMPF: welle 0,1 → 0,5 m — die Höhe ${m.see.hoehe.toFixed(2)} → ${m.offen.hoehe.toFixed(2)} m (Soll ≥ ${RUMPF.hoeher}×: der Bord steht über der Welle)`);
    if (!(m.offen.ecken >= RUMPF.ecken * m.see.ecken))
        rot.push(`RUMPF: welle 0,1 → 0,5 m — ${m.see.ecken} → ${m.offen.ecken} Ecken (Soll ≥ ${RUMPF.ecken}×: die offene See verlangt Klinker-Gänge)`);
    if (!(m.schwer.laenge >= m.see.laenge + RUMPF.laenger))
        rot.push(`RUMPF: last 200 → 400 kg — die Länge ${m.see.laenge.toFixed(2)} → ${m.schwer.laenge.toFixed(2)} m (Soll + ${RUMPF.laenger} m: eine Ducht je Sitzendem)`);
    return rot;
}

// ── Kern in Node laden (die diag-vehicle-contract-Klasse: r128-UMD + require) ──
const VC = studioKern("vehicle-core.js", "__vehicleCore");
function expectedFor(presetId) {
    const p = VC.PRESETS[presetId];
    return VC.exportDrive(Object.assign({}, p.s, p.fx));
}

// ===== TEIL A: die statischen Absenzen (Node, kommentarfrei) — die Präsenzen (Kern-Export, Brücke, Steckplatz, die Bindung
// des Ritts an den Chokepoint, Kern-Sitz und Kern-Hülle) beweisen A2/A3 und der lebende Draht B-a … B-d =====
hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: ein verfaelschtes fahrprofil (Kriterium e) → die Divergenz-Linse MUSS feuern.
        const exp = expectedFor("gt");
        check("Selbst-Test 0: unverfaelscht == 0 Divergenzen", driveDiverges(expectedFor("gt"), exp).length === 0);
        const bad1 = Object.assign({}, exp, { topSpeedMul: exp.topSpeedMul * 1.07 });
        check("Selbst-Test 1: verfaelschtes topSpeedMul → Divergenz erkannt", driveDiverges(bad1, exp).length >= 1);
        const bad2 = Object.assign({}, exp, { kBrake: exp.kAcc }); // kBrake auf kAcc gefaelscht (die Formel-Verwechslung)
        check("Selbst-Test 2: verfaelschtes kBrake → Divergenz erkannt", driveDiverges(bad2, exp).length >= 1);
        // V3–V7: jedes Verdikt schweigt am gesunden Stand und nennt je gebrochenem Wert EINEN Täter — die Fahr-Probe (B2: der Eintrag
        // bleibt stehen; DONOR: der Rückfall auf Donor-Sitz/-Hülle) und der STAND (B-f, W5: waagrecht am Hang, Rad 0,49 m frei;
        // keine Probe). Die Shell mit eigenem FAHR-Literal macht der Selbsttest von gate:altlasten rot (ein Token wie jeder).
        const fahrt = {
                spawned: true,
                mounted: true,
                dist: 14.4,
                blockerMax: 2.1,
                flatFoundry: true,
                flatBauplan: true,
                snapDist: 14.4,
                sitzKern: true,
                huelleKern: true,
            },
            stand = { proben: 6, spaltM: 0.05 };
        for (const [V, basis, ...brueche] of [
            [driveVerdict, fahrt, { dist: 0, snapDist: 0 }, { sitzKern: false }, { huelleKern: false }],
            [standVerdict, stand, { spaltM: 0.49 }, { proben: 0 }],
            [formVerdict, { masseQ: 1.8963, wattQ: 1 }, { wattQ: 1.8963 }, { masseQ: 1 }],
            [scheibeVerdict, { durch: 2, mit: 2, abw: 0, folgt: true }, { mit: 0 }, { abw: 0.0357 }, { folgt: false }, { durch: 0 }],
            [reifenVerdict, { blaetter: 2, rollt: 0, sehne: 0.11, aufstand: 0, dzMesh: 0.0127, dzGesetz: 0.0127 }, { rollt: 2 }, { sehne: 0 }, { aufstand: 0.0127 }, { dzMesh: 0 }, { blaetter: 0 }],
        ])
            for (const b of [{}, ...brueche]) {
                const v = V({ ...basis, ...b });
                check(`Selbst-Test ${V.name} ${JSON.stringify(b)}`, v.length === Object.keys(b).length, v.join(" · "));
            }
        // A6: die Reibellipse am Mitschnitt — gesund schweigt sie; die Kehre von main (GT 1,023 μ·g), die Handbremse am Deckel
        // beider Achsen (main 1,8 μ·g·b/L), eine Handbremse, die nie greift, und ein Bremsweg 3 % länger nennen je ihren Täter
        const ellipse = Object.fromEntries(Object.entries(ELLIPSE_WEG_VORHER).map(([p, w]) => [p, { bogen: 1, hand: 0.76, weg: w }]));
        for (const [b, n] of [
            [{}, 0],
            [{ gt: { bogen: 1.023, hand: 0.76, weg: 31.27 } }, 1],
            [{ limousine: { bogen: 1, hand: 1.8, weg: 31.27 } }, 1],
            [{ supersport: { bogen: 1, hand: 0, weg: 36.74 } }, 1],
            [{ suv: { bogen: 1, hand: 0.76, weg: 32.2 } }, 1],
        ]) {
            const v = ellipseVerdict({ ...ellipse, ...b });
            check(`Selbst-Test ellipseVerdict ${JSON.stringify(b)}`, v.length === n, v.join(" · "));
        }
        // A7/B-h: die Mutante „feste Liste mit 3 Typen“ (die Tafel von main) heißt beim Namen, eine Stadt mit 3 Gattungen und ein
        // Kern mit 3 sind ROT, ein Wort-Katalog mit Kulturen (kein reines Rezept-Feld) schweigt
        const tafel = typTafeln(
            {
                "stamm/mutante.js": 'AnazhRealm.VERKEHR = Object.freeze({\n    wagen: Object.freeze(["kompakt_fwd", "limousine", "suv"]),',
                "stamm/katalog.js": 'dsl: Object.freeze(["gt", "cavallo", "probefahrt"])',
            },
            VC.GATTUNGEN || []
        );
        check("Selbst-Test typTafeln: die feste Liste mit 3 Typen heißt beim Namen, der Wort-Katalog schweigt", tafel.length === 1 && /^stamm\/mutante\.js:2 /.test(tafel[0]), tafel.join(" · "));
        const gesund = { kern: 6, stadt: 6, tafeln: [] };
        for (const [b, n] of [
            [{}, 0],
            [{ stadt: 3 }, 1],
            [{ kern: 3 }, 1],
            [{ tafeln: tafel }, 1],
        ]) {
            const v = gattungVerdict({ ...gesund, ...b });
            check(`Selbst-Test gattungVerdict ${JSON.stringify(b)}`, v.length === n, v.join(" · "));
        }
        // A7 der Umriss: gesund schweigt er; ein Paar unter der Schwelle heißt beim Namen (zwei Paare kosten dazu die Zahl der
        // lesbaren Gattungen), ein ungemessenes und ein fehlendes Paar sind ROT (eine Sonde ohne Messung, Lehre 6)
        const namenU = ["a", "b", "c", "d", "e", "f"];
        const paareU = (b) => namenU.flatMap((x, i) => namenU.slice(i + 1).map((y) => ({ a: x, b: y, abw: b[x + y] ?? 0.5 })));
        const seitenU = (b) => Object.fromEntries(namenU.map((n) => [n, b[n] ?? 0.004]));
        for (const [b, n, wort] of [
            [{}, 0, null],
            [{ ef: 0.29 }, 1, /^ZWILLING: f liest als e /],
            [{ ef: 0.29, ab: 0.1 }, 3, /4 lesbare Gattungen/],
            [{ cd: NaN }, 1, /c · d ist ungemessen/],
            [{ c: 0.233 }, 1, /^LOCH: c liest von links anders als von rechts \(23\.3 %/],
            [{ d: NaN }, 1, /die Seiten von d sind ungemessen/],
        ]) {
            const v = umrissVerdict(namenU, paareU(b), seitenU(b));
            check(`Selbst-Test umrissVerdict ${JSON.stringify(b)}`, v.length === n && (!wort || v.some((z) => wort.test(z))), v.join(" · "));
        }
        const luecke = umrissVerdict(namenU, paareU({}).slice(1), seitenU({}));
        check("Selbst-Test umrissVerdict: ein fehlendes Paar ist ROT", luecke.length === 1 && /14 Paare von 15/.test(luecke[0]), luecke.join(" · "));
        const blind = umrissVerdict(namenU, paareU({}));
        check("Selbst-Test umrissVerdict: ohne die Messung der Seiten ist jede Gattung ROT", blind.length === namenU.length, blind.join(" · "));
        // die Mutante am ECHTEN Kern: der Transporter des WIP (vier Türen, Glas rundum, Dach 1,75) liest als SUV — und nur er
        const ids = VC.GATTUNGEN || [];
        const mutM = umrissMessen(VC, ids, { transporter: UMRISS_MUTANTE });
        const mut = umrissVerdict(ids, mutM.paare, mutM.seiten);
        check(
            "Selbst-Test Umriss am Kern: der Transporter mit Glas rundum heißt als Zwilling des SUV beim Namen",
            mut.length === 1 && /^ZWILLING: transporter liest als suv /.test(mut[0]),
            mut.join(" · ") || "die Mutante schweigt"
        );
        // die Mutante am ECHTEN Raster: ein Rumpf mit einer Blech-Wand je Seite — als EINE Fläche (beide Wände blicken nach +z) steht
        // sie an der Gegenseite als Loch; im Gegen-Umlauf (jede blickt nach aussen) lesen beide Seiten gleich
        const T3 = global.THREE;
        const blech = new T3.MeshBasicMaterial();
        const attrappe = (gegenUmlauf) => ({
            buildInstance: () => {
                const g = new T3.Group();
                const rumpf = new T3.Mesh(new T3.BoxGeometry(4, 0.6, 1.8), blech);
                rumpf.position.y = 0.5;
                g.add(rumpf);
                for (const sd of [-1, 1]) {
                    const wand = new T3.Mesh(new T3.PlaneGeometry(2, 0.8), blech);
                    wand.position.set(-0.8, 1.0, sd * 0.9);
                    if (gegenUmlauf && sd < 0) wand.rotation.y = Math.PI;
                    g.add(wand);
                }
                return g;
            },
        });
        const [loch, heil] = [false, true].map((u) => seitenAbweichung(seitenRiss(attrappe(u), "x"), seitenRiss(attrappe(u), "x", null, true)));
        check(
            "Selbst-Test die zwei Seiten am Raster: die Blech-Wand als EINE Fläche steht an einer Seite als Loch, im Gegen-Umlauf an keiner",
            loch > UMRISS.seite * 5 && heil === 0,
            `eine Fläche ${(100 * loch).toFixed(1)} % · Gegen-Umlauf ${(100 * heil).toFixed(1)} %`
        );
        // A8 das Gesetz der Kabine: gesund schweigt es; ein Fenster ohne Höhe, ein umgestülptes, ein Bau mit nicht-endlichen
        // Werten und eine ungemessene Ecke heißen beim Namen
        const eckenK = (b) => ["a", "b"].flatMap((id) => Array.from({ length: 8 }, (_, i) => ({ id, ov: { guertel: i }, glas: 0.4, nan: 0, ...(b[id + i] || {}) })));
        for (const [b, n, wort] of [
            [{}, 0, null],
            [{ a3: { glas: 0.02 } }, 1, /^KABINE: a guertel=3 — Glas-Höhe 0\.020 m/],
            [{ b5: { glas: -0.15 } }, 1, /^KABINE: b guertel=5 — Glas-Höhe -0\.150 m/],
            [{ a0: { glas: 0, nan: 7668 } }, 2, /der Bau trägt 7668 nicht-endliche Werte/],
            [{ b1: { nan: NaN } }, 1, /der Bau trägt NaN nicht-endliche Werte/],
        ]) {
            const v = kabineVerdict(eckenK(b), ["a", "b"]);
            check(`Selbst-Test kabineVerdict ${JSON.stringify(b)}`, v.length === n && (!wort || v.some((z) => wort.test(z))), v.join(" · "));
        }
        const eckeFehlt = kabineVerdict(eckenK({}).slice(1), ["a", "b"]);
        check("Selbst-Test kabineVerdict: eine ungemessene Ecke ist ROT", eckeFehlt.length === 1 && /15 Ecken von 16/.test(eckeFehlt[0]), eckeFehlt.join(" · "));
        // die Mutante am ECHTEN Kern (sein Text ohne das Gesetz, der EINE Lader `kernAusText`): der GT am Rand Gürtel 1,2 steht mit
        // nicht-endlichen Werten und ohne Glas-Höhe beim Namen, der Sportwagen mit dem Gürtel über dem Dach als umgestülpt
        const kernText = ausDatei("vehicle-core.js");
        const ankerK = "return kabineGesetz(gattungForm(epocheZeit(P)));";
        const mutK =
            kernText.split(ankerK).length === 2
                ? kabineVerdict(kabineMessen(require("./lib/asset-worker-harness.cjs").kernAusText(kernText.replace(ankerK, "return gattungForm(epocheZeit(P));"), "__vehicleCore")), VC.GATTUNGEN)
                : [`Anker fehlt: ${ankerK}`];
        check(
            "Selbst-Test Kabine am Kern: ohne das Gesetz heißt der GT am Rand Gürtel 1,2 beim Namen (kein Glas, nicht-endliche Werte), der Sportwagen umgestülpt",
            mutK.some((z) => /^KABINE: gt guertel=1\.2 — der Bau trägt [1-9]\d* nicht-endliche Werte/.test(z)) &&
                mutK.some((z) => /^KABINE: gt guertel=1\.2 — Glas-Höhe 0\.000 m/.test(z)) &&
                mutK.some((z) => /^KABINE: supersport guertel=1\.2 — Glas-Höhe -0\.080 m/.test(z)),
            `${mutK.length} Zeilen · ${mutK.slice(0, 3).join(" · ") || "die Mutante schweigt"}`
        );
        // A9 am ECHTEN Kern: liest der Rumpf seine Welle nicht (oder seine Last), steht die Gestalt still — beim Namen
        const harness = require("./lib/asset-worker-harness.cjs");
        for (const [anker, ersatz, wort] of [
            ["const hs = Number.isFinite(P && P.welle) ? Math.max(0, P.welle) : 0.1;", "const hs = 0.1;", /^RUMPF: welle 0,1 → 0,5 m — die Höhe/],
            ["const last = Number.isFinite(P && P.last) ? Math.max(0, P.last) : 200;", "const last = 200;", /^RUMPF: last 200 → 400 kg/],
        ]) {
            const mut = kernText.split(anker).length === 2 ? rumpfVerdict(rumpfMessen(harness.kernAusText(kernText.replace(anker, ersatz), "__vehicleCore"))) : [`Anker fehlt: ${anker}`];
            check(`Selbst-Test Rumpf am Kern: ${ersatz} — der ungelesene Eingang ist ROT beim Namen`, mut.some((z) => wort.test(z)), mut.join(" · ") || "die Mutante schweigt");
        }
        const rumpfHeil = rumpfVerdict(rumpfMessen(VC));
        check("Selbst-Test Rumpf: der gesunde Kern ist grün", rumpfHeil.length === 0, rumpfHeil.join(" · "));
        selbsttestEnde(errs, "die Linse feuert auf beide Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== N6/H7 — TEIL A: Formel + Paritaet + ein Pfad (Node) ===");
    // Die Absenz über den EINEN Helfer (stammLib.fehlt, der Täter beim Namen). A1 (die Shell ohne FAHR-Literal und carPhys) steht
    // in gate:altlasten; A4 (kein Namensraum-Literal in der Brücke) hält die Verfassung (gate:constitution N2) — EINE Wand, kein
    // Zwilling. N6.4 — EIN Bewegungs-Pfad: die ride-Skalare liest NUR der Bewegungs-Schritt (_loopPlayerMovement).
    check(
        "A5/N6.4: EIN Bewegungs-Pfad (ride.topSpeedMul/kAcc/kBrake nur in _loopPlayerMovement)",
        stammLib.fehlt({ ausser: "_loopPlayerMovement" }, /\bride\.(?:topSpeedMul|kAcc|kBrake)\b/),
        stammLib.fehlt.wo
    );

    // A7: die Gattungen des Kerns und jede eigene Typ-Liste des Stamms (die Stadt zählt B-h im lebenden Draht)
    const gattungenKern = Array.isArray(VC.GATTUNGEN) ? VC.GATTUNGEN : [];
    const tafeln = typTafeln(stammQuellen(), gattungenKern);
    const gA = gattungVerdict({ kern: gattungenKern.length, tafeln });
    check(
        `A7: die Gattungen sind Gesetz des Kerns (≥ ${GATTUNG.min}) und kein Stamm-Feld zählt sie selbst auf`,
        gA.length === 0,
        gA.join(" · ") || `${gattungenKern.length} Gattungen: ${gattungenKern.join(", ")} · 0 eigene Typ-Listen in stamm/`
    );
    // A7: jede Gattung liest als eigener Wagen — der Seitenriss ihres Baus (Leser: `buildInstance`, die feine Stufe der Welt)
    const umriss = umrissMessen(VC, gattungenKern);
    const uV = umrissVerdict(gattungenKern, umriss.paare, umriss.seiten);
    const eng = umriss.paare.slice().sort((x, y) => x.abw - y.abw);
    check(
        `A7: jede Gattung liest als eigener Wagen (Seitenriss Karosse/Glas je Paar ≥ ${UMRISS.zwilling} verschieden, ≥ ${GATTUNG.min} lesbare Gattungen) und von beiden Seiten gleich (≤ ${100 * UMRISS.seite} % der Zellen)`,
        uV.length === 0,
        uV.join(" · ") ||
            `die engsten Paare: ${eng.slice(0, 3).map((p) => `${p.a} · ${p.b} ${p.abw.toFixed(3)}`).join(", ")} · Glas am Riss: ` +
                gattungenKern.map((id, i) => `${id} ${Math.round((100 * umriss.risse[i].glas) / umriss.risse[i].belegt)} %`).join(", ") +
                ` · links ≠ rechts: ` +
                gattungenKern.map((id) => `${id} ${(100 * umriss.seiten[id]).toFixed(2)} %`).join(", ")
    );
    // A8: das Gesetz der Kabine — an jeder Gattung trägt jede Ecke des Regler-Paars Gürtel × Dach ein Fenster mit Höhe
    const kabine = kabineMessen(VC);
    const kV = kabineVerdict(kabine, gattungenKern);
    check(
        `A8: das Gesetz der Kabine — an jeder Gattung hält jede Ecke des Regler-Paars Gürtel × Dach die Glas-Höhe (≥ ${KABINE.glasMin} m) und baut endlich`,
        kV.length === 0,
        kV.join(" · ") || `${kabine.length} Ecken an ${gattungenKern.length} Gattungen · kleinste Glas-Höhe ${Math.min(...kabine.map((f) => f.glas)).toFixed(3)} m`
    );

    // A9: die Ursache des Rumpfs — Welle und Last formen den Bau
    const rumpf = rumpfMessen(VC);
    const rV = rumpfVerdict(rumpf);
    check(
        `A9: das Boot fällt aus seinem Wasser und seiner Last (Hs 0,1 → 0,5 m: ≥ ${RUMPF.hoeher}× höher, ≥ ${RUMPF.ecken}× Ecken; 200 → 400 kg: + ${RUMPF.laenger} m)`,
        rV.length === 0,
        rV.join(" · ") ||
            `See ${rumpf.see.laenge.toFixed(2)}×${rumpf.see.hoehe.toFixed(2)} m ${rumpf.see.ecken} Ecken · offen ${rumpf.offen.laenge.toFixed(2)}×${rumpf.offen.hoehe.toFixed(2)} m ${rumpf.offen.ecken} Ecken · schwer ${rumpf.schwer.laenge.toFixed(2)} m`
    );

    const ell = ellipseMessung(VC);
    const ellV = ellipseVerdict(ell);
    check(
        `A6: die Reibellipse je Achse — im Bogen und in der Kehre ≤ ${ELLIPSE.bogen} μ·g, die Handbremse ${ELLIPSE.hand.join("–")} μ·g·b/L, geradeaus der Bremsweg ±${ELLIPSE.weg * 100} %`,
        ellV.length === 0,
        ellV.join(" · ") || Object.entries(ell).map(([p, e]) => `${p} ${e.bogen} μ·g Hand ${e.hand} ${e.weg} m`).join(" · ")
    );

    // A2 (die Hand-Ableitung exportDrive == carPhys-Primitive) fiel in w11-fahrzeug: sie war ein Zwilling der Formel im Skript —
    // die Probefahrt liest exportDrive selbst (Welle L), das Antriebs-Gesetz richtet gate:garage-labor G9 an der Fahrt; dort
    // steht seit w12-fahrzeug-decke auch A3/H7 (jede Gattung ihr eigenes Tempo, vorher: GT ≠ Supersport in zwei Skalaren).
    const gtExp = expectedFor("gt");

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    const { browser, page } = await nullWelt(server, { frist: 180000, vor: WELT_ORTE_INSTALL }); // die Orte aus der Welt (`__weltOrte`, scripts/lib/welt-orte.cjs)

    const out = await page.evaluate(async () => {
        const res = { book: {} };
        await __weltDa();
        const f = r._ensureAssetFoundry();
        // Buch + Auto-Blueprint abwarten (das fahrprofil reist im selben get-recipes-Reply).
        await __weltDa(
            () =>
                f &&
                f.ready &&
                f.recipes &&
                f.recipes.gt &&
                f.recipes.gt.fx &&
                f.recipes.gt.fx.fahrprofil &&
                r.state.blueprints &&
                r.state.blueprints.fahrzeug_gt
        );
        // ===== B-a: das LIVE-Buch je Fahrzeug-Preset =====
        try {
            for (const id in f.recipes) {
                const rec = f.recipes[id];
                if (rec?.kind === "vehicle")
                    res.book[id] = rec.fx && typeof rec.fx.fahrprofil === "object" ? rec.fx.fahrprofil : null;
            }
        } catch (e) {
            res.bookErr = fehlerText(e);
        }
        // ===== B-c: das Host-Profil — Lab fuehrt (fahrzeug_gt). Die Emergenz aus der Substanz misst der Playtest (gelaende-boden
        // V18150Ride; hier stand bis w12-fahrzeug-decke ein Literal-Zwilling der Formel von FAHR.hostEmergent), die Absenz des
        // Alt-Wagens der Playtest werkstatt (Rezept-Katalog c) =====
        try {
            const pGt = r._vehicleProfile({ type: "fahrzeug_gt" });
            res.gt = pGt && { topSpeedMul: pGt.topSpeedMul, kAcc: pGt.kAcc, kBrake: pGt.kBrake };
        } catch (e) {
            res.profErr = fehlerText(e);
        }
        // ===== B-d: DIE FAHR-PROBE — nach N Fahr-Ticks bewegt sich der EINTRAG =====
        try {
            const pm = r.state.playerMesh.position;
            const spawnAt = { x: pm.x + 5, y: pm.y, z: pm.z };
            const entry = r.spawnArchitecture("fahrzeug_gt", spawnAt, { silent: true, precise: true });
            res.drive = { spawned: !!entry };
            if (entry) {
                // Studio-Gestalt andocken lassen (der Bau ist async: Flat-Miss → Anfrage → Bau).
                await __gebautNach(entry);
                res.drive.visualKind = entry.instanced ? "instanced" : entry.mesh ? "mesh" : "kalt";
                // B-i: DIE SCHEIBE (fahrzeug-gestalt) — die Stoffe, die der gestellte GT in der Welt zeichnet (seine Instanz-Gruppen):
                // jede durchsichtige trägt das Gesetz der Scheibe (welt-licht `scheibe`) mit dem F₀ der Zeile glas, und eine Zeile mit
                // halber Brechkraft (n − 1 × ½) setzt ihn (`_glasOptikWirkt`) — gelesen am Uniform, das der Stoff zeichnet
                try {
                    const mats = new Set();
                    for (const ref of entry.instSlots || []) {
                        const g = r.state.archInstanceGroups.get(ref.key);
                        if (g && g.mesh && g.mesh.material) mats.add(g.mesh.material);
                    }
                    const durch = [...mats].filter((m) => m.transparent && m.opacity < 1);
                    const SG = window.__schmiedeCore.STOFF_GESETZ;
                    const zeile = () => SG.fresnel0(SG.kanaele(SG.zeile("glas"))[1]);
                    const wert = () => durch.map((m) => (m.userData.scheibe ? m.userData.scheibe.value : NaN));
                    const vor = wert();
                    const z0 = SG.zeile;
                    let nach = vor;
                    SG.zeile = (n) => (n === "glas" ? Object.assign({}, z0(n), { n: 1 + (z0(n).n - 1) / 2 }) : z0(n));
                    try {
                        if (typeof r._glasOptikWirkt === "function") r._glasOptikWirkt();
                        nach = wert();
                    } finally {
                        SG.zeile = z0;
                        if (typeof r._glasOptikWirkt === "function") r._glasOptikWirkt();
                    }
                    res.scheibe = {
                        stoffe: mats.size,
                        durch: durch.length,
                        mit: durch.filter((m) => m.userData.scheibe).length,
                        f0: vor.map((v) => +v.toFixed(5)),
                        abw: Math.max(...vor.map((v) => Math.abs(v - zeile()))),
                        folgt: durch.length > 0 && nach.every((v, i) => Math.abs(v - vor[i]) > 1e-4),
                    };
                } catch (eS) {
                    res.scheibeErr = fehlerText(eS);
                }
                // B-j: DER REIFEN (fahrzeug-gestalt) — die Rad-Blätter, die der gestellte GT in der Welt zeichnet (der Foundry-Flat
                // der servierten Stufe, nabenrelativ gebacken): die Blätter bis an den Umfang (der Reifen) rollen nicht, ihr tiefster
                // Punkt liegt als Sehne unter der Nabe, und sie stehen um dz = W / kz frei über dem Aufstand — W die Last des
                // Fahr-Satzes (`_fahrSatz(…).rad.W`, dieselbe, mit der das Rad im Boden einsinkt), kz die Steifigkeit des Gesetzes
                try {
                    const VCp = window.__vehicleCore;
                    const lodR = Number.isFinite(entry._servedLod) ? entry._servedLod : entry._lodLevel;
                    const flat = r._foundryFlattenFor(entry, r._foundryPresetForEntry(entry), lodR);
                    const SR = r._fahrSatz(entry, r._vehicleProfile(entry));
                    const maß = new Map();
                    for (const lf of (flat && flat.leaves) || []) {
                        if (!lf.rad || !lf.geom || maß.has(lf.geom)) continue;
                        const p = lf.geom.attributes.position;
                        let minY = Infinity,
                            maxR = 0;
                        for (let i = 0; i < p.count; i++) {
                            minY = Math.min(minY, p.getY(i));
                            maxR = Math.max(maxR, Math.hypot(p.getX(i), p.getY(i)));
                        }
                        let sx0 = Infinity,
                            sx1 = -Infinity;
                        for (let i = 0; i < p.count; i++)
                            if (p.getY(i) < minY + 5e-4) [sx0, sx1] = [Math.min(sx0, p.getX(i)), Math.max(sx1, p.getX(i))];
                        const e = lf.localMatrix.elements;
                        maß.set(lf.geom, { minY, maxR, sehne: sx1 - sx0, dreht: !!lf.rad.dreht, k: Math.hypot(e[0], e[1], e[2]), hy: lf.rad.raeder[0].hy });
                    }
                    const alle = [...maß.values()],
                        rMax = Math.max(...alle.map((m) => m.maxR)),
                        reifen = alle.filter((m) => m.maxR > 0.97 * rMax);
                    const lauf = reifen.reduce((a, m) => (m.minY < a.minY ? m : a), reifen[0]);
                    const R = VCp.FAHR.reifen,
                        rad = SR && SR.rad;
                    const kz = rad ? R.kz * Math.sqrt((rad.b * rad.D) / (R.bezug.b * R.bezug.D)) : NaN;
                    res.reifen = {
                        blaetter: reifen.length,
                        rollt: reifen.filter((m) => m.dreht).length,
                        sehne: +(lauf.sehne * lauf.k).toFixed(4),
                        dzMesh: +((rMax + lauf.minY) * lauf.k).toFixed(5), // freier Halbmesser − Abstand Nabe → Aufstand
                        dzGesetz: rad ? +(rad.W / kz).toFixed(5) : NaN,
                        W: rad ? +rad.W.toFixed(1) : NaN,
                        aufstand: +((lauf.minY + lauf.hy) * lauf.k).toFixed(5), // 0: die Sehne liegt in der Ebene y 0 der Vorlage
                    };
                } catch (eR) {
                    res.reifenErr = fehlerText(eR);
                }
                // KONSUM: die Instanz zieht über die EINE Flat-Quelle mit — die Foundry-Gestalt, ohne Foundry der Bauplan
                const ruft = (k, n = 0, f0 = r[k]) => {
                    const zurueck = leihe(r, { [k]: (...a) => (n++, f0.apply(r, a)) }); // die EINE Leihe (welt-boot)
                    try {
                        r._archInstanceUpdate(entry);
                    } finally {
                        zurueck();
                    }
                    return n > 0;
                };
                const instF = entry.instFoundry;
                res.drive.flatFoundry = !!entry.instanced && ruft("_foundryFlattenFor");
                entry.instFoundry = false;
                res.drive.flatBauplan = !!entry.instanced && ruft("_archFlattenBlueprint");
                entry.instFoundry = instF;
                r._archInstanceUpdate(entry);
                const m0 = { x: entry.position.x, z: entry.position.z };
                const mres = r.mountArchitecture(entry);
                res.drive.mounted = !!(mres?.ok) && r.state.player.mountedArch === entry.id;
                // DONOR-ABSCHIED — der lebende KONSUM/ABSENZ-Beweis am
                // frisch gespawnten Eintrag (Gier 0 — die Welt-AABB-Spanne ist die
                // Laengs-Achse): Sitz == Kern-Formel UND != Donor-Anker; Blocker-
                // Spanne == Kern-Huellen-Laenge (> 3 m — Donor-Box war 2.1 m).
                try {
                    const fzg = r._fahrzeugGesetzFor(entry);
                    const drv = fzg && fzg.drive;
                    const hip = r.constructor.SITZ_HIP_OFFSET;
                    const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
                    const kernSitz =
                        drv?.sitz && Number.isFinite(drv.sitz.y) ? Math.max(0.45, drv.sitz.y * sc + hip) : null;
                    const donorSp = r._attachPointFor(r.state.blueprints.fahrzeug_gt, "sitz").point;
                    const donorSitz = Number.isFinite(donorSp.y) ? Math.max(0.45, donorSp.y * sc + hip) : null;
                    res.drive.sitzKern =
                        kernSitz !== null &&
                        Math.abs(entry._sitzHeight - kernSitz) < 1e-9 &&
                        (donorSitz === null || Math.abs(entry._sitzHeight - donorSitz) > 0.01);
                    if (entry.blockerAABBs?.length && drv?.huelle) {
                        let mnX = Infinity;
                        let mxX = -Infinity;
                        let mnZ = Infinity;
                        let mxZ = -Infinity;
                        for (const b of entry.blockerAABBs) {
                            mnX = Math.min(mnX, b.minX);
                            mxX = Math.max(mxX, b.maxX);
                            mnZ = Math.min(mnZ, b.minZ);
                            mxZ = Math.max(mxZ, b.maxZ);
                        }
                        const span = Math.max(mxX - mnX, mxZ - mnZ);
                        // die Länge der gezeichneten Gestalt (das Maß des Kerns am Bau, physik.K2 Staffel 2), sonst der Kern-Hülle
                        const M = entry._gestaltMass;
                        const L = M ? M.bug - M.heck : drv.huelle.noseX - drv.huelle.tailX;
                        res.drive.huelleKern = span > 3 && Math.abs(span - L * sc) < 0.05;
                    }
                } catch (eD) {
                    res.drive.donorErr = fehlerText(eD);
                }
                // N Fahr-Ticks: der REITER ist die horizontale Autoritaet — pm faehrt,
                // playerVel traegt die Fahrt-Richtung (Gier-/Phasen-Quelle des Chokepoints).
                if (r.state.playerVel) r.state.playerVel.setValue(2.4, 0, 0);
                // der Ritt bewegt sich im Sim-Schritt (`_rittSchritt`: Lage, Gier, die Blocker), das Bild folgt im Frame-Takt
                for (let i = 0; i < 120; i++) {
                    pm.x += 0.12;
                    r._rittSchritt(0.05);
                    r._tickMountedMovement(0.05);
                }
                res.drive.dist = Math.hypot(entry.position.x - m0.x, entry.position.z - m0.z);
                // Blocker folgen (max. Zentrums-Abstand aller Boxen zur neuen Position).
                if (entry.blockerAABBs) {
                    let bMax = 0;
                    for (const b of entry.blockerAABBs) {
                        const cx = (b.minX + b.maxX) / 2;
                        const cz = (b.minZ + b.maxZ) / 2;
                        bMax = Math.max(bMax, Math.hypot(cx - entry.position.x, cz - entry.position.z));
                    }
                    res.drive.blockerMax = bMax;
                }
                // Persistenz: der Snapshot traegt die GEFAHRENE Position (wie jede Architektur-Bewegung).
                const snap = r.buildStateSnapshot();
                const se =
                    snap && Array.isArray(snap.architectures)
                        ? snap.architectures.find((a) => a.id === entry.id)
                        : null;
                res.drive.snapDist = se ? Math.hypot(se.position.x - m0.x, se.position.z - m0.z) : null;
                // Aufraeumen (die Probe hinterlaesst nichts).
                r.dismountArchitecture();
                r.removeArchitecture(entry);
                if (r.state.playerVel) r.state.playerVel.setValue(0, 0, 0);
                r.state._fieldVy = 0;
            }
        } catch (e) {
            res.driveErr = fehlerText(e);
        }
        // ===== B-f (W5 Gegenstände): DER STAND AM HANG =====
        // Je Hang-Probe (Steigung 12–35 % über ±2 m, trocken) parkt der GT längs und quer zum Hang (der Spawn-Pfad wie
        // Hotbar/DSL: Basis auf dem Boden unter dem Ursprung); gemessen werden die vier Aufstandspunkte der GERENDERTEN
        // Matrix gegen das Boden-Gesetz. Die Hänge kommen aus der Welt (welt-orte `hang`, K55-5 — bis dahin ±40 m um die
        // Mess-Wiese: die Wiese ist nach ihrem Gesetz flach, `hangMax` 5°, und fand in der Aue 1 Hang statt 6).
        try {
            const M = new THREE.Matrix4();
            const v3 = new THREE.Vector3();
            const grad = (t) => (Math.atan(t) * 180) / Math.PI;
            const hang = window
                .__weltOrte("hang", { min: grad(0.12), max: grad(0.35), basis: 2, anzahl: 6, abstand: 24, rMax: 800 })
                .map((o, i) => ({
                    x: o.x,
                    z: o.z,
                    g: Math.tan((o.neigung * Math.PI) / 180),
                    rot: i % 2 ? Math.PI / 2 : 0,
                }));
            let spaltM = 0;
            const je = [];
            for (const p of hang) {
                const e3 = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x: p.x, y: r.getTerrainHeightAt(p.x, p.z) + 0.5, z: p.z },
                    { silent: true, precise: true, rotationY: p.rot, seed: 11 }
                );
                if (!e3) continue;
                const h = r._fahrzeugGesetzFor(e3).drive.huelle;
                r._archEntryWorldMatrix(e3, M);
                let maxS = 0;
                for (const ax of [h.fAx, h.rAx])
                    for (const sz of [-1, 1]) {
                        v3.set(ax, 0, (sz * h.spur) / 2).applyMatrix4(M);
                        maxS = Math.max(maxS, Math.abs(v3.y - r.getTerrainHeightAt(v3.x, v3.z)));
                    }
                spaltM = Math.max(spaltM, maxS);
                je.push(+maxS.toFixed(3));
                r.removeArchitecture(e3);
            }
            res.stand = { proben: je.length, spaltM, je, steigung: hang.map((p) => +p.g.toFixed(2)) };
        } catch (e) {
            res.standErr = fehlerText(e);
        }
        // ===== B-g: DER STEMPEL BAUT DIE FORM, NIE DEN MOTOR — der Fahr-Satz des Ritts am Rezept und am schweren Stempel =====
        try {
            const pm = r.state.playerMesh.position;
            const satz = (ov, dz) => {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x: pm.x + 9, y: pm.y, z: pm.z + dz },
                    Object.assign({ silent: true, precise: true }, ov ? { studioOv: ov } : null)
                );
                try {
                    const S = r._fahrSatz(e, r._vehicleProfile(e));
                    return { masse: r._fahrzeugGesetzFor(e).drive.mass, aLeist: S.aLeist };
                } finally {
                    r.removeArchitecture(e);
                }
            };
            const [L, S] = [satz(null, 0), satz({ radstand: 3.4, spur: 1.9, dach: 1.75 }, 8)];
            res.form = { masseQ: S.masse / L.masse, wattQ: (S.aLeist * S.masse) / (L.aLeist * L.masse) };
        } catch (e) {
            res.formErr = fehlerText(e);
        }
        return res;
    });

    // ===== B-h: DIE GATTUNGEN DER STADT — die Stadt des Messorts stadt-voll (sein Wort, sein Anker) steht, der Spieler an ihrem
    // Ursprung, bis ihr Verkehr angelegt ist; gezählt werden die Gattungen ihrer Wagen und die Fahrzeug-Typen, die in der Welt
    // STEHEN (`state.architectures`, dasselbe Maß wie die Station gestalt#1) =====
    const stadt = await page.evaluate(async () => {
        try {
            const ort = (await (await fetch("spec/profiband/haushalt.json")).json()).messorte.find((m) => m.id === "stadt-voll");
            const w = ort.gruendung.wort.split(" ");
            const [seed, nH, [ax, az]] = [Number(w[1]), Number(w[2]), ort.gruendung.anker];
            await __weltDa(() => AnazhRealm._siedlungGesetz());
            const S0 = () => [...(r._bewohnerSiedlungen || new Map()).values()].find((q) => q.plan.seed === seed && Math.hypot(q.ox - ax, q.oz - az) < 200);
            if (!S0()) await r.spawnSettlement({ seed, nH, position: { x: ax, y: 0, z: az } });
            const S = S0();
            if (!S) return { fehler: "keine Stadt am Messort stadt-voll" };
            const pm = r.state.playerMesh.position;
            let t = performance.now();
            for (const weiter = __deckel("B-h: der Verkehr der Stadt", 150000); weiter() && !(S.verkehr && S.verkehr.wagen.length); ) {
                pm.set(S.ox, r.getTerrainHeightAt(S.ox, S.oz) + 0.2, S.oz);
                r.state.playerVel.setValue(0, 0, 0);
                for (let k = 0; k < 8; k++) r._gameLoopTick((t += 1000 / 60));
                await window.sleep();
            }
            const VK = S.verkehr;
            if (!VK || !VK.wagen.length) return { fehler: `die Stadt trägt keinen Verkehr (Soll ${VK && VK.zahl && VK.zahl.soll})` };
            const typen = {};
            for (const W of VK.wagen) typen[W.typ] = (typen[W.typ] || 0) + 1;
            const welt = [...new Set((r.state.architectures || []).filter((e) => e && /^fahrzeug_/.test(e.type)).map((e) => e.type))];
            return { wagen: VK.wagen.length, soll: VK.zahl.soll, typen, welt };
        } catch (e) {
            return { fehler: fehlerText(e) };
        }
    });

    await browser.close();
    server.close();

    // B-a/B-b: JEDES Fahrzeug-Rezept trägt im LIVE-Buch sein fahrprofil BIT-EXAKT == Node-exportDrive (durch Worker + Ingest;
    // bis w12-fahrzeug-decke zwei Zeilen: 5/5 finite, bit-exakt nur gt + supersport)
    const abw = Object.keys(VC.PRESETS).flatMap((id) => driveDiverges(out.book[id], expectedFor(id)).map((k) => `${id}.${k}`));
    check(
        "B-a/B-b: jedes Fahrzeug-Rezept reiste BIT-EXAKT durch Worker+Ingest (Buch == Node-exportDrive)",
        !abw.length,
        out.bookErr || abw.join(",") || Object.keys(out.book).join(",")
    );
    // B-h: die Gattungen, die in der Stadt stadt-voll stehen und fahren — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test)
    const nWelt = stadt.welt ? stadt.welt.length : 0;
    const gB = stadt.fehler ? [stadt.fehler] : gattungVerdict({ kern: gattungenKern.length, stadt: Math.min(nWelt, Object.keys(stadt.typen).length), tafeln: [] });
    check(
        `B-h: die Stadt stadt-voll fährt ≥ ${GATTUNG.min} Gattungen des Kerns (Wagen ihres Verkehrs und Fahrzeug-Typen der Welt)`,
        gB.length === 0,
        gB.join(" · ") || `${stadt.wagen} von ${stadt.soll} Wagen · ${JSON.stringify(stadt.typen)} · in der Welt ${stadt.welt.join(", ")}`
    );
    // B-c: das Host-Profil.
    const pg = out.gt;
    check(
        "B-c: _vehicleProfile(fahrzeug_gt) traegt die LAB-Werte (topSpeedMul/kAcc/kBrake === exportDrive)",
        !!pg && pg.topSpeedMul === gtExp.topSpeedMul && pg.kAcc === gtExp.kAcc && pg.kBrake === gtExp.kBrake,
        out.profErr || (pg ? `kAcc=${pg.kAcc}` : "kein Profil")
    );
    // B-d (B2): die stehende Fahr-Probe — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const dv = driveVerdict(out.drive);
    check(
        "B-d/B2: FAHR-PROBE — nach 120 Fahr-Ticks: Eintrag > 1 m bewegt · Blocker ziehen mit · Snapshot traegt es",
        dv.length === 0,
        out.driveErr ||
            (out.drive
                ? `kind=${out.drive.visualKind} dist=${(out.drive.dist || 0).toFixed(2)}m${dv.length ? " fehlt:" + dv.join(",") : ""}`
                : "keine Probe")
    );
    // B-f (W5): der Stand am Hang — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const sv = standVerdict(out.stand);
    const st = out.stand || {};
    check(
        "B-f/W5: STAND — ein geparkter GT steht am Hang auf seinen vier Rädern (längs und quer)",
        sv.length === 0,
        out.standErr ||
            `größter Rad-Spalt ${(st.spaltM || 0).toFixed(3)} m über ${st.proben || 0} Hang-Proben (Steigung ${JSON.stringify(st.steigung || [])}, je ${JSON.stringify(st.je || [])})${sv.length ? " — Täter: " + sv.join(", ") : ""}`
    );

    // B-g: der Motor des Rezepts — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const fv = formVerdict(out.form);
    check(
        "B-g: FORM — der schwere Stempel fährt den Motor seines Rezepts (Leistung × 1 am Fahr-Satz des Ritts)",
        fv.length === 0,
        out.formErr || `Masse × ${out.form && out.form.masseQ.toFixed(4)}, Leistung × ${out.form && out.form.wattQ.toFixed(6)}${fv.length ? " — Täter: " + fv.join(", ") : ""}`
    );

    // B-i: die Scheibe des gestellten Wagens — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const scheibeV = scheibeVerdict(out.scheibe);
    check(
        "B-i: SCHEIBE — das Glas des gestellten Wagens trägt das Gesetz der Scheibe mit dem F₀ der Zeile glas und folgt ihr",
        scheibeV.length === 0,
        out.scheibeErr || `${JSON.stringify(out.scheibe)}${scheibeV.length ? " — Täter: " + scheibeV.join(", ") : ""}`
    );

    // B-j: der Reifen des gestellten Wagens unter seiner Last — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const reifenV = reifenVerdict(out.reifen);
    check(
        "B-j: REIFEN — der Reifen des gestellten Wagens rollt nicht, liegt als Sehne auf und steht um W / kz frei (W die Last des Bodens)",
        reifenV.length === 0,
        out.reifenErr || `${JSON.stringify(out.reifen)}${reifenV.length ? " — Täter: " + reifenV.join(", ") : ""}`
    );

    wandEnde(
        errs,
        "DAS LAB-FAHRPROFIL FÜHRT (N6): die Bruecke rechnet exportDrive beim Buch-Bau bit-exakt, _vehicleProfile faehrt die Lab-Werte, der Bewegungs-Loop ist EIN Pfad."
    );
});
