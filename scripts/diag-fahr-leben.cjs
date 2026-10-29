// diag-fahr-leben.cjs — DIE FAHR-LINSE DES LEBENS (Familie fahren): sie fährt den Ritt durch den ECHTEN
// Spiel-Takt (`_gameLoopTick` — Akkumulator, Sim-Schritte, Interpolation, Frame-Tick), nie an ihm vorbei, und sie ruft
// den Fahr-Schritt des Kerns selbst (vehicle-core), nie einen Nachbau. Die Befunde je Zeile tragen die Commit-Messages.
//
//   node scripts/diag-fahr-leben.cjs [--selftest | --kette | --kern | --koerper | --rueckmeldung | --wegenetz [--mutante | --gleich]]
//   Port: FAHR_LEBEN_PORT (Standard 4413)
"use strict";
const { statikServer, nullRenderer, ROOT: root, hauptLauf, pruefer, wandEnde, selbsttestEnde, starteBrowser } = require("./lib/welt-boot.cjs");
const path = require("path");

const PORT = Number(process.env.FAHR_LEBEN_PORT || 4413);
const schalter = (f) => process.argv.includes(f);

const { errs, check } = pruefer();
const taeter = (v, trenner = " · ") => (v.length ? " — Täter: " + v.join(trenner) : "");

// ── DAS TAKT-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const TAKT = { gierGrad: 0.5, wegAnteil: 0.02, wegMinM: 0.4, wegFahrtMinM: 5, haltM: 0.05, versatzM: 0.01 };
function taktVerdict(m, wegFahrtMinM) {
    const out = [];
    const minWeg = Number.isFinite(wegFahrtMinM) ? wegFahrtMinM : TAKT.wegFahrtMinM;
    if (!m || m.gestartet !== true) return ["start"];
    if (!(m.frames > 0)) return ["frames 0"];
    if (m.teleport !== 0) out.push(`teleport ${m.teleport}/${m.frames}`);
    if (!(m.simWeg >= minWeg)) out.push(`sim-weg ${(m.simWeg || 0).toFixed(2)} m (keine Fahrt)`);
    const tol = Math.max(TAKT.wegMinM, TAKT.wegAnteil * (m.simWeg || 0));
    if (!(Math.abs((m.simWeg || 0) - (m.fahrWeg || 0)) <= tol))
        out.push(`weg sim ${(m.simWeg || 0).toFixed(2)} ≠ fahrt ${(m.fahrWeg || 0).toFixed(2)} m`);
    if (Number.isFinite(m.luft) && m.luft !== 0) out.push(`luft ${m.luft}/${m.schritte}`);
    if (Number.isFinite(m.gierGrad) && !(m.gierGrad <= TAKT.gierGrad)) out.push(`gier ${m.gierGrad.toFixed(1)}°`);
    // DIE GERITTEN-WAND: der Eintrag steht auf dem Reiter (Distanz 0), seine Stufe ist 0 — nie die Karte unter dem Reiter
    if (!(m.versatz <= TAKT.versatzM)) out.push(`versatz ${Number(m.versatz).toFixed(3)} m (der Eintrag folgt dem Reiter nicht)`);
    if (m.stufe !== 0) out.push(`stufe ${m.stufe} (geritten nie Grob- oder Kartenstufe)`);
    return out;
}
// Am Hang ohne Taste: kein Teleport, der Wagen hält, die Gier steht.
function haltVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (m.teleport !== 0) out.push(`teleport ${m.teleport}/${m.frames}`);
    if (!(m.fahrWeg <= TAKT.haltM)) out.push(`rollt ${(m.fahrWeg || 0).toFixed(2)} m (v ${(m.v || 0).toFixed(1)} m/s)`);
    if (!(m.gierGesamt <= TAKT.gierGrad)) out.push(`gier ${(m.gierGesamt || 0).toFixed(1)}°`);
    return out;
}
// T4 Der Wechsel am Steilhang (F1): jede zeichnende Stufe am Wagen, je Rückkehr nach Third (Ego drehte ≥ egoGrad) die Kamera
// nach 10 Bildern an der Gier, Ruck (das Soll von fahrzeug.K3 Staffel 2, vorher 0,07: die Bildzeit zitterte die Feder 0,03) und
// Gleichlauf p95, Höhe über der Ebene des Wagens p05.
const WECHSEL = { stufeM: 0.2, egoGrad: 70, azGrad: 10, ruckM: 0.02, gleichMax: 0.2, hochMin: 10, wiederaufGrad: 1, sprungM: 0.5, abV: 7.5, fovGrad: 0.5 };
function wechselVerdict(m) {
    if (!m || m.gestartet !== true) return [m && !m.ort ? "steilhang: kein Ort (vakuös)" : "wechsel start"];
    const W = WECHSEL;
    const out = [];
    if (!(m.stufeM <= W.stufeM)) out.push(`stufe ${m.stufeWer} ${m.stufeM} m neben dem Wagen (sie fährt nicht mit)`);
    if (!(m.band > 0)) out.push("band: kein Band-Partner im Ritt (vakuös)");
    if (!(m.ego.length === 2 && m.ego.every((g) => g >= W.egoGrad)))
        out.push(`ego: die Gier drehte ${m.ego.join(" · ")}° (vakuös, Soll 2 × ≥ ${W.egoGrad}°)`);
    if (!(m.nach10.length === 2 && m.nach10.every((g) => g <= W.azGrad)))
        out.push(`kamera ${m.nach10.join(" · ")}° neben der Gier 10 Bilder nach dem Wechsel (die alte Richtung)`);
    if (!(m.abSprung.length === 2 && m.abV.every((v) => v >= W.abV) && m.abSprung.every((x) => x <= W.sprungM)))
        out.push(`absteigen in voller Fahrt (${m.abV.join(" · ")} m/s): die Kamera springt ${m.abSprung.join(" · ")} m je Bild (Third · Ego, Soll ≤ ${W.sprungM})`);
    if (!(m.abFov && m.abFov.length === 3 && m.abFov.every((x) => x <= W.fovGrad)))
        out.push(`sichtfeld: Ego → Third und der Abstieg in voller Fahrt springen ${m.abFov && m.abFov.join(" · ")}° je Bild (Wechsel · Third · Ego, Soll ≤ ${W.fovGrad})`);
    // eine Zahl ohne Bilder ist nie grün (null ist nie 0, Lehre 17)
    if (!(m.ruckN >= 20 && m.ruckP95 <= W.ruckM)) out.push(`ruck p95 ${m.ruckP95} m quer je Bild (Soll ≤ ${W.ruckM}, ${m.ruckN} Bilder)`);
    if (!(m.gleichN >= 20 && m.gleichP95 <= W.gleichMax))
        out.push(`gleichlauf p95 ${m.gleichP95} (Soll ≤ ${W.gleichMax}, ${m.gleichN} Bilder): das Bild neben der Physik`);
    if (!(m.hochN >= 20 && m.hochP05 >= W.hochMin))
        out.push(`hoch p05 ${m.hochP05}° über der Ebene des Wagens (Soll ≥ ${W.hochMin}°, ${m.hochN} Bilder)`);
    if (!Number.isFinite(m.wiederauf)) out.push("wiederaufstieg: kein Bild ohne Sim-Schritt (vakuös)");
    else if (!(m.wiederauf <= W.wiederaufGrad)) out.push(`wiederaufstieg ${m.wiederauf}° neben der Gier`);
    return out;
}

// DAS FAHR-GESETZ EINES REZEPTS (der Satz, den Probefahrt und Welt fahren): exportDrive über die Vorgabe und den Patch des Rezepts.
const gesetzVon = (VC, pid) => VC.fahrGesetz(VC.exportDrive(Object.assign({}, VC.DEFAULT_P, VC.presetPatch(pid))));
// ── K2–K5 — DER FAHR-SCHRITT AM KERN SELBST (Node; dieselbe Funktion, die Probefahrt und Welt rufen). ──
function kernProbe(VC) {
    if (!VC || typeof VC.fahrSchritt !== "function" || typeof VC.fahrGesetz !== "function")
        return [["K2 der Kern trägt den Fahr-Schritt", false, "vehicle-core ohne fahrSchritt/fahrGesetz"]];
    const DT = 1 / 60;
    const lauf = (pid, boden, n, eingabe, x0) => {
        const G = gesetzVon(VC, pid);
        const z = VC.fahrZustand(x0 || 0, 0, 0);
        VC.fahrStand(z, G, boden, 0);
        const m = { luft: 0, sprung: 0, G, z };
        let y0 = z.y;
        for (let i = 0; i < n; i++) {
            VC.fahrSchritt(z, eingabe(i, z), G, boden, DT);
            m.sprung = Math.max(m.sprung, Math.abs(z.y - y0));
            y0 = z.y;
            if (z.luft) m.luft++;
        }
        return m;
    };
    const rad = (g) => (g * Math.PI) / 180;
    const out = [];
    // K2 — die Steig-Grenze je Rezept (Vollgas 4 s aus dem Stand: kommt er 0,5 m voran?) gegen tan α = μ.
    const grenzen = [];
    let k2 = true;
    for (const pid of Object.keys(VC.PRESETS)) {
        let lo = 0;
        let hi = 89;
        for (let it = 0; it < 22; it++) {
            const a = (lo + hi) / 2;
            const t = Math.tan(rad(a));
            const m = lauf(
                pid,
                (x) => x * t,
                240,
                () => ({ throttle: 1 })
            );
            if (m.z.x > 0.5) lo = a;
            else hi = a;
        }
        const mu = VC.FAHR.maxGrip * gesetzVon(VC, pid).grip;
        const soll = (Math.atan(mu) * 180) / Math.PI;
        grenzen.push(`${pid} ${lo.toFixed(1)}°/${soll.toFixed(1)}°`);
        if (!(lo <= soll + 0.5)) k2 = false;
    }
    out.push(["K2 Reibkreis längs: kein Rezept steigt steiler als tan α = μ", k2, grenzen.join(" · ")]);
    // K3 — Halt am 21°-Hang ohne Eingabe; über dem Reibkreis (50°) rutscht der Wagen.
    const h21 = lauf(
        "gt",
        (x) => x * Math.tan(rad(21)),
        300,
        () => ({})
    );
    const h50 = lauf(
        "gt",
        (x) => x * Math.tan(rad(50)),
        120,
        () => ({})
    );
    out.push([
        "K3 Halt: 21°-Hang ohne Eingabe hält (≤ 0,01 m, Gier 0), 50° rutscht",
        Math.abs(h21.z.x) <= 0.01 && Math.abs(h21.z.yaw) < 1e-6 && h50.z.x < -1,
        `21°: ${h21.z.x.toFixed(3)} m · 50°: ${h50.z.x.toFixed(2)} m`,
    ]);
    // K4 — der Quer-Hangabtrieb (Gefälle nach +z: links = −z liegt höher).
    const quer = (a) => (x, z) => -z * Math.tan(rad(a));
    const q35 = lauf("gt", quer(35), 300, () => ({ throttle: 0.4 }));
    const q30 = lauf("gt", quer(30), 300, () => ({}));
    const q50 = lauf("gt", quer(50), 300, () => ({}));
    out.push([
        "K4 Querhang: Fahrt längs 35° ohne Lenkung driftet talwärts, am Stand hält 30°, 50° rutscht",
        q35.z.z > 0.3 && Math.abs(q30.z.z) <= 0.01 && q50.z.z > 1,
        `35° Fahrt ${q35.z.z.toFixed(2)} m · 30° Stand ${q30.z.z.toFixed(3)} m · 50° Stand ${q50.z.z.toFixed(2)} m`,
    ]);
    // K5 — die Vertikale: Kuppe (R 12 m hebt bei Vollgas ab, R 40 m nicht), Klippe 7 m (ballistisch, landet).
    const kuppe = (R) => (x) => {
        const x1 = R * 0.3;
        return Math.abs(x) < x1 ? -(x * x) / (2 * R) : -(x1 * x1) / (2 * R) - (Math.abs(x) - x1) * 0.3;
    };
    const k12 = lauf("gt", kuppe(12), 600, () => ({ throttle: 1 }), -60);
    const k40 = lauf("gt", kuppe(40), 600, () => ({ throttle: 1 }), -60);
    const kl = lauf(
        "gt",
        (x) => (x < 10 ? 0 : -7),
        240,
        () => ({ throttle: 1 })
    );
    out.push([
        "K5 Vertikale: Kuppe R 12 m hebt ab, R 40 m nicht; die 7-m-Klippe ohne Höhen-Sprung > 0,5 m je Schritt, gelandet",
        k12.luft > 0 && k40.luft === 0 && kl.luft > 0 && kl.sprung <= 0.5 && !kl.z.luft && Math.abs(kl.z.y + 7) <= 0.05,
        `Kuppe R12 Luft ${k12.luft} · R40 Luft ${k40.luft} · Klippe Luft ${kl.luft}, größter Sprung ${kl.sprung.toFixed(2)} m, Ende y ${kl.z.y.toFixed(2)}`,
    ]);
    // K7 — DIE WAND IST EIN SPRUNG DES BODENS: der GT steht auf ebenem Boden, dann liegt der Boden
    // unter ihm auf einmal 0,35 m höher (der Schub des Wirts quer auf höheren Grund). Die Wand hält EINEN Schritt (der Wirt
    // schiebt heraus), dann steigt der Wagen auf sein Gesetz, je Schritt höchstens eine Stufe.
    {
        const G7 = gesetzVon(VC, "gt");
        const z7 = VC.fahrZustand(0, 0, 0);
        VC.fahrStand(z7, G7, () => 0, 0);
        const hoch = () => 0.35;
        const ys = [];
        for (let i = 0; i < 6; i++) {
            VC.fahrStand(z7, G7, hoch, DT);
            ys.push(z7.y);
        }
        const stufe7 = VC.FAHR.schritt.stufeRad * G7.radR;
        const gehalten = Math.abs(ys[0]) <= 1e-9;
        const steigt = ys.slice(1).every((y, i) => y - (i === 0 ? ys[0] : ys[i]) <= stufe7 + 1e-9);
        const steht = Math.abs(ys[2] - 0.35) <= 0.01 && Math.abs(ys[5] - 0.35) <= 0.01;
        out.push([
            "K7 die Wand ist ein Sprung des Bodens: sie hält EINEN Schritt, dann steigt der Wagen auf sein Gesetz (je Schritt ≤ eine Stufe) — nie für immer darunter",
            gehalten && steigt && steht,
            `Boden +0,35 m: Höhe je Schritt ${ys.map((y) => y.toFixed(3)).join(" · ")} (Stufe ${stufe7.toFixed(3)} m)`,
        ]);
    }
    // K6 — DIE VERWINDUNG: bilinear verwundener Boden, die vier Aufstandspunkte ±tau um die Ebene. Kein Rad
    // liegt tiefer im Boden als sein Federweg (auf.hub — der GT federt ein Rad einzeln, ein starres Werk nie), und wo der
    // Federweg trägt, hebt die Verwindung den Wagen nicht.
    const Pv = Object.assign({}, VC.DEFAULT_P, VC.presetPatch("gt"));
    const Dv = VC.exportDrive(Pv);
    const Ggt = VC.fahrGesetz(Dv);
    const av = Ggt.auf;
    const starr = VC.fahrGesetz(Dv, { vorn: av.vorn, hinten: av.hinten, quer: av.quer, bauch: av.bauch, hub: 0 });
    const mL = (av.vorn + av.hinten) / 2;
    const hL = (av.vorn - av.hinten) / 2;
    const verwunden = (tau) => (x, z) => tau * ((x - mL) / hL) * (-z / av.quer);
    const tief = (G, tau) => {
        const boden = verwunden(tau);
        const z = VC.fahrZustand(0, 0, 0);
        VC.fahrStand(z, G, boden, 0);
        let pen = 0;
        // Fahrt-Rahmen des Kerns bei yaw 0: vorn +x, links −z
        for (const l of [av.vorn, av.hinten])
            for (const q of [av.quer, -av.quer]) {
                const ebene = z.y + Math.tan(z.steig) * l + Math.tan(z.wank) * q;
                pen = Math.max(pen, boden(l, -q) - ebene);
            }
        return { pen, y: z.y };
    };
    const hubGt = av.hub > 0 ? av.hub : 0;
    const v45 = tief(Ggt, 0.45);
    const s45 = tief(starr, 0.45);
    const v10 = tief(Ggt, 0.1);
    out.push([
        "K6 Verwindung: kein Rad tiefer im Boden als sein Federweg (GT: radHub × radR, starr: 0); im Federweg hebt sie nicht",
        hubGt > 0 && v45.pen <= hubGt + 1e-9 && s45.pen <= 1e-9 && Math.abs(v10.y) <= 1e-9,
        `GT tau 0,45: ${v45.pen.toFixed(3)} m im Boden (Federweg ${hubGt.toFixed(3)}) · starr tau 0,45: ${s45.pen.toFixed(3)} m · GT tau 0,10: Hub ${v10.y.toFixed(3)} m`,
    ]);
    const r8 = (out.reifen = reifenMessung(VC)); // die Zeile REIFEN liest die Station fahrzeug.K1
    const v8 = reifenVerdict(r8);
    out.push([
        "K8 Reifen (fahrzeug.K1): Spitze je Achse und Rezept bei 6–10°, bis 30° ≥ 15 % Abfall; Takt ≥ 240 Hz, ≤ 50 µs je Schritt",
        !v8.length,
        `Takt ${r8.hz} Hz · ${r8.kostenUs} µs ${v8.join(" · ")}`,
    ]);
    return out;
}
// ── K8 DER REIFEN: die Seitenkraft je 0,1° Schlupf bis 30°, vorn vlat = c·ω, hinten −b·ω (die andere Achse schlupffrei);
// der Takt (`taktHz`) bei 12 m/s, Vollgas und vollem Einschlag; in der Welt (W-Kette, `reifenWeltVerdict`) der Bremsweg
// 50 → 0 km/h Gras gegen Weg (`boden`), nass gegen trocken auf beiden (KETTE.nass), μ(gras) halb in der Stoff-Zeile (`zeile`) ──
const REIFEN = { spitze: [6, 10], abfall: 0.15, hz: 240, kostenUs: 50, boden: 1.5, nass: 1.3, zeile: 1.3, labor: 1 };
// DER TAKT des Fahr-Schritts an EINEM Aufruf (z, e, G, dt): die gröbste Teilung in n gleiche Aufrufe, die Tempo, Gier und
// Lenkung nicht mehr ändert, als Rate n / dt — K8 am Kern, in der Seite (`__taktHz`) an jedem Schritt der Welt (S1).
function taktHz(VC, z0, e, G, dt) {
    const lauf = (n, z = Object.assign({}, z0)) => {
        for (let k = 0; k < n; k++) VC.fahrKraefte(z, e, G, dt / n);
        return [z.vlong, z.vlat, z.yawRate, z.yaw, z.steer].join();
    };
    let n = 1;
    while (n < 16 && lauf(2 * n) === lauf(1)) n *= 2;
    return n / dt;
}
function reifenMessung(VC) {
    const m = { achsen: [] };
    let G;
    for (const pid of Object.keys(VC.PRESETS)) {
        G = gesetzVon(VC, pid);
        for (const [wo, hebel] of [
            ["vorn", G.c],
            ["hinten", -G.b],
        ]) {
            const f = [];
            for (let g = 1; g <= 300; g++) {
                const w = ((15 + G.slipEps) * Math.tan((g * Math.PI) / 1800)) / G.L;
                const z = Object.assign(VC.fahrZustand(0, 0, 0), { vlong: 15, yawRate: w, vlat: hebel * w });
                f.push(Math.abs(VC.fahrKraefte(z, {}, G, 0).aLat));
            }
            const i = f.indexOf(Math.max(...f));
            m.achsen.push({ wo: pid + " " + wo, spitze: (i + 1) / 10, abfall: 1 - f[299] / f[i] });
        }
    }
    m.hz = taktHz(VC, Object.assign(VC.fahrZustand(0, 0, 0), { vlong: 12 }), { throttle: 1, steer: 1 }, G, 1 / 60);
    const [z, t0] = [VC.fahrZustand(0, 0, 0), process.hrtime.bigint()];
    for (let i = 0; i < 20000; i++) VC.fahrKraefte(z, { throttle: 1, steer: i & 64 ? 1 : -1 }, G, 1 / 60);
    m.kostenUs = +(Number(process.hrtime.bigint() - t0) / 2e7).toFixed(2);
    return m;
}
function reifenVerdict(m) {
    const out = [];
    for (const a of m.achsen) {
        if (!(a.spitze >= REIFEN.spitze[0] && a.spitze <= REIFEN.spitze[1])) out.push(`spitze ${a.wo} ${a.spitze}°`);
        if (!(a.abfall >= REIFEN.abfall)) out.push(`abfall ${a.wo} ${Math.round(a.abfall * 100)} %`);
    }
    if (!(m.hz >= REIFEN.hz)) out.push(`takt ${m.hz} Hz`);
    if (!(m.kostenUs <= REIFEN.kostenUs)) out.push(`kosten ${m.kostenUs} µs`);
    return m.achsen.length ? out : ["reifen ohne Achse"];
}

// ── DAS STATIONS-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test). ──
const STATION = {
    laborM: 0.01,
    sprungM: 0.5,
    querM: 0.3,
    rolleRad: 1,
    lenkRad: 0.1,
    spaltM: 0.03,
    schubM: 0.01,
    sattelRad: 0.01,
    standM: 0.05,
    // S4: die Flug-Höhe der Station (Räder über dem Grund), ab der abgestiegen wird — 10× die Stand-Toleranz: ein Wagen, der in
    // der Luft hängen bliebe, steht dort sichtbar über ihr. Die Landform trägt an der Wiese einen Hang von 3,7 m: der Wagen
    // fliegt 87 Takte, höchstens 0,69 m über dem Grund (die 1 m davor fand nur die 8,5-m-Klippe der alten Welt).
    flugM: 0.5,
    // L (die Orte der Leben-Schau): eine Rad-Stufe des GT (FAHR.schritt.stufeRad · radR ≈ 0,17 m) ist das Maß
    unterM: 0.2, // so tief darf der Wagen höchstens unter der Ebene seiner Räder liegen (einen Schritt lang: die Wand)
    unterN: 3, // so viele Sim-Schritte höchstens mehr als 5 cm darunter (die Wand hält einen, das Steigen zwei)
    versetztM: 0.2, // so weit versetzt der Kontakt-Löser den Wagen je Schritt höchstens über die eigene Fahrt hinaus
    wegM: 5, // so weit fährt der GT mit W nach dem Kontakt mindestens (er steht nie für immer)
    randM: 10, // der Spalt ist ein Spalt: der Rand liegt so hoch über seinem Grund (sonst ist L2 vakuös)
    fallM: 3, // so tief fällt der Wagen hinter der Kante mindestens
    // L3–L5 der Stoß: das EINE Impuls-Gesetz (Masse aus Leib und Kern, Stoß-Zahl, Impuls-Austausch)
    stossVMin: 3, // m/s: so schnell fährt der GT mindestens in den Stoß (sonst ist die Probe vakuös)
    rueckprallMs: -0.3, // m/s: so weit rückwärts prallt der Wagen am Fels in den 8 Schritten nach dem Stoß mindestens
    wagenWegM: 0.3, // m: so weit rutscht der gestoßene geparkte GT mindestens
    wagenFahrt: 0.2, // Anteil der Fahrt, den der stoßende Wagen nach dem Stoß mit einem gleich schweren behält
    baerWegM: 0.5, // m: so weit stößt der Wagen den Bären mindestens
    baerFahrt: 0.5, // Anteil der Fahrt, den der Wagen nach dem Stoß mit dem leichteren Bären behält
    wagenHaltM: 0.05, // m: so weit rutscht ein gebremster GT höchstens, wenn ein Mensch gegen ihn läuft
    lockstepM: 1e-6, // m: so weit dürfen Wagen und Bär nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)
    sitzM: 0.03, // m: so weit dürfen die Oberschenkel über oder in der Sitzfläche liegen (0710-4 Klasse 4)
    ankerM: 0.05, // m: so weit darf das Hüftgelenk neben dem Sitz-Anker stehen
    blickGrad: 5, // °: so weit darf der sitzende Leib neben die Fahrt schauen
    schwimmTiefM: 0.25, // m: so tief darf ein gleitender Schwimmer unter seiner Schwimm-Linie liegen (die Wellen ±0,2)
    hautAussen: 0.005, // Anteil der Haut des Reiters, der je Richtung außerhalb der Hülle des Wagens liegen darf
    spielerDv: 0.3, // m/s: so viel bekommt der Spieler mindestens vom rutschenden GT
    spielerTiefM: 0.12, // m: höchstens EIN Frame der Anfahrt (zwei Sim-Schritte bei 3,5 m/s) zwischen Kapsel und Blocker-Box
};
function stationVerdict(s) {
    const out = [];
    if (!s || !s.kern) return ["kern ohne fahrSchritt"];
    if (!s.labor || !(s.labor.schritte > 0)) out.push("labor keine Spur");
    else if (!(s.labor.maxM <= STATION.laborM))
        out.push(`labor≠welt ${s.labor.maxM.toFixed(3)} m (Schritt ${s.labor.bei})`);
    if (!s.klippe) out.push("klippe nicht gefunden");
    else {
        if (!(s.klippe.sprung <= STATION.sprungM)) out.push(`klippe-sprung ${s.klippe.sprung.toFixed(2)} m je Schritt`);
        if (!(s.klippe.luft > 0)) out.push("klippe ohne Flug");
    }
    const ab = s.absteigen;
    if (!ab) out.push("absteigen keine Probe");
    else if (!ab.imFlug || !(ab.hoehe >= STATION.flugM))
        out.push(`absteigen nicht im Flug (vakuös, ${(ab.hoehe || 0).toFixed(2)} m)`);
    else {
        if (!(Math.abs(ab.ueberBoden) <= STATION.standM))
            out.push(`absteigen-luft: der Wagen hängt ${ab.ueberBoden.toFixed(2)} m über der Ebene seiner Räder`);
        if (!(ab.sprung <= STATION.sprungM)) out.push(`absteigen-sprung ${ab.sprung.toFixed(2)} m je Schritt`);
    }
    if (!s.quer) out.push("querhang nicht gefunden");
    else if (!(s.quer.drift >= STATION.querM))
        out.push(`querhang ohne Abtrieb (Quer-Abdrift ${s.quer.drift.toFixed(2)} m)`);
    const rd = s.raeder;
    if (!rd) out.push("raeder keine Probe");
    else {
        if (!(rd.leaves > 0)) out.push("raeder starr (keine Rad-Instanz)");
        else {
            if (!(rd.rolle >= STATION.rolleRad)) out.push(`raeder rollen nicht (${rd.rolle.toFixed(2)} rad)`);
            if (!(rd.lenk >= STATION.lenkRad && rd.lenkHinten <= 0.01))
                out.push(`raeder lenken nicht (vorn ${rd.lenk.toFixed(3)} · hinten ${rd.lenkHinten.toFixed(3)} rad)`);
            // der Bremssattel (R:s) steht je Ecke als eigenes Leaf und hängt an der Nabe wie im Labor: er rollt nie
            if (!(rd.stehend > 0)) out.push("raeder ohne Sattel (kein stehendes Rad-Leaf)");
            else if (!(rd.stehRolle <= STATION.sattelRad))
                out.push(`raeder Sattel rollt (${rd.stehRolle.toFixed(2)} rad)`);
        }
        if (!(rd.tauchBremse <= STATION.spaltM)) out.push(`raeder tauchen beim Bremsen ${rd.tauchBremse.toFixed(3)} m`);
        if (!(rd.spaltP75 <= STATION.spaltM)) out.push(`raeder Spalt p75 ${rd.spaltP75.toFixed(3)} m`);
    }
    const pf = s.pflicht;
    if (!pf) out.push("pflicht keine Probe");
    else if (pf.satz !== "bruch" || pf.ebene !== "bruch")
        out.push(`pflicht still (fahrSatz ${pf.satz} · rittEbene ${pf.ebene})`);
    else if (pf.leser !== true) out.push("pflicht-leser: _fahrSatz/_rittEbene lesen den Kern nicht durch _fahrSchrittGesetz");
    const hk = s.huelleKonsum || {};
    for (const k of ["gleiten", "kapsel", "leibWagen", "leibTier"])
        if (hk[k] !== true) out.push(`huelle-konsum ${k}: ${s.huelleKonsum ? "der Leser ruft die EINE Quelle nicht" : "keine Probe"}`);
    const hg = s.huelleHang;
    if (!hg) out.push("huelle-hang keine Probe");
    else if (!(hg.schub >= 0.5)) out.push(`huelle-hang vakuös (Schub ${(hg.schub || 0).toFixed(2)} m)`);
    else if (!(hg.eindringen <= 0.01)) out.push(`huelle-hang Schub ins Gelände ${hg.eindringen.toFixed(2)} m`);
    if (!s.huelleSchub) out.push("huelle-schub keine Probe");
    else if (!(s.huelleSchub.weg <= STATION.schubM))
        out.push(`huelle-schub ein Wesen schob den Wagen ${s.huelleSchub.weg.toFixed(2)} m`);
    // L1 DER HANGFUSS: nach JEDER Kontakt-Antwort steht der Wagen wieder auf dem Gesetz, der Schub je Schritt ist
    // begrenzt, er fährt weiter.
    const hf = s.hangfuss;
    if (!hf) out.push("hangfuss keine Probe");
    else if (!hf.ziel || !(hf.kontakte >= 1))
        out.push(`hangfuss vakuös (Glutbrunnen ${hf.ziel ? "steht" : "fehlt"}, ${hf.kontakte || 0} Kontakte)`);
    else {
        if (!(hf.unterMax <= STATION.unterM && hf.unterN <= STATION.unterN))
            out.push(
                `hangfuss-unter: der Wagen liegt ${hf.unterMax.toFixed(2)} m unter der Ebene seiner Räder (${hf.unterN} Schritte > 0,05 m) — eine Kontakt-Antwort ohne Erdung`
            );
        if (!(hf.schubMax <= STATION.versetztM))
            out.push(
                `hangfuss-schub: der Kontakt-Löser versetzt den Wagen in EINEM Schritt ${hf.schubMax.toFixed(2)} m`
            );
        if (!(hf.weg >= STATION.wegM)) out.push(`hangfuss-steht: mit W nur ${hf.weg.toFixed(2)} m gefahren`);
    }
    // L3–L5 DER STOSS: ein Stoß hat eine Folge — Rückprall am Fels, der Gegner bekommt seinen Impuls, ein Ereignis
    // für Kamera und Klang.
    for (const [k, name] of [
        ["stossFels", "stoss-fels"],
        ["stossWagen", "stoss-wagen"],
        ["stossBaer", "stoss-baer"],
    ]) {
        const m = s[k];
        if (!m) {
            out.push(`${name} keine Probe`);
            continue;
        }
        if (!(m.kontakt >= 0 && m.vVor >= STATION.stossVMin)) {
            out.push(`${name} vakuös (kein Stoß aus ≥ 3 m/s: Kontakt ${m.kontakt}, ${(m.vVor || 0).toFixed(2)} m/s)`);
            continue;
        }
        // der Stoß gilt der Annäherung: gleitet der Gegner schon schneller fort, als der Wagen nachkommt, stößt nichts —
        // die Ursache vor ihrem Symptom (der Wagen verliert dann Fahrt an einen Gegner, der schon fort ist)
        if (m.ohneAnnaeherung > 0)
            out.push(
                `${name}: Stoß ohne Annäherung (${m.ohneAnnaeherung}×, der Gegner glitt schon schneller fort) — die Fahrt statt der Relativ-Geschwindigkeit`
            );
        const was = `${m.vVor.toFixed(2)} → ${m.vNach.toFixed(2)} m/s`;
        if (k === "stossFels" && !(m.vMinNach <= STATION.rueckprallMs))
            out.push(
                `${name}: kein Rückprall (${was}, kleinste Fahrt danach ${m.vMinNach.toFixed(2)} m/s) — ein Stopp ohne Folge`
            );
        if (k === "stossWagen") {
            if (!(m.zielWeg >= STATION.wagenWegM))
                out.push(
                    `${name}: der geparkte GT bewegt sich ${m.zielWeg.toFixed(2)} m (${was}) — er bekommt keinen Impuls`
                );
            if (!(m.vNach >= STATION.wagenFahrt * m.vVor))
                out.push(`${name}: der Wagen steht nach dem Stoß (${was}) — kein Impuls-Austausch`);
        }
        if (k === "stossBaer") {
            if (!(m.zielWeg >= STATION.baerWegM))
                out.push(`${name}: der Bär bewegt sich ${m.zielWeg.toFixed(2)} m (${was}) — er bekommt keinen Impuls`);
            if (!(m.vNach >= STATION.baerFahrt * m.vVor))
                out.push(`${name}: der Wagen steht am Bären (${was}) — kein Impuls-Austausch nach Masse`);
        }
        if (!(m.ereignisse >= 1 && m.ruck > 0))
            out.push(
                `${name}: kein Stoß-Ereignis (${m.ereignisse} Ereignisse, Kamera-Ruck ${(m.ruck || 0).toFixed(2)}) — keine Rückmeldung`
            );
    }
    // K3 (physik.K3) DER FREIE KÖRPER: die Kisten ruhen ≤ 2 s am Boden und jede auf der darunter (±2 cm), zittern danach und
    // wach ≤ 1 cm; der Wagen kippt das Fass > 45°; die Mutanten (Schwere 0, ohne Stoß) fallen.
    const fk = s.frei;
    const ruht = (k) => k && k.ruheS <= 2 && [k.boden, ...k.fugen].every((d) => Math.abs(d) <= 0.02);
    if (!fk || !fk.fass) out.push("frei keine Probe");
    else
        for (const [gut, t] of [
            [ruht(fk.kisten), "frei-ruhe: die Kisten ruhen nicht am Boden"],
            [fk.kisten.zittern <= 0.01 && fk.wachZittern <= 0.01, "frei-zittern über 1 cm"],
            [fk.fass.kipp > 45, "frei-fass: der Wagen kippt das Fass nicht"],
            [!ruht(fk.schwerelos), "frei-mutante: ohne Schwere ruhen die Kisten am Boden (vakuös)"],
            [fk.fassOhneStoss && fk.fassOhneStoss.kipp < 45, "frei-mutante: ohne Stoß kippt das Fass (vakuös)"],
        ])
            if (!gut) out.push(t);
    // L6 SPIELER UND WAGEN: Impuls in beide Richtungen, keine Durchdringung.
    const sw = s.spielerWagen;
    if (!sw || !sw.a || !sw.b) out.push("spieler-wagen keine Probe");
    else {
        // im Lauf = er geht (die Kadenz folgt der Emotion: 0,81 · 1,15 · 1,44 m/s über die Läufe), nicht: er steht
        if (!(sw.a.kontakt >= 0 && sw.a.vorKontakt >= 0.5))
            out.push(
                `spieler-wagen: der Spieler erreicht den GT nicht im Lauf (vakuös, ${(sw.a.vorKontakt || 0).toFixed(2)} m/s)`
            );
        else if (!(sw.a.paare >= 1))
            out.push(
                `spieler-wagen: der Spieler läuft gegen den GT (${sw.a.vorKontakt.toFixed(2)} m/s) und kein Stoß fällt — kein Impuls`
            );
        else if (!(sw.a.prallNach <= 0))
            out.push(
                `spieler-wagen: nach dem Stoß läuft der Spieler noch mit ${(sw.a.prallNach * 100).toFixed(0)} % seiner Fahrt in den Wagen — er prallt nicht ab`
            );
        if (!(sw.a.wagenWeg <= STATION.wagenHaltM))
            out.push(
                `spieler-wagen: der gebremste GT rutscht ${sw.a.wagenWeg.toFixed(3)} m vom Spieler (die Bremse hält nicht)`
            );
        if (!(sw.a.minAbstand >= -STATION.spielerTiefM))
            out.push(`spieler-wagen: der Spieler steckt ${(-sw.a.minAbstand).toFixed(2)} m im Wagen`);
        if (!(sw.b.spielerDv >= STATION.spielerDv))
            out.push(
                `wagen-spieler: der rutschende GT stößt den Spieler nicht (${(sw.b.spielerDv || 0).toFixed(3)} m/s)`
            );
        if (!(sw.b.minAbstand >= -STATION.spielerTiefM))
            out.push(`wagen-spieler: der GT schiebt sich ${(-sw.b.minAbstand).toFixed(2)} m in den Spieler`);
    }
    // L8 + Schwimmer: der gestoßene Fuchs im Wasser steht bei jeder Bildrate gleich (x, z und y)
    if (s.schwimmer && !s.schwimmer.fehler) {
        const ls = s.lockSchwimmer;
        if (!ls) out.push("lockstep schwimmer: keine Probe");
        else if (!(ls.abw <= STATION.lockstepM) || !(ls.abwY <= STATION.lockstepM))
            out.push(
                `lockstep schwimmer: 20 Sim-Schritte nach dem Stoß steht der Fuchs bei gemischten Frames ${ls.abw} m daneben und ${ls.abwY} m höher/tiefer als bei 60 fps`
            );
    }
    // L10 DER GESTOSSENE SCHWIMMER
    const sch = s.schwimmer;
    if (!sch || sch.fehler) out.push(`schwimmer keine Probe${sch && sch.fehler ? " (" + sch.fehler + ")" : ""}`);
    else if (!(sch.gleitet >= 3)) out.push("schwimmer: der Stoß trägt ihn nicht (vakuös)");
    else if (!(sch.tiefste >= -STATION.schwimmTiefM))
        out.push(
            `schwimmer: der gestoßene Fuchs sinkt ${(-sch.tiefste).toFixed(2)} m unter seine Schwimm-Linie (auf den Grund)`
        );
    // L9 DER REITER IM WAGEN
    const rw = s.reiter;
    if (!rw || !rw.length) out.push("reiter keine Probe");
    else
        for (const q of rw) {
            if (q.fehler || q.sitz === null) {
                out.push(`reiter ${q.typ}: ${q.fehler || "kein Sitz-Anker"}`);
                continue;
            }
            if (q.dach !== null && !(q.oben <= q.dach))
                out.push(`reiter ${q.typ}: die Oberkante steht ${(q.oben - q.dach).toFixed(3)} m über der Dachlinie`);
            if (!(Math.abs(q.schenkel - q.sitz) <= STATION.sitzM))
                out.push(
                    `reiter ${q.typ}: die Oberschenkel liegen ${Math.abs(q.schenkel - q.sitz).toFixed(3)} m ${q.schenkel > q.sitz ? "über" : "unter"} der Sitzfläche`
                );
            if (!(Math.hypot(q.ankerL, q.ankerQ) <= STATION.ankerM))
                out.push(
                    `reiter ${q.typ}: das Hüftgelenk steht ${q.ankerL.toFixed(2)} m längs / ${q.ankerQ.toFixed(2)} m quer neben dem Sitz-Anker`
                );
            if (!(q.blickGrad <= STATION.blickGrad))
                out.push(
                    `reiter ${q.typ}: der Leib schaut ${q.blickGrad.toFixed(0)}° neben die Fahrt (er folgt der Maus)`
                );
            const gl = q.glas;
            if (gl && gl.n > 0 && gl.aussen / gl.n > STATION.hautAussen)
                out.push(
                    `reiter ${q.typ}: ${((100 * gl.aussen) / gl.n).toFixed(1)} % der Haut seitlich durch die gezeichnete Haut des Wagens (${Object.entries(
                        gl.wer
                    )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([w, k]) => `${w} ×${k}`)
                        .join(", ")})`
                );
            const au = q.aussen;
            if (au && au.n > 0)
                for (const art of ["unten", "seite", "oben", "laengs"])
                    if (au[art] / au.n > STATION.hautAussen)
                        out.push(
                            `reiter ${q.typ}: ${((100 * au[art]) / au.n).toFixed(1)} % der Haut ${{ unten: "unter dem Bauch", seite: "seitlich aus der Kabine", oben: "über dem Dach", laengs: "vor dem Bug / hinter dem Heck" }[art]} (bis ${au.tief[art]} m, ${au.wer[art]})`
                        );
        }
    if (s.reiterStand && !(s.reiterStand.abw <= 1e-6))
        // die Gier des Beckens setzt der Gang selbst
        out.push(
            `reiter: nach dem Absteigen steht der Wurzel-Knochen ${s.reiterStand.abw.toFixed(3)} m neben seinem Stand (Gier ${(s.reiterStand.gier || 0).toFixed(3)})`
        );
    // L8 DER STOSS IM SIM-SCHRITT (der Leib vor der Mauer: gate:kollision-bild (V))
    if (!s.lockstep) out.push("lockstep keine Probe");
    else if (s.lockstep.ruhe !== true)
        out.push(`lockstep start: der Wagen kommt vor der Probe nicht zur Ruhe (600 Bilder, der Fahr-Zustand nie drei Bilder lang ≤ 1 nm; zuletzt ${(s.lockstep.unruhe || []).join(" / ")})`);
    else if (s.lockstep.gleicherStart !== true)
        out.push(`lockstep start: die Läufe beginnen an verschiedenen Ständen des ruhenden Wagens (${s.lockstep.startAbw} > 1e-7)`);
    else if (!(s.lockstep.abw <= STATION.lockstepM) || !(s.lockstep.baerAbw <= STATION.lockstepM))
        out.push(
            `lockstep: nach 200 Sim-Schritten steht der Wagen bei gemischten Frames ${s.lockstep.abw.toFixed(3)} m anders als bei 60 fps (Bär ${s.lockstep.baerAbw.toFixed(3)} m)${s.lockstep.erst ? ` — zuerst in Schritt ${s.lockstep.erst.schritt}: ${s.lockstep.erst.groesse} um ${s.lockstep.erst.d}${s.lockstep.erst.tiere ? ` (Tiere nahe dem Wagen ${s.lockstep.erst.tiere.join(" / ")})` : ""}` : ""}`
        );
    // L2 DIE SPALTKANTE: der Wagen fährt über die Kante und fällt.
    const sp = s.spalt;
    if (!sp) out.push("spalt keine Probe");
    else if (!(sp.rand - sp.grund >= STATION.randM))
        out.push(`spalt vakuös (Rand ${(sp.rand || 0).toFixed(1)} m, Grund ${(sp.grund || 0).toFixed(1)} m)`);
    else if (!(sp.vor > 4.5 && sp.yMin < sp.rand - STATION.fallM))
        out.push(
            `spalt-wand: der Wagen hält an der Kante (${sp.vor.toFixed(2)} m über die Kante, tiefste Höhe ${sp.yMin.toFixed(2)} m bei Rand ${sp.rand.toFixed(2)} m) — eine unsichtbare Wand`
        );
    return out;
}

// K1 (physik.K1, `probeKoerper`): die Messung der Meisterkarte und ρ ×2 in der EINEN Stoff-Zeile (jede Masse ×2).
const K1 = { m: 0.01, dv: 0.05, grund: 0.3, holz: 0.1, brust: 0.2 };
function koerperVerdict(k) {
    if (!k || k.err || !k.vor || !k.nach) return { s1: [`keine Probe (${k && k.err})`], s2: ["keine Probe"] };
    const [V, N, s1, s2] = [k.vor, k.nach, [], []];
    const nie = (b, out, t) => b || out.push(t);
    nie(k.mutiert > 0, s1, "keine Mutation");
    const traegt = (x) => (x.anteil >= 0 ? x.anteil < 1 : x.traegt);
    const koerper = (n, out, wasser, lab) => {
        const [a, b] = [V[n], N[n]];
        if (!(a && b && a.kg > 0)) return out.push(`${n}: keine Masse`);
        nie(Math.abs(b.kg / a.kg - 2) <= K1.m, out, `${n}: ρ ×2 → Masse ×${(b.kg / a.kg).toFixed(3)}`);
        nie(lab === undefined || Math.abs(a.kg / lab - 1) <= K1.m, out, `${n}: Welt ${a.kg.toFixed(2)} ≠ Labor ${lab} kg`);
        for (const x of wasser ? [a, b] : [])
            nie(traegt(x) ? x.schwimmt && x.tief < x.grund - K1.grund : !x.schwimmt && Math.abs(x.tief - x.grund) <= K1.grund, out,
                `${n} (${x === a ? "vorher" : "ρ ×2"}): ${traegt(x) ? "getragen" : "dichter als Wasser"}, ${x.tief} m tief`);
    };
    const [sp, wo, wa, h] = [V.spieler || {}, V.wolf || {}, V.wagen || {}, V.holz || {}];
    koerper("spieler", s1, true, k.labMensch);
    koerper("wolf", s1, true, k.refKg);
    koerper("wagen", s1, true, wa.kernKg);
    nie(sp.traegt && wo.traegt, s1, "vorher nicht getragen");
    nie(Math.abs(sp.tief - k.brustM) <= K1.brust, s1, `spieler ${sp.tief} m tief ≠ Brustkorb ${k.brustM}`);
    nie(sp.kg >= 60 && sp.kg <= 90, s1, `Mensch ${sp.kg} kg außer 60–90`);
    nie(wa.kg >= 1100 && wa.kg <= 1600, s1, `Wagen ${wa.kg} kg außer 1100–1600`);
    nie(wa.rho === k.rhoBlech, s1, `wagen: liegt nach ${wa.rho}, nicht nach ρ(blech)`);
    nie(N.wagen && Math.abs((2 * N.wagen.wasserK) / wa.wasserK - 1) <= K1.m, s1, "wagen: Wasser-Term");
    for (const M of [V, N]) {
        const q = M.stoss || {};
        nie(q.J > 0 && Math.abs((q.dvA / q.dvB) * (M.spieler.kg / M.wolf.kg) - 1) <= K1.dv, s1, "Stoß: Δv ≠ Massen-Verhältnis");
    }
    koerper("holz", s2, true);
    koerper("stein", s2, true);
    nie(Math.abs(h.tief / h.H / (h.rho / k.rhoW) - 1) <= K1.holz, s2, `holz: Eintauchtiefe ${h.tief} von ${h.H} m`);
    nie(V.stein && !traegt(V.stein), s2, "stein: schwimmt");
    koerper("geschmiedet", s2, false, (V.geschmiedet || {}).labKg);
    koerper("lose", s2);
    for (const n of ["geschmiedet", "lose"]) nie(V[n] && N[n] && N[n].dauer > V[n].dauer, s2, `${n}: der Schwung bleibt`);
    return { s1, s2 };
}
function koerperBericht(k) {
    const v = koerperVerdict(k);
    const [V, N] = [(k && k.vor) || {}, (k && k.nach) || {}];
    const z = (n) =>
        V[n] && N[n] ? `${n} ${(+V[n].kg).toFixed(1)} → ${(+N[n].kg).toFixed(1)} kg` + (V[n].tief >= 0 ? `, tief ${V[n].tief} → ${N[n].tief} m` : "") : n;
    const [h, w, q] = [V.holz || {}, V.wagen || {}, V.stoss || {}];
    const zahl = [
        ["spieler", "wolf", "wagen"].map(z).join(" · ") +
            ` · Labor Mensch ${(+k.labMensch).toFixed(1)}, Wolf ${k.refKg}, Wagen ${(+w.kernKg).toFixed(0)} kg · Brustkorb ${(+k.brustM).toFixed(2)} m · Δv ${(q.dvA / q.dvB).toFixed(3)}`,
        ["holz", "stein", "geschmiedet", "lose"].map(z).join(" · ") +
            ` · Holz ${(h.tief / h.H).toFixed(3)} der Höhe (ρ/ρw ${(h.rho / k.rhoW).toFixed(2)}) · Labor Keule ${(+(V.geschmiedet || {}).labKg).toFixed(3)} kg`,
    ];
    ["s1", "s2"].forEach((s, i) =>
        check(`K1#${i + 1} (physik.K1) ${i ? "DIE DINGE" : "DIE LEIBER"}: die Messung der Meisterkarte und ρ ×2`, !v[s].length,
            zahl[i] + (v[s].length ? " — " + v[s].join(" · ") : ""))
    );
    return v;
}

const server = statikServer();

const {
    probeLeben,
    probeKoerper,
    tempoVerdict,
    tempoSpion,
    kernTempo,
    ruckJeBild,
} = require("./lib/fahr-proben.cjs");

// W (feld.K1) DIE WETTER-KETTE: ein Glied zählt, wenn es mit dem Sturm ZIEHT und STEHT, solange sein Vorgänger gehalten wird
// (`kette` in lib/fahr-proben.cjs), und nur hinter einem zählenden Vorgänger; die Tiefe ist der längste Ast (Staffel 1 =
// Tiefe 2–3, 2 = ≥ 4): Regen-Feld → Nässe → Grip (zieht ab Bremsweg × `nass`) und Nässe → Brand (der Herd erlischt, wo die
// Welt nass ist) → Licht (sein Feuer im Licht der Welt). Ein zweiter Leser am selben Vorgänger verlängert keinen Ast.
const KETTE = { v0: 50 / 3.6, bremsMax: 400, sprungS: 1200, eps: 0.02, tiefe: 4 };
function ketteVerdict(m) {
    const f = ["trocken", "sturm", "festRegen", "festNaesse", "festBrand"].filter((l) => !(m && m[l] && m[l].s > 0));
    if (f.length) return { tiefe: 0, befunde: [`ohne Bremsung: ${f}`] };
    const { trocken: t, sturm: s, festRegen: fr, festNaesse: fn, festBrand: fb } = m;
    const gl = (a, b) => Math.abs(a - b) <= KETTE.eps * Math.max(1, Math.abs(b));
    const nasHalt = (k) => fn.regen > KETTE.eps && gl(fn.naesse, t.naesse) && gl(fn[k], t[k]);
    const glieder = [
        ["Regen-Feld", 0, s.regen > t.regen + KETTE.eps, true],
        ["Nässe", 1, s.naesse > t.naesse + KETTE.eps && gl(s.stoff, s.naesse), !(fr.regen > t.regen) && gl(fr.naesse, t.naesse)],
        ["Grip", 2, s.s / t.s >= REIFEN.nass, nasHalt("s")],
        ["Brand", 2, s.brand < t.brand - KETTE.eps, nasHalt("brand")],
        ["Licht", 4, s.licht < t.licht - KETTE.eps, fb.naesse > t.naesse + KETTE.eps && gl(fb.brand, t.brand) && gl(fb.licht, t.licht)],
    ];
    const [tief, befunde] = [[0], []]; // je Glied (Vorgänger: sein Index hier, 0 das Wort) seine Tiefe, −1 zählt nicht
    for (const [n, v, zieht, steht] of glieder) {
        tief.push(tief[v] >= 0 && zieht && steht ? tief[v] + 1 : -1);
        if (tief[v] >= 0 && !(zieht && steht)) befunde.push(`${n} ${zieht ? "steht nicht" : "zieht nicht"}`);
    }
    if (m.stern && gl(m.stern.s, t.s)) befunde.push("blind: der Wort-Leser steht");
    return { tiefe: Math.max(...tief), befunde };
}
// K8 IN DER WELT (fahrzeug.K1 Staffel 2) an den Bremsungen der W-Kette (je Lage der Weg `s` bis bremsV): Gras/Weg (`boden`), nass
// gegen trocken auf beiden Böden (`nass`), μ(gras) halb in der Stoff-Zeile (`zeile`), der Takt an jedem Schritt der Welt (`hz`),
// Labor = Welt (S1: `labor` = STATION.laborM / größte Abweichung). Rückgabe: die Täter beim Namen (die Bremswege trägt W).
function reifenWeltVerdict(k) {
    const [q, L] = [(a, b) => k[a].s / k[b].s, k.labor || {}];
    const m = { boden: q("trocken", "weg"), nass: Math.min(q("sturm", "trocken"), q("wegNass", "weg")), zeile: q("zeile", "trocken"), hz: L.hz, labor: STATION.laborM / L.maxM };
    return Object.keys(m).filter((n) => !(m[n] >= REIFEN[n])).map((n) => n + " " + m[n]);
}
function ketteBericht(k, err) {
    const v = ketteVerdict(k);
    check(
        `W (feld.K1) DIE WETTER-KETTE: Sturm → Regen-Feld → Nässe → Grip | Brand → Licht, jedes Glied zieht und steht, wenn sein Vorgänger gehalten wird (Tiefe ≥ ${KETTE.tiefe})`,
        !err && v.tiefe >= KETTE.tiefe && !v.befunde.length,
        `Tiefe ${v.tiefe} ${JSON.stringify(k)} ${err || ""}${v.befunde.join(" · ")}`
    );
    const r8 = k ? reifenWeltVerdict(k) : ["keine Kette"];
    check("K8 Reifen in der Welt (fahrzeug.K1): Bremsweg Gras/Weg, nass, μ(gras) halb, Takt, Labor = Welt", !err && !r8.length, String(r8));
    return v;
}

// ════ WN — DIE FAHRT AUF DEM WEGENETZ (fahrzeug.K2 Staffel 1, `wegenetz` in probeLeben): die feste Route von der Mess-Wiese über die
// Orte der Zellen (je zwei Nachbarn im Wegenetz) — ≥ 2 km, auf Weg und Feldweg durch Wald und Dorf, 0 Steckenbleiber, ≥ 80 % der
// Sim-Schritte über 0,8 · vmax. ════
const WEGENETZ = { orte: ["-1,-5", "0,-5", "1,-6", "2,-7", "3,-6", "4,-7"] };
const wegenetzVerdict = (m) =>
    [
        [m.lang >= 2000, `Route ${m.lang} m`],
        [m.wegAnteil >= 0.95, `querfeldein (Weg ${m.wegAnteil})`],
        [m.ende, `nicht angekommen (${m.weg} m)`],
        [!m.steck.length, `Steckenbleiber bei ${m.steck} m`],
        [m.anteil >= 0.8, `über 0,8 · vmax ${m.anteil}`],
        [m.boden.wiese > 0 && m.boden.wald >= 0.1 && m.boden.dorf >= 0.05, `Boden ${JSON.stringify(m.boden)}`],
    ].flatMap(([ok, t]) => (ok ? [] : [t]));

// ════ F — DIE FAHR-BAHN, eigenes Boot: der Wagen, den die Welt hinstellt, steht auf fahrbarem Grund, kommt rückwärts
// und nach einem Stoß frei, zeigt sein Tempo und klingt — FK/FK2 am Kern (rückwärts aus dem Stand, die Drehzahl), F1 der
// Platz an jedem Tor, F2 die Vorschau, F3 die Natur-Wand, F4 Stoß und Befreiung, F5 Tacho, F7 Tasten (beide misst die Fahrt der Rückmeldung RM); SCHMUGGEL
// (Vorschau ohne Platz-Gesetz, Natur-Wand ohne Wagen) → ROT beim Namen. ════
const BAHN = {
    rueckM: 3, // FK, F1: rückwärts aus dem Stand in 2,5 s
    rueckFrames: 150,
    hangGrad: [0, 10, 15],
    vorM: 2, // F1: W 2 s
    vorFrames: 120,
    neigungGrad: 15, // F1: die Rad-Ebene
    tore: 10, // F1: der Genesis-Ring
    settleFrames: 60, // F1: 1 s Welt nach dem Platz
    freiM: 1, // F4: so weit vom Stoß ist er frei
    freiFrames: 120, // F4: in 2 s
};

// ── DIE URTEILE DER BAHN (rein; Seiten-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
function bahnKernVerdict(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return ["kein Kern-Lauf"];
    const out = [];
    for (const z of rows)
        if (!(z.weg >= BAHN.rueckM)) out.push(`${z.rezept} ${z.art} ${z.grad}°: ${z.weg.toFixed(2)} m in 2,5 s`);
    return out;
}
function bahnPlatzVerdict(m) {
    if (!m || !m.da) return [m && m.grund ? m.grund : "kein Wagen"];
    const out = [];
    if (!(m.neigung <= BAHN.neigungGrad))
        out.push(`Neigung ${m.neigung.toFixed(0)}° (steig ${m.steig.toFixed(0)}°, wank ${m.wank.toFixed(0)}°)`);
    if (m.waende > 0) out.push(`${m.waende} Wände im Umriss`);
    if (m.blocker > 0) out.push(`${m.blocker} Blocker im Band (${m.blockerNamen.join(", ")})`);
    if (m.eingestiegen === false) out.push(`E steigt nicht ein${m.statt ? " (" + m.statt + ")" : ""}`);
    else if (m.eingestiegen) {
        if (m.vor != null && !(m.vor >= BAHN.vorM)) out.push(`W 2 s ${m.vor.toFixed(2)} m`);
        if (m.zurueck != null && !(m.zurueck >= BAHN.rueckM)) out.push(`S 2,5 s ${m.zurueck.toFixed(2)} m`);
        if (!m.ausgestiegen) out.push("E steigt nicht aus");
    }
    return out;
}
function bahnStossVerdict(m) {
    if (!m || !m.da) return [m && m.grund ? m.grund : "keine Station"];
    const out = [];
    if (!m.stoss) out.push(`kein Stoß am ${m.ziel}${m.ohneStoss ? " " + JSON.stringify(m.ohneStoss) : ""}`);
    if (!m.versuche || m.versuche.length === 0) out.push(`keine Befreiung am ${m.ziel}`);
    for (const v of m.versuche || [])
        if (!(v.freiFrame >= 0 && v.freiFrame <= BAHN.freiFrames))
            out.push(`${m.ziel} ${v.seite}: nach 2 s ${v.weg.toFixed(2)} m (${v.vMinKmh.toFixed(1)} km/h)`);
    return out;
}
function bahnTachoVerdict(m) {
    if (!m) return ["keine Probe"];
    if (!m.element) return ["kein Tacho im Spiel (#fahr-tacho fehlt)"];
    const out = [];
    if (!(m.proben > 0)) out.push("keine Probe im Sattel");
    if (m.unsichtbar > 0) out.push(`im Sattel unsichtbar in ${m.unsichtbar}/${m.proben} Proben`);
    if (m.falsch > 0) out.push(`${m.falsch}/${m.proben} Proben ≠ |vlong| × FAHR.kmh (${m.beispiel})`);
    if (!(m.maxKmh >= 20)) out.push(`Fahrt zu langsam für die Probe (${m.maxKmh} km/h)`);
    if (m.nachAbsteigenSichtbar) out.push("nach dem Absteigen noch sichtbar");
    return out;
}
// ════ RM — DIE RÜCKMELDUNG (fahrzeug.K5): drei Kanäle, je als Paar an ihrem Ausgang gemessen (`rueck` in probeLeben), Glatt ↔
// Drift ↔ Hang; die Mutante (jede Kopplung gekappt) muss jeden Kanal ROT machen. Federweg je Ecke der Hülle in mm, Stoß ab
// stossMin m/s² Boden-Stoß, die Antwort binnen antwortBilder; das Summen im Bild eines Stoßes ab summStoss (die Hälfte von
// PAD_GESETZ.rumble.bodenVoll). ════
const RUECK = { bilder: 240, driftAb: 120, tachoKmh: 1, stoss: 10, antwortBilder: 10, antwortMm: 5, wankMm: 3, paar: 1.5, starkDrift: 0.5, starkGlatt: 0.1, summen: 0.4 };
// je Fahrt (Zeile je Bild: Federweg je Ecke, Boden-Stoß, Rumble stark und schwach): Wank = mittlerer Quer-Ausschlag der Ecken im
// Drift-Teil, Antwort = mittlerer größter Ausschlag binnen antwortBilder nach jedem Stoß, stark = Rumble im Drift-Teil, summen =
// das schwache Rumble im Bild jedes Stoßes
function rueckMass(m) {
    if (!m) return null;
    const [B, R] = [m.bild, RUECK];
    const mittel = (a) => +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(3);
    const st = B.map((z, i) => i).filter((i) => B[i][1] >= R.stoss && i + R.antwortBilder < B.length);
    const ausschlag = (i) => Math.max(...B.slice(i + 1, i + 1 + R.antwortBilder).flatMap((z) => z[0].map((w, c) => Math.abs(w - B[i][0][c]))));
    const teil = B.slice(R.driftAb + 20);
    return {
        klingt: m.klingt,
        still: m.still,
        wankMm: mittel(teil.map(([h]) => 250 * Math.abs(h[0] - h[1] + h[2] - h[3]))),
        stoesse: st.length,
        antwortMm: mittel(st.map((i) => 1000 * ausschlag(i))),
        stark: mittel(teil.map((z) => z[2])),
        summen: mittel(st.map((i) => B[i][3])),
    };
}
// die Täter je Kanal ({ motor, feder, rumble }) an den Maßen der drei Fahrten (`m`, rueckMass)
function rueckVerdict(m) {
    const [t, R, alle] = [{ motor: [], feder: [], rumble: [] }, RUECK, Object.values(m)];
    const kein = ["kein Ritt"];
    if (!alle.every(Boolean)) return { motor: kein, feder: kein, rumble: kein };
    const nein = (k, ok, text) => ok || t[k].push(text);
    // auf Glatt und am Hang die Antwort auf den Boden-Stoß (im Drift trägt der Schlupf den Federweg)
    const [n, an, su] = [m.glatt.stoesse + m.hang.stoesse, ...["antwortMm", "summen"].map((k) => Math.min(m.glatt[k], m.hang[k]))];
    nein("motor", alle.every((x) => x.klingt && x.still), `Stimmen im Sattel ${alle.map((x) => x.klingt)}, danach still ${alle.map((x) => x.still)}`);
    nein("feder", n >= 3 && an >= R.antwortMm, `Boden-Stoß ohne Federweg (${n} Stöße, Antwort ${an} mm)`);
    nein("feder", m.drift.wankMm >= Math.max(R.wankMm, R.paar * m.glatt.wankMm), `der Drift wankt ${m.drift.wankMm} mm (Glatt ${m.glatt.wankMm})`);
    nein("rumble", m.drift.stark >= R.starkDrift && m.glatt.stark <= R.starkGlatt, `Schlupf ohne Rumble (Drift ${m.drift.stark}, Glatt ${m.glatt.stark})`);
    nein("rumble", su >= R.summen, `Boden-Stoß ohne Summen (${su} auf ${n} Stößen)`);
    return t;
}
function rueckBericht(o) {
    console.log("=== RM — DIE RÜCKMELDUNG (fahrzeug.K5) ===");
    const [e, mm] = [o.echt, o.mutiert].map((r) => Object.fromEntries(["glatt", "drift", "hang"].map((n) => [n, rueckMass(r && r[n])])));
    const [v, mu] = [rueckVerdict(e), rueckVerdict(mm)];
    // RM1 ohne Mutante: den stummen Motor schneidet gate:klang-zensus S13
    for (const [k, name] of [["motor", "RM1 die Stimme der Fahrt klingt im Sattel, danach still (die Tonhöhe: gate:klang-zensus F)"], ["feder", "RM2 die Federung im Bild: Drift-Wank, Boden-Stoß"], ["rumble", "RM3 das Rumble: Schlupf, Boden-Stoß"]])
        check(name, !v[k].length && (k === "motor" || mu[k].length > 0), `${o.err || v[k].join(" · ") || "gekoppelt"} · Mutante: ${mu[k].join(" · ") || "—"}`);
    console.log(`RUECKMELDUNG ${JSON.stringify({ echt: e, mutiert: mm })}`);
}
function bahnTastenVerdict(m) {
    if (!m || !Array.isArray(m.zeilen)) return ["keine Hilfe"];
    const t = m.zeilen.join("\n");
    const out = [];
    if (!/\bE\b[^·\n]*(einsteig|aussteig)/i.test(t)) out.push("E (einsteigen) fehlt in der Hilfe");
    if (!/\bShift\b[^·\n]*Handbremse/i.test(t)) out.push("Shift (Handbremse) fehlt in der Hilfe");
    if (!m.handbremseWirkt)
        out.push(`Shift kommt im Fahr-Schritt nicht als Handbremse an (${m.handbremseDetail || "?"})`);
    return out;
}
function bahnWandVerdict(m) {
    if (!m || !m.da) return [m && m.grund ? m.grund : "keine Probe"];
    const out = [];
    if (m.urteil !== "wagen")
        out.push(`ein Wurf (${m.art}) ${m.l} m vor dem Ursprung steht im Wagen (Urteil ${m.urteil})`);
    if (m.grundriss)
        out.push(
            `der Wagen ist ein Grundriss (_imGrundriss → ${m.grundriss}): ein Haus räumt die Natur aus ihm und nennt sich`
        );
    return out;
}

// FK — DER KERN SELBST: rückwärts aus dem Stand je Rezept, eben und bergauf (Node).
function bahnKernRueck(VC) {
    const DT = 1 / 60;
    const rows = [];
    for (const rezept of Object.keys(VC.PRESETS)) {
        const G = gesetzVon(VC, rezept);
        if (!G) {
            rows.push({ rezept, art: "kein Fahr-Satz", grad: 0, weg: 0 });
            continue;
        }
        for (const grad of BAHN.hangGrad) {
            const t = Math.tan((grad * Math.PI) / 180);
            const boden = (x) => -x * t; // rückwärts (−x) bergauf
            for (const [art, e] of [
                ["S", { brake: 1 }],
                ["S + Gegenlenkung links", { brake: 1, steer: 1 }],
                ["S + Gegenlenkung rechts", { brake: 1, steer: -1 }],
            ]) {
                const z = VC.fahrZustand(0, 0, 0);
                VC.fahrStand(z, G, boden, 0);
                for (let i = 0; i < BAHN.rueckFrames; i++) VC.fahrSchritt(z, e, G, boden, DT);
                rows.push({ rezept, art, grad, weg: Math.hypot(z.x, z.z) });
            }
        }
    }
    return rows;
}
// FK2 — DIE DREHZAHL ÜBER 0…vmax (Node, klang:FAHRT): je Rezept vom Stand bis vmax in 1 %-Schritten.
function bahnKernStimme(KC, VC) {
    if (!KC || !KC.FAHRT || typeof KC.fahrtMischung !== "function")
        return ["klang-core ohne klang:FAHRT / fahrtMischung — die Fahrt hat keine Stimme"];
    const F = KC.FAHRT;
    const out = [];
    for (const rezept of Object.keys(VC.PRESETS)) {
        const G = gesetzVon(VC, rezept);
        if (!G) continue;
        const vmax = G.vmax;
        const rueckVmax = vmax * VC.FAHR.schritt.rueckVmax;
        const lage = (v) => KC.fahrtMischung({ v, vmax, rueckVmax, gas: 1 });
        const m0 = lage(0);
        const m1 = lage(vmax);
        if (m0.upm !== F.leerlaufUpm) out.push(`${rezept}: Stand ${m0.upm} U/min ≠ Leerlauf ${F.leerlaufUpm}`);
        if (m1.upm !== F.begrenzerUpm) out.push(`${rezept}: vmax ${m1.upm} U/min ≠ Begrenzer ${F.begrenzerUpm}`);
        let fallend = 0;
        let vorher = m0;
        for (let i = 1; i <= 100; i++) {
            const m = lage((vmax * i) / 100);
            const gang = (v) => Math.min(F.gaenge, Math.floor(v / (vmax / F.gaenge)) + 1);
            if (m.upm < vorher.upm && gang((vmax * i) / 100) === gang((vmax * (i - 1)) / 100)) fallend++;
            if (Math.abs(m.motorHz - (m.upm / 60) * (F.zylinder / 2)) > 1e-9) {
                out.push(`${rezept}: Motor-Ton ${m.motorHz} Hz ≠ Zünd-Folge bei ${m.upm} U/min`);
                break;
            }
            vorher = m;
        }
        if (fallend) out.push(`${rezept}: die Drehzahl fällt in ${fallend} Schritten innerhalb eines Gangs`);
        const r0 = KC.fahrtMischung({ v: -rueckVmax, vmax, rueckVmax });
        if (r0.upm !== F.begrenzerUpm) out.push(`${rezept}: rückwärts am Deckel ${r0.upm} U/min ≠ Begrenzer`);
    }
    return out;
}

// ── DIE PROBE DER BAHN IN DER SEITE (Funktionsrumpf; ein eigenes Boot, alle F-Phasen). ──
async function probeBahn(B) {
    const out = { log: [] };
    const uhr = { t: performance.now(), zeilen: [] }; // die Dauer je Phase (Bericht, kein Urteil)
    const phase = (name) => {
        const t = performance.now();
        uhr.zeilen.push(`${name} ${((t - uhr.t) / 1000).toFixed(1)} s`);
        uhr.t = t;
    };
    await window.__weltDa();
    const r = window.anazhRealm;
    const st = r.state;
    const VC = window.__vehicleCore;
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => f && f.ready && f.recipes && st.blueprints && st.blueprints.fahrzeug_gt);
    if (!(st.blueprints && st.blueprints.fahrzeug_gt)) return { err: "Buch ohne fahrzeug_gt" };
    // DER TAKT: echte Frames (`_gameLoopTick`), feste Schritte — die Zahl der Frames ist die Uhr.
    let tMs = performance.now();
    const frame = () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
    };
    const takt = (n) => {
        for (let i = 0; i < n; i++) frame();
    };
    // DIE TASTEN: echte Tastatur-Ereignisse über den Hörer des Spiels.
    const gehalten = new Set();
    const ereignis = (art, k) => window.dispatchEvent(new KeyboardEvent(art, { bubbles: true, key: k, code: "Key" + k.toUpperCase() }));
    const halte = (liste) => {
        const soll = new Set(liste);
        for (const k of Array.from(gehalten))
            if (!soll.has(k)) {
                ereignis("keyup", k);
                gehalten.delete(k);
            }
        for (const k of soll)
            if (!gehalten.has(k)) {
                ereignis("keydown", k);
                gehalten.add(k);
            }
    };
    const tippe = (k) => {
        ereignis("keydown", k);
        ereignis("keyup", k);
    };
    const boden = (a, b) => r.getTerrainHeightAt(a, b);
    const stelle = (x, z) => {
        st.playerMesh.position.set(x, boden(x, z) + 1.8, z);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        takt(20);
    };
    // der Körper steht, bevor die Probe ihn braucht (das EINE Warten auf den Bau, welt-boot `__gebautNach`, im Takt der Bahn)
    const gebaut = async (e) => e && window.__gebautNach(e, { takt: frame });
    const fahrtGier = (e) => (Number.isFinite(e.rotationY) ? e.rotationY : 0) + Math.PI / 2; // Studio-Wagen: Bug +x
    const wagenWeg = (e) => {
        if (!e) return;
        if (st.player.mountedArch === e.id) r.dismountArchitecture();
        r.removeArchitecture(e);
    };
    const logs = [];
    const orgLog = r.log.bind(r);
    r.log = function (m, l) {
        if (/Fahr-Platz|Portal betreten/.test(String(m))) logs.push(String(m).slice(0, 200));
        return orgLog(m, l);
    };

    // ── DIE MESSUNG DES PLATZES (unabhängig vom Platz-Gesetz des Stamms): Ebene, Wände, Blocker. ──
    const platzMessung = (e) => {
        const prof = r._vehicleProfile(e);
        const G = r._fahrSatz(e, prof);
        const fzg = r._fahrzeugGesetzFor(e);
        const h = fzg && fzg.drive && fzg.drive.huelle;
        if (!G || !h) return { da: false, grund: "kein Fahr-Gesetz am Wagen" };
        const sc = Number.isFinite(e.scale) ? e.scale : 1;
        const bug = h.noseX * sc;
        const heck = h.tailX * sc;
        const hw = h.bw * sc;
        const dach = (Number.isFinite(h.yRoof) ? h.yRoof : 1.3) * sc;
        const stufe = VC.FAHR.schritt.stufeRad * G.radR;
        const ry = fahrtGier(e);
        const x = e.position.x;
        const z = e.position.z;
        const eb = VC.fahrEbene(G, boden, x, z, ry - Math.PI / 2);
        if (!eb) return { da: false, grund: "keine Ebene unter dem Wagen" };
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const qX = Math.cos(ry);
        const qZ = -Math.sin(ry);
        const tS = Math.tan(eb.steig);
        const tW = Math.tan(eb.wank);
        const ebeneY = (l, q) => eb.y + tS * l + tW * q;
        // Wände: Feld über Ebene + Rad-Stufe mit einer Fläche steiler als die Ebenen-Klammer des Kerns, oder auf Brust-Höhe
        let waende = 0;
        const nrm = {};
        const steilY = Math.cos(VC.FAHR.schritt.ebeneMax);
        const brust = Math.min(dach, 1.2);
        for (let i = 0; i <= 4; i++) {
            const l = heck + ((bug - heck) * i) / 4;
            for (const q of [-hw, 0, hw]) {
                const px = x + l * fX + q * qX;
                const pz = z + l * fZ + q * qZ;
                const ctx = r._terrainColumnContext(px, pz);
                const yS = ebeneY(l, q) + stufe + 0.02;
                let wand = false;
                if (r._fieldSolid(px, yS, pz, ctx)) {
                    r._fieldGradient(px, yS, pz, nrm);
                    wand = !(nrm.mag > 1e-6) || nrm.y < steilY;
                }
                if (wand || r._fieldSolid(px, ebeneY(l, q) + brust, pz, ctx)) waende++;
            }
        }
        // Blocker: das Rechteck der Hülle gegen jede Box (gedreht: ihre obb) im Band Ebene + Stufe … Dach.
        const hl = (bug - heck) / 2;
        const cx = x + fX * ((bug + heck) / 2);
        const cz = z + fZ * ((bug + heck) / 2);
        const unten = eb.y + stufe;
        const oben = eb.y + dach;
        let blocker = 0;
        const namen = new Set();
        for (const a of st.architectures) {
            if (!a || a === e || !a.blockerAABBs || !a.position) continue;
            if (Math.abs(a.position.x - x) > 30 || Math.abs(a.position.z - z) > 30) continue;
            for (const b of a.blockerAABBs) {
                if (!(b.topY > unten && b.botY < oben)) continue;
                if (b.dick < stufe) continue; // ein Trieb dünner als die Rad-Stufe wird überrollt
                const ob = b.obb;
                const b1 = ob ? [ob.c, -ob.s] : [1, 0];
                const b2 = ob ? [ob.s, ob.c] : [0, 1];
                const ex = ob ? ob.hx : (b.maxX - b.minX) / 2;
                const ez = ob ? ob.hz : (b.maxZ - b.minZ) / 2;
                const dx = cx - (ob ? ob.cx : (b.minX + b.maxX) / 2);
                const dz = cz - (ob ? ob.cz : (b.minZ + b.maxZ) / 2);
                let getrennt = false;
                for (const u of [b1, b2, [fX, fZ], [qX, qZ]]) {
                    const rO = hl * Math.abs(fX * u[0] + fZ * u[1]) + hw * Math.abs(qX * u[0] + qZ * u[1]);
                    const rA = ex * Math.abs(b1[0] * u[0] + b1[1] * u[1]) + ez * Math.abs(b2[0] * u[0] + b2[1] * u[1]);
                    if (Math.abs(dx * u[0] + dz * u[1]) >= rO + rA) {
                        getrennt = true;
                        break;
                    }
                }
                if (!getrennt) {
                    blocker++;
                    namen.add(a.type);
                }
            }
        }
        return {
            da: true,
            x: +x.toFixed(2),
            z: +z.toFixed(2),
            neigung: (Math.atan(Math.hypot(tS, tW)) * 180) / Math.PI,
            steig: (eb.steig * 180) / Math.PI,
            wank: (eb.wank * 180) / Math.PI,
            waende,
            blocker,
            blockerNamen: Array.from(namen),
        };
    };
    // ── DIE PROBE-FAHRT: E (echte Taste, Reichweite des Spiels), W 2 s vom Platz, bremsen bis zum Stand, S 2,5 s rückwärts aus
    // dem Stand, E;
    // `nurEin`: nur E ein und aus (der Platz an jedem Tor). ──
    const probeFahrt = (e, m, nurEin) => {
        const pos = () => ({ x: e.position.x, z: e.position.z });
        const ry = fahrtGier(e);
        stelle(e.position.x + Math.cos(ry) * 1.5, e.position.z - Math.sin(ry) * 1.5); // 1,5 m neben der Flanke
        const vorLog = logs.length;
        tippe("e");
        frame();
        m.eingestiegen = st.player.mountedArch === e.id;
        if (!m.eingestiegen) {
            m.statt = logs.slice(vorLog).join(" · ") || "keine Meldung";
            if (r._portalOverlay) r.exitPortal(); // die Probe geht weiter in der Heimat
            return m;
        }
        takt(12);
        if (!nurEin) {
            const p0 = pos();
            halte(["w"]);
            takt(B.vorFrames);
            halte([]);
            const p1 = pos();
            m.vor = Math.hypot(p1.x - p0.x, p1.z - p0.z);
            // bremsen bis zum Stand (S über der Brems-Schwelle des Kerns ist die Bremse), dann rückwärts AUS DEM STAND
            halte(["s"]);
            for (let i = 0; i < 120 && e._fahr && e._fahr.vlong > VC.FAHR.schritt.bremsV; i++) frame();
            halte([]);
            for (let i = 0; i < 30 && e._fahr && Math.abs(e._fahr.vlong) > 0.1; i++) frame();
            const p2 = pos();
            halte(["s"]);
            takt(B.rueckFrames);
            halte([]);
            const p3 = pos();
            m.zurueck = Math.hypot(p3.x - p2.x, p3.z - p2.z);
            takt(30);
        }
        tippe("e");
        frame();
        m.ausgestiegen = st.player.mountedArch == null;
        return m;
    };
    const M = r._genesisMitte();
    const vorschau = async () => {
        let e = null;
        // der Ort-Takt des Spiels: je Takt Ring und Vorschau (die Platz-Suche läuft im Takt, FAHR_PLATZ_JE_TAKT Orte); das EINE
        // Warten (welt-boot `__gebautNach`) zählt Takte ohne Offenes, nie Sekunden
        await window
            .__gebautNach("die Vorschau der Garage", {
                fertig: () => !!(e = st.architectures.find((a) => a && a.id === "portal-preview-garage")),
                takt: async (t) => {
                    r._genesisPortalRing(st.playerMesh.position);
                    r._portalApproachPrefetch(st.playerMesh.position);
                    if (t % 20 === 19) await sleep(20); // das Buch und der Bau dürfen ankommen
                },
                max: 3000,
            });
        return e;
    };

    // ════ F2 — DIE VORSCHAU DES SPIELS am Garage-Tor (der Ort des Befunds; danach 1 s Welt) ════
    stelle(M.x, M.z);
    const ev = await vorschau();
    if (ev) {
        await gebaut(ev);
        takt(B.settleFrames);
        out.vorschau = platzMessung(ev);
        probeFahrt(ev, out.vorschau);
        wagenWeg(ev);
    } else out.vorschau = { da: false, grund: "keine Vorschau am Garage-Tor" };

    phase("Boot + F2");
    // ════ F1 — DER PLATZ AN JEDEM TOR des Genesis-Rings (der Weg der Vorschau: autonomous, Blick vom Ring hinaus) ════
    const tore = st.architectures.filter((a) => {
        const bp = a && st.blueprints[a.type];
        return (
            bp &&
            bp.builtIn &&
            bp.role === "portal" &&
            bp.portalMeta &&
            bp.portalMeta.world &&
            Math.hypot(a.position.x - M.x, a.position.z - M.z) < 40
        );
    });
    out.tore = [];
    let n = 0;
    const gesetzt = [];
    stelle(M.x, M.z);
    for (const t of tore) {
        const ort = r._portalVorschauOrt(t);
        if (!ort) {
            out.tore.push({ tor: t.type, da: false, grund: "kein Wunsch-Ort der Vorschau (_portalVorschauOrt)" });
            continue;
        }
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: ort.x, y: ort.y, z: ort.z },
            {
                silent: true,
                autonomous: true,
                seed: 49178,
                rotationY: ort.blick - Math.PI / 2,
                id: "fahr-bahn-tor-" + n++,
            }
        );
        if (!e) {
            out.tore.push({ tor: t.type, da: false, grund: "kein GT gesetzt" });
            continue;
        }
        gesetzt.push({ e, t, ort });
    }
    takt(B.settleFrames); // EINE Sekunde Welt für alle: die Wald-Schlange setzt ihre Würfe
    for (const { e, t, ort } of gesetzt) {
        const m = platzMessung(e);
        m.tor = t.type;
        m.weiter = +Math.hypot(e.position.x - ort.x, e.position.z - ort.z).toFixed(1);
        probeFahrt(e, m, true);
        out.tore.push(m);
    }
    for (const { e } of gesetzt) wagenWeg(e);

    phase("F1");
    // ════ F3 — DIE NATUR-WAND KENNT DEN WAGEN: eine Tanne 1,5 m vor dem Ursprung eines stehenden GT ════
    const wandProbe = () => {
        // außerhalb der Lichtung des Genesis-Platzes samt der Krone einer Tanne (die Lichtung trägt den Ring der Tore, 15 m)
        const sx = M.x + 30;
        const sz = M.z + 30;
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: sx, y: boden(sx, sz) + 0.5, z: sz },
            { silent: true, precise: true, rotationY: 0, id: "fahr-bahn-wand" }
        );
        if (!e) return { da: false, grund: "kein GT" };
        const ry = fahrtGier(e);
        const l = 1.5;
        const p = { x: sx + Math.sin(ry) * l, y: boden(sx, sz), z: sz + Math.cos(ry) * l };
        const urteil = r._naturWand("baum_tanne", p, { scale: 1 });
        const grundriss = r._imGrundriss(p.x, p.z, 0.8, 0);
        wagenWeg(e);
        return { da: true, art: "baum_tanne", l, urteil: urteil || false, grundriss: grundriss || false };
    };
    out.wand = wandProbe();

    // ════ SCHMUGGEL — die Vorschau ohne Platz-Gesetz, die Natur-Wand ohne die Wagen (an derselben Stelle): ROT ════
    {
        const P = Object.getPrototypeOf(r);
        const neuVorschau = () => {
            if (st.worldMeta) st.worldMeta.portalPreviewGarage = false;
            if (r._portalPreviewFertig) r._portalPreviewFertig.garage = false;
        };
        neuVorschau();
        const hatGesetz = typeof P._fahrPlatzSuche === "function";
        if (hatGesetz) {
            r._fahrPlatzSuche = () => true;
            r._fahrPlatzWege = function* () {
                return true;
            };
        }
        // DER ORT, AN DEM DAS GESETZ ZÄHLT: ein Kiefern-Stamm auf dem Wunsch-Ort der Vorschau (`_portalVorschauOrt`) —
        // ohne Platz-Gesetz steht der Wagen in ihm. Die Welt allein trägt dort nicht immer ein Hindernis: am Flussnetz-Gelände
        // ist der Wunsch-Ort am Garage-Tor frei (3°, keine Wand, kein Blocker), und der Schmuggel fiel vakuös grün.
        const torG = st.architectures.find((a) => a && a.type === "welt_garage" && a.position);
        const wo = torG && r._portalVorschauOrt(torG);
        const stamm = wo
            ? r.spawnArchitecture(
                  "baum_kiefer",
                  { x: wo.x, y: boden(wo.x, wo.z), z: wo.z },
                  { silent: true, precise: true, id: "fahr-bahn-schmuggel-stamm" }
              )
            : null;
        if (stamm) await gebaut(stamm);
        stelle(M.x, M.z);
        const e3 = await vorschau();
        out.schmuggelPlatz = e3 ? platzMessung(e3) : { da: false, grund: "keine Vorschau" };
        out.schmuggelPlatz.gesetzStub = hatGesetz;
        out.schmuggelPlatz.stamm = !!stamm;
        if (stamm) r.removeArchitecture(stamm);
        delete r._fahrPlatzSuche;
        delete r._fahrPlatzWege;
        wagenWeg(e3);
        neuVorschau();
        r._blockerMit = function (name) {
            return name === "moveable" ? [] : P._blockerMit.call(this, name);
        };
        out.schmuggelWand = wandProbe();
        delete r._blockerMit;
    }

    phase("F3 + Schmuggel");
    // ════ F4 — DER STOSS UND DIE BEFREIUNG (die Stelle der Schau, Kurs auf −765/−752) ════
    // DIE STELLE AUS DER WELT: die Schau stand auf ebenem Grund (−875/−732, Kurs auf −765/−752); am Flussnetz-Gelände liegt
    // sie am Hang, und der Wagen glitt quer am Ziel vorbei (kein Stoß). Die Station sucht in Ringen um die Stelle der Schau
    // den nächsten trockenen Anlauf (2 m zurück, 10 m voraus) mit Stufe ≤ 0,08 m je m und Quergefälle ≤ 0,05 m je m.
    const stossOrt = (() => {
        const fahrt = Math.atan2(-765 - -875, -752 - -732);
        const fX = Math.sin(fahrt);
        const fZ = Math.cos(fahrt);
        const nass = (x, z) => {
            const ws = r._atlasWaterLevelAt(x, z, boden(x, z));
            return Number.isFinite(ws) && ws > boden(x, z) - 0.3;
        };
        const eben = (x, z) => {
            for (let s = -2; s <= 10; s++) {
                const px = x + fX * s;
                const pz = z + fZ * s;
                const h = boden(px, pz);
                if (!Number.isFinite(h) || nass(px, pz)) return false;
                if (Math.abs(h - boden(px - fX, pz - fZ)) > 0.08) return false;
                if (Math.abs(boden(px + fZ * 2, pz - fX * 2) - boden(px - fZ * 2, pz + fX * 2)) / 4 > 0.05)
                    return false;
            }
            return true;
        };
        for (let ring = 0; ring <= 20; ring++)
            for (let k = 0; k < (ring ? 12 : 1); k++) {
                const x = -875 + Math.cos((k * Math.PI) / 6) * ring * 24;
                const z = -732 + Math.sin((k * Math.PI) / 6) * ring * 24;
                if (eben(x, z)) return { x, z, fahrt };
            }
        return null;
    })();
    out.stossOrt = stossOrt ? [Math.round(stossOrt.x), Math.round(stossOrt.z)] : null;
    const stossStation = async (zielTyp, zielAbstand) => {
        const m = { da: false, ziel: zielTyp, versuche: [] };
        if (!stossOrt) {
            m.grund = "kein ebener trockener Anlauf um die Stelle der Schau (480 m)";
            return m;
        }
        const sx = stossOrt.x;
        const sz = stossOrt.z;
        const fahrt = stossOrt.fahrt;
        const fX = Math.sin(fahrt);
        const fZ = Math.cos(fahrt);
        stelle(sx - Math.cos(fahrt) * 1.5, sz + Math.sin(fahrt) * 1.5);
        // das Ziel der Schau steht vor dem Bug: die Welt trägt den Glutbrunnen; fehlt er (oder für den Stamm), setzt die
        // Station ihn (Fixture)
        let ziel = st.architectures.find(
            (a) =>
                a &&
                a.type === zielTyp &&
                Math.abs((a.position.x - sx) * fZ - (a.position.z - sz) * fX) < 1.2 &&
                (a.position.x - sx) * fX + (a.position.z - sz) * fZ > 2 &&
                (a.position.x - sx) * fX + (a.position.z - sz) * fZ < 8
        );
        let fixture = null;
        if (!ziel) {
            const gx = sx + fX * zielAbstand;
            const gz = sz + fZ * zielAbstand;
            fixture = ziel = r.spawnArchitecture(
                zielTyp,
                { x: gx, y: boden(gx, gz) + 0.5, z: gz },
                { silent: true, precise: true, id: "fahr-bahn-ziel-" + zielTyp }
            );
            if (ziel) await gebaut(ziel);
        }
        if (!ziel) {
            m.grund = `kein ${zielTyp} vor dem Bug`;
            return m;
        }
        // JEDER VERSUCH VON DER STATION: der Wagen steht je Seite neu am Ort der Schau, Bug auf das Ziel.
        const wagenAnDerStation = async () => {
            const e = r.spawnArchitecture(
                "fahrzeug_gt",
                { x: sx, y: boden(sx, sz) + 0.5, z: sz },
                { silent: true, precise: true, rotationY: fahrt - Math.PI / 2, id: "fahr-bahn-stoss" }
            );
            if (!e) return { grund: "kein GT an der Stelle der Schau" };
            await gebaut(e);
            stelle(sx - Math.cos(fahrt) * 1.5, sz + Math.sin(fahrt) * 1.5);
            tippe("e");
            frame();
            if (st.player.mountedArch !== e.id) {
                if (r._portalOverlay) r.exitPortal();
                wagenWeg(e);
                return { grund: "E steigt an der Stelle der Schau nicht ein" };
            }
            takt(12);
            return { e };
        };
        for (const [seite, lenk] of [
            ["mit A", "a"],
            ["mit D", "d"],
        ]) {
            const ws = await wagenAnDerStation();
            if (!ws.e) {
                m.grund = ws.grund;
                if (fixture) r.removeArchitecture(fixture);
                return m;
            }
            const e = ws.e;
            // der Stoß: Gas gegen das Ziel, bis der Wagen steht (höchstens 3 s), dann 0,5 s drücken
            halte(["w"]);
            let stoss = false;
            const w0 = { x: e.position.x, z: e.position.z };
            let vMax = 0;
            for (let i = 0; i < 180; i++) {
                frame();
                if (e._fahr) vMax = Math.max(vMax, Math.abs(e._fahr.vlong));
                if (e._fahr && Math.abs(e._fahr.vlong) < 0.3 && i > 20) {
                    stoss = true;
                    break;
                }
            }
            // der Täter beim Namen: wie weit der Wagen fuhr, wo das Ziel dann lag (längs, quer), seine Boxen
            if (!stoss && !m.ohneStoss) {
                const dx = ziel.position.x - e.position.x;
                const dz = ziel.position.z - e.position.z;
                const bx = ziel.blockerAABBs || [];
                m.ohneStoss = {
                    seite,
                    weg: +Math.hypot(e.position.x - w0.x, e.position.z - w0.z).toFixed(2),
                    vMax: +vMax.toFixed(2),
                    zielLaengs: +(dx * fX + dz * fZ).toFixed(2),
                    zielQuer: +(dx * fZ - dz * fX).toFixed(2),
                    quelle: fixture ? "gesetzt" : "Welt",
                    blocker: bx.length,
                    unten: bx.length
                        ? +(Math.min(...bx.map((b) => b.botY)) - boden(ziel.position.x, ziel.position.z)).toFixed(2)
                        : null,
                    oben: bx.length
                        ? +(Math.max(...bx.map((b) => b.topY)) - boden(ziel.position.x, ziel.position.z)).toFixed(2)
                        : null,
                };
            }
            takt(15);
            halte([]);
            takt(10);
            m.stoss = m.stoss !== false && stoss;
            // die Befreiung: S + Gegenlenkung; frei, sobald der Wagen ≥ freiM vom Stoß ist
            const p0 = { x: e.position.x, z: e.position.z };
            let vMin = 0;
            let freiFrame = -1;
            let weg = 0;
            halte(["s", lenk]);
            for (let i = 1; i <= B.freiFrames; i++) {
                frame();
                if (e._fahr) vMin = Math.min(vMin, e._fahr.vlong);
                weg = Math.hypot(e.position.x - p0.x, e.position.z - p0.z);
                if (weg >= B.freiM) {
                    freiFrame = i;
                    break;
                }
            }
            halte([]);
            m.versuche.push({ seite, freiFrame, weg, vMinKmh: vMin * 3.6 });
            takt(30);
            wagenWeg(e);
        }
        m.da = true;
        if (fixture) r.removeArchitecture(fixture);
        return m;
    };
    out.stossGlut = await stossStation("glutbrunnen", 4.4);
    out.stossStamm = await stossStation("baum_kiefer", 5);

    phase("F4");
    out.log.push("Dauer: " + uhr.zeilen.join(" · "));
    out.log.push(...logs.slice(0, 20));
    return out;
}


hauptLauf(async () => {
    if (schalter("--selftest")) {
        console.log("=== SELBST-TEST: die Fahr-Linse nennt jeden Täter des Befunds ===");
        const gesund = {
            gestartet: true,
            frames: 240,
            teleport: 0,
            schritte: 270,
            luft: 0,
            simWeg: 30.1,
            fahrWeg: 29.9,
            gierGrad: 0.0,
            versatz: 0,
            stufe: 0,
        };
        check("Selbst-Test 0: gesunder Ritt == 0 Täter", taktVerdict(gesund).length === 0);
        // W: gesund Tiefe 4 (der Ast über Brand und Licht), jeder Täter beim Namen seines Glieds (je Lage der Bremsweg s, die
        // Glut des Herds, sein Licht); ein gebrochener Grip kürzt die Tiefe nicht. Dieselben Lagen trägt der K8-Selbsttest
        const lg = (regen, naesse, s, brand = 1 - naesse, licht = brand) => ({ regen, naesse, stoff: naesse, s, brand, licht });
        const kg = { trocken: lg(0, 0, 20), sturm: lg(1, 1, 35), festRegen: lg(0, 0, 20), festNaesse: lg(1, 0, 20), festBrand: lg(1, 1, 20, 1), stern: lg(1, 0, 35) };
        for (const [bruch, tiefe, soll] of [
            [{}, 4, /^$/],
            [{ sturm: lg(1, 1, 20) }, 4, /Grip zieht nicht/],
            [{ festNaesse: lg(1, 0, 35) }, 4, /Grip steht nicht/],
            [{ sturm: lg(1, 1, 35, 1) }, 3, /Brand zieht nicht/],
            [{ festNaesse: lg(1, 0, 20, 0) }, 3, /Brand steht nicht/],
            [{ festBrand: lg(1, 1, 20, 1, 0) }, 3, /Licht steht nicht/],
            [{ festRegen: lg(0, 1, 35) }, 1, /Nässe steht nicht/],
            [{ stern: lg(1, 0, 20) }, 4, /blind/],
        ]) {
            const v = ketteVerdict(Object.assign({}, kg, bruch));
            check(`Selbst-Test W ${soll} → Tiefe ${tiefe}`, v.tiefe === tiefe && soll.test(v.befunde.join()), v.befunde.join());
        }

        // K1: ein grüner Lauf, je Täter ROT beim Namen
        {
            const lauf = (k) => {
                const o = {};
                for (const [n, kg, t, anteil] of [
                    ["spieler", 89.06, 1.07],
                    ["wolf", 64.01, 0.6],
                    ["wagen", 1341.36, 3.43, 3],
                    ["holz", 1814.4, 0.432, 0.72],
                    ["stein", 6678, 3.43, 2.65],
                ])
                    o[n] = { kg: kg * k, tief: k > 1 ? 3.43 : t, grund: 3.43, schwimmt: k < 2 && t < 3, traegt: k < 2, anteil: anteil * k, H: 0.6 };
                Object.assign(o.wagen, { rho: 3000, kernKg: 1341.36, wasserK: 0.7 / k });
                o.holz.rho = 720 * k;
                o.stoss = { J: 1, dvA: 0.7187, dvB: 1 };
                o.geschmiedet = { kg: 2.1766 * k, labKg: 2.1766, dauer: k };
                o.lose = { kg: 2.5846 * k, dauer: k };
                return o;
            };
            const fall = (pfad, wert) => {
                const k = { vor: lauf(1), nach: lauf(2), mutiert: 18, refKg: 64, rhoBlech: 3000, rhoW: 1000, brustM: 1.22, labMensch: 89.06 };
                for (const M of [k.vor, k.nach]) delete M.spieler.anteil, delete M.wolf.anteil;
                if (pfad) {
                    const t = pfad.split(".");
                    t.slice(0, -1).reduce((o, x) => o[x], k)[t[t.length - 1]] = wert;
                }
                return koerperVerdict(k);
            };
            const g = fall();
            check("Selbst-Test K1: ein grüner Lauf bleibt grün", !g.s1.length && !g.s2.length, g.s1.concat(g.s2).join(" · "));
            for (const [pfad, wert, s, soll] of [
                ["nach.wolf.kg", 64.01, "s1", /wolf: ρ ×2 → Masse/],
                ["nach.spieler.schwimmt", true, "s1", /spieler \(ρ ×2\): dichter als Wasser/],
                ["labMensch", 117.29, "s1", /spieler: Welt/],
                ["vor.spieler.kg", 117.29, "s1", /Mensch 117\.29 kg außer/],
                ["vor.stoss.dvB", 0.7187, "s1", /Stoß: Δv/],
                ["vor.holz.tief", 0.216, "s2", /holz: Eintauchtiefe 0\.216/],
                ["vor.stein.anteil", 0.9, "s2", /stein: schwimmt/],
                ["vor.geschmiedet.labKg", 2.5, "s2", /geschmiedet: Welt/],
            ]) {
                const v = fall(pfad, wert);
                check(`Selbst-Test K1: ${pfad} = ${wert} → ROT`, v[s].some((x) => soll.test(x)), v[s].join(" · "));
            }
        }

        for (const [name, bruch, soll] of [
            ["der gerittene Wagen auf der Karte (Distanz-Wand)", { stufe: 2 }, "stufe"],
            ["der Eintrag bleibt hinter dem Reiter (Pin gerissen)", { versatz: 3.2 }, "versatz"],
            ["114 von 114 Frames Teleport (F-D1)", { teleport: 114 }, "teleport"],
            ["25,95 m simuliert, 10,27 m gefahren (F-D1)", { simWeg: 25.95, fahrWeg: 10.27 }, "weg"],
            ["Reiter in der Luft 421/421 (F-D10)", { luft: 270 }, "luft"],
            ["82,4° Gier in Frames ohne Sim-Schritt (F-D2)", { gierGrad: 82.4 }, "gier"],
            ["keine Fahrt (0 m)", { simWeg: 0, fahrWeg: 0 }, "sim-weg"],
        ]) {
            const v = taktVerdict(Object.assign({}, gesund, bruch));
            check(
                `Selbst-Test: ‚${name}' → die Linse nennt ${soll}`,
                v.length >= 1 && v[0].startsWith(soll),
                v.join(" · ")
            );
        }
        check("Selbst-Test: nicht gestartet → die Linse feuert", taktVerdict({ gestartet: false }).length === 1);
        const steht = { gestartet: true, frames: 180, teleport: 0, fahrWeg: 0.0, gierGesamt: 0, v: 0 };
        check("Selbst-Test H0: der haltende Wagen == 0 Täter", haltVerdict(steht).length === 0);
        const rollt = haltVerdict(Object.assign({}, steht, { fahrWeg: 9.7, v: 4.7, gierGesamt: 84 }));
        check(
            "Selbst-Test H: ‚rollt 9,7 m mit 4,7 m/s zurück und dreht 84°' → rollt + gier",
            rollt.length === 2 && rollt[0].startsWith("rollt") && rollt[1].startsWith("gier"),
            rollt.join(" · ")
        );
        const wechsel = { gestartet: true, ort: [1, 2, 20], stufeM: 0.01, band: 90, ego: [76, 77], nach10: [4.1, 3.8] };
        Object.assign(wechsel, { ruckN: 165, ruckP95: 0.02, gleichN: 400, gleichP95: 0.04, hochN: 210, hochP05: 17.4, wiederauf: 0, abV: [9.1, 8.6], abSprung: [0.31, 0.2], abFov: [0.2, 0.4, 0] });
        check("Selbst-Test T4: der gesunde Wechsel == 0 Täter", wechselVerdict(wechsel).length === 0, wechselVerdict(wechsel).join(" · "));
        for (const [name, bruch, soll] of [
            ["der Band-Partner bleibt am Ort des Aufstiegs (F1)", { stufeM: 23.4, stufeWer: "L1 (Band)" }, "stufe"],
            ["kein Band im Ritt", { band: 0 }, "band"],
            ["die Gier drehte in Ego nur 20°", { ego: [20, 77] }, "ego"],
            ["Third beginnt aus der alten Richtung (18° / 20°)", { nach10: [18, 20] }, "kamera"],
            ["der Abstieg in Fahrt reißt die Kamera 4,1 m", { abSprung: [4.1, 0.2] }, "absteigen"],
            ["das Tempo-FOV springt beim Wechsel Ego → Third (4,7°)", { abFov: [4.7, 0.4, 0] }, "sichtfeld"],
            ["das Tempo-FOV fällt beim Abstieg in einem Bild (5,06°)", { abFov: [0.2, 5.06, 0] }, "sichtfeld"],
            ["Third ruckt quer (0,14 m)", { ruckP95: 0.14 }, "ruck"],
            ["das Bild läuft 0,9 neben der Physik", { gleichP95: 0.91 }, "gleichlauf"],
            ["bergab −3,3° über der Fahrbahn", { hochP05: -3.3 }, "hoch"],
            ["der Wiederaufstieg zeigt die alte Gier (57°)", { wiederauf: 57 }, "wiederaufstieg"],
            ["kein Bild ohne Sim-Schritt nach dem Aufstieg", { wiederauf: undefined }, "wiederaufstieg: kein"],
            ["kein Steilhang", { gestartet: false, ort: null }, "steilhang"],
        ]) {
            const v = wechselVerdict(Object.assign({}, wechsel, bruch));
            check(`Selbst-Test T4: ‚${name}' → die Linse nennt ${soll}`, v.length === 1 && v[0].startsWith(soll), v.join(" · "));
        }
        // der Ruck je Bild über ungleiche Bildzeiten (16,7 · 33,3 ms): gleichförmig 1,8 m/s quer ist keiner (je Bild roh 0,03), ein Zittern bleibt
        const [glatt, zittert] = [ruckJeBild([[0, 0], [0.03, 16.7], [0.09, 50]]), ruckJeBild([[0, 0], [0.03, 16.7], [0, 33.4]])];
        check("Selbst-Test T4: der Ruck je Bild — gleichförmig quer 0, ein Zittern nennt ruck", glatt < 1e-3 && !(zittert <= WECHSEL.ruckM), `${glatt.toFixed(4)} · ${zittert.toFixed(3)} m`);
        // T5 das Tempo der Kamera: die Täter beim Namen
        const gut5 = { n: 9, quelle: true, fov: { 10: 5.4 }, zeigt: 0, schreiber: ["_kamFov"], orbit: 69, rueck: 1.08, fovMax: 10, arm: 0.2, drift: 9, knick: 0.08 };
        check("Selbst-Test T5: das gesunde Tempo == 0 Täter", tempoVerdict(gut5).length === 0, tempoVerdict(gut5).join(" · "));
        const VCk = (require(path.join(root, "vehicle-core.js")), globalThis.__vehicleCore);
        for (const [bruch, soll] of [
            // die Mutation am echten Kern: der Wirt reicht den Fahrtvektor ohne Schlupf — die Kamera klebt am Kurs
            [kernTempo({ ...VCk, chaseKamera: (c, g, s, dt, K, z, vm) => VCk.chaseKamera(c, g, s, dt, K, z && { ...z, vlat: 0 }, vm) }), "drift"],
            [{ fovMax: 0 }, "fov"],
            [{ arm: 0 }, "arm"],
            [{ quelle: false }, "quelle"],
            [{ fov: { 10: 0 } }, "fov"],
            [{ zeigt: 0.4 }, "zeigt"],
            [{ schreiber: ["_tickBogenZug", "_bogenRelease", "setZoomActive"] }, "schreiber"],
            [{ orbit: 0 }, "orbit"],
            [{ rueck: 0.54 }, "rueck"],
            [{ knick: 0.98 }, "knick"],
            [{ kern: ["chaseGreif"] }, "kern"],
            [{ zoom: false }, "zoom"],
            [{ laut: false }, "laut"],
        ]) {
            const v = tempoVerdict(Object.assign({}, gut5, bruch));
            check(`Selbst-Test T5: ${JSON.stringify(bruch)} → die Linse nennt ${soll}`, v.length === 1 && v[0].startsWith(soll), v.join(" · "));
        }
        // Die Stations-Linse.
        const gutS = {
            kern: true,
            labor: { schritte: 180, maxM: 0.0001, bei: 3 },
            klippe: { sprung: 0.2, luft: 40 },
            absteigen: { imFlug: true, hoehe: 2.1, ueberBoden: 0.0, sprung: 0.2 },
            quer: { drift: 1.2 },
            raeder: {
                leaves: 4,
                stehend: 4,
                stehRolle: 0,
                rolle: 12,
                lenk: 0.4,
                lenkHinten: 0,
                tauchBremse: 0.0,
                spaltP75: 0.01,
                spaltMax: 0.05,
            },
            huelleSchub: { weg: 0 },
            huelleHang: { schub: 0.8, eindringen: 0 },
            pflicht: { satz: "bruch", ebene: "bruch", leser: true },
            huelleKonsum: { gleiten: true, kapsel: true, leibWagen: true, leibTier: true },
            hangfuss: { ziel: true, kontakte: 4, unterMax: 0.12, unterN: 2, schubMax: 0.17, weg: 21 },
            spalt: { rand: 32.4, grund: 15, vor: 8, yMin: 18 },
            stossFels: { kontakt: 40, vVor: 6.5, vNach: -1.3, vMinNach: -1.3, ereignisse: 1, ruck: 3, zielWeg: 0 },
            stossWagen: { kontakt: 40, vVor: 6.5, vNach: 2.3, vMinNach: 2.3, ereignisse: 1, ruck: 3, zielWeg: 2.1 },
            stossBaer: { kontakt: 40, vVor: 6.5, vNach: 5.0, vMinNach: 5.0, ereignisse: 1, ruck: 2, zielWeg: 3.2 },
            frei: { kisten: { ruheS: 0.8, zittern: 0, boden: 0, fugen: [0] }, wachZittern: 0, schwerelos: { boden: 0.1, fugen: [0.1] }, fass: { kipp: 172 }, fassOhneStoss: { kipp: 2 } },
            spielerWagen: {
                a: {
                    minAbstand: 0,
                    wagenWeg: 0.002,
                    kontakt: 100,
                    vorKontakt: 4.2,
                    nachKontakt: -0.1,
                    paare: 3,
                    prallNach: -0.03,
                },
                b: { minAbstand: 0, spielerDv: 3.2, angestossen: true },
            },
            lockstep: { abw: 0, baerAbw: 0, ruhe: true, gleicherStart: true },
            reiter: [
                {
                    typ: "fahrzeug_gt",
                    oben: 1.15,
                    dach: 1.2,
                    schenkel: 0.475,
                    sitz: 0.475,
                    ankerL: 0,
                    ankerQ: 0,
                    blickGrad: 0,
                    lehneGrad: 25,
                },
                {
                    typ: "fahrzeug_wagen",
                    oben: 2,
                    dach: null,
                    schenkel: 1.02,
                    sitz: 1.025,
                    ankerL: 0,
                    ankerQ: 0,
                    blickGrad: 1,
                },
            ],
            reiterStand: { abw: 0 },
            schwimmer: { vorher: -0.1, tiefste: -0.15, gleitet: 20, tiefe: 2 },
            lockSchwimmer: { abw: 0, abwY: 0 },
        };
        check("Selbst-Test S0: gesunde Stationen == 0 Täter", stationVerdict(gutS).length === 0);
        for (const [name, bruch, soll] of [
            [
                "Hangfuß: 1,19 m unter den Rädern, 66 Schritte (Leben-Schau 07.10.: 1,16 m)",
                { hangfuss: { ziel: true, kontakte: 1, unterMax: 1.19, unterN: 66, schubMax: 0.1, weg: 21 } },
                "hangfuss-unter",
            ],
            [
                "Hangfuß: der Glutbrunnen versetzt den Wagen 1,33 m in EINEM Schritt (Leben-Schau: 0,97 m)",
                { hangfuss: { ziel: true, kontakte: 1, unterMax: 0.0, unterN: 0, schubMax: 1.33, weg: 21 } },
                "hangfuss-schub",
            ],
            [
                "Hangfuß: W bewegt ihn 0,00 m",
                { hangfuss: { ziel: true, kontakte: 1, unterMax: 0.0, unterN: 0, schubMax: 0.1, weg: 0 } },
                "hangfuss-steht",
            ],
            [
                "Hangfuß ohne Glutbrunnen (vakuös)",
                { hangfuss: { ziel: false, kontakte: 0, unterMax: 0, unterN: 0, schubMax: 0, weg: 21 } },
                "hangfuss vakuös",
            ],
            [
                "Spaltkante: der Wagen steht bei x −904,09 (11,7 → 0,17 m/s, Leben-Schau: 11,44 → 0,19)",
                { spalt: { rand: 32.4, grund: 15, vor: -0.09, yMin: 32.42 } },
                "spalt-wand",
            ],
            ["Spalt ohne Spalt (vakuös)", { spalt: { rand: 32.4, grund: 31, vor: 8, yMin: 18 } }, "spalt vakuös"],
            [
                "Fels: 10,41 → 0,16 m/s in EINEM Frame, kein Rückprall (Leben-Schau 07.10.)",
                { stossFels: { ...gutS.stossFels, vVor: 10.41, vNach: 0.16, vMinNach: 0.16 } },
                "stoss-fels: kein Rückprall",
            ],
            [
                "geparkter GT: 11,28 → 0,00 m/s, er bewegt sich nicht (Leben-Schau 07.10.)",
                { stossWagen: { ...gutS.stossWagen, vVor: 11.28, vNach: 0, vMinNach: 0, zielWeg: 0 } },
                "stoss-wagen: der geparkte GT bewegt sich",
            ],
            [
                "Bär: 9,27 → 0,17 m/s, der Bär bewegt sich nicht (Leben-Schau 07.10.)",
                { stossBaer: { ...gutS.stossBaer, vVor: 9.27, vNach: 0.17, vMinNach: 0.17, zielWeg: 0 } },
                "stoss-baer: der Bär bewegt sich",
            ],
            [
                "Stoß ohne Ereignis (keine Kamera, kein Klang)",
                { stossFels: { ...gutS.stossFels, ereignisse: 0, ruck: 0 } },
                "stoss-fels: kein Stoß-Ereignis",
            ],
            [
                "der Bär gleitet fort und wird je Schritt neu gestoßen (gate:fahr-leben 07.10.: 7,92 → 1,71 m/s)",
                {
                    stossBaer: {
                        kontakt: 40,
                        vVor: 7.92,
                        vNach: 3.7,
                        vMinNach: 1.71,
                        ereignisse: 5,
                        ruck: 4,
                        zielWeg: 5.6,
                        ohneAnnaeherung: 6,
                    },
                },
                "stoss-baer: Stoß ohne Annäherung",
            ],
            [
                "der Spieler läuft gegen den GT ohne Folge, der GT schiebt sich in den Spieler (0710-4)",
                {
                    spielerWagen: {
                        a: { minAbstand: 0, wagenWeg: 0, kontakt: 100, vorKontakt: 4.2, nachKontakt: 4.1, paare: 0 },
                        b: { minAbstand: -0.6, spielerDv: 0, angestossen: true },
                    },
                },
                "spieler-wagen",
            ],
            [
                "der Wagen steht je nach Bildrate anders (Gegenprüfung 0710-5: 0,06 m nach 200 Schritten)",
                { lockstep: { abw: 0.06, baerAbw: 0, ruhe: true, gleicherStart: true } },
                "lockstep",
            ],
            [
                "der 60-fps-Lauf beginnt am frisch gesetzten Stand, der gemischte einen Schritt später (K70-N1: 1,2 mm nach 200 Schritten)",
                { lockstep: { abw: 0.001239, baerAbw: 0, ruhe: true, gleicherStart: false, startAbw: 0.163 } },
                "lockstep start",
            ],
            [
                "der Wagen kriecht vor der Probe (der Stand kommt nie zur Ruhe)",
                { lockstep: { abw: 0, baerAbw: 0, ruhe: false, gleicherStart: true, startAbw: 0 } },
                "lockstep start",
            ],
            [
                "der Reiter ragt aus dem GT, schwebt über dem Sitz und schaut mit der Maus (Gegenprüfung 0710-4 Klasse 4)",
                { reiter: [{ ...gutS.reiter[0], oben: 2.175, schenkel: 0.72, ankerL: 0.3, ankerQ: 0.4, blickGrad: 90, lehneGrad: 0 }] },
                "reiter fahrzeug_gt",
            ],
            [
                "die Füße des Reiters hängen unter dem Wagen (Gegenprüfung 0710-4, das Auge)",
                {
                    reiter: [
                        {
                            ...gutS.reiter[0],
                            lehneGrad: 60,
                            aussen: {
                                unten: 4200,
                                seite: 0,
                                oben: 0,
                                laengs: 0,
                                n: 116000,
                                tief: { unten: 0.18 },
                                wer: { unten: "ankle1" },
                            },
                        },
                    ],
                },
                "reiter fahrzeug_gt",
            ],
            [
                "die Höhe des gestoßenen Schwimmers hängt an der Bildrate (Gegenprüfung 0710-5-Nachschnitt)",
                { lockSchwimmer: { abw: 0, abwY: 0.31 } },
                "lockstep schwimmer",
            ],
            [
                "der gestoßene Schwimmer sinkt auf den Grund (Gegenprüfung 0710-5-Nachschnitt)",
                { schwimmer: { vorher: -0.1, tiefste: -1.6, gleitet: 20, tiefe: 2 } },
                "schwimmer:",
            ],
            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",
                { lockstep: { abw: 0, baerAbw: 1.39, ruhe: true, gleicherStart: true } },
                "lockstep",
            ],
            ["5 Kisten ruhen 2,4 s", { frei: { ...gutS.frei, kisten: { ...gutS.frei.kisten, ruheS: 2.4 } } }, "frei-ruhe"],
            ["die Wagen-Kollision aus: das Fass steht", { frei: { ...gutS.frei, fass: { kipp: 2 } } }, "frei-fass"],
            ["ohne Schwere ruhen die Kisten am Boden", { frei: { ...gutS.frei, schwerelos: gutS.frei.kisten } }, "frei-mutante"],
            [
                "Stoß aus dem Stand (vakuös)",
                { stossBaer: { kontakt: -1, vVor: 0, vNach: 0, vMinNach: 0, ereignisse: 0, ruck: 0, zielWeg: 0 } },
                "stoss-baer vakuös",
            ],
            ["kein Fahr-Schritt im Kern", { kern: false }, "kern"],
            ["Welt weicht 0,4 m vom Labor ab", { labor: { schritte: 180, maxM: 0.4, bei: 50 } }, "labor≠welt"],
            ["7,95 m Höhen-Sprung in einem Schritt (F-D6)", { klippe: { sprung: 7.95, luft: 40 } }, "klippe-sprung"],
            [
                "im Flug abgestiegen: der Wagen hängt 2,4 m in der Luft (Gegenprüfung 07.10.)",
                { absteigen: { imFlug: true, hoehe: 2.4, ueberBoden: 2.4, sprung: 0 } },
                "absteigen-luft",
            ],
            [
                "im Flug abgestiegen: der Wagen springt 2,4 m auf den Boden (Teleport)",
                { absteigen: { imFlug: true, hoehe: 2.4, ueberBoden: 0, sprung: 2.4 } },
                "absteigen-sprung",
            ],
            [
                "am Boden abgestiegen (vakuös)",
                { absteigen: { imFlug: false, hoehe: 0.1, ueberBoden: 0, sprung: 0 } },
                "absteigen nicht im Flug",
            ],
            ["Querhang ohne Abtrieb: 0,00 m (F-D7)", { quer: { drift: 0.0 } }, "querhang"],
            [
                "die starre Instanz: kein Rad-Leaf (F-D8)",
                { raeder: { leaves: 0, rolle: 0, lenk: 0, lenkHinten: 0, tauchBremse: 0.0, spaltP75: 0.01 } },
                "raeder starr",
            ],
            [
                "Vorderräder 0,09 m im Boden beim Bremsen (F-D8)",
                { raeder: { ...gutS.raeder, tauchBremse: 0.09 } },
                "raeder tauchen",
            ],
            [
                "die Räder lenken nicht (F-D8)",
                { raeder: { ...gutS.raeder, lenk: 0 } },
                "raeder lenken nicht",
            ],
            [
                "der Bremssattel rollt mit dem Rad (Gegenprüfung 07.10.)",
                { raeder: { ...gutS.raeder, stehRolle: 3.1 } },
                "raeder Sattel rollt",
            ],
            [
                "kein Sattel an der Nabe",
                { raeder: { ...gutS.raeder, stehend: 0 } },
                "raeder ohne Sattel",
            ],
            ["ein Bär schiebt den stehenden Wagen 0,5 m", { huelleSchub: { weg: 0.5 } }, "huelle-schub"],
            [
                "ein Kasten schiebt die Hülle 0,5 m in den Hang (Befund 07.10.)",
                { huelleHang: { schub: 0.8, eindringen: 0.5 } },
                "huelle-hang Schub",
            ],
            ["der Kasten schiebt nicht (vakuös)", { huelleHang: { schub: 0, eindringen: 0 } }, "huelle-hang vakuös"],
            [
                "ein alter Kern: fahrSatz und rittEbene still null (Gegenprüfung 07.10.)",
                { pflicht: { satz: "null", ebene: "null" } },
                "pflicht still",
            ],
            ["der Fahr-Satz liest den Kern vorbei am Pflicht-Leser", { pflicht: { satz: "bruch", ebene: "bruch", leser: false } }, "pflicht-leser"],
            ["die Hülle gleitet in einer eigenen Schleife", { huelleKonsum: { kapsel: true, leibWagen: true, leibTier: true } }, "huelle-konsum gleiten"],
        ]) {
            const v = stationVerdict(Object.assign({}, gutS, bruch));
            check(
                `Selbst-Test S: ‚${name}' → die Linse nennt ${soll}`,
                v.length >= 1 && v[0].startsWith(soll),
                v.join(" · ")
            );
        }
        {
            // F — DIE FAHR-BAHN: jedes Urteil nennt seinen eingeschmuggelten Täter
            const gutP = {
                da: true,
                neigung: 8,
                steig: 5,
                wank: 6,
                waende: 0,
                blocker: 0,
                blockerNamen: [],
                eingestiegen: true,
                vor: 9,
                zurueck: 4,
                ausgestiegen: true,
            };
            const gutS = {
                da: true,
                ziel: "glutbrunnen",
                stoss: true,
                versuche: [{ seite: "mit A", freiFrame: 40, weg: 3, vMinKmh: -15 }],
            };
            const gutT = {
                element: true,
                proben: 10,
                unsichtbar: 0,
                falsch: 0,
                maxKmh: 40,
                nachAbsteigenSichtbar: false,
            };
            const gutH = {
                zeilen: ["Fahren: E einsteigen/aussteigen · W Gas · Shift Handbremse"],
                handbremseWirkt: true,
            };
            check(
                "Selbst-Test F0: gute Fahr-Bahn == 0 Täter",
                !bahnPlatzVerdict(gutP).length &&
                    !bahnStossVerdict(gutS).length &&
                    !bahnTachoVerdict(gutT).length &&
                    !bahnTastenVerdict(gutH).length &&
                    !bahnWandVerdict({ da: true, urteil: "wagen" }).length
            );
            for (const [name, taeter, re] of [
                [
                    "F1 Fels (Schau 2 #6: 38° steil, 40° gewankt)",
                    bahnPlatzVerdict(
                        Object.assign({}, gutP, {
                            neigung: 41,
                            steig: 38,
                            wank: -17,
                            waende: 3,
                            vor: 0.08,
                            zurueck: 0.2,
                        })
                    ),
                    /Neigung 41°.*3 Wände.*W 2 s 0\.08.*S 2,5 s 0\.20/,
                ],
                [
                    "F1 16° (über der Platz-Grenze)",
                    bahnPlatzVerdict(Object.assign({}, gutP, { neigung: 16.4, steig: 13, wank: 11 })),
                    /Neigung 16°/,
                ],
                [
                    "F1 Tanne in der Hülle",
                    bahnPlatzVerdict(Object.assign({}, gutP, { blocker: 2, blockerNamen: ["baum_tanne"] })),
                    /Blocker im Band \(baum_tanne\)/,
                ],
                [
                    "F1 E betritt das Tor (P2 welt_portal)",
                    bahnPlatzVerdict(Object.assign({}, gutP, { eingestiegen: false, statt: "Portal betreten" })),
                    /E steigt nicht ein \(Portal betreten\)/,
                ],
                [
                    "F1 rückwärts 0,1 m (Auge 06)",
                    bahnPlatzVerdict(Object.assign({}, gutP, { zurueck: 0.1 })),
                    /S 2,5 s 0\.10 m/,
                ],
                [
                    "F3 Natur-Wand ohne Wagen",
                    bahnWandVerdict({ da: true, art: "baum_tanne", l: 1.5, urteil: false }),
                    /steht im Wagen \(Urteil false\)/,
                ],
                [
                    "F3 der Wagen als Grundriss (Prüfung K12/1: ein Haus räumte die Natur aus nahen Wagen)",
                    bahnWandVerdict({ da: true, art: "baum_tanne", l: 1.5, urteil: "wagen", grundriss: "wagen" }),
                    /der Wagen ist ein Grundriss \(_imGrundriss → wagen\)/,
                ],
                [
                    "F4 Befreiung −0,9 km/h",
                    bahnStossVerdict(
                        Object.assign({}, gutS, {
                            versuche: [{ seite: "mit A", freiFrame: -1, weg: 0.25, vMinKmh: -0.9 }],
                        })
                    ),
                    /glutbrunnen mit A: nach 2 s 0\.25 m/,
                ],
                [
                    "F4 kein Stoß",
                    bahnStossVerdict(Object.assign({}, gutS, { stoss: false })),
                    /kein Stoß am glutbrunnen/,
                ],
                ["F5 kein Tacho", bahnTachoVerdict({ element: false }), /kein Tacho/],
                [
                    "F5 falsche Zahl",
                    bahnTachoVerdict(Object.assign({}, gutT, { falsch: 3, beispiel: "zeigt 12, Fahrt 40 km/h" })),
                    /3\/10 Proben ≠/,
                ],
                [
                    "F5 nach dem Absteigen",
                    bahnTachoVerdict(Object.assign({}, gutT, { nachAbsteigenSichtbar: true })),
                    /nach dem Absteigen/,
                ],
                [
                    "F7 ohne Fahr-Tasten",
                    bahnTastenVerdict({ zeilen: ["Tasten: WASD laufen · 1–9 Hotbar"], handbremseWirkt: true }),
                    /E \(einsteigen\) fehlt.*Shift \(Handbremse\) fehlt/,
                ],
                [
                    "F7 Shift wirkungslos",
                    bahnTastenVerdict(
                        Object.assign({}, gutH, {
                            handbremseWirkt: false,
                            handbremseDetail: "Shift im Fahr-Schritt 0/30",
                        })
                    ),
                    /Shift kommt im Fahr-Schritt nicht/,
                ],
            ])
                check(
                    `Selbst-Test ${name} → beim Namen`,
                    taeter.length > 0 && re.test(taeter.join(" · ")),
                    taeter.join(" · ")
                );
            {
                // DER KERN mit dem alten Rückwärts-Antrieb (0,4 × aEngine) fällt in FK; die Stimme mit falschem Motor-Ton in FK2
                require(path.join(root, "vehicle-core.js"));
                require(path.join(root, "klang-core.js"));
                const VCs = globalThis.__vehicleCore;
                const KCs = globalThis.__klangCore;
                const alt = VCs.FAHR.schritt.rueckAntrieb;
                VCs.FAHR.schritt.rueckAntrieb = 0.4;
                const kAlt = bahnKernVerdict(bahnKernRueck(VCs));
                VCs.FAHR.schritt.rueckAntrieb = alt;
                check(
                    "Selbst-Test FK: der Kern mit dem alten Rückwärts-Antrieb (0,4) → beim Namen",
                    kAlt.some((t) => /^gt S/.test(t)),
                    kAlt.slice(0, 2).join(" · ")
                );
                const mischung = KCs.fahrtMischung;
                KCs.fahrtMischung = (l) => Object.assign({}, mischung(l), { upm: 800, motorHz: 53.3 });
                const sAlt = bahnKernStimme(KCs, VCs);
                KCs.fahrtMischung = mischung;
                check(
                    "Selbst-Test FK2: eine starre Drehzahl (Leerlauf bei vmax) → beim Namen",
                    sAlt.some((t) => /vmax 800 U\/min ≠ Begrenzer/.test(t)),
                    sAlt.slice(0, 2).join(" · ")
                );
                // K8: der Kern verstimmt; Kosten, keine Achse
                const R8 = VCs.FAHR.reifen;
                const alt8 = [R8.spitzeGrad, R8.C, R8.taktHz];
                Object.assign(R8, { spitzeGrad: 12, C: 1.1, taktHz: 60 });
                const k8 = reifenVerdict(reifenMessung(VCs)).join(" · ");
                [R8.spitzeGrad, R8.C, R8.taktHz] = alt8;
                const p8 = [[], [{ spitze: 8, abfall: 1 }]].map((achsen) =>
                    reifenVerdict({ achsen, hz: 240, kostenUs: 180 })
                );
                // in der Welt (die Lagen des W-Selbsttests): grün bleibt grün, ein konstantes μ (Gras = Weg, die Zeile wirkt nicht) ROT
                const w8 = { ...kg, zeile: kg.sturm, weg: lg(0, 0, 12), wegNass: lg(1, 1, 18), labor: { maxM: 0, hz: 240 } };
                const W8 = [{}, { weg: kg.trocken, wegNass: kg.sturm, zeile: kg.trocken }].map((o) => reifenWeltVerdict({ ...w8, ...o }));
                check(
                    "Selbst-Test K8: Spitze 12°, C 1,1, Takt 60 Hz, 180 µs, keine Achse; in der Welt ein konstantes μ → beim Namen",
                    /^spitze gt vorn 12° · abfall gt vorn 0 %.* · takt 60 Hz$/.test(k8) &&
                        p8.join() === "reifen ohne Achse,kosten 180 µs" &&
                        W8.join() === ",boden 1,zeile 1",
                    `${k8.slice(0, 40)} … ${k8.slice(-10)} · ${p8.join(" · ")} · ${W8}`
                );
            }
        }
        {
            // WN: ein guter Lauf ohne Täter, jeder Bruch beim Namen
            const g = { lang: 2380, wegAnteil: 1, ende: true, weg: 2380, steck: [], anteil: 0.85, boden: { wiese: 0.1, wald: 0.6, dorf: 0.3 } };
            const aus = [{}, { steck: [704] }, { anteil: 0.6 }, { lang: 1850 }, { wegAnteil: 0.3 }, { ende: false }, { boden: { wald: 1 } }].map((an) => wegenetzVerdict({ ...g, ...an }));
            check("Selbst-Test WN: die Fahrt auf dem Wegenetz nennt jeden Bruch", aus.map((v) => v.length).join("") === "0111111", aus.join(" | "));
        }
        {
            // RM — DIE RÜCKMELDUNG: gute Maße == 0 Täter; je gekappte Kopplung genau ihr Kanal (Stimme · Feder · Rumble)
            const g = { klingt: 1, still: true, wankMm: 0.2, stoesse: 40, antwortMm: 9.6, stark: 0, summen: 0.54 };
            const v = (an) => {
                const t = rueckVerdict({ glatt: { ...g, ...an }, drift: { ...g, wankMm: 9, stark: 1, ...an }, hang: { ...g, ...an } });
                return [t.motor, t.feder, t.rumble].map((l) => +!!l.length).join("");
            };
            const faelle = [[{}, "000"], [{ still: false }, "100"], [{ antwortMm: 0.2 }, "010"], [{ wankMm: 2 }, "010"], [{ stark: 0 }, "001"], [{ summen: 0.01 }, "001"]];
            const ist = faelle.map(([an]) => v(an));
            check(
                "Selbst-Test RM: je gekappte Kopplung genau ihr Kanal",
                faelle.every((f, i) => ist[i] === f[1]),
                ist.join(" · ")
            );
        }
        selbsttestEnde(errs, "die Fahr-Linse nennt Teleport, Weg, Luft, Gier, Halt, Tempo, Sprung und Querhang beim Namen.");
        process.exit(0);
    }

    console.log("=== K — DER EINE FAHR-SCHRITT (Q13 · F-D6 F-D7): der Kern selbst (Node) ===");
    require(path.join(root, "vehicle-core.js"));
    const kern = kernProbe(globalThis.__vehicleCore);
    for (const [name, ok, detail] of kern) check(name, ok, detail);
    console.log("REIFEN " + JSON.stringify(kern.reifen));
    if (schalter("--kern")) process.exit(errs.length ? 1 : 0); // Station K allein

    await server.lausche(PORT);
    // `--rueckmeldung` allein zeichnet auf der Karte (GPU-Station fahrzeug.K5; welt-boot nennt den Adapter, `[linse-gpu]`)
    const rm = schalter("--rueckmeldung");
    const browser = await starteBrowser({ art: rm ? "linse" : "null", frist: 1800000, zusatz: ["--autoplay-policy=no-user-gesture-required"] });
    const page = await browser.newPage();
    if (!rm) await nullRenderer(page);
    if (schalter("--wegenetz")) await page.evaluateOnNewDocument(() => (window.__anazhAutoSettlement = true)); // die Orte erwachen
    await server.zeige(page, 30000);
    // der Messort der Mess-Wiese (spec/profiband/haushalt.json `messorte`, S1 W1f) — derselbe Leser wie gate:vehicle-drive B-e
    const messort = require("./lib/band-urteil.cjs").ladeSpec("wiese").ort.spieler;
    // die Orte des Wassers aus der Welt (L10: der See, `__wasserOrte`)
    await page.evaluate(require("./lib/wasser-linse.cjs").WASSER_INSTALL);
    await page.evaluate(`window.__tempoSpion = ${tempoSpion}; window.__taktHz = ${taktHz}; window.__ruckJeBild = ${ruckJeBild};`);
    // ein Teil allein: die Rückmeldung (RM), das Körper-Gesetz (K1) oder die Wetter-Kette (W)
    const nur = [
        [rm, probeLeben, { nurRueck: true, rueck: RUECK }, (o) => rueckBericht(o.rueck || o)],
        [schalter("--koerper"), probeKoerper, {}, (o) => {
            console.log("=== K1 — DAS EINE KÖRPER-GESETZ (physik.K1) ===");
            koerperBericht(o);
            console.log(`KOERPER ${JSON.stringify(o)}`);
        }],
        [schalter("--wegenetz"), probeLeben, { wegenetz: { ...WEGENETZ, mutante: schalter("--mutante"), gleich: schalter("--gleich") } }, (o) => {
            const v = o.wegenetz ? wegenetzVerdict(o.wegenetz) : [o.err];
            check("WN (fahrzeug.K2) die Fahrt auf dem Wegenetz" + (schalter("--mutante") ? " — MUTANTE: die Weg-Erkennung aus" : ""), !v.length, v.join(" · "));
            console.log(`WEGENETZ ${JSON.stringify(o.wegenetz)}`);
        }],
        [schalter("--kette"), probeLeben, { nurKette: true, kette: KETTE }, (o) => {
            const v = ketteBericht(o.kette, o.err);
            console.log(`KETTE ${JSON.stringify({ tiefe: v.tiefe, roh: o.kette })}`);
        }],
    ].find(([an]) => an);
    if (nur) {
        const o = await page.evaluate(nur[1], { messort, ...nur[2] });
        await browser.close();
        server.close();
        nur[3](o);
        process.exit(errs.length ? 1 : 0);
    }

    // F — die Fahr-Bahn im eigenen Boot nach dem Leben
    const bahnLauf = async () => {
        const page2 = await browser.newPage();
        await nullRenderer(page2);
        await server.zeige(page2, 30000);
        return page2.evaluate(probeBahn, BAHN);
    };
    const out = await page.evaluate(probeLeben, {
        messort,
        dorf: require("./lib/welt-orte.cjs").messort("dorf"),
        randM: STATION.randM,
        flugM: STATION.flugM,
        kette: KETTE,
        rueck: RUECK,
    });
    await page.close();
    const bahn = await bahnLauf();
    await browser.close();
    server.close();

    console.log("=== T — DER RITT-TAKT (Q1 · F-D1 F-D2 F-D10), echter Frame (_gameLoopTick) ===");
    if (out.err) check("Probe ohne Ausnahme", false, out.err.split("\n")[0]);
    const zeile = (m) =>
        m && m.gestartet
            ? `teleport ${m.teleport}/${m.frames} · sim ${m.simWeg.toFixed(2)} m · fahrt ${m.fahrWeg.toFixed(2)} m · luft ${m.luft}/${m.schritte} · gier ohne Schritt ${m.gierGrad.toFixed(1)}° (gesamt ${m.gierGesamt.toFixed(1)}°) · v ${m.v.toFixed(1)} m/s`
            : "nicht gestartet";
    const vGt = taktVerdict(out.gt);
    check(
        "T1 GT geradeaus (W, wechselnde Frame-Zeiten): kein Teleport, Sim-Weg = Fahr-Weg, Reiter sitzt, keine Gier ohne Sim-Schritt",
        vGt.length === 0,
        `${zeile(out.gt)}${taeter(vGt, ", ")}`
    );
    const lt = out.luftTaeter;
    check(
        "T0 die echte Vertikale sieht ihre Täter: Reiter 0,3 m über dem Sitz und geerdeter Wagen 0,3 m über dem Boden zählen als Luft",
        !!lt && lt.sitz > 0 && lt.wagen > 0,
        lt
            ? `Reiter über dem Sitz → luft ${lt.sitz} · Wagen über dem Boden → luft ${lt.wagen} (je 10 Frames)`
            : "keine Probe"
    );
    const vHang = haltVerdict(out.gtHang);
    check(
        "T2 GT am Hang ohne Taste: kein Teleport, er hält (Haltebremse bis zum Reibkreis), keine Gier",
        !!out.hang && vHang.length === 0,
        out.hang
            ? `Hang ${(out.hang.g * 100).toFixed(0)} % · ${zeile(out.gtHang)}${taeter(vHang, ", ")}`
            : "kein Hang gefunden"
    );
    // Das Pferd geht Schritt (≈ 1,3 m/s): 2 m Weg in 180 Frames sind Fahrt; seine Gier folgt der Fahrt (kein Maß).
    const vRoss = taktVerdict(Object.assign({}, out.ross, { gierGrad: undefined }), 2);
    check(
        "T3 Pferd (richtungs-folgender Ritt): kein Teleport, Sim-Weg = Fahr-Weg, Reiter sitzt",
        vRoss.length === 0,
        `${zeile(out.ross)}${taeter(vRoss, ", ")}`
    );
    const vW = wechselVerdict(out.wechsel);
    check(
        "T4 Wechsel Third → Ego → Third in der Fahrt am Steilhang bergab: jede Stufe am Wagen, die Kamera hinter ihm, über der Fahrbahn, ohne Ruck",
        vW.length === 0,
        `${JSON.stringify(out.wechsel)}${taeter(vW)}`
    );
    const v5 = tempoVerdict(out.tempo && Object.assign(out.tempo, kernTempo(globalThis.__vehicleCore)));
    check(
        "T5 die Kamera atmet das Tempo (Kern und Ritt): FOV und Arm mit v, Azimut im Drift, camera.fov = Ruhe + Tempo, EIN Schreiber, Maus-Orbit zurück in 1–1,25 s",
        v5.length === 0,
        `${JSON.stringify(out.tempo)}${taeter(v5)}`
    );
    ketteBericht(out.kette);
    console.log("=== S — DIE STATIONEN IN DER WELT (Q13 · F-D6 F-D7), echter Sim-Schritt ===");
    const S = out.stationen || {};
    const vS = stationVerdict(S);
    const hat = (t) => vS.some((x) => x.startsWith(t));
    const frei = (...t) => !["kern", ...t].some(hat); // kein Täter dieser Zeilen und der Kern trägt
    check(
        "S1 Welt == Labor: der Welt-Ritt fährt die Spur des Labor-Aufrufs (VC.fahrSchritt), W und W + A",
        frei("labor"),
        S.labor
            ? `${S.labor.schritte} Schritte · ${S.labor.weg.toFixed(1)} m · größte Abweichung ${S.labor.maxM.toExponential(1)} m (Höhe ${S.labor.maxY.toExponential(1)} m) · Kontakt-Schritte ${S.labor.kontakte}`
            : vS.join(" · ")
    );
    check(
        "S2 Klippe: kein Höhen-Sprung > 0,5 m je Sim-Schritt, der Wagen fliegt",
        frei("klippe"),
        S.klippe
            ? `Bahn-Wache ${S.klippe.wache} · Fall ${S.klippe.fall.toFixed(1)} m bei (${S.klippeOrt.x}, ${S.klippeOrt.z}) · größter Sprung ${S.klippe.sprung.toFixed(2)} m · Luft ${S.klippe.luft}/${S.klippe.schritte} · danach ${S.klippe.ueberGrund.toFixed(2)} m über dem Grund`
            : vS.join(" · ")
    );
    check(
        "S4 Absteigen im Flug: der Wagen fällt ballistisch auf seinen Boden und steht dort (nie in der Luft, kein Sprung)",
        frei("absteigen"),
        S.absteigen
            ? `Bahn-Wache ${S.absteigen.wache} · abgestiegen ${S.absteigen.hoehe.toFixed(2)} m über dem Boden (im Flug ${S.absteigen.imFlug}) · nach 240 Frames ${S.absteigen.ueberBoden.toFixed(3)} m über der Ebene seiner Räder · größter Sprung ${S.absteigen.sprung.toFixed(2)} m · ${S.absteigen.diag || ""}`
            : vS.join(" · ")
    );
    check(
        "S3 Querhang: Fahrt längs der Höhenlinie ohne Lenkung driftet quer talwärts (der Quer-Hangabtrieb wirkt)",
        frei("querhang"),
        S.quer
            ? `${S.querOrt.grad.toFixed(1)}° bei (${S.querOrt.x.toFixed(0)}, ${S.querOrt.z.toFixed(0)}) · ${S.quer.weg.toFixed(1)} m gefahren · Quer-Abdrift talwärts ${S.quer.drift.toFixed(3)} m · Bahn-Wache ${S.quer.wache}`
            : vS.join(" · ")
    );
    console.log("=== R — DIE RÄDER IN DER INSTANZ (Q13 · F-D8), echter Sim-Schritt ===");
    const R = S.raeder;
    check(
        "R1 die Räder rollen und lenken: Rad-Leaves je Ecke, Rolle relativ zum Aufbau > 1 rad, vorn Einschlag > 0,1 rad, hinten 0; der Sattel hängt an der Nabe (rollt nie)",
        frei("raeder starr", "raeder rollen", "raeder lenken", "raeder keine", "raeder ohne Sattel", "raeder Sattel"),
        R
            ? `${R.leaves} drehende + ${R.stehend} stehende Rad-Leaves · Rolle ${R.rolle.toFixed(2)} rad · Einschlag vorn ${R.lenk.toFixed(3)} / hinten ${R.lenkHinten.toFixed(3)} rad · Sattel-Rolle ${R.stehRolle.toFixed(3)} rad`
            : "keine Probe"
    );
    check(
        "R2 die Räder stehen auf dem Boden: beim Bremsen taucht kein Vorderrad ein (≤ 0,03 m), Rad-Spalt p75 ≤ 0,03 m",
        frei("raeder tauchen", "raeder Spalt", "raeder keine"),
        R
            ? `Eintauchen beim Bremsen ${R.tauchBremse.toFixed(3)} m · Rad-Spalt p75 ${R.spaltP75.toFixed(3)} m (max ${R.spaltMax.toFixed(3)}; das Rad gegen den gezeichneten Boden misst gate:koerper-stand K8)`
            : "keine Probe"
    );
    check(
        "P4 ein alter Kern ohne fahrGesetz/fahrEbene bricht im Spiel laut (KERN-PFLICHT), nie still der richtungs-folgende Ritt",
        frei("pflicht"),
        S.pflicht ? `_fahrSatz → ${S.pflicht.satz} · _rittEbene → ${S.pflicht.ebene}` : "keine Probe"
    );
    console.log("=== H — DIE HÜLLE ALS KÖRPER (Q5 · F-D4 F-L5), echter Sim-Schritt ===");
    check(
        "H5/H6 Konsum: Kapsel und Hülle gleiten über `_wandGleiten`, Wagen und Tier lösen gegen `_kreaturLeib` (Zähl-Spion)",
        !hat("huelle-konsum"),
        JSON.stringify(S.huelleKonsum || null)
    );
    check(
        "H3 ein Bär steht 0,5 m im Bug des stehenden Wagens: der Wagen bleibt stehen (ein Wesen schiebt keinen Wagen)",
        frei("huelle-schub"),
        S.huelleSchub ? `Weg des Wagens in 60 Frames ${S.huelleSchub.weg.toFixed(3)} m` : "keine Probe"
    );
    check(
        "H4 ein Kasten schiebt die Hülle zur Gelände-Wand: sie dringt nie ins Gelände (die echte Methode, synthetische Welt)",
        frei("huelle-hang"),
        S.huelleHang
            ? `Schub des Kastens ${S.huelleHang.schub.toFixed(2)} m · Eindringen in die Wand ${S.huelleHang.eindringen.toFixed(3)} m`
            : "keine Probe"
    );
    console.log("=== L — DIE ORTE DER LEBEN-SCHAU (Auftrag 0710-2), echter Sim-Schritt ===");
    const L1 = S.hangfuss;
    check(
        "L1 Hangfuß (der Glutbrunnen am Dorf-Messort, 9,3 m/s, Gier 92,3°, seine Box): nach JEDER Kontakt-Antwort steht der Wagen auf dem Gesetz (≤ 0,2 m unter der Ebene seiner Räder, ≤ 3 Schritte), der Schub je Schritt ≤ 0,2 m über die eigene Fahrt, er fährt weiter",
        frei("hangfuss"),
        L1
            ? `unter dem Gesetz höchstens ${L1.unterMax.toFixed(3)} m (${L1.unterN} Schritte > 0,05 m) · größter Schub ${L1.schubMax.toFixed(3)} m · ${L1.kontakte} Kontakt-Schritte · ${L1.weg.toFixed(1)} m gefahren`
            : "keine Probe"
    );
    const L2 = S.spalt;
    check(
        "L2 Spaltkante (die nächste Kante am Schicht-Ort des Gesetzes, 11,4 m/s über sie): der Wagen fährt über die Kante und FÄLLT (keine unsichtbare Wand)",
        frei("spalt"),
        L2
            ? `Kante ${L2.randX}/${L2.randZ} in (${L2.achse.join(", ")}) · Rand ${L2.rand.toFixed(1)} m, Grund ${L2.grund.toFixed(1)} m · ${L2.vor.toFixed(2)} m über die Kante · tiefste Höhe ${L2.yMin.toFixed(2)} m · größter Schub ${L2.schubMax.toFixed(3)} m · ${L2.weg.toFixed(1)} m gefahren`
            : "keine Probe"
    );
    const z2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
    const sz = (m) =>
        m
            ? `Fahrt ${z2(m.vVor)} → ${z2(m.vNach)} m/s (kleinste danach ${z2(m.vMinNach)}) · Gegner ${z2(m.zielWeg)} m · ${m.ereignisse} Stoß-Ereignisse · Kamera-Ruck ${z2(m.ruck)} · ohne Annäherung ${m.ohneAnnaeherung}${
                  m.ohneAnnaeherung && m.ohneWer
                      ? ` (${Object.entries(m.ohneWer)
                            .map(([w, k]) => `${w} ×${k}`)
                            .join(", ")})`
                      : ""
              }${m.erster ? ` · erster Kontakt: ${m.erster.mit}, ${m.erster.winkel}° zur Richtung des Ziels, ${m.erster.abstand} m davor (${m.erster.quer} m quer), Quer-Fahrt ${m.erster.vQuer} m/s` : ""}${m.gasseTiere ? ` · Tiere in der Gasse: ${m.gasseTiere} (${m.gasseArten.join(", ")})` : ""}`
            : "keine Probe";
    check(
        "L3 Stoß am Fels (der Baum der Schau: 10,41 → 0,16 m/s): der Wagen prallt zurück (≤ −0,3 m/s), Kamera und Klang hören den Stoß",
        frei("stoss-fels"),
        sz(S.stossFels)
    );
    check(
        "L4 Stoß an den geparkten GT (Schau: 11,28 → 0,00): er bekommt seinen Impuls und rutscht (≥ 0,3 m), der stoßende behält Fahrt (≥ 20 %)",
        frei("stoss-wagen"),
        sz(S.stossWagen)
    );
    check(
        "L5 Stoß an den Bären (Schau: 9,27 → 0,17): der Bär bekommt seinen Impuls (≥ 0,5 m), der schwerere Wagen behält Fahrt (≥ 50 %)",
        frei("stoss-baer"),
        sz(S.stossBaer)
    );
    check(
        "K3#1 (physik.K3) DER FREIE KÖRPER: 5 Kisten fallen und ruhen (≤ 2 s, Zittern ≤ 1 cm), ein Wagen wirft ein Fass um (> 45°)",
        frei("frei"),
        JSON.stringify(S.frei || null)
    );
    const swz = S.spielerWagen || {};
    check(
        "L6 Spieler und Wagen (0710-4): der laufende Spieler prallt am gebremsten GT ab (der Wagen hält), ein rutschender GT stößt den stehenden Spieler — Impuls nach Masse, keine Durchdringung",
        frei("spieler-wagen", "wagen-spieler"),
        (swz.a && swz.b
            ? `Spieler → GT: Fahrt in den Wagen ${swz.a.vorKontakt.toFixed(2)} → ${swz.a.nachKontakt.toFixed(2)} m/s, Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m, Schub des Wagens in ${swz.a.schub} Schritten, ${swz.a.paare} Stöße (Rest der Fahrt in den Wagen danach höchstens ${Number.isFinite(swz.a.prallNach) ? (swz.a.prallNach * 100).toFixed(0) : "–"} %), Fuß bis ${Number.isFinite(swz.a.aufstieg) ? swz.a.aufstieg.toFixed(2) : "–"} m über dem Boden · GT → Spieler: Spieler ${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung ${swz.b.minAbstand.toFixed(3)} m`
            : "keine Probe") +
            (hat("spieler-wagen") || hat("wagen-spieler")
                ? ` — ${vS.filter((x) => x.startsWith("spieler-wagen") || x.startsWith("wagen-spieler")).join(" · ")}`
                : "")
    );
    check(
        "L8 Lockstep (0710-5): der Wagen steht nach 200 Sim-Schritten gegen einen Bären bei 60 fps und gemischten Frames an derselben Stelle, ein gestoßener Schwimmer nach 20 (auch in der Höhe)",
        frei("lockstep"),
        (S.lockSchwimmer ? `Schwimmer ${S.lockSchwimmer.abw} m / Höhe ${S.lockSchwimmer.abwY} m · ` : "") +
            (S.lockstep
                ? `Start ${S.lockstep.startAbw} nach ${S.lockstep.ruheBilder} Bildern${S.lockstep.ruhe ? "" : ` (unruhig: ${(S.lockstep.unruhe || []).join(" / ")})`} · Abweichung Wagen ${S.lockstep.abw} m · Bär ${S.lockstep.baerAbw} m${S.lockstep.erst ? ` · zuerst Schritt ${S.lockstep.erst.schritt}: ${S.lockstep.erst.groesse} ${S.lockstep.erst.d}${S.lockstep.erst.tiere ? ` (Tiere nahe dem Wagen ${S.lockstep.erst.tiere.join(" / ")})` : ""}` : ""}`
                : "keine Probe")
    );
    const reiterZeile = (q) =>
        q.fehler || q.sitz === null
            ? `${q.typ} ${q.fehler || "ohne Sitz"}`
            : `${q.typ.replace("fahrzeug_", "")}: Kopf ${q.dach === null ? "offen" : (q.oben - q.dach).toFixed(2)} · Schenkel ${(q.schenkel - q.sitz).toFixed(2)} · Anker ${Math.hypot(q.ankerL, q.ankerQ).toFixed(2)} · Blick ${q.blickGrad.toFixed(0)}° · Lehne ${q.lehneGrad}°${q.glas && q.glas.n ? ` · durch die Tür ${((100 * q.glas.aussen) / q.glas.n).toFixed(1)} %` : ""}${
                  q.aussen && q.aussen.n
                      ? ` · außen ${
                            ["unten", "seite", "oben", "laengs"]
                                .filter((k) => q.aussen[k])
                                .map(
                                    (k) =>
                                        `${k} ${((100 * q.aussen[k]) / q.aussen.n).toFixed(1)} % (${q.aussen.tief[k]} m ${q.aussen.wer[k]})`
                                )
                                .join(", ") || "0"
                        }`
                      : ""
              }`;
    check(
        "L9 der Reiter im Wagen (0710-4 Klasse 4): je Wagen-Art die Oberkante ≤ Dachlinie, die Oberschenkel auf dem Polster, das Hüftgelenk über dem Sitz-Anker, der Leib schaut längs der Fahrt (die Maus quer); abgestiegen steht er wie vorher",
        frei("reiter"),
        (S.reiter || []).map(reiterZeile).join(" · ") +
            (S.reiterStand ? ` · abgestiegen: Wurzel ${S.reiterStand.abw} m, Gier ${S.reiterStand.gier}` : "") +
            (hat("reiter") ? ` — ${vS.filter((x) => x.startsWith("reiter")).join(" · ")}` : "")
    );
    const swm = S.schwimmer || {};
    check(
        "L10 der gestoßene Schwimmer (0710-5): ein Fuchs in tiefem Wasser gleitet nach einem Stoß an seiner Schwimm-Linie, nicht auf dem Grund",
        frei("schwimmer"),
        swm.fehler
            ? swm.fehler
            : `Wasser ${swm.tiefe} m tief · vor dem Stoß ${swm.vorher} m, beim Gleiten tiefstens ${swm.tiefste} m gegen die Linie (${swm.gleitet} Frames gleitend)`
    );
    {
        // ════ F — DIE FAHR-BAHN ════
        console.log("=== F — DIE FAHR-BAHN (K12): Platz an jedem Tor, rückwärts, Befreiung, Tacho, Tasten ===");
        const fkRows = bahnKernRueck(globalThis.__vehicleCore);
        const fk = bahnKernVerdict(fkRows);
        const fkGt = fkRows.filter((z) => z.rezept === "gt");
        check(
            `FK rückwärts aus dem Stand: jedes Rezept fährt S (und S + Gegenlenkung) 2,5 s eben, 10° und 15° bergauf ≥ ${BAHN.rueckM} m (${fkRows.length} Läufe)`,
            fk.length === 0,
            `GT ${fkGt.map((z) => `${z.art} ${z.grad}° ${z.weg.toFixed(2)} m`).join(" · ")}${fk.length ? " — Täter: " + fk.slice(0, 6).join(" · ") : ""}`
        );
        require(path.join(root, "klang-core.js"));
        const fk2 = bahnKernStimme(globalThis.__klangCore, globalThis.__vehicleCore);
        check(
            "FK2 die Drehzahl über 0…vmax (klang:FAHRT): Stand = Leerlauf, vmax = Begrenzer, steigt in jedem Gang, Motor-Ton = U/min/60 · Zylinder/2",
            fk2.length === 0,
            fk2.length
                ? "Täter: " + fk2.slice(0, 6).join(" · ")
                : `${Object.keys(globalThis.__vehicleCore.PRESETS).length} Rezepte`
        );
        const bz = (m) =>
            !m || !m.da
                ? (m && m.grund) || "—"
                : `${m.tor ? m.tor + " " : ""}bei (${m.x}, ${m.z})${m.weiter != null ? ` ${m.weiter} m vom Wunsch-Ort` : ""} · Neigung ${m.neigung.toFixed(1)}° · Wände ${m.waende} · Blocker ${m.blocker} · W 2 s ${m.vor != null ? m.vor.toFixed(2) : "—"} m · S 2,5 s ${m.zurueck != null ? m.zurueck.toFixed(2) : "—"} m`;
        const fv = bahnPlatzVerdict(bahn.vorschau);
        check(
            "F2 die Vorschau des Spiels am Garage-Tor steht auf fahrbarem Grund (≤ 15°, ohne Berührung) und fährt an (E · W 2 s · S 2,5 s ≥ 3 m · E)",
            fv.length === 0,
            bz(bahn.vorschau) + taeter(fv)
        );
        const torTaeter = [];
        for (const m of bahn.tore || []) for (const t of bahnPlatzVerdict(m)) torTaeter.push(`${m.tor || "?"}: ${t}`);
        const toreDa = (bahn.tore || []).filter((m) => m.da).length;
        const neigMax = Math.max(0, ...(bahn.tore || []).filter((m) => m.da).map((m) => m.neigung));
        check(
            `F1 an jedem Tor des Genesis-Rings (${BAHN.tore}) steht der GT der Welt nach 1 s Welt auf fahrbarem Grund (≤ 15°, ohne Berührung), E steigt ein und aus`,
            toreDa >= BAHN.tore && torTaeter.length === 0,
            `${toreDa}/${(bahn.tore || []).length} Tore · Neigung höchstens ${neigMax.toFixed(1)}° · weiter als der Wunsch-Ort höchstens ${Math.max(0, ...(bahn.tore || []).filter((m) => m.da).map((m) => m.weiter || 0)).toFixed(0)} m${torTaeter.length ? " — Täter: " + torTaeter.slice(0, 6).join(" · ") : ""}`
        );
        const wv = bahnWandVerdict(bahn.wand);
        check(
            "F3 die Natur-Wand kennt den Wagen: eine Tanne 1,5 m vor dem Ursprung eines stehenden GT fällt („wagen“), der Wagen ist kein Grundriss",
            wv.length === 0,
            bahn.wand && bahn.wand.da
                ? `Urteil ${bahn.wand.urteil} · Grundriss ${bahn.wand.grundriss}${wv.length ? " — " + wv.join(" · ") : ""}`
                : wv.join(" · ")
        );
        const sp = bahnPlatzVerdict(bahn.schmuggelPlatz);
        const sw = bahnWandVerdict(bahn.schmuggelWand);
        check(
            "F-SCHMUGGEL die Vorschau ohne Platz-Gesetz und die Natur-Wand ohne die Wagen → ROT beim Namen",
            !!bahn.schmuggelPlatz && bahn.schmuggelPlatz.gesetzStub && sp.length > 0 && sw.length > 0,
            `ohne Platz-Gesetz: ${bz(bahn.schmuggelPlatz)} — ${sp.join(" · ") || "GRÜN (vakuös)"} · ohne Wagen: ${sw.join(" · ") || "GRÜN (vakuös)"}`
        );
        const sz = (m) =>
            m && m.da
                ? `Stoß ${m.stoss ? "ja" : "nein"} · ${m.versuche.map((v) => `${v.seite} frei nach ${v.freiFrame >= 0 ? (v.freiFrame / 60).toFixed(2) + " s" : "—"} (${v.weg.toFixed(2)} m in 2 s)`).join(" · ")}`
                : (m && m.grund) || "—";
        for (const [name, m] of [
            ["am Glutbrunnen der Schau", bahn.stossGlut],
            ["am Kiefern-Stamm", bahn.stossStamm],
        ]) {
            const v = bahnStossVerdict(m);
            check(
                `F4 der Stoß ${name}: S + Gegenlenkung bringt den GT ≥ ${BAHN.freiM} m frei in ≤ 2 s`,
                v.length === 0,
                sz(m) + taeter(v)
            );
        }
        const [tacho, hilfe] = [(out.rueck || {}).tacho, (out.rueck || {}).hilfe || {}];
        const tv = bahnTachoVerdict(tacho);
        check(
            "F5 im Sattel zeigt #fahr-tacho |vlong| × vehicle:FAHR.kmh (die Zahl der Probefahrt), nach dem Absteigen ist er fort",
            tv.length === 0,
            `${tacho && tacho.proben} Proben · max ${tacho && tacho.maxKmh} km/h${taeter(tv)}`
        );
        const hv = bahnTastenVerdict(hilfe);
        const fz = (hilfe.zeilen || []).find((z) => /^Fahren/.test(z)) || "—";
        check(
            "F7 „hilfe“ nennt E (einsteigen) und Shift (Handbremse), Shift kommt in Fahrt als Handbremse im Fahr-Schritt an",
            hv.length === 0,
            `„${fz}“ · ${hilfe.handbremseDetail || ""}${taeter(hv)}`
        );
        for (const l of bahn.log || []) console.log("  · " + l);
    }
    if (bahn.err) check("F Probe ohne Ausnahme", false, String(bahn.err).split("\n")[0]);
    rueckBericht(out.rueck || out);
    wandEnde(errs, "der Ritt fährt im Sim-Schritt den EINEN Fahr-Schritt des Kerns: kein Teleport, Welt == Labor, Reibkreis, Querhang und Vertikale wirken.");
});
