// diag-fahr-leben.cjs — DIE FAHR-LINSE DES LEBENS (Welle L, Familie fahren): sie fährt den Ritt durch den ECHTEN
// Spiel-Takt (`_gameLoopTick` — Akkumulator, Sim-Schritte, Interpolation, Frame-Tick), nie an ihm vorbei, und sie ruft
// den Fahr-Schritt des Kerns selbst (vehicle-core), nie einen Nachbau. Befund 06.10.
// (artifacts/profiband/leben/befund-fahren-gelaende.md + karte-fahren-gelaende.md, sichtbar gespielt auf der Radeon):
// `gate:vehicle-drive` B-e integrierte den Ritt ohne Akkumulator und ohne Interpolation (Q0 F-L6) — die Defekte des
// echten Loops sah sie nie; Vertikale, Querhang und Reibkreis sah kein Gate.
//
//   T (Q1 · F-D1 F-D2 F-D10) — DER RITT-TAKT. Der GT fährt mit W über eine trockene Gerade an der Mess-Wiese, die
//     Frame-Zeiten wechseln (8–33 ms: Frames ohne, mit einem und mit zwei Sim-Schritten). Gezählt wird je Frame:
//       teleport  — der Akkumulator fand das Spieler-Mesh NICHT dort, wo die Interpolation es hinlegte, und übernahm
//                   die nachhinkende Lage als Sim-Wahrheit (Befund: 114 von 114 Frames)        Soll 0
//       weg       — Sim-Weg (Σ der Sim-Schritte) gegen Fahr-Weg (Σ der Wagen-Lage je Frame)
//                   (Befund: 25,95 m simuliert, 10,27 m gefahren)                                Soll ±2 % (min 0,4 m)
//       luft      — Sim-Schritte, in denen der Reiter im Sattel „in der Luft" gilt
//                   (Befund: 421 von 421)                                                         Soll 0
//       gier      — die Gier dreht in Frames OHNE Sim-Schritt (das Frame-Flag: in 14 von 192 Frames 82,4°)   Soll ≤ 0,5°
//     T2 am Hang ohne Taste: der Wagen HÄLT (die Haltebremse bis zum Reibkreis) und dreht nicht (Befund: rollte mit
//     4,7 m/s zurück und drehte sich 84°). Dazu das Pferd (`reittier_holzross`, der richtungs-folgende Ritt ohne Lenk-
//     Gesetz): teleport 0, weg ±2 % (Befund: 131 von 135 Frames, 3,66 m simuliert, 1,81 m geritten).
//
//   K (Q13 · F-D6 F-D7) — DER EINE FAHR-SCHRITT, am Kern selbst (Node) und als Wand:
//       K1 der Kern trägt fahrSchritt (Kräfte + Stand), die Probefahrt ruft ihn, der Stamm ruft ihn — und keiner von
//          beiden integriert eine eigene Kopie (Befund: zwei Integratoren, Stillstand GT Labor 54,7° gegen Welt 66,6°)
//       K2 Reibkreis längs: kein Rezept steigt steiler als tan α = μ (Befund: Supersport 90°, GT 66,6°)
//       K3 Halt: am 21°-Hang ohne Eingabe hält der Wagen; über dem Reibkreis (50°) rutscht er
//       K4 Querhang: der Quer-Hangabtrieb wirkt (Fahrt längs 35° ohne Lenkung driftet talwärts; am Stand hält 30°,
//          50° rutscht) (Befund: 0,00 m Abdrift)
//       K5 Vertikale: an der Kuppe mit v²/R > g hebt der Wagen ab, unter g nicht; über eine 7-m-Klippe fällt er
//          ballistisch (kein Höhen-Sprung > 0,5 m je Schritt) und landet auf dem Grund (Befund: 7,95 m in einem Frame)
//   S (Q13) — DIE STATIONEN IN DER WELT (echter Sim-Schritt, an der Mess-Wiese gesucht):
//       S1 Welt == Labor: dieselben Eingaben, derselbe Boden — der Welt-Ritt fährt die Spur des Labor-Aufrufs
//          (VC.fahrSchritt) auf den Millimeter                                                         Soll ≤ 0,01 m
//       S2 Klippe: kein Höhen-Sprung je Sim-Schritt > 0,5 m (Befund 6,94/7,95 m), der Wagen fliegt (Luft-Schritte > 0)
//       S3 Querhang: Fahrt längs eines 25–40°-Querhangs ohne Lenkung driftet quer talwärts (Befund 0,00 m) Soll ≥ 0,3 m
//
//   R (Q13 · F-D8) — DIE RÄDER IN DER INSTANZ: der GT fährt (W), bremst voll (S) und lenkt (W + A); je Sim-Schritt die
//       Rad-Leaves relativ zum Aufbau (Rolle > 1 rad, Einschlag vorn > 0,1 rad, hinten 0) und der Aufstand (Eintauchen
//       beim Bremsen ≤ 0,03 m, Rad-Spalt p75 ≤ 0,03 m). Befund: 12 Blätter mit unveränderter relativer Matrix, beim
//       Bremsen die Vorderräder 7,4–11,1 cm im Boden.
//   H (Q5 · F-D4 F-L5) — DIE HÜLLE ALS KÖRPER: der GT fährt mit W gegen einen Felsblock und gegen einen Bären; das
//       Eindringen der Wagen-Hülle (exportDrive.huelle) in die Blocker-Boxen bzw. den Raum des Wesens (Befund: Bug
//       1,97–2,32 m im Stamm, der Bär ganz im Wagen)                                                Soll ≤ 0,05 m
//
//   node scripts/diag-fahr-leben.cjs [--selftest]          Port: FAHR_LEBEN_PORT (Standard 4413)
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const PORT = Number(process.env.FAHR_LEBEN_PORT || 4413);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── DAS TAKT-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const TAKT = { gierGrad: 0.5, wegAnteil: 0.02, wegMinM: 0.4, wegFahrtMinM: 5, haltM: 0.05 };
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

// ── DIE STATISCHE WAND (Node, kommentarfrei): der Ritt sitzt im Sim-Schritt, der Frame-Tick schreibt nie den Reiter,
// das Lenk-Frame-Flag ist tot. Liefert [name, ok, detail]. ──
function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index + m[0].length - 1);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}
function taktWand(src) {
    const nc = ohneKommentare(src);
    const sim = fnBody(nc, /\n {4}_stepFixedSim\(simTime, dt\) \{/);
    const frame = fnBody(nc, /\n {4}_tickMountedMovement\(_?dt\) \{/);
    const ritt = fnBody(nc, /\n {4}_rittSchritt\(dt\) \{/);
    const flag = (nc.match(/_rideSteer(?!Yaw)\b/g) || []).length;
    return [
        [
            "W1 der Sim-Schritt trägt den Ritt (`_stepFixedSim` ruft `_rittSchritt` nach der Bewegung)",
            !!sim && /_loopPlayerMovement\(simTime, dt\);[\s\S]*this\._rittSchritt\(dt\)/.test(sim) && !!ritt,
        ],
        [
            "W2 der Frame-Tick schreibt nie den Reiter (`_tickMountedMovement` ohne pm.y-Zuweisung), der Sim-Schritt setzt den Sitz",
            !!frame && !/\bpm\.y\s*=[^=]/.test(frame) && !!ritt && /\bpm\.y\s*=[^=]/.test(ritt),
        ],
        ["W3 das Lenk-Frame-Flag `_rideSteer` ist tot (0 im Code)", flag === 0, `${flag}×`],
    ];
}

// ── K1 — DIE WAND DES EINEN FAHR-SCHRITTS (Node, kommentarfrei): der Kern trägt ihn, Probefahrt und Welt rufen ihn,
// keiner integriert eine eigene Kopie (die Reifen-Seitenkraft `FlatF` lebt nur im Kern). ──
function fahrWand(stamm, garage, kern) {
    const st = ohneKommentare(stamm);
    const ga = ohneKommentare(garage);
    const ke = ohneKommentare(kern);
    const lpm = fnBody(st, /\n {4}_loopPlayerMovement\(currentTime, dtOverride\) \{/) || "";
    const upd = fnBody(ga, /\nfunction updateVehicle\(dt,t\)\{/) || "";
    const kopieStamm = (st.match(/\bFlatF\b/g) || []).length;
    const kopieLab = (ga.match(/\bFlatF\b/g) || []).length;
    return [
        [
            "K1a der Kern trägt den EINEN Fahr-Schritt (fahrSchritt = fahrKraefte + fahrStand, exportiert)",
            /function fahrSchritt\(/.test(ke) &&
                /function fahrKraefte\(/.test(ke) &&
                /function fahrStand\(/.test(ke) &&
                /fahrSchritt: fahrSchritt/.test(ke),
        ],
        [
            "K1b die Welt ruft ihn (`_loopPlayerMovement` → fahrStand + fahrKraefte) und integriert keine Kopie",
            /\.fahrStand\(/.test(lpm) && /\.fahrKraefte\(/.test(lpm) && kopieStamm === 0,
            `FlatF im Stamm ${kopieStamm}×`,
        ],
        [
            "K1c die Probefahrt ruft ihn (`updateVehicle` → VC.fahrSchritt) und integriert keine Kopie",
            /VC\.fahrSchritt\(/.test(upd) && kopieLab === 0,
            `FlatF in garage.js ${kopieLab}×`,
        ],
    ];
}

// ── P — DIE KERN-PFLICHT DES FAHR-SCHRITTS (Node, kommentarfrei; Gegenprüfung 07.10.): `_fahrSatz`/`_rittEbene` gaben bei
// einem Kern ohne fahrGesetz/fahrEbene still null (der Gesetz-Wagen ritt richtungs-folgend), Hülle, Kontakt und Rad trugen
// Literal-Zwillinge der FAHR.schritt-Zeilen (0,34/0,5 · 0,7 · 0,34/0,6). Soll: EIN fail-closed Leser
// (`AnazhRealm._fahrSchrittGesetz` → `_kernPflichtBruch`), jeder Fahr-Leser liest durch ihn. ──
const FAHR_LESER = ["_fahrSatz", "_rittEbene", "_rittSchritt", "_fahrHuelle", "_fahrHuelleKontakt", "_archRadMatrix", "_loopPlayerMovement"];
function pflichtWand(stamm) {
    const st = ohneKommentare(stamm);
    const leser = fnBody(st, /\nAnazhRealm\._fahrSchrittGesetz = function \(\) \{/) || "";
    const koerper = {};
    for (const n of FAHR_LESER) koerper[n] = fnBody(st, new RegExp("\\n {4}" + n + "\\([^)]*\\) \\{")) || "";
    const fehlt = FAHR_LESER.filter((n) => !koerper[n]);
    const still = ["_fahrSatz", "_rittEbene"].filter(
        (n) => /typeof\s+VC\b|typeof\s+\w+\.fahr\w+\s*!==/.test(koerper[n]) || !/_fahrSchrittGesetz\(\)/.test(koerper[n])
    );
    const zwillinge = [];
    for (const n of FAHR_LESER) {
        const b = koerper[n];
        const treffer = (b.match(/__vehicleCore|FAHR\.schritt|\b0\.34\b|:\s*0\.7\)|:\s*0\.6\)|0\.5 \* radR/g) || []).length;
        if (treffer) zwillinge.push(`${n} ${treffer}×`);
    }
    return [
        [
            "P1 der EINE Fahr-Schritt-Leser bricht laut (`_fahrSchrittGesetz` → `_kernPflichtBruch`)",
            /_kernPflichtBruch\(/.test(leser) && /typeof vc\[f\] === "function"/.test(leser) && fehlt.length === 0,
            fehlt.length ? `ohne Körper: ${fehlt.join(", ")}` : "",
        ],
        [
            "P2 kein stiller Ausweg: `_fahrSatz` und `_rittEbene` lesen den Kern durch ihn (kein typeof → null)",
            still.length === 0 && /_kernPflichtBruch\(/.test(koerper._fahrSatz),
            still.join(", "),
        ],
        ["P3 keine Literal-Zwillinge der FAHR.schritt-Zeilen in den Fahr-Lesern", zwillinge.length === 0, zwillinge.join(" · ")],
    ];
}

// ── K2–K5 — DER FAHR-SCHRITT AM KERN SELBST (Node; dieselbe Funktion, die Probefahrt und Welt rufen). ──
function kernProbe(VC) {
    if (!VC || typeof VC.fahrSchritt !== "function" || typeof VC.fahrGesetz !== "function")
        return [["K2 der Kern trägt den Fahr-Schritt", false, "vehicle-core ohne fahrSchritt/fahrGesetz"]];
    const DT = 1 / 60;
    const lauf = (pid, boden, n, eingabe, x0) => {
        const P = Object.assign({}, VC.DEFAULT_P, VC.presetPatch(pid));
        const G = VC.fahrGesetz(VC.exportDrive(P));
        const z = VC.fahrZustand(x0 || 0, 0, 0);
        VC.fahrStand(z, G, boden, 0);
        const m = { luft: 0, sprung: 0, G, z, P };
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
            const m = lauf(pid, (x) => x * t, 240, () => ({ throttle: 1 }));
            if (m.z.x > 0.5) lo = a;
            else hi = a;
        }
        const P = Object.assign({}, VC.DEFAULT_P, VC.presetPatch(pid));
        const mu = VC.FAHR.maxGrip * P.grip;
        const soll = (Math.atan(mu) * 180) / Math.PI;
        grenzen.push(`${pid} ${lo.toFixed(1)}°/${soll.toFixed(1)}°`);
        if (!(lo <= soll + 0.5)) k2 = false;
    }
    out.push(["K2 Reibkreis längs: kein Rezept steigt steiler als tan α = μ", k2, grenzen.join(" · ")]);
    // K3 — Halt am 21°-Hang ohne Eingabe; über dem Reibkreis (50°) rutscht der Wagen.
    const h21 = lauf("gt", (x) => x * Math.tan(rad(21)), 300, () => ({}));
    const h50 = lauf("gt", (x) => x * Math.tan(rad(50)), 120, () => ({}));
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
    const kl = lauf("gt", (x) => (x < 10 ? 0 : -7), 240, () => ({ throttle: 1 }));
    out.push([
        "K5 Vertikale: Kuppe R 12 m hebt ab, R 40 m nicht; die 7-m-Klippe ohne Höhen-Sprung > 0,5 m je Schritt, gelandet",
        k12.luft > 0 && k40.luft === 0 && kl.luft > 0 && kl.sprung <= 0.5 && !kl.z.luft && Math.abs(kl.z.y + 7) <= 0.05,
        `Kuppe R12 Luft ${k12.luft} · R40 Luft ${k40.luft} · Klippe Luft ${kl.luft}, größter Sprung ${kl.sprung.toFixed(2)} m, Ende y ${kl.z.y.toFixed(2)}`,
    ]);
    // K6 — DIE VERWINDUNG (Gegenprüfung 07.10.: M3 an (102, 60) — auf verwundenem Boden lagen zwei diagonale Räder des
    // Teile-Wagens 0,229 m im Boden): bilinear verwundener Boden, die vier Aufstandspunkte ±tau um die Ebene. Kein Rad
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
    return out;
}

// ── DAS STATIONS-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test). ──
const STATION = { laborM: 0.01, sprungM: 0.5, querM: 0.3, huelleM: 0.05, beruehrtM: 0.3, rolleRad: 1, lenkRad: 0.1, spaltM: 0.03, schubM: 0.01, sattelRad: 0.01 };
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
    if (!s.quer) out.push("querhang nicht gefunden");
    else if (!(s.quer.drift >= STATION.querM)) out.push(`querhang ohne Abtrieb (Quer-Abdrift ${s.quer.drift.toFixed(2)} m)`);
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
            else if (!(rd.stehRolle <= STATION.sattelRad)) out.push(`raeder Sattel rollt (${rd.stehRolle.toFixed(2)} rad)`);
        }
        if (!(rd.tauchBremse <= STATION.spaltM)) out.push(`raeder tauchen beim Bremsen ${rd.tauchBremse.toFixed(3)} m`);
        if (!(rd.spaltP75 <= STATION.spaltM)) out.push(`raeder Spalt p75 ${rd.spaltP75.toFixed(3)} m`);
    }
    const pf = s.pflicht;
    if (!pf) out.push("pflicht keine Probe");
    else if (pf.satz !== "bruch" || pf.ebene !== "bruch") out.push(`pflicht still (fahrSatz ${pf.satz} · rittEbene ${pf.ebene})`);
    if (!s.huelleSchub) out.push("huelle-schub keine Probe");
    else if (!(s.huelleSchub.weg <= STATION.schubM)) out.push(`huelle-schub ein Wesen schob den Wagen ${s.huelleSchub.weg.toFixed(2)} m`);
    for (const [k, name] of [
        ["huelleBlock", "fels"],
        ["huelleBaer", "baer"],
    ]) {
        const h = s[k];
        if (!h) out.push(`huelle-${name} keine Probe`);
        else if (!(h.abstand <= STATION.beruehrtM)) out.push(`huelle-${name} keine Berührung (Abstand ${h.abstand.toFixed(2)} m)`);
        else if (!(h.tief <= STATION.huelleM)) out.push(`huelle-${name} Eindringen ${h.tief.toFixed(2)} m`);
    }
    return out;
}

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

// ── DIE PROBE IN DER SEITE (Funktionsrumpf; r = die Welt). Fährt den echten Frame. ──
async function probeLeben(expected) {
    const res = {};
    const dl0 = performance.now() + 60000;
    while (
        (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
        performance.now() < dl0
    )
        await new Promise((r) => setTimeout(r, 100));
    const r = window.anazhRealm;
    const st = r.state;
    const VC = window.__vehicleCore;
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 50000;
    while (performance.now() < dl) {
        if (f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt) break;
        await new Promise((r2) => setTimeout(r2, 80));
    }
    const P = Object.getPrototypeOf(r);
    const DT = 1 / 60;
    // Frame-Zeiten (ms): Frames ohne (8,3), mit einem (16,7 · 20 · 11,1) und mit zwei Sim-Schritten (25 · 33,3).
    const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
    let tMs = performance.now();
    const frame = (i) => {
        tMs += MUSTER[i % MUSTER.length];
        r._gameLoopTick(tMs);
    };
    // DIE ZÄHLER am echten Takt: der Teleport-Zweig des Akkumulators (exakt seine Bedingung), der Weg je Sim-Schritt,
    // und die Spur je Sim-Schritt (Eingabe + Fahr-Zustand) für den Labor-Vergleich.
    const z = { teleport: 0, schritte: 0, luft: 0, simWeg: 0, an: false, spur: null, ent: null };
    r._loopFixedStep = function (realDt, ct) {
        const m = st.playerMesh;
        if (z.an && st._fixedSimPos && !(st._fixedRenderPos && m.position.equals(st._fixedRenderPos))) z.teleport++;
        return P._loopFixedStep.call(this, realDt, ct);
    };
    r._stepFixedSim = function (simTime, dt) {
        const m = st.playerMesh.position;
        const x0 = m.x;
        const z0 = m.z;
        const k = st.keys;
        const e = {
            throttle: k.w ? 1 : 0,
            brake: k.s ? 1 : 0,
            steer: (k.a ? 1 : 0) - (k.d ? 1 : 0),
            hand: !!k.shift,
        };
        P._stepFixedSim.call(this, simTime, dt);
        if (z.an) {
            z.simWeg += Math.hypot(m.x - x0, m.z - z0);
            z.schritte++;
            if (st.isInAir) z.luft++;
        }
        if (z.spur && z.ent && z.ent._fahr) {
            const q = z.ent._fahr;
            z.spur.push({ e, dt, x: q.x, z: q.z, yaw: q.yaw, y: q.y, luft: q.luft, kontakt: z.kontakt });
        }
    };
    // Der EINE Kontakt-Löser: was er in diesem Sim-Schritt der Fahrt nahm (Lage oder Geschwindigkeit ≠ v·dt), ist kein
    // Fahr-Schritt — die Labor-Spur übernimmt dort die Lage der Welt (gezählt als Kontakt-Schritt).
    r._stepCharacter = function (delta, ct) {
        const m = st.playerMesh.position;
        const v = st.playerVel;
        const x0 = m.x;
        const z0 = m.z;
        const vx = v.x();
        const vz = v.z();
        P._stepCharacter.call(this, delta, ct);
        const dtc = Math.min(0.1, Math.max(0.0001, delta));
        const anders =
            Math.abs(m.x - (x0 + vx * dtc)) > 1e-9 ||
            Math.abs(m.z - (z0 + vz * dtc)) > 1e-9 ||
            Math.abs(v.x() - vx) > 1e-9 ||
            Math.abs(v.z() - vz) > 1e-9;
        z.kontakt = anders ? { x: m.x, z: m.z, vx: v.x(), vz: v.z() } : null;
    };
    const aufraeumen = () => {
        delete r._loopFixedStep;
        delete r._stepFixedSim;
        delete r._stepCharacter;
    };
    const tasten = (w, a) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
        st.keys.a = !!a;
    };
    const hh = (a, b) => r.getTerrainHeightAt(a, b);
    const nass = (a, b) => {
        const ws = r._waterRunSurfaceAt(a, b);
        return Number.isFinite(ws) && ws > hh(a, b) - 0.3;
    };
    // Die Strecke: trocken, die kleinste Stufe (dieselbe Suche wie gate:vehicle-drive B-e), Fahrt in +x.
    const mo = expected.messort;
    let start = null;
    for (let ring = 0; ring <= 4; ring++)
        for (let k = 0; k < (ring ? 8 : 1); k++) {
            const cx = mo[0] + Math.cos((k * Math.PI) / 4) * ring * 32;
            const cz = mo[1] + Math.sin((k * Math.PI) / 4) * ring * 32;
            let trocken = true;
            let stufe = 0;
            for (const dz of [-3, 0, 3]) {
                let vor = null;
                for (let s = 0; s <= 36 && trocken; s++) {
                    const hx = hh(cx + s * 2, cz + dz);
                    if (!Number.isFinite(hx) || nass(cx + s * 2, cz + dz)) trocken = false;
                    if (vor !== null) stufe = Math.max(stufe, Math.abs(hx - vor));
                    vor = hx;
                }
            }
            if (trocken && (!start || stufe < start.stufe)) start = { x: cx, z: cz, stufe };
        }
    res.start = start;
    if (!start) {
        aufraeumen();
        return res;
    }
    // Ein Werk setzen, aufsitzen, einschwingen. `fahrt` = Fahrt-Richtung (sin, cos); ein Studio-Fahrzeug liegt längs x.
    const setzen = async (typ, x, zz, fahrt) => {
        st.playerMesh.position.set(x, hh(x, zz) + 1.2, zz);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        const rotY = typ.startsWith("fahrzeug_") ? fahrt - Math.PI / 2 : fahrt;
        const e = r.spawnArchitecture(
            typ,
            { x, y: hh(x, zz) + 0.5, z: zz },
            { silent: true, precise: true, rotationY: rotY }
        );
        if (!e) return null;
        const dlB = performance.now() + 45000;
        while (!e.instanced && !e.mesh && performance.now() < dlB) {
            r._rebuildArchitectureMesh(e);
            if (e.instanced || e.mesh) break;
            await new Promise((r3) => setTimeout(r3, 200));
        }
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) return null;
        tasten(false);
        for (let i = 0; i < 12; i++) frame(i); // einschwingen (Sitz, Ebene, Interpolation)
        return e;
    };
    const weg = (e) => {
        r.dismountArchitecture();
        r.removeArchitecture(e);
    };
    const gierUnwrap = (e) => (Number.isFinite(e._rideYaw) ? e._rideYaw : 0);
    // Eine Fahrt: n Frames mit/ohne W; zählt Teleport · Sim-Weg · Fahr-Weg · Luft · Gier (gesamt und in Frames ohne
    // Sim-Schritt — dort darf nichts den Wagen drehen).
    const fahrt = (e, n, w) => {
        tasten(w);
        z.teleport = 0;
        z.schritte = 0;
        z.luft = 0;
        z.simWeg = 0;
        z.an = true;
        let fahrWeg = 0;
        let px = e.position.x;
        let pz = e.position.z;
        let g0 = gierUnwrap(e);
        let gier = 0;
        let gierFrame = 0;
        for (let i = 0; i < n; i++) {
            const s0 = z.schritte;
            frame(i);
            fahrWeg += Math.hypot(e.position.x - px, e.position.z - pz);
            px = e.position.x;
            pz = e.position.z;
            const g = gierUnwrap(e);
            let d = g - g0;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d < -Math.PI) d += 2 * Math.PI;
            gier += Math.abs(d);
            if (z.schritte === s0) gierFrame += Math.abs(d);
            g0 = g;
        }
        z.an = false;
        tasten(false);
        return {
            gestartet: true,
            frames: n,
            teleport: z.teleport,
            schritte: z.schritte,
            luft: z.luft,
            simWeg: z.simWeg,
            fahrWeg,
            gierGrad: (gierFrame * 180) / Math.PI,
            gierGesamt: (gier * 180) / Math.PI,
            v: st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0,
        };
    };
    try {
        // (1) Der GT geradeaus, W gehalten (Fahrt +x).
        const gt = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        res.gt = gt ? fahrt(gt, 240, true) : { gestartet: false };
        if (gt) weg(gt);
        // (2) Am Hang ohne Taste: der GT steht bergauf (der Befund: rollte zurück und drehte sich 84°).
        let hang = null;
        for (let dx = -48; dx <= 48 && !hang; dx += 6)
            for (let dz = -48; dz <= 48 && !hang; dz += 6) {
                const x = mo[0] + dx;
                const zz = mo[1] + dz;
                const gx = (hh(x + 3, zz) - hh(x - 3, zz)) / 6;
                const gz = (hh(x, zz + 3) - hh(x, zz - 3)) / 6;
                const g = Math.hypot(gx, gz);
                if (!(g >= 0.2 && g <= 0.45) || nass(x, zz)) continue;
                // gleichmäßig: dieselbe Steigung 6 m bergab
                const ux = gx / g;
                const uz = gz / g;
                const g2 = Math.hypot(
                    (hh(x - ux * 6 + 3, zz - uz * 6) - hh(x - ux * 6 - 3, zz - uz * 6)) / 6,
                    (hh(x - ux * 6, zz - uz * 6 + 3) - hh(x - ux * 6, zz - uz * 6 - 3)) / 6
                );
                if (!(g2 >= 0.15)) continue;
                hang = { x, z: zz, g, fahrt: Math.atan2(ux, uz) };
            }
        res.hang = hang;
        if (hang) {
            const gh = await setzen("fahrzeug_gt", hang.x, hang.z, hang.fahrt);
            res.gtHang = gh ? fahrt(gh, 180, false) : { gestartet: false };
            if (gh) weg(gh);
        }
        // (3) Das Pferd: der richtungs-folgende Ritt ohne Lenk-Gesetz (W in Blick-Richtung +x).
        st.yaw = Math.PI / 2;
        const ross = await setzen("reittier_holzross", start.x, start.z, Math.PI / 2);
        res.ross = ross ? fahrt(ross, 180, true) : { gestartet: false };
        if (ross) weg(ross);

        // ═══ S — DIE STATIONEN (Q13) ═══
        const S = (res.stationen = { kern: !!(VC && typeof VC.fahrSchritt === "function") });
        // R — DIE RÄDER IN DER INSTANZ (Q13 F-D8): dieselbe Gerade; W (1,5 s), dann S (Vollbremsung, 1 s), dann W + A.
        // Je Sim-Schritt die Rad-Leaves (`lf.rad`): ihre Matrix RELATIV zum Aufbau (dreht das Rad? lenkt es?) und der
        // Aufstand (Naben-Mitte − radR gegen den Boden). Ohne Rad-Leaves (die starre Instanz) misst die Linse die Rad-
        // Punkte der Aufbau-Matrix (fAx/rAx × ±Spur/2) — der Befund: kein Rad rollt oder lenkt, beim Bremsen tauchen die
        // Vorderräder 7,4–11,1 cm in den Boden.
        const gR = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        if (gR) {
            const preset = r._foundryPresetForEntry(gR);
            const flat = r._foundryFlattenFor(gR, preset, Number.isFinite(gR._servedLod) ? gR._servedLod : gR._lodLevel);
            const hu = r._fahrzeugGesetzFor(gR).drive.huelle;
            const radR = hu.radR * (Number.isFinite(gR.scale) ? gR.scale : 1);
            const rad = [];
            // die STEHENDEN Rad-Leaves (R:s — der Bremssattel hängt an der Nabe: er lenkt mit, rollt aber nie)
            const steh = [];
            if (flat && Array.isArray(flat.leaves) && gR.instSlots)
                for (let i = 0; i < flat.leaves.length && i < gR.instSlots.length; i++)
                    if (flat.leaves[i].rad) (flat.leaves[i].rad.dreht ? rad : steh).push({ i, rd: flat.leaves[i].rad });
            let stehRolle = 0;
            const Bu = new THREE.Matrix4();
            const M = new THREE.Matrix4();
            const B = new THREE.Matrix4();
            const Rel = new THREE.Matrix4();
            const v3 = new THREE.Vector3();
            const relStart = new Map();
            let rolle = 0;
            let lenk = 0;
            let lenkHinten = 0;
            let tauchBremse = 0;
            const spalte = [];
            let phase = "w";
            const P5 = r._stepFixedSim;
            r._stepFixedSim = function (simTime, dt) {
                P5.call(this, simTime, dt);
                r._tickMountedMovement(dt);
                r._archEntryWorldMatrix(gR, B);
                const Binv = B.clone().invert();
                // der Sattel im UNGEFEDERTEN Rahmen der Räder: seine Hoch-Achse bleibt oben (nur der Lenk-Einschlag dreht
                // um sie) — rollt er mit dem Rad, kippt sie um den Rad-Winkel
                r._archEntryWorldMatrix(gR, Bu, true);
                const BuInv = Bu.clone().invert();
                for (const { i } of steh) {
                    const s = gR.instSlots[i];
                    const g = st.archInstanceGroups.get(s.key);
                    if (!g) continue;
                    g.mesh.getMatrixAt(s.slot, M);
                    const e = Rel.multiplyMatrices(BuInv, M).elements;
                    const c = e[5] / Math.max(1e-9, Math.hypot(e[4], e[5], e[6]));
                    stehRolle = Math.max(stehRolle, Math.acos(Math.max(-1, Math.min(1, c))));
                }
                // die Rad-Punkte: Naben-Mitte je Ecke (Rad-Leaf) oder der Rad-Punkt der Aufbau-Matrix (starr)
                const punkte = [];
                if (rad.length) {
                    for (const { i, rd } of rad) {
                        const s = gR.instSlots[i];
                        const g = st.archInstanceGroups.get(s.key);
                        if (!g) continue;
                        g.mesh.getMatrixAt(s.slot, M);
                        v3.setFromMatrixPosition(M);
                        punkte.push({ front: rd.front, x: v3.x, y: v3.y - radR, z: v3.z });
                        // relativ zum Aufbau: die Achse z (Rolle um sie) und die Gier der Nabe (Lenkung)
                        Rel.multiplyMatrices(Binv, M);
                        const key = rd.ecke;
                        const e = Rel.elements;
                        const yAchse = [e[4], e[5], e[6]];
                        const xAchse = [e[0], e[1], e[2]];
                        if (!relStart.has(key)) relStart.set(key, yAchse);
                        const y0 = relStart.get(key);
                        const c = (y0[0] * yAchse[0] + y0[1] * yAchse[1] + y0[2] * yAchse[2]) / (Math.hypot(...y0) * Math.hypot(...yAchse));
                        rolle = Math.max(rolle, Math.acos(Math.max(-1, Math.min(1, c))));
                        if (phase === "a") {
                            // Gier der Nabe im Aufbau: die Achse z des Rades (die Drehachse) gegen die Quer-Achse z des Aufbaus
                            const zA = [e[8], e[9], e[10]];
                            const gier = Math.abs(Math.atan2(zA[0], Math.abs(zA[2]))) * (rd.dreh ? 1 : 1);
                            if (rd.front) lenk = Math.max(lenk, gier);
                            else lenkHinten = Math.max(lenkHinten, gier);
                        }
                        void xAchse;
                    }
                } else {
                    for (const ax of [hu.fAx, hu.rAx])
                        for (const sz of [-1, 1]) {
                            v3.set(ax, 0, (sz * hu.spur) / 2).applyMatrix4(B);
                            punkte.push({ front: ax === hu.fAx, x: v3.x, y: v3.y, z: v3.z });
                        }
                }
                let spalt = 0;
                for (const p of punkte) {
                    const d = p.y - hh(p.x, p.z);
                    spalt = Math.max(spalt, Math.abs(d));
                    if (phase === "s" && p.front) tauchBremse = Math.max(tauchBremse, -d);
                }
                spalte.push(spalt);
            };
            tasten(true, false);
            for (let i = 0; i < 90; i++) frame(i);
            phase = "s";
            for (const k of ["w", "a", "s", "d"]) st.keys[k] = false;
            st.keys.s = true;
            for (let i = 0; i < 40; i++) frame(i);
            st.keys.s = false;
            phase = "a";
            tasten(true, true);
            for (let i = 0; i < 60; i++) frame(i);
            tasten(false);
            r._stepFixedSim = P5;
            spalte.sort((a, b) => a - b);
            S.raeder = {
                leaves: rad.length,
                stehend: steh.length,
                stehRolle,
                rolle,
                lenk,
                lenkHinten,
                tauchBremse,
                spaltP75: spalte.length ? spalte[Math.floor(spalte.length * 0.75)] : Infinity,
                spaltMax: spalte.length ? spalte[spalte.length - 1] : Infinity,
            };
            weg(gR);
        }
        // P — DIE KERN-PFLICHT IM SPIEL (Gegenprüfung 07.10.): ein alter Kern ohne fahrGesetz/fahrEbene muss LAUT brechen
        // (`_kernPflichtBruch`), nie still null liefern (dann ritt der Gesetz-Wagen richtungs-folgend). Die Probe tauscht das
        // Kern-Objekt gegen eine Kopie ohne die beiden Funktionen (wie ein Boot mit altem Kern) und ruft die zwei Leser.
        const gP = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        if (gP) {
            const echt = window.__vehicleCore;
            const alt = Object.assign({}, echt);
            delete alt.fahrGesetz;
            delete alt.fahrEbene;
            const fang = (fn) => {
                try {
                    const v = fn();
                    return v === null || v === undefined ? "null" : "wert";
                } catch (e) {
                    const msg = String((e && e.message) || e);
                    return /KERN-PFLICHT/.test(msg) ? "bruch" : "fehler " + msg.slice(0, 80);
                }
            };
            window.__vehicleCore = alt;
            try {
                gP._fahrSatz = null;
                gP._fahrSatzKey = null;
                S.pflicht = {
                    satz: fang(() => r._fahrSatz(gP, r._vehicleProfile(gP))),
                    ebene: fang(() => r._rittEbene(gP, gP.position.x, gP.position.z, gP._rideYaw)),
                };
            } finally {
                window.__vehicleCore = echt;
            }
            weg(gP);
        }
        // S1 WELT == LABOR: dieselbe Gerade, W, dann W + A; die Spur je Sim-Schritt gegen den Labor-Aufruf.
        const g1 = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        if (g1 && g1._fahr && S.kern) {
            const z0 = Object.assign({}, g1._fahr);
            z.ent = g1;
            z.spur = [];
            tasten(true, false);
            for (let i = 0; i < 90; i++) frame(i);
            tasten(true, true);
            for (let i = 0; i < 90; i++) frame(i);
            tasten(false);
            const spur = z.spur;
            z.spur = null;
            z.ent = null;
            const G = g1._fahrSatz;
            const boden = r._fahrBoden(g1);
            // Die Labor-Spur: derselbe Kern (Stand an der Lage, dann Kräfte — die Folge der Probefahrt, um einen Stand
            // versetzt), dieselben Eingaben, derselbe Boden. Wo der Kontakt-Löser griff, übernimmt sie die Lage der Welt.
            const q = Object.assign({}, z0);
            let maxM = 0;
            let bei = -1;
            let maxY = 0;
            let kontakte = 0;
            for (let n = 0; n < spur.length; n++) {
                const k = spur[n].kontakt;
                if (k) {
                    kontakte++;
                    const cy = Math.cos(q.yaw);
                    const sy = Math.sin(q.yaw);
                    q.x = k.x;
                    q.z = k.z;
                    q.vlong = k.vx * cy - k.vz * sy;
                    q.vlat = -k.vx * sy - k.vz * cy;
                }
                VC.fahrStand(q, G, boden, spur[n].dt);
                maxY = Math.max(maxY, Math.abs(q.y - spur[n].y));
                VC.fahrKraefte(q, spur[n].e, G, spur[n].dt);
                const d = Math.max(Math.hypot(q.x - spur[n].x, q.z - spur[n].z), Math.abs(q.yaw - spur[n].yaw));
                if (d > maxM) {
                    maxM = d;
                    bei = n;
                }
            }
            S.labor = { schritte: spur.length, maxM, bei, maxY, kontakte, weg: Math.hypot(q.x - z0.x, q.z - z0.z) };
        }
        if (g1) weg(g1);
        // S2 KLIPPE: Anlauf 24 m trocken und flach (≤ 15 %), dann fällt der Grund 3–14 m (der Befund fand 8,5 m).
        let kl = null;
        for (let dx = -160; dx <= 160 && !kl; dx += 8)
            for (let dz = -160; dz <= 160 && !kl; dz += 8)
                for (let k = 0; k < 8 && !kl; k++) {
                    const x = mo[0] + dx;
                    const zz = mo[1] + dz;
                    const ux = Math.sin((k * Math.PI) / 4);
                    const uz = Math.cos((k * Math.PI) / 4);
                    const h0 = hh(x, zz);
                    let gut = Number.isFinite(h0);
                    for (let s = 2; s <= 24 && gut; s += 2) {
                        const a = hh(x - ux * s, zz - uz * s);
                        const b = hh(x - ux * (s - 2), zz - uz * (s - 2));
                        if (!Number.isFinite(a) || Math.abs(a - b) > 0.3 || nass(x - ux * s, zz - uz * s)) gut = false;
                    }
                    if (!gut) continue;
                    const unten = hh(x + ux * 6, zz + uz * 6);
                    const fall = h0 - unten;
                    if (!(fall >= 3 && fall <= 14) || nass(x + ux * 6, zz + uz * 6)) continue;
                    kl = { x, z: zz, fall, fahrt: Math.atan2(ux, uz), sx: x - ux * 24, sz: zz - uz * 24 };
                }
        S.klippeOrt = kl;
        if (kl) {
            const g2 = await setzen("fahrzeug_gt", kl.sx, kl.sz, kl.fahrt);
            if (g2) {
                tasten(true, false);
                let yv = g2.position.y;
                let sprung = 0;
                let luft = 0;
                let schritte = 0;
                const P2 = r._stepFixedSim;
                r._stepFixedSim = function (simTime, dt) {
                    P2.call(this, simTime, dt);
                    sprung = Math.max(sprung, Math.abs(g2.position.y - yv));
                    yv = g2.position.y;
                    schritte++;
                    if (g2._fahr && g2._fahr.luft) luft++;
                };
                for (let i = 0; i < 420; i++) frame(i);
                tasten(false);
                for (let i = 0; i < 60; i++) frame(i);
                r._stepFixedSim = P2;
                const unterGrund = g2.position.y - 0.5 - hh(g2.position.x, g2.position.z);
                S.klippe = { sprung, luft, schritte, ueberGrund: unterGrund, fall: kl.fall };
                weg(g2);
            }
        }
        // S3 QUERHANG: 25–40° quer, die Höhenlinie 16 m gerade (Richtung ±20°), trocken; Fahrt längs der Linie, W.
        let qh = null;
        for (let dx = -160; dx <= 160 && !qh; dx += 4)
            for (let dz = -160; dz <= 160 && !qh; dz += 4) {
                const x = mo[0] + dx;
                const zz = mo[1] + dz;
                const grad = (a, b) => [(hh(a + 1, b) - hh(a - 1, b)) / 2, (hh(a, b + 1) - hh(a, b - 1)) / 2];
                const [gx, gz] = grad(x, zz);
                const g = Math.hypot(gx, gz);
                if (!(g >= Math.tan(0.44) && g <= Math.tan(0.7)) || nass(x, zz)) continue;
                const cx = -gz / g;
                const cz = gx / g;
                let gut = true;
                for (let s = -8; s <= 8 && gut; s += 2) {
                    const [ax, az] = grad(x + cx * s, zz + cz * s);
                    const ag = Math.hypot(ax, az);
                    if (!(ag >= 0.3) || (ax * gx + az * gz) / (ag * g) < Math.cos(0.35) || nass(x + cx * s, zz + cz * s))
                        gut = false;
                }
                if (!gut) continue;
                qh = { x: x - cx * 8, z: zz - cz * 8, grad: (Math.atan(g) * 180) / Math.PI, fahrt: Math.atan2(cx, cz) };
            }
        S.querOrt = qh;
        if (qh) {
            const g3 = await setzen("fahrzeug_gt", qh.x, qh.z, qh.fahrt);
            if (g3) {
                // Die QUER-ABDRIFT talwärts: je Sim-Schritt die Geschwindigkeit quer zum Bug, auf die tiefe Seite gezählt
                // (ohne Quer-Hangabtrieb tötet der Reifen jede Quer-Fahrt: 0).
                let drift = 0;
                const P3 = r._stepFixedSim;
                r._stepFixedSim = function (simTime, dt) {
                    P3.call(this, simTime, dt);
                    const ry = Number.isFinite(g3._rideYaw) ? g3._rideYaw : 0;
                    const lx = Math.cos(ry);
                    const lz = -Math.sin(ry);
                    const x = g3.position.x;
                    const zz = g3.position.z;
                    const steigLinks = (hh(x + lx, zz + lz) - hh(x - lx, zz - lz)) / 2;
                    const v = st.playerVel;
                    drift += (v.x() * lx + v.z() * lz) * -Math.sign(steigLinks) * dt;
                };
                tasten(true, false);
                for (let i = 0; i < 100; i++) frame(i);
                tasten(false);
                r._stepFixedSim = P3;
                S.quer = { drift, weg: Math.hypot(g3.position.x - qh.x, g3.position.z - qh.z) };
                weg(g3);
            }
        }

        // ═══ H — DIE HÜLLE ALS KÖRPER (Q5 · F-D4 F-L5) ═══
        // Auf einer freien, trockenen, flachen Gasse (kein fremder Blocker in ±2,5 m auf 16 m) steht 9 m vor dem Wagen ein
        // Hindernis; der GT fährt mit W hinein. Gemessen wird das EINDRINGEN der Wagen-Hülle (exportDrive.huelle: Bug bis
        // Heck × ±bw, ein 0,1-m-Raster) in das Hindernis — in die Blocker-Boxen eines Felsblocks (`stein_block`) und in den
        // Raum eines Bären (tetrapoda VERHALTEN.separation: halber Paar-Radius × bodySize) — und als Beweis der Berührung
        // der kleinste Abstand am Ende (sonst wäre 0 Eindringen vakuös). Befund: Bug 1,97–2,32 m im Stamm, 2,17 m in der
        // Wand, der Bär ganz im Wagen.
        const gasse = (() => {
            const frei = (x, zz, ux, uz) => {
                for (let s = 0; s <= 16; s += 1) {
                    const px = x + ux * s;
                    const pz = zz + uz * s;
                    const h0 = hh(px, pz);
                    if (!Number.isFinite(h0) || nass(px, pz)) return false;
                    if (s > 0 && Math.abs(h0 - hh(px - ux, pz - uz)) > 0.25) return false;
                }
                for (const e of st.architectures) {
                    if (!e || !e.position || !e.blockerAABBs) continue;
                    if (Math.hypot(e.position.x - x, e.position.z - zz) > 40) continue;
                    for (const b of e.blockerAABBs) {
                        const cx = (b.minX + b.maxX) / 2 - x;
                        const cz = (b.minZ + b.maxZ) / 2 - zz;
                        const l = cx * ux + cz * uz;
                        const q = Math.abs(cx * uz - cz * ux);
                        if (l > -4 && l < 18 && q < 2.5 + Math.max(b.maxX - b.minX, b.maxZ - b.minZ) / 2) return false;
                    }
                }
                return true;
            };
            for (let ring = 0; ring <= 6; ring++)
                for (let k = 0; k < (ring ? 12 : 1); k++) {
                    const x = mo[0] + Math.cos((k * Math.PI) / 6) * ring * 24;
                    const zz = mo[1] + Math.sin((k * Math.PI) / 6) * ring * 24;
                    for (let d = 0; d < 8; d++) {
                        const a = (d * Math.PI) / 4;
                        if (frei(x, zz, Math.sin(a), Math.cos(a))) return { x, z: zz, fahrt: a };
                    }
                }
            return null;
        })();
        S.gasse = gasse;
        const huelleProbe = async (hindernis) => {
            if (!gasse) return null;
            const gH = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (!gH) return null;
            const h = r._fahrzeugGesetzFor(gH).drive.huelle;
            const sc = Number.isFinite(gH.scale) ? gH.scale : 1;
            const ux = Math.sin(gasse.fahrt);
            const uz = Math.cos(gasse.fahrt);
            const ziel = hindernis.setzen(gH.position.x + ux * 9, gH.position.z + uz * 9);
            if (!ziel) {
                weg(gH);
                return null;
            }
            let tief = 0;
            let abstand = Infinity;
            let schritte = 0;
            const messen = () => {
                const ry = Number.isFinite(gH._rideYaw) ? gH._rideYaw : 0;
                const fX = Math.sin(ry);
                const fZ = Math.cos(ry);
                abstand = Infinity;
                for (let l = h.tailX * sc; l <= h.noseX * sc + 1e-6; l += 0.1)
                    for (let q = -h.bw * sc; q <= h.bw * sc + 1e-6; q += 0.1) {
                        const px = gH.position.x + l * fX + q * fZ;
                        const pz = gH.position.z + l * fZ - q * fX;
                        const t = hindernis.tiefe(ziel, px, pz);
                        tief = Math.max(tief, t);
                        abstand = Math.min(abstand, t > 0 ? 0 : hindernis.abstand(ziel, px, pz));
                    }
            };
            const P4 = r._stepFixedSim;
            r._stepFixedSim = function (simTime, dt) {
                // das Hindernis steht VOR dem Kontakt und bei der Messung am selben Ort (das Hirn des Bären läuft im Frame)
                hindernis.halten(ziel);
                P4.call(this, simTime, dt);
                hindernis.halten(ziel);
                messen();
                schritte++;
            };
            tasten(true, false);
            for (let i = 0; i < 150; i++) frame(i);
            tasten(false);
            r._stepFixedSim = P4;
            const vorn = (gH.position.x - gasse.x) * ux + (gH.position.z - gasse.z) * uz;
            weg(gH);
            hindernis.weg(ziel);
            return { tief, abstand, schritte, vorn };
        };
        const boxTiefe = (boxes, px, pz) => {
            let t = 0;
            for (const b of boxes || []) {
                if (px < b.minX || px > b.maxX || pz < b.minZ || pz > b.maxZ) continue;
                t = Math.max(t, Math.min(px - b.minX, b.maxX - px, pz - b.minZ, b.maxZ - pz));
            }
            return t;
        };
        const boxAbstand = (boxes, px, pz) => {
            let a = Infinity;
            for (const b of boxes || []) {
                const dx = Math.max(b.minX - px, 0, px - b.maxX);
                const dz = Math.max(b.minZ - pz, 0, pz - b.maxZ);
                a = Math.min(a, Math.hypot(dx, dz));
            }
            return a;
        };
        S.huelleBlock = await huelleProbe({
            setzen: (x, zz) => {
                const b = r.spawnArchitecture("stein_block", { x, y: hh(x, zz) + 0.5, z: zz }, { silent: true, precise: true });
                if (b) r._populateBlockerAABBs(b);
                return b && b.blockerAABBs && b.blockerAABBs.length ? b : null;
            },
            tiefe: (b, px, pz) => boxTiefe(b.blockerAABBs, px, pz),
            abstand: (b, px, pz) => boxAbstand(b.blockerAABBs, px, pz),
            halten: () => {},
            weg: (b) => r.removeArchitecture(b),
        });
        const SEPW = Object.getPrototypeOf(r).constructor._verhaltenGesetz().separation;
        S.huelleBaer = await huelleProbe({
            setzen: (x, zz) => {
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1); // die Probe braucht ihren Bären
                const c = r.spawnCreatureAt(x, hh(x, zz) + 0.5, zz, "calm", "baer", { precise: true });
                if (!c) return null;
                return { c, x, z: zz, y: c.position.y, rc: 0.5 * SEPW.radiusBaseM * (c.userData.bodySize || 1) };
            },
            tiefe: (b, px, pz) => Math.max(0, b.rc - Math.hypot(px - b.c.position.x, pz - b.c.position.z)),
            abstand: (b, px, pz) => Math.max(0, Math.hypot(px - b.c.position.x, pz - b.c.position.z) - b.rc),
            // der Bär steht (sein Hirn läuft im Frame-Takt; die Probe hält ihn am Ort)
            halten: (b) => b.c.position.set(b.x, b.y, b.z),
            weg: (b) => r.removeCreature(b.c),
        });
        // H3 — EIN WESEN SCHIEBT KEINEN WAGEN: der GT steht (keine Taste), ein Bär steht 0,5 m tief in seinem Bug (er lief
        // hinein); 60 Frames später darf der Wagen sich nicht bewegt haben (das Ausweichen ist Sache des Wesens).
        if (gasse) {
            const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (gS) {
                const h = r._fahrzeugGesetzFor(gS).drive.huelle;
                const ux = Math.sin(gasse.fahrt);
                const uz = Math.cos(gasse.fahrt);
                const x0 = gS.position.x;
                const z0 = gS.position.z;
                const ab = h.noseX + 0.5 * SEPW.radiusBaseM * 1.0 - 0.5;
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
                const c = r.spawnCreatureAt(x0 + ux * ab, hh(x0 + ux * ab, z0 + uz * ab) + 0.5, z0 + uz * ab, "calm", "baer", {
                    precise: true,
                });
                if (c) {
                    // derselbe Abstand mit der echten Größe des Bären (bodySize), 0,5 m im Bug
                    const rc = 0.5 * SEPW.radiusBaseM * (c.userData.bodySize || 1);
                    const d = h.noseX + rc - 0.5;
                    const cx = x0 + ux * d;
                    const cz = z0 + uz * d;
                    const cy = c.position.y;
                    const P6 = r._stepFixedSim;
                    r._stepFixedSim = function (simTime, dt) {
                        c.position.set(cx, cy, cz);
                        P6.call(this, simTime, dt);
                        c.position.set(cx, cy, cz);
                    };
                    tasten(false);
                    for (let i = 0; i < 60; i++) frame(i);
                    r._stepFixedSim = P6;
                    S.huelleSchub = { weg: Math.hypot(gS.position.x - x0, gS.position.z - z0) };
                    r.removeCreature(c);
                }
                weg(gS);
            }
        }
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }
    aufraeumen();
    return res;
}

(async () => {
    if (process.argv.includes("--selftest")) {
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
        };
        check("Selbst-Test 0: gesunder Ritt == 0 Täter", taktVerdict(gesund).length === 0);
        for (const [name, bruch, soll] of [
            ["114 von 114 Frames Teleport (F-D1)", { teleport: 114 }, "teleport"],
            ["25,95 m simuliert, 10,27 m gefahren (F-D1)", { simWeg: 25.95, fahrWeg: 10.27 }, "weg"],
            ["Reiter in der Luft 421/421 (F-D10)", { luft: 270 }, "luft"],
            ["82,4° Gier in Frames ohne Sim-Schritt (F-D2)", { gierGrad: 82.4 }, "gier"],
            ["keine Fahrt (0 m)", { simWeg: 0, fahrWeg: 0 }, "sim-weg"],
        ]) {
            const v = taktVerdict(Object.assign({}, gesund, bruch));
            check(`Selbst-Test: ‚${name}' → die Linse nennt ${soll}`, v.length >= 1 && v[0].startsWith(soll), v.join(" · "));
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
        // Die Stations-Linse.
        const gutS = {
            kern: true,
            labor: { schritte: 180, maxM: 0.0001, bei: 3 },
            klippe: { sprung: 0.2, luft: 40 },
            quer: { drift: 1.2 },
            raeder: { leaves: 4, stehend: 4, stehRolle: 0, rolle: 12, lenk: 0.4, lenkHinten: 0, tauchBremse: 0.0, spaltP75: 0.01, spaltMax: 0.05 },
            huelleBlock: { tief: 0.0, abstand: 0.02 },
            huelleSchub: { weg: 0 },
            huelleBaer: { tief: 0.01, abstand: 0.0 },
            pflicht: { satz: "bruch", ebene: "bruch" },
        };
        check("Selbst-Test S0: gesunde Stationen == 0 Täter", stationVerdict(gutS).length === 0);
        for (const [name, bruch, soll] of [
            ["kein Fahr-Schritt im Kern", { kern: false }, "kern"],
            ["Welt weicht 0,4 m vom Labor ab", { labor: { schritte: 180, maxM: 0.4, bei: 50 } }, "labor≠welt"],
            ["7,95 m Höhen-Sprung in einem Schritt (F-D6)", { klippe: { sprung: 7.95, luft: 40 } }, "klippe-sprung"],
            ["Querhang ohne Abtrieb: 0,00 m (F-D7)", { quer: { drift: 0.0 } }, "querhang"],
            ["Bug 1,85 m im Fels (F-D4)", { huelleBlock: { tief: 1.85, abstand: 0 } }, "huelle-fels Eindringen"],
            ["die starre Instanz: kein Rad-Leaf (F-D8)", { raeder: { leaves: 0, rolle: 0, lenk: 0, lenkHinten: 0, tauchBremse: 0.0, spaltP75: 0.01 } }, "raeder starr"],
            ["Vorderräder 0,09 m im Boden beim Bremsen (F-D8)", { raeder: { leaves: 4, stehend: 4, stehRolle: 0, rolle: 12, lenk: 0.4, lenkHinten: 0, tauchBremse: 0.09, spaltP75: 0.01 } }, "raeder tauchen"],
            ["die Räder lenken nicht (F-D8)", { raeder: { leaves: 4, stehend: 4, stehRolle: 0, rolle: 12, lenk: 0, lenkHinten: 0, tauchBremse: 0, spaltP75: 0.01 } }, "raeder lenken nicht"],
            ["der Bremssattel rollt mit dem Rad (Gegenprüfung 07.10.)", { raeder: { leaves: 4, stehend: 4, stehRolle: 3.1, rolle: 12, lenk: 0.4, lenkHinten: 0, tauchBremse: 0, spaltP75: 0.01 } }, "raeder Sattel rollt"],
            ["kein Sattel an der Nabe", { raeder: { leaves: 4, stehend: 0, stehRolle: 0, rolle: 12, lenk: 0.4, lenkHinten: 0, tauchBremse: 0, spaltP75: 0.01 } }, "raeder ohne Sattel"],
            ["der Bär ganz im Wagen (F-L5)", { huelleBaer: { tief: 1.6, abstand: 0 } }, "huelle-baer Eindringen"],
            ["nie berührt (vakuös)", { huelleBlock: { tief: 0, abstand: 6.5 } }, "huelle-fels keine Berührung"],
            ["ein Bär schiebt den stehenden Wagen 0,5 m", { huelleSchub: { weg: 0.5 } }, "huelle-schub"],
            ["ein alter Kern: fahrSatz und rittEbene still null (Gegenprüfung 07.10.)", { pflicht: { satz: "null", ebene: "null" } }, "pflicht still"],
        ]) {
            const v = stationVerdict(Object.assign({}, gutS, bruch));
            check(`Selbst-Test S: ‚${name}' → die Linse nennt ${soll}`, v.length >= 1 && v[0].startsWith(soll), v.join(" · "));
        }
        // Die statischen Wände feuern auf den Vor-Stand.
        const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const garage = fs.readFileSync(path.join(root, "worlds/garage/garage.js"), "utf8");
        const kern = fs.readFileSync(path.join(root, "vehicle-core.js"), "utf8");
        const gruen = taktWand(quelle);
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const vorStand = quelle
            .replace("        this._rittSchritt(dt);\n", "")
            .replace(
                /(\n {4}_tickMountedMovement\(_?dt\) \{)/,
                "$1\n        const pm = this.state.playerMesh.position;\n        pm.y = 0;\n        entry._rideSteer = false;"
            );
        const rot = taktWand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Sitz im Frame, Flag lebt, kein Sim-Ritt) → W1 W2 W3 feuern",
            rot.filter((w) => !w[1]).length === 3,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        const kGruen = fahrWand(quelle, garage, kern);
        check("Selbst-Test K1: der Arbeitsbaum ist grün", kGruen.every((w) => w[1]), kGruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const kRot = fahrWand(
            quelle.replace(/(\n {4}_loopPlayerMovement\(currentTime, dtOverride\) \{)/, "$1\n        let FlatF = 0;"),
            garage.replace(/(\nfunction updateVehicle\(dt,t\)\{)/, "$1let FlatF=0;"),
            kern.replace("fahrSchritt: fahrSchritt", "")
        );
        check(
            "Selbst-Test K1: der Vor-Stand (Kopien in Welt und Labor, kein Export) → K1a K1b K1c feuern",
            kRot.filter((w) => !w[1]).length === 3,
            kRot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 3)}`).join(" ")
        );
        const pGruen = pflichtWand(quelle);
        check(
            "Selbst-Test P: der Arbeitsbaum ist grün",
            pGruen.every((w) => w[1]),
            pGruen.filter((w) => !w[1]).map((w) => w[0] + " " + w[2]).join(" | ")
        );
        const pRot = pflichtWand(
            quelle
                .replace(
                    /(\n {4}_fahrSatz\(entry, prof\) \{)/,
                    '$1\n        const VC = globalThis.__vehicleCore;\n        if (!VC || typeof VC.fahrGesetz !== "function") return null;'
                )
                .replace(/(\n {4}_fahrHuelle\(entry\) \{)/, "$1\n        const radR = 0.34;")
        );
        check(
            "Selbst-Test P: der Vor-Stand (typeof → null im Fahr-Satz, Literal-Zwilling in der Hülle) → P2 P3 feuern",
            !pRot[1][1] && !pRot[2][1],
            pRot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Fahr-Linse nennt Teleport, Weg, Luft, Gier, Halt, Kopie, Sprung und Querhang beim Namen.");
        process.exit(0);
    }

    const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    console.log("=== W — DIE STATISCHE WAND DES RITT-TAKTS (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of taktWand(quelle)) check(name, ok, detail);
    console.log("=== P — DIE KERN-PFLICHT DES FAHR-SCHRITTS (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of pflichtWand(quelle)) check(name, ok, detail);
    console.log("=== K — DER EINE FAHR-SCHRITT (Q13 · F-D6 F-D7): Wand + der Kern selbst (Node) ===");
    for (const [name, ok, detail] of fahrWand(
        quelle,
        fs.readFileSync(path.join(root, "worlds/garage/garage.js"), "utf8"),
        fs.readFileSync(path.join(root, "vehicle-core.js"), "utf8")
    ))
        check(name, ok, detail);
    require(path.join(root, "vehicle-core.js"));
    for (const [name, ok, detail] of kernProbe(globalThis.__vehicleCore)) check(name, ok, detail);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const messort = JSON.parse(fs.readFileSync(path.join(root, "spec/profiband/haushalt.json"), "utf8")).messort.spieler;
    const out = await page.evaluate(probeLeben, { messort });
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
        `${zeile(out.gt)}${vGt.length ? " — Täter: " + vGt.join(", ") : ""}`
    );
    const vHang = haltVerdict(out.gtHang);
    check(
        "T2 GT am Hang ohne Taste: kein Teleport, er hält (Haltebremse bis zum Reibkreis), keine Gier",
        !!out.hang && vHang.length === 0,
        out.hang
            ? `Hang ${(out.hang.g * 100).toFixed(0)} % · ${zeile(out.gtHang)}${vHang.length ? " — Täter: " + vHang.join(", ") : ""}`
            : "kein Hang gefunden"
    );
    // Das Pferd geht Schritt (≈ 1,3 m/s): 2 m Weg in 180 Frames sind Fahrt; seine Gier folgt der Fahrt (kein Maß).
    const vRoss = taktVerdict(Object.assign({}, out.ross, { gierGrad: undefined }), 2);
    check(
        "T3 Pferd (richtungs-folgender Ritt): kein Teleport, Sim-Weg = Fahr-Weg, Reiter sitzt",
        vRoss.length === 0,
        `${zeile(out.ross)}${vRoss.length ? " — Täter: " + vRoss.join(", ") : ""}`
    );
    console.log("=== S — DIE STATIONEN IN DER WELT (Q13 · F-D6 F-D7), echter Sim-Schritt ===");
    const S = out.stationen || {};
    const vS = stationVerdict(S);
    const hat = (t) => vS.some((x) => x.startsWith(t));
    check(
        "S1 Welt == Labor: der Welt-Ritt fährt die Spur des Labor-Aufrufs (VC.fahrSchritt), W und W + A",
        !hat("kern") && !hat("labor"),
        S.labor
            ? `${S.labor.schritte} Schritte · ${S.labor.weg.toFixed(1)} m · größte Abweichung ${S.labor.maxM.toExponential(1)} m (Höhe ${S.labor.maxY.toExponential(1)} m) · Kontakt-Schritte ${S.labor.kontakte}`
            : vS.join(" · ")
    );
    check(
        "S2 Klippe: kein Höhen-Sprung > 0,5 m je Sim-Schritt, der Wagen fliegt",
        !hat("kern") && !hat("klippe"),
        S.klippe
            ? `Fall ${S.klippe.fall.toFixed(1)} m bei (${S.klippeOrt.x}, ${S.klippeOrt.z}) · größter Sprung ${S.klippe.sprung.toFixed(2)} m · Luft ${S.klippe.luft}/${S.klippe.schritte} · danach ${S.klippe.ueberGrund.toFixed(2)} m über dem Grund`
            : vS.join(" · ")
    );
    check(
        "S3 Querhang: Fahrt längs der Höhenlinie ohne Lenkung driftet quer talwärts (der Quer-Hangabtrieb wirkt)",
        !hat("kern") && !hat("querhang"),
        S.quer
            ? `${S.querOrt.grad.toFixed(1)}° bei (${S.querOrt.x.toFixed(0)}, ${S.querOrt.z.toFixed(0)}) · ${S.quer.weg.toFixed(1)} m gefahren · Quer-Abdrift talwärts ${S.quer.drift.toFixed(2)} m`
            : vS.join(" · ")
    );
    console.log("=== R — DIE RÄDER IN DER INSTANZ (Q13 · F-D8), echter Sim-Schritt ===");
    const R = S.raeder;
    check(
        "R1 die Räder rollen und lenken: Rad-Leaves je Ecke, Rolle relativ zum Aufbau > 1 rad, vorn Einschlag > 0,1 rad, hinten 0; der Sattel hängt an der Nabe (rollt nie)",
        !hat("kern") &&
            !hat("raeder starr") &&
            !hat("raeder rollen") &&
            !hat("raeder lenken") &&
            !hat("raeder keine") &&
            !hat("raeder ohne Sattel") &&
            !hat("raeder Sattel"),
        R
            ? `${R.leaves} drehende + ${R.stehend} stehende Rad-Leaves · Rolle ${R.rolle.toFixed(2)} rad · Einschlag vorn ${R.lenk.toFixed(3)} / hinten ${R.lenkHinten.toFixed(3)} rad · Sattel-Rolle ${R.stehRolle.toFixed(3)} rad`
            : "keine Probe"
    );
    check(
        "R2 die Räder stehen auf dem Boden: beim Bremsen taucht kein Vorderrad ein (≤ 0,03 m), Rad-Spalt p75 ≤ 0,03 m",
        !hat("kern") && !hat("raeder tauchen") && !hat("raeder Spalt") && !hat("raeder keine"),
        R ? `Eintauchen beim Bremsen ${R.tauchBremse.toFixed(3)} m · Rad-Spalt p75 ${R.spaltP75.toFixed(3)} m (max ${R.spaltMax.toFixed(3)})` : "keine Probe"
    );
    check(
        "P4 ein alter Kern ohne fahrGesetz/fahrEbene bricht im Spiel laut (KERN-PFLICHT), nie still der richtungs-folgende Ritt",
        !hat("kern") && !hat("pflicht"),
        S.pflicht ? `_fahrSatz → ${S.pflicht.satz} · _rittEbene → ${S.pflicht.ebene}` : "keine Probe"
    );
    console.log("=== H — DIE HÜLLE ALS KÖRPER (Q5 · F-D4 F-L5), echter Sim-Schritt ===");
    const hz = (h, was) =>
        h
            ? `Eindringen der Hülle ${h.tief.toFixed(3)} m · Abstand am Ende ${h.abstand.toFixed(3)} m · ${h.vorn.toFixed(1)} m gefahren · ${h.schritte} Schritte`
            : `keine Probe (${was})`;
    check(
        "H1 der GT fährt mit W gegen einen Felsblock: die Hülle hält an den Blocker-Boxen (Eindringen ≤ 0,05 m)",
        !hat("kern") && !hat("huelle-fels"),
        hz(S.huelleBlock, "stein_block")
    );
    check(
        "H2 der GT fährt mit W gegen einen Bären: die Hülle hält am Raum des Wesens (Eindringen ≤ 0,05 m)",
        !hat("kern") && !hat("huelle-baer"),
        hz(S.huelleBaer, "baer")
    );
    check(
        "H3 ein Bär steht 0,5 m im Bug des stehenden Wagens: der Wagen bleibt stehen (ein Wesen schiebt keinen Wagen)",
        !hat("kern") && !hat("huelle-schub"),
        S.huelleSchub ? `Weg des Wagens in 60 Frames ${S.huelleSchub.weg.toFixed(3)} m` : "keine Probe"
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Ritt fährt im Sim-Schritt den EINEN Fahr-Schritt des Kerns: kein Teleport, Welt == Labor, Reibkreis, Querhang und Vertikale wirken."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Fahr-Leben-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
