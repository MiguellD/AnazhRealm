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

// ── B-k DIE SPUR IM BODEN (fahrzeug-medium-2, rinne_sichtbar; Karte: „Spurrinne nach 10 Durchfahrten sichtbar“): der gestellte
// Wagen fährt zehnmal dieselbe Zeile weichen Bodens — durch den Schreib-Akt der Welt (`_fahrRad` → `_tritt`, das EINE Feld der
// Tritte → die Wege-Karte), gelesen von den Lesern der Welt (`_pfadFeldAt`, den Wiese und Streu dünnen, und der Stoff unter dem
// Fuß, `_kontaktStoffAt`). Nach EINER Durchfahrt malt die Spur nichts (ein Weg entsteht erst durch Wiederholung), nach zehn ist
// jede Zelle der Spur Erde, und die Rinne ist tiefer als nach der ersten. Am Kopf vor fahrzeug-medium-2 trat das Rad wie ein Fuß:
// zehn Durchfahrten trugen der Zelle 20 Tritte, der Pfad beginnt bei 27,7 — die Spur blieb unsichtbar.
function spurVerdict(s) {
    if (!s || !(s.zellen > 0)) return [`die Probe fand keine Zeile weichen Bodens für die Spur (${s && s.grund})`];
    const out = [];
    if (s.gemalt10 < s.zellen)
        out.push(
            `die Spur von 10 Durchfahrten bleibt unsichtbar (gemalt ${s.gemalt10} von ${s.zellen} Zellen, je Zelle ${s.tritte10} Tritte, der Pfad ab 27,7) — das Rad tritt wie ein Fuß (\`_fahrRad\` → \`_tritt\`, \`TRITT.rad\`)`
        );
    if (s.gemalt1 > 0) out.push(`eine Durchfahrt malt schon den Pfad (${s.gemalt1} von ${s.zellen} Zellen) — ein Weg entsteht erst durch Wiederholung`);
    if (s.erde10 < s.zellen) out.push(`der Leib hört auf der Spur keine Erde (\`_kontaktStoffAt\`: ${s.erde10} von ${s.zellen} Zellen)`);
    if (!(s.tief10 > s.tief1)) out.push(`die Rinne wächst nicht mit den Durchfahrten (${s.tief1} → ${s.tief10} cm, \`_trittDurchfahrten\`)`);
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

// ── A10 DER FLUG (fahrzeug-medium-2, Karte 2 mensch.fahrzeug.medium): ein Rad verliert seinen Boden erst, wenn die Ebene
// weiter unter die Fallkurve des Aufbaus faellt als sein Federweg (`auf.hub`) und der Reifen (luftEps) — am Kern je Gattung, die
// 100 km/h faehrt. Eine Bodenwelle von 3 cm auf 4 m bei 100 km/h (die Ebene beschleunigt bis 5,8 g, das Rad federt sie aus) hebt
// keinen Wagen ab; die Kuppe einer Rampe von 25 % bei 90 km/h wirft jeden in die Luft (die Steig-Rate 6,25 m/s traegt ihn ueber
// den Federweg). Am Kopf von main verlor das Rad den Griff 2 cm unter der Fallkurve: ueber der Welle hingen GT · Supersport ·
// Limousine · Kompakt · SUV · Transporter 84 · 100 · 82 · 98 · 81 · 80 von 180 Bildern in der Luft, und am Genesis-Ort flogen
// 78 von 120 Bremsungen aus 100 km/h, 60 davon ohne Kuppe (nachher 18, keine ohne Kuppe: drei Saaten mit Rampen-Kuppe und
// Kante, jede Gattung). DIE KANTE: der Federweg traegt das Rad nur, wo die Ebene der vier eine Ebene ist (fahrEbene `traegt`);
// an einer Stufe von 6 m bei 15 m/s liegt der Bauch am Rand, die Raeder haengen darueber, und der Wagen fliegt, sobald der Spalt
// den Reifen uebersteigt (Soll 0 Bilder am Boden auf einer Kante, die nicht traegt). Griff der Federweg auch dort, ritt der GT
// 5 Bilder mit 40 Grad Bug-unten auf der Kante (je Gattung), und in der Welt (gate:fahr-leben S4) kroch er 330 Bilder an der Klippe.
const FLUG = { v: 100 / 3.6, welle: [0.03, 4], rampe: [0.25, 20], vRampe: 25, kante: [6, 20], vKante: 15, bilder: 180 };
function flugMessung(VC) {
    const dt = 1 / 60;
    const m = {};
    const lauf = (G, boden, v) => {
        const z = VC.fahrZustand(-10, 0, 0);
        VC.fahrStand(z, G, boden, 0);
        z.vlong = v;
        z.speed = v;
        let luft = 0,
            griff = 0;
        for (let i = 0; i < FLUG.bilder; i++) {
            VC.fahrKraefte(z, { throttle: 0.4 }, G, dt);
            VC.fahrStand(z, G, boden, dt);
            if (z.luft === true) luft++;
            const eb = VC.fahrEbene(G, boden, z.x, z.z, z.yaw, z.einsinken);
            if (z.luft !== true && eb && !eb.traegt && z.y - eb.y > VC.FAHR.schritt.luftEps) griff++;
        }
        return { luft, griff };
    };
    const [A, lam] = FLUG.welle,
        [s, l] = FLUG.rampe,
        [k, kx] = FLUG.kante;
    for (const pid of VC.GATTUNGEN || []) {
        const P = { ...VC.DEFAULT_P, ...VC.presetPatch(pid) };
        const drv = VC.exportDrive(P);
        if (!(drv && drv.vmax >= FLUG.v)) continue;
        const G = VC.fahrGesetz(drv);
        const kante = lauf(G, (x) => (x < kx ? 0 : -k), FLUG.vKante);
        m[pid] = {
            hub: G.auf.hub,
            welle: lauf(G, (x) => A * Math.sin((2 * Math.PI * x) / lam), FLUG.v).luft,
            rampe: lauf(G, (x) => (x < 0 ? 0 : x < l ? s * x : s * l), FLUG.vRampe).luft,
            kante: kante.griff,
            kanteLuft: kante.luft,
        };
    }
    return m;
}
function flugVerdict(m) {
    const out = [];
    const ids = Object.keys(m || {});
    if (ids.length < GATTUNG.min) out.push(`${ids.length} Gattungen mit 100 km/h gemessen (Soll ≥ ${GATTUNG.min})`);
    for (const [pid, f] of Object.entries(m || {})) {
        if (!(f.welle === 0))
            out.push(`${pid} hebt über der Welle ${FLUG.welle[0]} m / ${FLUG.welle[1]} m ab (${f.welle} von ${FLUG.bilder} Bildern in der Luft, Federweg ${f.hub.toFixed(3)} m)`);
        if (!(f.rampe > 0)) out.push(`${pid} springt nicht über die Kuppe der Rampe ${FLUG.rampe[0] * 100} %`);
        if (!(f.kante === 0))
            out.push(`${pid} greift auf der Kante ${FLUG.kante[0]} m (${f.kante} Bilder am Boden, wo die Ebene nicht trägt — vehicle-core.js fahrStand: der Federweg gilt nur, wo die Ebene trägt)`);
        if (!(f.kanteLuft > 0)) out.push(`${pid} fliegt nicht über die Kante ${FLUG.kante[0]} m (vakuös)`);
    }
    return out;
}

// ── A11 DIE KIPPGRENZE (mensch.fahrzeug.form#2, Karte 2: „Kippgrenze ± 15 % gegen statische Formel“): am Kern je Gattung und
// ihr hoher Bauplan (Dach × 1,6, Bodenfreiheit × 3, Spur × 0,8 — die Hebel der Werkstatt). Die statische Formel (NHTSA Static
// Stability Factor, 68 FR 59250): die innere Spur hebt ab bei a_quer = SSF · g, auf dem Kipptisch bei tan θ = SSF, SSF = Spur ÷ 2h.
// Der Reifen trägt höchstens μ · g: wessen μ über dem SSF liegt, KIPPT (Kipptisch tan θ ÷ SSF und im Kreis a_quer vor dem Abheben
// ÷ SSF · g im Band ± 15 %, er liegt am Ende auf der Seite); wessen μ darunter liegt, RUTSCHT und bleibt stehen. Am Kopf von main
// kippte kein Bauplan: der Kern trug nur die Längs-Lastverlagerung, der Wank war eine Feder mit Anschlag 0,12 rad — 7 von 16
// Bauplänen mit μ > SSF rutschten mit 0,76–1,0 g durch den Kreis und erst bei tan θ = μ vom Tisch.
const KIPP = { band: 0.15, rand: 1.15, v: 20, bilder: 480, tisch: 0.025, stehen: 180, min: 3 };
function kippMessung(VC) {
    const dt = 1 / 60;
    const m = {};
    const kreis = (G) => {
        const z = VC.fahrZustand(0, 0, 0),
            boden = () => 0;
        VC.fahrStand(z, G, boden, 0);
        z.vlong = z.speed = KIPP.v;
        let a = 0,
            vh = 0;
        for (let i = 0; i < KIPP.bilder; i++) {
            const v = Math.hypot(z.vlong, z.vlat);
            if (i === 60) vh = v;
            VC.fahrKraefte(z, { steer: Math.min(1, i / 360), throttle: z.kipp ? 0 : Math.max(0, Math.min(1, (KIPP.v - v) * 0.5)) }, G, dt);
            VC.fahrStand(z, G, boden, dt);
            if (i > 30 && !z.kipp) a = Math.max(a, Math.abs(z.aLat || 0)); // die Querkraft der Reifen je Masse (Fy / m)
        }
        return { aQ: a / G.g, liegt: !!z.umgekippt, v: vh };
    };
    // der Kipptisch: tan θ in Stufen KIPP.tisch, dann die Grenze auf 1/64 Stufe halbiert
    const neige = (G, t) => {
        const z = VC.fahrZustand(0, 0, 0),
            boden = (x, q) => -q * t;
        VC.fahrStand(z, G, boden, 0);
        const q0 = z.z;
        for (let i = 0; i < KIPP.stehen; i++) {
            VC.fahrKraefte(z, {}, G, dt);
            VC.fahrStand(z, G, boden, dt);
        }
        return z.umgekippt ? "kippt" : Math.abs(z.z - q0) > 0.05 ? "rutscht" : null;
    };
    const tisch = (G) => {
        for (let t = KIPP.tisch; t <= 2; t += KIPP.tisch) {
            if (!neige(G, t)) continue;
            let lo = t - KIPP.tisch,
                hi = t;
            for (let k = 0; k < 6; k++) {
                const m = (lo + hi) / 2;
                if (neige(G, m)) hi = m;
                else lo = m;
            }
            return { tan: hi, kippt: neige(G, hi) === "kippt" };
        }
        return { tan: null, kippt: false };
    };
    for (const pid of VC.GATTUNGEN || []) {
        const P = { ...VC.DEFAULT_P, ...VC.presetPatch(pid) };
        for (const [name, ov] of [
            [pid, {}],
            [pid + "+hoch", { dach: P.dach * 1.6, fahrhoehe: P.fahrhoehe * 3, spur: P.spur * 0.8 }],
        ]) {
            const G = VC.fahrGesetz(VC.exportDrive({ ...P, ...ov }));
            if (!G) continue;
            const ssf = G.kipp ? G.kipp.ssf : G.auf.quer / G.cgH;
            m[name] = { ssf, mu: G.maxGrip * G.grip, kreis: kreis(G), tisch: tisch(G) };
        }
    }
    return m;
}
function kippVerdict(m) {
    const out = [];
    const e = Object.entries(m || {});
    const kippen = e.filter(([, k]) => k.mu > k.ssf * KIPP.rand);
    const rutschen = e.filter(([, k]) => k.mu * KIPP.rand < k.ssf);
    if (kippen.length < KIPP.min) out.push(`${kippen.length} Baupläne mit μ über dem SSF gemessen (Soll ≥ ${KIPP.min})`);
    if (rutschen.length < KIPP.min) out.push(`${rutschen.length} Baupläne mit μ unter dem SSF gemessen (Soll ≥ ${KIPP.min})`);
    // der Kreis urteilt, wer die Probe-Geschwindigkeit hält (der Karren fährt 1,6 m/s: sein SSF liegt jenseits seines Kreises)
    const imKreis = kippen.filter(([, k]) => !(k.kreis.v < KIPP.v * 0.8));
    if (kippen.length >= KIPP.min && imKreis.length < KIPP.min) out.push(`${imKreis.length} Baupläne mit μ über dem SSF im Kreis gemessen (Soll ≥ ${KIPP.min})`);
    const nie = kippen.filter(([, k]) => !k.tisch.kippt && !k.kreis.liegt);
    if (nie.length)
        out.push(
            `${nie.length} von ${kippen.length} Bauplänen mit μ > SSF kippen nie (${nie.map(([p, k]) => `${p} SSF ${k.ssf.toFixed(2)} μ ${k.mu.toFixed(2)}: Kreis ${k.kreis.aQ.toFixed(2)} g, Tisch rutscht bei tan ${k.tisch.tan == null ? "—" : (+k.tisch.tan).toFixed(3)}`).join(" · ")} — vehicle-core.js fahrTakt: keine Quer-Lastverlagerung, der Aufbau dreht nie um die äußere Radlinie)`
        );
    for (const [p, k] of kippen) {
        if (nie.some(([q]) => q === p)) continue;
        const qT = k.tisch.kippt ? k.tisch.tan / k.ssf : null;
        const qK = k.kreis.aQ / k.ssf;
        if (!(qT != null && Math.abs(qT - 1) <= KIPP.band)) out.push(`${p} Kipptisch tan θ ÷ SSF ${qT == null ? "— (" + (k.tisch.tan == null ? "steht" : "rutscht bei tan " + k.tisch.tan) + ")" : qT.toFixed(2)} (Soll 1 ± ${KIPP.band})`);
        if (k.kreis.v < KIPP.v * 0.8) continue;
        if (!k.kreis.liegt) out.push(`${p} liegt im Kreis nicht auf der Seite (a_quer ${k.kreis.aQ.toFixed(2)} g gegen SSF ${k.ssf.toFixed(2)})`);
        else if (!(Math.abs(qK - 1) <= KIPP.band)) out.push(`${p} Kreis a_quer vor dem Abheben ÷ SSF · g ${qK.toFixed(2)} (Soll 1 ± ${KIPP.band})`);
    }
    for (const [p, k] of rutschen)
        if (k.tisch.kippt || k.kreis.liegt) out.push(`${p} kippt mit μ ${k.mu.toFixed(2)} unter dem SSF ${k.ssf.toFixed(2)} (${k.tisch.kippt ? "Tisch tan " + k.tisch.tan : "im Kreis"}) — er müsste rutschen`);
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
            // B-k: gesund schweigt; die Spur des Kopfs vor fahrzeug-medium-2 (20 Tritte, 0 gemalt), eine Durchfahrt, die malt, eine
            // Spur ohne Erde unter dem Fuß und eine Rinne, die nicht wächst, nennen je ihren Täter
            [spurVerdict, { zellen: 16, gemalt1: 0, gemalt10: 16, erde10: 16, tritte10: 90, tief1: 0.6, tief10: 1.1 }, { gemalt10: 0 }, { gemalt1: 16 }, { erde10: 0 }, { tief10: 0.6 }, { zellen: 0 }],
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
        // A10: der Flug — gesund schweigt er; die Welle von main (GT 84 Bilder in der Luft), eine Rampe ohne Sprung, der Griff
        // auf der Kante (der Federweg ohne `traegt`: GT 5 Bilder), eine Kante ohne Flug und eine Messung mit 3 Gattungen nennen je
        // ihren Täter
        const flugGesund = Object.fromEntries(["gt", "supersport", "limousine", "kompakt_fwd", "suv", "transporter"].map((p) => [p, { hub: 0.2, welle: 0, rampe: 60, kante: 0, kanteLuft: 90 }]));
        for (const [b, n] of [
            [{}, 0],
            [{ gt: { hub: 0.204, welle: 84, rampe: 70, kante: 0, kanteLuft: 90 } }, 1],
            [{ suv: { hub: 0.246, welle: 0, rampe: 0, kante: 0, kanteLuft: 90 } }, 1],
            [{ gt: { hub: 0.204, welle: 0, rampe: 60, kante: 5, kanteLuft: 84 } }, 1],
            [{ limousine: { hub: 0.204, welle: 0, rampe: 58, kante: 0, kanteLuft: 0 } }, 1],
        ]) {
            const v = flugVerdict({ ...flugGesund, ...b });
            check(`Selbst-Test flugVerdict ${JSON.stringify(b)}`, v.length === n, v.join(" · "));
        }
        const flugDrei = flugVerdict({ gt: flugGesund.gt, suv: flugGesund.suv, limousine: flugGesund.limousine });
        check("Selbst-Test flugVerdict: 3 Gattungen gemessen", flugDrei.length === 1, flugDrei.join(" · "));
        // A11: die Kippgrenze — gesund schweigt sie; der Kern von main (kein Bauplan kippt), ein Tisch weit neben der Formel,
        // ein Kreis ohne Liegen, ein rutschender Bauplan, der kippt, und eine Messung ohne hohe Baupläne nennen je ihren Täter
        const kG = (ssf, mu, tan, liegt, aQ) => ({ ssf, mu, kreis: { aQ, liegt, v: 20 }, tisch: { tan, kippt: tan != null && liegt } });
        const kippGesund = {
            gt: { ...kG(1.75, 1, 1, false, 1.0), tisch: { tan: 1, kippt: false } },
            suv: { ...kG(1.31, 1, 1, false, 1.0), tisch: { tan: 1, kippt: false } },
            transporter: { ...kG(1.16, 0.8, 0.8, false, 0.8), tisch: { tan: 0.8, kippt: false } },
            "gt+hoch": kG(0.8, 1, 0.85, true, 0.8),
            "suv+hoch": kG(0.63, 1, 0.65, true, 0.63),
            "transporter+hoch": kG(0.63, 1, 0.65, true, 0.62),
        };
        for (const [b, n] of [
            [{}, 0],
            [{ "gt+hoch": { ssf: 0.8, mu: 1, kreis: { aQ: 0.98, liegt: false }, tisch: { tan: 1, kippt: false } }, "suv+hoch": { ssf: 0.63, mu: 1, kreis: { aQ: 0.99, liegt: false }, tisch: { tan: 1, kippt: false } } }, 1],
            [{ "gt+hoch": kG(0.8, 1, 0.6, true, 0.8) }, 1],
            [{ "gt+hoch": { ...kG(0.8, 1, 0.85, true, 0.1), kreis: { aQ: 0.1, liegt: false, v: 1.6 } } }, 1],
            [{ "suv+hoch": { ...kG(0.63, 1, 0.65, true, 0.63), kreis: { aQ: 0.99, liegt: false } } }, 1],
            [{ suv: { ...kG(1.31, 1, 0.5, true, 0.5) } }, 1],
        ]) {
            const v = kippVerdict({ ...kippGesund, ...b });
            check(`Selbst-Test kippVerdict ${JSON.stringify(b)}`, v.length === n, v.join(" · "));
        }
        const kippOhne = kippVerdict({ gt: kippGesund.gt, suv: kippGesund.suv, transporter: kippGesund.transporter });
        check("Selbst-Test kippVerdict: keine hohen Baupläne", kippOhne.length === 1, kippOhne.join(" · "));
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

    const flug = flugMessung(VC);
    const flV = flugVerdict(flug);
    check(
        `A10: der Flug — über der Welle ${FLUG.welle[0]} m / ${FLUG.welle[1]} m bei 100 km/h federt jedes Rad seinen Boden aus (0 Bilder in der Luft), über die Kuppe der Rampe ${FLUG.rampe[0] * 100} % springt jeder Wagen, an der Kante ${FLUG.kante[0]} m greift keiner (er fliegt)`,
        flV.length === 0,
        flV.join(" · ") || Object.entries(flug).map(([p, f]) => `${p} Welle ${f.welle} · Rampe ${f.rampe} · Kante ${f.kante} am Boden, ${f.kanteLuft} in der Luft (Federweg ${f.hub.toFixed(3)} m)`).join(" · ")
    );

    const kipp = kippMessung(VC);
    const kpV = kippVerdict(kipp);
    check(
        `A11: die Kippgrenze — wessen μ über dem SSF (Spur ÷ 2h) liegt, kippt auf dem Kipptisch bei tan θ und im Kreis bei a_quer = SSF · g (± ${KIPP.band * 100} %) und liegt auf der Seite; wessen μ darunter liegt, rutscht`,
        kpV.length === 0,
        kpV.join(" · ") ||
            Object.entries(kipp)
                .map(([p, k]) => `${p} SSF ${k.ssf.toFixed(2)} μ ${k.mu.toFixed(2)}: Tisch ${k.tisch.kippt ? "kippt" : "rutscht"} bei tan ${k.tisch.tan == null ? "—" : k.tisch.tan.toFixed(3)} · Kreis ${k.kreis.aQ.toFixed(2)} g${k.kreis.liegt ? ", liegt" : ""}`)
                .join(" · ")
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
                        // die Nabe der Ecke: der Flat stellt jedes Rad-Blatt je Ecke als eigene Instanz (`_foundryFlattenFor`,
                        // DIE RÄDER: rad = { ecke, hx, hy, hz, … }) — `rad.raeder` trägt nur die Vorlage vor dem Flat (bis
                        // fahrzeug-stapel las die Linse es hier: „Cannot read properties of undefined (reading '0')“)
                        maß.set(lf.geom, { minY, maxR, sehne: sx1 - sx0, dreht: !!lf.rad.dreht, k: Math.hypot(e[0], e[1], e[2]), hy: lf.rad.hy });
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
                // B-k: DIE SPUR (fahrzeug-medium-2) — der gestellte GT fährt zehnmal dieselben 12 m weichen Bodens (Gier 0, längs +x)
                // durch den Schreib-Akt der Welt (`_fahrRad`: je Rad die Rinne der Durchfahrten vor ihm, dann sein Tritt), je Durchfahrt
                // ein frischer Fahr-Zustand; gelesen an den Zellen beider Spuren, über die Vorder- und Hinterrad rollten. Das Feld
                // der Tritte kehrt danach zurück (die Wege-Karte behält die Farbe der Spur, fern von B-h).
                try {
                    const VCk = window.__vehicleCore;
                    const SK = r._fahrSatz(entry, r._vehicleProfile(entry));
                    const TT = r.constructor.TRITT;
                    const wm = r.state.worldMeta;
                    const vorher = [{ ...((wm && wm.tritt) || {}) }, new Map(r._trittSchwach || [])];
                    const hk = (x, z) => r._voxelSurfaceY(x, z);
                    const weich = (x, z) => {
                        const y = hk(x, z);
                        const Z = Number.isFinite(y) && r._stoff(r._kontaktStoffAt(x, z, y));
                        return !!(Z && Z.radBoden) && !(r._atlasWaterLevelAt(x, z, y) > y - 0.3);
                    };
                    const q = SK.auf.quer;
                    const pmk = r.state.playerMesh.position;
                    let ort = null;
                    for (let k = 0; k < 600 && !ort; k++) {
                        const [x0, z0] = [pmk.x + Math.cos(k * 2.4) * (8 + k * 0.2), pmk.z + Math.sin(k * 2.4) * (8 + k * 0.2)];
                        let ja = true;
                        for (let sx = -3; sx <= 15 && ja; sx += 1) for (const dz of [-q, 0, q]) ja = ja && weich(x0 + sx, z0 + dz);
                        if (ja) ort = { x0, z0 };
                    }
                    const zellen = [];
                    if (ort)
                        for (let x = ort.x0 + 3.25; x < ort.x0 + 9; x += TT.zelleM)
                            for (const zz of [ort.z0 - q, ort.z0 + q]) {
                                const [i, j] = [Math.floor(x / TT.zelleM), Math.floor(zz / TT.zelleM)];
                                zellen.push([(i + 0.5) * TT.zelleM, (j + 0.5) * TT.zelleM]);
                            }
                    const fahre = () => {
                        const z = VCk.fahrZustand(ort.x0, ort.z0, 0);
                        let tief = 0;
                        for (let sx = 0; sx <= 12; sx += 0.2) {
                            [z.x, z.y, z.luft] = [ort.x0 + sx, hk(ort.x0 + sx, ort.z0), false];
                            const b = r._fahrRad(z, SK, false);
                            if (b && sx >= 6 && sx < 6.2) tief = b.z;
                        }
                        return +(tief * 100).toFixed(2);
                    };
                    const lies = () => ({
                        gemalt: zellen.filter(([x, z]) => r._pfadFeldAt(x, z, hk(x, z)) >= 0.5).length,
                        erde: zellen.filter(([x, z]) => r._kontaktStoffAt(x, z, hk(x, z)) === "erde").length,
                        tritte: zellen.map(([x, z]) => r._trittZahl(x, z)).sort((a, b) => a - b)[zellen.length >> 1],
                    });
                    if (ort) {
                        const tief1 = fahre();
                        const l1 = lies();
                        let tief10 = tief1;
                        for (let n = 2; n <= 10; n++) tief10 = fahre();
                        const l10 = lies();
                        res.spur = {
                            ort: [+ort.x0.toFixed(1), +ort.z0.toFixed(1)],
                            zellen: zellen.length,
                            gemalt1: l1.gemalt,
                            gemalt10: l10.gemalt,
                            erde10: l10.erde,
                            tritte1: +(l1.tritte || 0).toFixed(2),
                            tritte10: +(l10.tritte || 0).toFixed(2),
                            tief1,
                            tief10,
                        };
                    } else res.spur = { zellen: 0, grund: "kein weicher Ort in 600 Proben um den Spieler" };
                    if (wm) wm.tritt = vorher[0];
                    r._trittSchwach = vorher[1];
                } catch (eK) {
                    res.spurErr = fehlerText(eK);
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

    // B-k: die Spur des gestellten Wagens im Boden — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const spurV = spurVerdict(out.spur);
    check(
        "B-k: SPUR — nach einer Durchfahrt malt die Spur nichts, nach zehn ist jede Zelle der Spur Erde (Wege-Karte und Stoff unter dem Fuß), die Rinne wächst",
        spurV.length === 0 && !out.spurErr,
        out.spurErr || `${JSON.stringify(out.spur)}${spurV.length ? " — Täter: " + spurV.join(", ") : ""}`
    );

    wandEnde(
        errs,
        "DAS LAB-FAHRPROFIL FÜHRT (N6): die Bruecke rechnet exportDrive beim Buch-Bau bit-exakt, _vehicleProfile faehrt die Lab-Werte, der Bewegungs-Loop ist EIN Pfad."
    );
});
