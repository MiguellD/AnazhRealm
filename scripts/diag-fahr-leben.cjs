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
//       luft      — Sim-Schritte, in denen der Reiter nicht auf seinem Sitz sitzt oder der geerdete Wagen auf keinem
//                   seiner vier Aufstandspunkte steht (die Lage selbst, nie das Flag isInAir — Gegenprüfung 07.10.)
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
//       Eindringen der Wagen-Hülle (exportDrive.huelle) in die Blocker-Boxen bzw. den LEIB des Wesens (Befund: Bug
//       1,97–2,32 m im Stamm, der Bär ganz im Wagen)                                                Soll ≤ 0,05 m
//       H6 (D2): Wagen gegen Tier liest denselben Leib wie Tier gegen Hülle (`_kreaturLeib`); der Bär steht quer, die
//       Hülle berührt seine Flanke (≤ 0,3 m) statt vor einem zweiten Kreis (separation × bodySize) zu halten.
//       H7 (D5): eine 34° gedrehte Haus-Wand (Hülle der Stufe, `_hausObb`) — die Hülle berührt die ECHTE Wand (≤ 0,3 m)
//       und dringt nicht ein, statt vor ihrer Welt-AABB zu halten.
//       H8 (D5, die zweite Rolle): eine 34° gedrehte Mauer aus EINEM Teil — jedes gedrehte Teil eines Hindernisses (der
//       geparkte Wagen, Fels, Tor, Bauwerk) ist seine gedrehte Box (`_blockerComputePartAABB` → obb); die Hülle berührt
//       das Teil (≤ 0,3 m), nie seine Welt-AABB. Die H-Proben räumen die Gasse von fremden Wesen (der Leib hält den Wagen).
//
//   K7 (0710-2) die Wand ist ein SPRUNG des Bodens: liegt der Boden unter dem Wagen auf einmal 0,35 m höher, hält die
//       Wand einen Schritt, dann steigt er auf sein Gesetz (je Schritt ≤ eine Stufe) — vorher fror die Höhe für immer ein.
//   L (0710-2) — DIE ORTE DER LEBEN-SCHAU (07.10., integ-l 828d5ace, sichtbar gefahren), echter Sim-Schritt, an genau den
//       Orten mit Tempo und Gier der Schau:
//       L1 HANGFUSS (−852/−861,2, 9,3 m/s, Gier 92,3°): die flache Box eines Glutbrunnens schob den GT in EINEM Schritt
//          0,97 m quer auf höheren Grund, die Höhe fror ein, 1,16 m unter den Rädern für immer. Soll: nach JEDER Kontakt-
//          Antwort steht der Wagen auf dem Gesetz (≤ 0,2 m darunter, ≤ 3 Schritte), der Schub je Schritt ≤ 0,2 m über die
//          eigene Fahrt, er fährt weiter.
//       L2 SPALTKANTE (−904/−975, 11,4 m/s in +x): eine unsichtbare Wand stoppte den Wagen in EINEM Schritt (11,44 →
//          0,19 m/s), Gas danach 0,00 m. Soll: er fährt über die Kante und FÄLLT.
//       L3–L5 DER STOSS (Schau: Baum 10,41 → 0,16 · geparkter GT 11,28 → 0,00 · Bär 9,27 → 0,17 m/s, je EIN Frame, ohne
//          Folge): aus 9 m Anlauf in der freien Gasse gegen Fels, geparkten GT und Bären (nicht gehalten). Soll: das EINE
//          Impuls-Gesetz — am Fels Rückprall, der Gegner bekommt seinen Impuls nach Masse, ein Stoß-Ereignis (Kamera, Klang).
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
const FAHR_LESER = [
    "_fahrSatz",
    "_rittEbene",
    "_rittSchritt",
    "_fahrzeugStand",
    "_fahrNachlauf",
    "_fahrHuelle",
    "_fahrHuelleKontakt",
    "_archRadMatrix",
    "_loopPlayerMovement",
];
function pflichtWand(stamm) {
    const st = ohneKommentare(stamm);
    const leser = fnBody(st, /\nAnazhRealm\._fahrSchrittGesetz = function \(\) \{/) || "";
    const koerper = {};
    for (const n of FAHR_LESER) koerper[n] = fnBody(st, new RegExp("\\n {4}" + n + "\\([^)]*\\) \\{")) || "";
    const fehlt = FAHR_LESER.filter((n) => !koerper[n]);
    const still = ["_fahrSatz", "_rittEbene"].filter(
        (n) =>
            /typeof\s+VC\b|typeof\s+\w+\.fahr\w+\s*!==/.test(koerper[n]) || !/_fahrSchrittGesetz\(\)/.test(koerper[n])
    );
    const zwillinge = [];
    for (const n of FAHR_LESER) {
        const b = koerper[n];
        // dazu die Ebenen-Klammer als Literal (±0,7 rad = FAHR.schritt.ebeneMax) in Stand und Ritt ohne Fahr-Gesetz
        const treffer = (
            b.match(/__vehicleCore|FAHR\.schritt|\b0\.34\b|:\s*0\.7\)|:\s*0\.6\)|0\.5 \* radR|Math\.min\(0\.7,/g) || []
        ).length;
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
        [
            "P3 keine Literal-Zwillinge der FAHR.schritt-Zeilen in den Fahr-Lesern",
            zwillinge.length === 0,
            zwillinge.join(" · "),
        ],
    ];
}

// ── H5 — DIE EINE GLEIT-SCHLEIFE (Node, kommentarfrei; Gegenprüfung 07.10.): die Gelände-Gleitschleife der Hülle war eine
// Kopie der PM_ClipVelocity-Schleife aus Schritt 5b. Soll: die Schleife lebt EINMAL (`_wandGleiten`), Kapsel und Hülle
// rufen sie. ──
// H6 — EIN LEIB JE TIER (Entscheid D2 der Welle L, Integration): der Wagen-Kontakt rechnete das Wesen als zweiten Leib
// (den Kreis VERHALTEN.separation × bodySize, quer bis 0,8 m breiter als das Tier). Soll: Wagen gegen Tier liest
// denselben Leib wie Tier gegen Hülle (`_kreaturLeib`, die EINE Größe der Familie kreatur), kein `separation` im Kontakt.
function huelleWand(stamm) {
    const st = ohneKommentare(stamm);
    const schleifen = (st.match(/pl < AnazhRealm\.SLIDE_CLIP_PLANES/g) || []).length;
    const kapsel = fnBody(st, /\n {4}_stepCharacter\(delta, currentTime\) \{/) || "";
    const huelle = fnBody(st, /\n {4}_fahrHuelleKontakt\([^)]*\) \{/) || "";
    const tierHuelle = fnBody(st, /\n {4}_kreaturHuellenKontakt\([^)]*\) \{/) || "";
    const ruftK = /this\._wandGleiten\(/.test(kapsel);
    const ruftH = /this\._wandGleiten\(/.test(huelle);
    const leibW = /this\._kreaturLeib\(/.test(huelle);
    const leibT = /this\._kreaturLeib\(/.test(tierHuelle);
    const kreis = (huelle.match(/\bseparation\b|bodySize/g) || []).length;
    const loeser = fnBody(st, /\n {4}_resolveHuelleVsAABB\([^)]*\) \{/) || "";
    const obb = /\bbox\.obb\b/.test(loeser);
    // die zweite Rolle: jedes um die Hoch-Achse gedrehte Teil trägt seine obb (`_blockerComputePartAABB`)
    const teilBox = fnBody(st, /\n {4}_blockerComputePartAABB\([^)]*\) \{/) || "";
    const teilObb = /\bobb:\s*\{/.test(teilBox);
    return [
        [
            "H5 EINE Gleit-Schleife: die Kapsel (5b) und die Hülle rufen `_wandGleiten`, keine Kopie",
            schleifen === 1 && ruftK && ruftH,
            `Schleifen ${schleifen}× · Kapsel ruft ${ruftK} · Hülle ruft ${ruftH}`,
        ],
        [
            "H6 EIN Leib je Tier (D2): Wagen gegen Tier und Tier gegen Hülle lesen `_kreaturLeib`, kein zweiter Kreis im Kontakt",
            leibW && leibT && kreis === 0,
            `Wagen liest den Leib ${leibW} · Tier liest den Leib ${leibT} · separation/bodySize im Wagen-Kontakt ${kreis}×`,
        ],
        [
            "H7 die gedrehte Box (D5): die Hülle löst im Rahmen der Box (`_resolveHuelleVsAABB` liest `box.obb`), nie gegen ihre Welt-AABB",
            obb,
            `box.obb im Löser der Hülle ${obb}`,
        ],
        [
            "H8 EINE Form in beiden Rollen (D5): jedes gedrehte Teil eines Hindernisses trägt seine obb (`_blockerComputePartAABB`)",
            teilObb,
            `obb der Teil-Box ${teilObb}`,
        ],
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
            const m = lauf(
                pid,
                (x) => x * t,
                240,
                () => ({ throttle: 1 })
            );
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
    // K7 — DIE WAND IST EIN SPRUNG DES BODENS (0710-2, die Hangfuß-Falle): der GT steht auf ebenem Boden, dann liegt der Boden
    // unter ihm auf einmal 0,35 m höher (der Schub des Wirts quer auf höheren Grund). Die Wand hält EINEN Schritt (der Wirt
    // schiebt heraus), dann steigt der Wagen auf sein Gesetz, je Schritt höchstens eine Stufe. Vorher fror die Höhe ein:
    // der Wand-Zweig verglich den Boden mit der Höhe des Wagens, nie mit dem Boden des letzten Schritts.
    {
        const P7 = Object.assign({}, VC.DEFAULT_P, VC.presetPatch("gt"));
        const G7 = VC.fahrGesetz(VC.exportDrive(P7));
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
const STATION = {
    laborM: 0.01,
    sprungM: 0.5,
    querM: 0.3,
    huelleM: 0.05,
    beruehrtM: 0.3,
    rolleRad: 1,
    lenkRad: 0.1,
    spaltM: 0.03,
    schubM: 0.01,
    sattelRad: 0.01,
    standM: 0.05,
    // L (0710-2, die Orte der Leben-Schau): eine Rad-Stufe des GT (FAHR.schritt.stufeRad · radR ≈ 0,17 m) ist das Maß
    unterM: 0.2, // so tief darf der Wagen höchstens unter der Ebene seiner Räder liegen (einen Schritt lang: die Wand)
    unterN: 3, // so viele Sim-Schritte höchstens mehr als 5 cm darunter (die Wand hält einen, das Steigen zwei)
    versetztM: 0.2, // so weit versetzt der Kontakt-Löser den Wagen je Schritt höchstens über die eigene Fahrt hinaus
    wegM: 5, // so weit fährt der GT mit W nach dem Kontakt mindestens (er steht nie für immer)
    randM: 10, // der Spalt ist ein Spalt: der Rand liegt so hoch über seinem Grund (sonst ist L2 vakuös)
    fallM: 3, // so tief fällt der Wagen hinter der Kante mindestens
    // L3–L5 der Stoß (0710-2): das EINE Impuls-Gesetz (Masse aus Leib und Kern, Stoß-Zahl, Impuls-Austausch)
    stossVMin: 3, // m/s: so schnell fährt der GT mindestens in den Stoß (sonst ist die Probe vakuös)
    rueckprallMs: -0.3, // m/s: so weit rückwärts prallt der Wagen am Fels in den 8 Schritten nach dem Stoß mindestens
    wagenWegM: 0.3, // m: so weit rutscht der gestoßene geparkte GT mindestens
    wagenFahrt: 0.2, // Anteil der Fahrt, den der stoßende Wagen nach dem Stoß mit einem gleich schweren behält
    baerWegM: 0.5, // m: so weit stößt der Wagen den Bären mindestens
    baerFahrt: 0.5, // Anteil der Fahrt, den der Wagen nach dem Stoß mit dem leichteren Bären behält
    spielerAbprall: 0.25, // Anteil der Fahrt in den Wagen, den der Spieler nach dem Kontakt höchstens behält (0710-4)
    wagenHaltM: 0.05, // m: so weit rutscht ein gebremster GT höchstens, wenn ein Mensch gegen ihn läuft
    lockstepM: 1e-6, // m: so weit dürfen Wagen und Bär nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)
    spielerDv: 0.3, // m/s: so viel bekommt der Spieler mindestens vom rutschenden GT
    spielerTiefM: 0.12, // m: höchstens EIN Frame der Anfahrt (zwei Sim-Schritte bei 3,5 m/s) zwischen Kapsel und Blocker-Box — die
    // Lage des Spielers setzt sein Sim-Schritt (der Stoß trägt ihn im nächsten fort), die Blocker-Boxen des rutschenden Wagens
    // folgen je Frame; gemessen 0,05–0,10 m je nach Kadenz, die Basis 0,14 m mit 0 m/s
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
    else if (!ab.imFlug || !(ab.hoehe >= 1))
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
    const hg = s.huelleHang;
    if (!hg) out.push("huelle-hang keine Probe");
    else if (!(hg.schub >= 0.5)) out.push(`huelle-hang vakuös (Schub ${(hg.schub || 0).toFixed(2)} m)`);
    else if (!(hg.eindringen <= 0.01)) out.push(`huelle-hang Schub ins Gelände ${hg.eindringen.toFixed(2)} m`);
    if (!s.huelleSchub) out.push("huelle-schub keine Probe");
    else if (!(s.huelleSchub.weg <= STATION.schubM))
        out.push(`huelle-schub ein Wesen schob den Wagen ${s.huelleSchub.weg.toFixed(2)} m`);
    for (const [k, name] of [
        ["huelleBlock", "fels"],
        ["huelleBaer", "baer"],
    ]) {
        const h = s[k];
        if (!h) out.push(`huelle-${name} keine Probe`);
        else if (!(h.abstand <= STATION.beruehrtM))
            out.push(`huelle-${name} keine Berührung (Abstand ${h.abstand.toFixed(2)} m)`);
        else if (!(h.tief <= STATION.huelleM)) out.push(`huelle-${name} Eindringen ${h.tief.toFixed(2)} m`);
    }
    // das gedrehte Haus (D5): die Hülle berührt die ECHTE Wand (kleinster Abstand über die Fahrt), nie die Welt-AABB davor
    // und die gedrehte Teil-Box (D5, die zweite Rolle — Wagen, Fels, Tor, Bauwerk): die Hülle berührt das Teil, nie seine Welt-AABB
    for (const [k, name, was] of [
        ["huelleHaus", "haus", "der echten Wand"],
        ["huelleTeil", "teil", "des Teils"],
    ]) {
        const h = s[k];
        if (!h) out.push(`huelle-${name} keine Probe`);
        else if (!(h.nah <= STATION.beruehrtM))
            out.push(`huelle-${name} keine Berührung ${was} (kleinster Abstand ${h.nah.toFixed(2)} m)`);
        else if (!(h.tief <= STATION.huelleM)) out.push(`huelle-${name} Eindringen ${h.tief.toFixed(2)} m`);
    }
    // L1 DER HANGFUSS (0710-2): nach JEDER Kontakt-Antwort steht der Wagen wieder auf dem Gesetz, der Schub je Schritt ist
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
            out.push(`hangfuss-schub: der Kontakt-Löser versetzt den Wagen in EINEM Schritt ${hf.schubMax.toFixed(2)} m`);
        if (!(hf.weg >= STATION.wegM)) out.push(`hangfuss-steht: mit W nur ${hf.weg.toFixed(2)} m gefahren`);
    }
    // L3–L5 DER STOSS (0710-2): ein Stoß hat eine Folge — Rückprall am Fels, der Gegner bekommt seinen Impuls, ein Ereignis
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
    // L6 SPIELER UND WAGEN (0710-4): Impuls in beide Richtungen, keine Durchdringung.
    const sw = s.spielerWagen;
    if (!sw || !sw.a || !sw.b) out.push("spieler-wagen keine Probe");
    else {
        if (!(sw.a.kontakt >= 0 && sw.a.vorKontakt >= 1))
            out.push(
                `spieler-wagen: der Spieler erreicht den GT nicht im Lauf (vakuös, ${(sw.a.vorKontakt || 0).toFixed(2)} m/s)`
            );
        else if (!(sw.a.nachKontakt <= STATION.spielerAbprall * sw.a.vorKontakt))
            out.push(
                `spieler-wagen: der Spieler läuft gegen den GT und behält seine Fahrt (${sw.a.vorKontakt.toFixed(2)} → ${sw.a.nachKontakt.toFixed(2)} m/s) — kein Impuls`
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
    // L7/L8 DER STOSS IM SIM-SCHRITT (0710-5)
    const lw = s.leibWand;
    if (!lw) out.push("leib-wand keine Probe");
    else
        for (const k of ["60", "30", "gemischt"]) {
            const m = lw[k];
            if (!m || !(m.n >= 8)) out.push(`leib-wand ${k}: keine Probe`);
            else if (m.durch > 0)
                out.push(`leib-wand ${k}: der gestoßene Bär geht ${m.durch}/${m.n} Mal durch die 0,35-m-Wand`);
        }
    if (!s.lockstep) out.push("lockstep keine Probe");
    else if (!(s.lockstep.abw <= STATION.lockstepM) || !(s.lockstep.baerAbw <= STATION.lockstepM))
        out.push(
            `lockstep: nach 200 Sim-Schritten steht der Wagen bei gemischten Frames ${s.lockstep.abw.toFixed(3)} m anders als bei 60 fps (Bär ${s.lockstep.baerAbw.toFixed(3)} m)${s.lockstep.erst ? ` — zuerst in Schritt ${s.lockstep.erst.schritt}: ${s.lockstep.erst.groesse} um ${s.lockstep.erst.d}` : ""}`
        );
    // L2 DIE SPALTKANTE (0710-2): der Wagen fährt über die Kante und fällt.
    const sp = s.spalt;
    if (!sp) out.push("spalt keine Probe");
    else if (!(sp.rand - sp.grund >= STATION.randM))
        out.push(`spalt vakuös (Rand ${(sp.rand || 0).toFixed(1)} m, Grund ${(sp.grund || 0).toFixed(1)} m)`);
    else if (!(sp.xMax > -899.5 && sp.yMin < sp.rand - STATION.fallM))
        out.push(
            `spalt-wand: der Wagen hält an der Kante (bis x ${sp.xMax.toFixed(2)}, tiefste Höhe ${sp.yMin.toFixed(2)} m bei Rand ${sp.rand.toFixed(2)} m) — eine unsichtbare Wand`
        );
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
    // DIE ECHTE VERTIKALE (Gegenprüfung 07.10.: `isInAir` ist im Sattel bedingungslos geerdet — die alte Zählung konnte nie
    // mehr rot werden). Nach jedem Sim-Schritt: (a) der Reiter sitzt auf dem Sitz seines Werks (Basis − 0,5 + Sitz-Höhe +
    // Hub der Feder, ±0,05 m), (b) ein Gesetz-Wagen, den der Kern geerdet nennt, steht auf mindestens einem seiner vier
    // Aufstandspunkte (kein Punkt mehr als 0,05 m über seinem Boden) — beides misst die Lage selbst —, und (c) steht das
    // Werk, gilt der Reiter nicht als in der Luft (der Befund F-D10: 421 von 421 Schritten; die Wand gegen den Rückfall).
    const inDerLuft = () => {
        const pl = st.player;
        const me = pl && pl.mountedArch !== null && pl.mountedArch !== undefined ? r._mountedEntry : null;
        if (!me || !me.position) return !!st.isInAir;
        const fz = me._fahr;
        if (st.isInAir && !(fz && fz.luft)) return true;
        const sitz = Number.isFinite(me._sitzHeight) ? me._sitzHeight : 0;
        const hub = fz && Number.isFinite(fz.fHub) ? fz.fHub : Number.isFinite(me._rideHeave) ? me._rideHeave : 0;
        if (Math.abs(st.playerMesh.position.y - (me.position.y - 0.5 + sitz + hub)) > 0.05) return true;
        if (!fz || fz.luft || !Number.isFinite(fz.y) || typeof r._rittAufstand !== "function") return false;
        const a = r._rittAufstand(me);
        const boden = r._fahrBoden(me);
        const yk = (Number.isFinite(me._rideYaw) ? me._rideYaw : 0) - Math.PI / 2; // der Rahmen des Kerns
        const fx = Math.cos(yk);
        const fzz = -Math.sin(yk);
        const lx = -Math.sin(yk);
        const lz = -Math.cos(yk);
        let minSpalt = Infinity;
        for (const l of [a.vorn, a.hinten])
            for (const q of [a.quer, -a.quer]) {
                const px = me.position.x + fx * l + lx * q;
                const pz = me.position.z + fzz * l + lz * q;
                const y = fz.y + Math.tan(fz.steig || 0) * l + Math.tan(fz.wank || 0) * q;
                minSpalt = Math.min(minSpalt, y - boden(px, pz));
            }
        return minSpalt > 0.05;
    };
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
            if (inDerLuft()) z.luft++;
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
    const setzen = async (typ, x, zz, fahrt, vorAufsitzen) => {
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
        if (vorAufsitzen) vorAufsitzen(e);
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
        // DIE VERTIKALE SIEHT IHRE TÄTER (am lebenden Ritt): (a) der Reiter 0,3 m über dem Sitz, (b) der geerdete Wagen
        // 0,3 m über seinem Boden (im Stand, der Kern nennt ihn geerdet) — je 10 Frames mit einem Eingriff nach dem
        // Ritt-Schritt; die Zählung muss feuern.
        if (gt && typeof P._rittSchritt === "function") {
            const eingriff = (fn, w) => {
                r._rittSchritt = function (dt) {
                    P._rittSchritt.call(this, dt);
                    fn();
                };
                const m = fahrt(gt, 10, w);
                delete r._rittSchritt;
                return m.luft;
            };
            res.luftTaeter = {
                sitz: eingriff(() => {
                    st.playerMesh.position.y += 0.3;
                }, true),
                wagen: (() => {
                    // erst steht er (die Fahrt fällt, 30 Frames ohne Taste: Halt am Stand)
                    if (gt._fahr) {
                        gt._fahr.vlong = 0;
                        gt._fahr.vlat = 0;
                        gt._fahr.yawRate = 0;
                        gt._fahr.vy = 0; // auch die Steig-Rate des Hangs (sonst hüpft er aus dem Stand)
                    }
                    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
                    fahrt(gt, 30, false);
                    return eingriff(() => {
                        if (gt._fahr && !gt._fahr.luft) {
                            gt._fahr.y += 0.3;
                            gt.position.y += 0.3;
                            st.playerMesh.position.y += 0.3;
                        }
                    }, false);
                })(),
            };
        }
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
            const flat = r._foundryFlattenFor(
                gR,
                preset,
                Number.isFinite(gR._servedLod) ? gR._servedLod : gR._lodLevel
            );
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
            const spalteSicht = [];
            // die Boden-Karte des gezeichneten Meshs (`_chunkSurfaceAt` je Chunk, bilinear); null ohne Karte
            const cfgB = r._voxelChunkConfig(0);
            const sicht = (x, zz) => {
                const cx = Math.floor(x / cfgB.span);
                const cz = Math.floor(zz / cfgB.span);
                const ce = st.voxelChunks ? st.voxelChunks.get(`${cx},${cz}`) : null;
                return ce && ce.surfMap ? r._chunkSurfaceAt(ce, cx, cz, x, zz) : null;
            };
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
                        const c =
                            (y0[0] * yAchse[0] + y0[1] * yAchse[1] + y0[2] * yAchse[2]) /
                            (Math.hypot(...y0) * Math.hypot(...yAchse));
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
                let spaltS = -1;
                for (const p of punkte) {
                    const d = p.y - hh(p.x, p.z);
                    spalt = Math.max(spalt, Math.abs(d));
                    if (phase === "s" && p.front) tauchBremse = Math.max(tauchBremse, -d);
                    // DIE SICHT (Gegenprüfung 07.10., Entscheid D1: nur messen und benennen — die Sim bleibt auf dem Gesetz):
                    // derselbe Aufstandspunkt gegen den GEZEICHNETEN Boden (die Boden-Karte des fertigen Meshs, Lehre 22)
                    const ys = sicht(p.x, p.z);
                    if (ys !== null) spaltS = Math.max(spaltS, Math.abs(p.y - ys));
                }
                spalte.push(spalt);
                if (spaltS >= 0) spalteSicht.push(spaltS);
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
            spalteSicht.sort((a, b) => a - b);
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
                sichtSchritte: spalteSicht.length,
                sichtP75: spalteSicht.length ? spalteSicht[Math.floor(spalteSicht.length * 0.75)] : null,
                sichtMax: spalteSicht.length ? spalteSicht[spalteSicht.length - 1] : null,
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
        // DIE BAHN IST FREI (Fixture der Klippen-Stationen): der gesetzte Wagen stößt beim Spawn einen Remesh seines Chunks an,
        // und die Welt streut dort neu ein (Spawn-Affinität — im Lauf vom 07.10. standen drei Felsbögen und ein Glutbrunnen
        // AUF dem Wagen und schoben ihn 3,3 m in den Hang: die Klasse „Natur weicht dem Bau", Familie koerper-haus, D3).
        // Vor dem Aufsitzen läuft die Welt 60 Frames, dann räumt die Probe, was auf dem Anlauf bis 8 m über die Kante blockt.
        let geraeumt = 0;
        const bahnFrei = (k) => (wagen) => {
            for (let i = 0; i < 60; i++) frame(i);
            const ux = Math.sin(k.fahrt);
            const uz = Math.cos(k.fahrt);
            let n = 0;
            for (const e of st.architectures.slice()) {
                if (!e || e === wagen || !e.blockerAABBs || !e.position) continue;
                const dx = e.position.x - k.sx;
                const dz = e.position.z - k.sz;
                const l = dx * ux + dz * uz;
                if (l > -6 && l < 32 && Math.abs(dx * uz - dz * ux) < 6) {
                    r.removeArchitecture(e);
                    n++;
                }
            }
            geraeumt = n;
        };
        if (kl) {
            const g2 = await setzen("fahrzeug_gt", kl.sx, kl.sz, kl.fahrt, bahnFrei(kl));
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
                S.klippe = { sprung, luft, schritte, ueberGrund: unterGrund, fall: kl.fall, geraeumt };
                weg(g2);
            }
            // S4 ABSTEIGEN IM FLUG (Gegenprüfung 07.10.: `dismountArchitecture` stellte den Wagen nicht ab — wer im Flug
            // ausstieg, ließ ihn bis zum Reload in der Luft hängen): dieselbe Klippe, W bis der Wagen 1 m über dem Boden
            // fliegt, dann absteigen; 240 Frames später steht er auf der Ebene seiner Räder (≤ 0,05 m), gefallen ohne Höhen-
            // Sprung > 0,5 m je Sim-Schritt.
            const g4 = await setzen("fahrzeug_gt", kl.sx, kl.sz, kl.fahrt, bahnFrei(kl));
            if (g4) {
                tasten(true, false);
                let hoehe = 0;
                for (let i = 0; i < 420; i++) {
                    frame(i);
                    hoehe = g4.position.y - 0.5 - hh(g4.position.x, g4.position.z);
                    if (g4._fahr && g4._fahr.luft && hoehe >= 1) break;
                }
                tasten(false);
                const imFlug = !!(g4._fahr && g4._fahr.luft);
                r.dismountArchitecture();
                let yv = g4.position.y;
                let sprungAb = 0;
                const P7 = r._stepFixedSim;
                r._stepFixedSim = function (simTime, dt) {
                    P7.call(this, simTime, dt);
                    sprungAb = Math.max(sprungAb, Math.abs(g4.position.y - yv));
                    yv = g4.position.y;
                };
                for (let i = 0; i < 240; i++) frame(i);
                r._stepFixedSim = P7;
                const eb = r._rittEbene(g4, g4.position.x, g4.position.z, g4._rideYaw);
                const bodenY = eb ? eb.y : hh(g4.position.x, g4.position.z);
                S.absteigen = { imFlug, hoehe, ueberBoden: g4.position.y - 0.5 - bodenY, sprung: sprungAb, geraeumt };
                r.removeArchitecture(g4);
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
                    if (
                        !(ag >= 0.3) ||
                        (ax * gx + az * gz) / (ag * g) < Math.cos(0.35) ||
                        nass(x + cx * s, zz + cz * s)
                    )
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
            // die Gasse ist frei von fremden Wesen (ein Wolf vor dem Bug hält den Wagen an seinem Leib — die Probe misst ihr
            // eigenes Hindernis): jedes Wesen im Umkreis 30 m der Strecke geht, bevor das Hindernis steht
            for (const cr of (st.creatures || []).slice())
                if (
                    cr &&
                    cr.position &&
                    Math.hypot(cr.position.x - (gasse.x + ux * 8), cr.position.z - (gasse.z + uz * 8)) < 30
                )
                    r.removeCreature(cr);
            const ziel = hindernis.setzen(gH.position.x + ux * 9, gH.position.z + uz * 9);
            if (!ziel) {
                weg(gH);
                return null;
            }
            let tief = 0;
            let abstand = Infinity;
            let nah = Infinity; // der kleinste Abstand über die Fahrt (gleitet die Hülle an der Wand entlang, zählt der Kontakt)
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
                nah = Math.min(nah, abstand);
                schritte++;
            };
            tasten(true, false);
            for (let i = 0; i < 150; i++) frame(i);
            tasten(false);
            r._stepFixedSim = P4;
            const vorn = (gH.position.x - gasse.x) * ux + (gH.position.z - gasse.z) * uz;
            weg(gH);
            hindernis.weg(ziel);
            return { tief, abstand, nah, schritte, vorn };
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
                const b = r.spawnArchitecture(
                    "stein_block",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true }
                );
                if (b) r._populateBlockerAABBs(b);
                return b && b.blockerAABBs && b.blockerAABBs.length ? b : null;
            },
            tiefe: (b, px, pz) => boxTiefe(b.blockerAABBs, px, pz),
            abstand: (b, px, pz) => boxAbstand(b.blockerAABBs, px, pz),
            halten: () => {},
            weg: (b) => r.removeArchitecture(b),
        });
        // Der Bär steht QUER zur Fahrt (die Flanke zum Bug): gemessen wird gegen SEINEN Leib (`_kreaturLeib`, D2 — dieselbe
        // Größe, mit der er selbst gegen jede Hülle löst: drei Achsen längs der Gier, je Achse der Radius), nie gegen einen
        // zweiten Kreis. Der Wagen soll den Leib berühren (Abstand ≤ 0,3 m), nicht vor einem breiteren Kreis halten.
        const leibAchsen = (b) => {
            const lb = b.leib;
            const out = [];
            for (let o = -1; o <= 1; o++)
                out.push([b.c.position.x + lb.fx * o * lb.halb, b.c.position.z + lb.fz * o * lb.halb]);
            return out;
        };
        const leibMass = (b, px, pz) => {
            let d = Infinity;
            for (const [ax, az] of leibAchsen(b)) d = Math.min(d, Math.hypot(px - ax, pz - az));
            return d - b.leib.radius; // < 0: im Leib
        };
        const quer = Number.isFinite(gasse && gasse.fahrt) ? gasse.fahrt + Math.PI / 2 : 0;
        const SEPW = Object.getPrototypeOf(r).constructor._verhaltenGesetz().separation;
        let baerLeib = null;
        const baerHalten = (b) => {
            b.c.position.set(b.x, b.y, b.z);
            b.c.rotation.y = b.ry;
            b.c.userData._stossV = null; // die Hand der Probe hält auch die Geschwindigkeit (der Bär steht)
            b.leib = r._kreaturLeib(b.c, 0, b.leib || {});
        };
        S.huelleBaer = await huelleProbe({
            setzen: (x, zz) => {
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1); // die Probe braucht ihren Bären
                const c = r.spawnCreatureAt(x, hh(x, zz) + 0.5, zz, "calm", "baer", { precise: true });
                if (!c) return null;
                // die Füße auf dem Boden (die Lage eines stehenden Tiers; der Leib reicht vom Fuß bis zum Kopf)
                const b = { c, x, z: zz, y: hh(x, zz), ry: quer };
                baerHalten(b);
                // die Maße im Bericht: der Leib und der Kreis, den der Wagen-Kontakt vor D2 las (separation × bodySize)
                baerLeib = {
                    radius: b.leib.radius,
                    halb: b.leib.halb,
                    kreis: 0.5 * SEPW.radiusBaseM * (c.userData.bodySize || 1),
                };
                return b;
            },
            tiefe: (b, px, pz) => Math.max(0, -leibMass(b, px, pz)),
            abstand: (b, px, pz) => Math.max(0, leibMass(b, px, pz)),
            // der Bär steht (sein Hirn läuft im Frame-Takt; die Probe hält ihn am Ort und in seiner Gier)
            halten: baerHalten,
            weg: (b) => r.removeCreature(b.c),
        });
        if (S.huelleBaer && baerLeib) S.huelleBaer.leib = baerLeib;
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
                const ab = h.noseX;
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
                const c = r.spawnCreatureAt(
                    x0 + ux * ab,
                    hh(x0 + ux * ab, z0 + uz * ab) + 0.5,
                    z0 + uz * ab,
                    "calm",
                    "baer",
                    {
                        precise: true,
                    }
                );
                if (c) {
                    // quer zur Fahrt, seine Flanke 0,5 m tief im Bug — gemessen an SEINEM Leib (`_kreaturLeib`, D2)
                    c.rotation.y = quer;
                    const lb = r._kreaturLeib(c, 0, {});
                    const d = h.noseX + lb.radius - 0.5;
                    const cx = x0 + ux * d;
                    const cz = z0 + uz * d;
                    const cy = hh(cx, cz);
                    const P6 = r._stepFixedSim;
                    r._stepFixedSim = function (simTime, dt) {
                        c.position.set(cx, cy, cz);
                        c.rotation.y = quer;
                        P6.call(this, simTime, dt);
                        c.position.set(cx, cy, cz);
                        c.rotation.y = quer;
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
        // H7 — DAS GEDREHTE HAUS (Entscheid D5 der Welle L, Integration): eine Haus-Wand 12 × 0,8 m, 34° gegen die Fahrt
        // gedreht, als Hülle der Stufe (`_hausHuelleSetzen` → `_hausObb`, derselbe Weg wie der Beipack `__huelle` der
        // Foundry) steht 9 m voraus; der GT fährt mit W hinein. Gemessen gegen die ECHTE Wand (im Rahmen der gedrehten Box):
        // das Eindringen und der kleinste Abstand über die Fahrt. Die Welt-AABB der gedrehten Wand ist ein Mehrfaches der
        // Wand — hält die Hülle an ihr, bleibt sie vor der Wand stehen (keine Berührung).
        st.blueprints._t_fahr_haus = {
            name: "_t_fahr_haus",
            parts: [
                { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 12, y: 2.5, z: 0.8 } },
            ],
        };
        const obbLokal = (ob, px, pz) => {
            const dx = px - ob.cx;
            const dz = pz - ob.cz;
            return [dx * ob.c - dz * ob.s, dx * ob.s + dz * ob.c];
        };
        S.huelleHaus = await huelleProbe({
            setzen: (x, zz) => {
                const e = r.spawnArchitecture(
                    "_t_fahr_haus",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: gasse.fahrt + 0.6 }
                );
                if (!e) return null;
                r._hausHuelleSetzen(e, { stufe: 0, boxen: [-6, -3, -0.4, 6, 2.5, 0.4] });
                const box = (e.blockerAABBs || []).find((b) => b.obb);
                if (!box) {
                    r.removeArchitecture(e);
                    return null;
                }
                return { e, ob: box.obb, aabb: [box.maxX - box.minX, box.maxZ - box.minZ] };
            },
            tiefe: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.max(0, Math.min(b.ob.hx - Math.abs(lx), b.ob.hz - Math.abs(lz)));
            },
            abstand: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.hypot(Math.max(Math.abs(lx) - b.ob.hx, 0), Math.max(Math.abs(lz) - b.ob.hz, 0));
            },
            halten: () => {},
            weg: (b) => r.removeArchitecture(b.e),
        });
        delete st.blueprints._t_fahr_haus;
        // H8 — DIE GEDREHTE TEIL-BOX (D5, die zweite Rolle der Hülle: jedes Hindernis aus Teilen — der geparkte Wagen, der
        // Fels, das Tor, ein Bauwerk — steht als seine Teil-Boxen aus `_blockerComputePartAABB`): eine Mauer aus EINEM Teil
        // 12 × 0,8 m, ohne Haus-Hülle, 34° gegen die Fahrt gedreht, steht 9 m voraus; der GT fährt mit W hinein. Gemessen
        // gegen das ECHTE Teil (in seinem Rahmen): das Eindringen und der kleinste Abstand über die Fahrt. Steht das Teil als
        // Welt-AABB, hält die Hülle vor dem Rechteck um die Mauer.
        st.blueprints._t_fahr_mauer = {
            name: "_t_fahr_mauer",
            parts: [
                { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 12, y: 2.5, z: 0.8 } },
            ],
        };
        S.huelleTeil = await huelleProbe({
            setzen: (x, zz) => {
                const e = r.spawnArchitecture(
                    "_t_fahr_mauer",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: gasse.fahrt + 0.6 }
                );
                if (!e) return null;
                r._populateBlockerAABBs(e);
                if (!e.blockerAABBs || e.blockerAABBs.length !== 1 || e._hausHuelle) {
                    r.removeArchitecture(e);
                    return null;
                }
                const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
                const c = Math.cos(e.rotationY);
                const sn = Math.sin(e.rotationY);
                return { e, ob: { cx: e.position.x, cz: e.position.z, c, s: sn, hx: 6 * sc, hz: 0.4 * sc } };
            },
            tiefe: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.max(0, Math.min(b.ob.hx - Math.abs(lx), b.ob.hz - Math.abs(lz)));
            },
            abstand: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.hypot(Math.max(Math.abs(lx) - b.ob.hx, 0), Math.max(Math.abs(lz) - b.ob.hz, 0));
            },
            halten: () => {},
            weg: (b) => r.removeArchitecture(b.e),
        });
        delete st.blueprints._t_fahr_mauer;
        // H4 — KEIN SCHUB INS GELÄNDE (Befund 07.10.: ein beim Remesh auf den Wagen gestreuter Felsbogen schob ihn 3,3 m in
        // den Hang, 2,43 m unter den Boden; die Wand-Regel der Vertikale hielt ihn dort). Die ECHTE Methode
        // `_fahrHuelleKontakt` mit der echten Hülle des GT auf einer synthetischen Welt (ein Objekt mit der Welt als Prototyp):
        // eine senkrechte Gelände-Wand 0,3 m neben der rechten Flanke, ein Kasten überlappt die linke Flanke 0,8 m und schiebt
        // zur Wand hin. Die Hülle darf nicht in die Wand.
        {
            const gT = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
            if (gT) {
                tasten(false);
                for (let i = 0; i < 4; i++) frame(i);
                const kEcht = r._fahrHuelle(gT);
                if (kEcht) {
                    const k = Object.assign({}, kEcht, { schub: [] });
                    const WX = k.hw + 0.3;
                    const w = Object.create(r);
                    w.state = {
                        architectures: [
                            {
                                id: -7,
                                position: { x: -k.hw - 0.1, y: 0, z: 0 },
                                blockerAABBs: [
                                    {
                                        minX: -k.hw - 1.0,
                                        maxX: -k.hw + 0.8,
                                        minZ: -1,
                                        maxZ: 1,
                                        botY: -1,
                                        topY: 3,
                                        dick: 5,
                                    },
                                ],
                            },
                        ],
                        creatures: [],
                        floatingIslands: [],
                        player: { mountedArch: -1 },
                    };
                    w._terrainColumnContext = () => null;
                    w._fieldSolid = (px) => px > WX;
                    w._fieldGradient = (px, py, pz, o) => {
                        const out = o || {};
                        out.x = -1;
                        out.y = 0;
                        out.z = 0;
                        out.mag = 1;
                        return out;
                    };
                    const ent = { _fahr: { y: 0, steig: 0, wank: 0 }, _rideYaw: 0 };
                    // zehn Schritte nacheinander (der Schub je Schritt ist auf eine Rad-Stufe begrenzt, 0710-2): der Kasten
                    // drückt die Hülle Schritt um Schritt an die Wand, und keiner schiebt sie hinein
                    let x = 0;
                    let schub = 0;
                    let eindringen = 0;
                    for (let i = 0; i < 10; i++) {
                        const o = w._fahrHuelleKontakt(ent, k, x, 0, 0, 0, 1 / 60);
                        if (i === 0)
                            for (let j = 0; j < k.schub.length; j += 2) schub += Math.hypot(k.schub[j], k.schub[j + 1]);
                        x = o.x;
                        eindringen = Math.max(eindringen, o.x + k.hw - WX);
                    }
                    S.huelleHang = { schub, eindringen: Math.max(0, eindringen), x, anWand: WX - (x + k.hw) };
                }
                weg(gT);
            }
        }

        // ═══ L — DIE ORTE DER LEBEN-SCHAU (Auftrag 0710-2, Befund 07.10. auf integ-l 828d5ace, sichtbar gefahren) ═══
        // An GENAU den Orten der Leben-Schau, mit ihrem Tempo und ihrer Gier, durch den echten Sim-Schritt. Je Sim-Schritt:
        // `unter` — die Ebene der Räder (der Kern selbst: fahrEbene an der Lage und Gier des Stands) über der Höhe des Wagens,
        // solange er nicht fliegt; `schub` — was der Kontakt-Löser die Lage über die eigene Fahrt hinaus versetzte.
        const VCl = window.__vehicleCore;
        const lebenFahrt = async (L, n) => {
            // die Welt um den Ort steht (die Chunks und ihre Streu — der Glutbrunnen ist Welt-Genese)
            st.playerMesh.position.set(L.ort[0], hh(L.ort[0], L.ort[1]) + 2, L.ort[1]);
            for (let i = 0; i < 240; i++) frame(i);
            const ziel = L.ziel ? L.ziel() : true;
            const gL = await setzen("fahrzeug_gt", L.start[0], L.start[1], L.gier);
            if (!gL) return null;
            for (const cr of (st.creatures || []).slice())
                if (cr && cr.position && Math.hypot(cr.position.x - L.ort[0], cr.position.z - L.ort[1]) < 30)
                    r.removeCreature(cr);
            const m = { ziel: !!ziel, unterMax: 0, unterN: 0, schubMax: 0, kontakte: 0, xMax: -Infinity, yMin: Infinity };
            m.y0 = gL._fahr ? gL._fahr.y : NaN;
            const zug = {};
            const PC = r._stepCharacter;
            r._stepCharacter = function (delta, ct) {
                const p = st.playerMesh.position;
                zug.x0 = p.x;
                zug.z0 = p.z;
                zug.vx = st.playerVel.x();
                zug.vz = st.playerVel.z();
                zug.dt = Math.min(0.1, Math.max(0.0001, delta));
                PC.call(this, delta, ct);
                const s = Math.hypot(p.x - (zug.x0 + zug.vx * zug.dt), p.z - (zug.z0 + zug.vz * zug.dt));
                // nur eine VERSETZUNG zählt (eine Wand nimmt die eigene Fahrt zurück: die Lage bleibt hinter x0 + v·dt)
                const zurueck = Math.hypot(p.x - zug.x0, p.z - zug.z0) <= Math.hypot(zug.vx, zug.vz) * zug.dt + 1e-6;
                zug.schub = zurueck ? 0 : s;
            };
            // die Höhe unter dem Gesetz am STAND selbst (Lage und Gier, an denen der Kern die Ebene stellt — die Kräfte
            // danach rücken die Lage um v·dt vor)
            const standRoh = VCl.fahrStand;
            VCl.fahrStand = function (zf, G, boden, dt) {
                const sx = zf.x;
                const sz = zf.z;
                const syaw = zf.yaw;
                const aus = standRoh.call(this, zf, G, boden, dt);
                if (zf === gL._fahr && dt > 0 && !zf.luft && Number.isFinite(zf.y)) {
                    const eb = VCl.fahrEbene(G, boden, sx, sz, syaw);
                    if (eb) {
                        const u = eb.y - zf.y;
                        m.unterMax = Math.max(m.unterMax, u);
                        if (u > 0.05) m.unterN++;
                    }
                }
                return aus;
            };
            const PF = r._stepFixedSim;
            r._stepFixedSim = function (simTime, dt) {
                zug.schub = 0;
                PF.call(this, simTime, dt);
                const fz = gL._fahr;
                if (!fz || !Number.isFinite(fz.y)) return;
                m.schubMax = Math.max(m.schubMax, zug.schub);
                if (zug.schub > 1e-3) m.kontakte++;
                m.xMax = Math.max(m.xMax, gL.position.x);
                m.yMin = Math.min(m.yMin, fz.y);
            };
            st.playerVel.setValue(Math.sin(L.gier) * L.v0, st.playerVel.y(), Math.cos(L.gier) * L.v0);
            if (gL._fahr) gL._fahr.vlong = L.v0;
            const x0 = gL.position.x;
            const z0 = gL.position.z;
            tasten(true, false);
            for (let i = 0; i < n; i++) frame(i);
            tasten(false);
            r._stepCharacter = PC;
            r._stepFixedSim = PF;
            VCl.fahrStand = standRoh;
            m.weg = Math.hypot(gL.position.x - x0, gL.position.z - z0);
            weg(gL);
            return m;
        };
        // L1 DER HANGFUSS: 9,3 m/s, Gier 92,3°, über den Hangfuß an (−852/−861,2) — die flache Box des Glutbrunnens
        // (−848,9/−861,8) lag unter dem Band der Hülle, bis der Wagen am Hangfuß absank; dann schob sie ihn in EINEM Schritt
        // 0,97 m quer auf 0,25 m höheren Grund, der Wand-Zweig des Kerns fror die Höhe ein: 1,16 m unter den Rädern, für immer.
        S.hangfuss = await lebenFahrt(
            {
                ort: [-852, -861.2],
                start: [-854.5, -861.1],
                gier: (92.3 * Math.PI) / 180,
                v0: 9.3,
                ziel: () =>
                    st.architectures.find(
                        (e) =>
                            e &&
                            e.position &&
                            /glutbrunnen/.test(e.blueprintName || e.name || e.type || "") &&
                            Math.hypot(e.position.x + 848.9, e.position.z + 861.8) < 1
                    ),
            },
            150
        );
        // L2 DIE SPALTKANTE: 11,4 m/s in +x auf den Rand des 23-m-Spalts (−904/−975) — der Wagen stand in EINEM Schritt (11,44 →
        // 0,19 m/s), Gas danach 0,00 m, der Bug über der Kante. Soll: er fährt über die Kante und FÄLLT.
        S.spalt = await lebenFahrt({ ort: [-904, -975], start: [-912, -975], gier: Math.PI / 2, v0: 11.4 }, 150);
        if (S.spalt) {
            S.spalt.rand = hh(-904, -975);
            S.spalt.grund = Math.min(hh(-898, -975), hh(-897, -975));
        }
        // L3–L5 DER STOSS (Leben-Schau 07.10.: Baum 10,41 → 0,16 · geparkter GT 11,28 → 0,00 · Bär 9,27 → 0,17 m/s, je in
        // EINEM Frame, kein Rückprall, der Gegner bewegt sich nicht, keine Rückmeldung): der GT fährt mit W aus 9 m Anlauf
        // in der freien Gasse auf das Hindernis, das NICHT gehalten wird. Kontakt = der erste Schritt, in dem der Kontakt-
        // Löser Lage oder Fahrt nahm (`z.kontakt`, der Mitschnitt am EINEN Kontakt-Löser); gemessen: die Fahrt davor und danach, die kleinste in den 8 Schritten danach (der
        // Rückprall), der Weg des Getroffenen längs der Fahrt, die Stoß-Ereignisse (`_stossEreignis`) und der Kamera-Ruck.
        const stossProbe = async (h) => {
            if (!gasse) return null;
            const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (!gS) return null;
            const ux = Math.sin(gasse.fahrt);
            const uz = Math.cos(gasse.fahrt);
            for (const cr of (st.creatures || []).slice())
                if (
                    cr &&
                    cr.position &&
                    Math.hypot(cr.position.x - (gasse.x + ux * 8), cr.position.z - (gasse.z + uz * 8)) < 30
                )
                    r.removeCreature(cr);
            const ziel = await h.setzen(gS.position.x + ux * 9, gS.position.z + uz * 9);
            if (!ziel) {
                weg(gS);
                return null;
            }
            const p0 = h.lage(ziel);
            const m = {
                kontakt: -1,
                vVor: 0,
                vNach: 0,
                vMinNach: Infinity,
                schritte: 0,
                ereignisse: 0,
                ruck: 0,
                ohneAnnaeherung: 0,
            };
            // DIE ANNÄHERUNG je Stoß des eigenen Wagens: die Fahrt in die Berührung (vor dem Löser) gegen die Geschwindigkeit
            // des Gegners längs derselben Normalen (Leib: Steuer-Schritt + getragener Stoß; Wagen: sein Fahr-Zustand).
            let vEin = null;
            const HKroh = r._fahrHuelleKontakt;
            r._fahrHuelleKontakt = function (entry, k, x0, z0, vx, vz, ...rest) {
                const alt = vEin;
                vEin = entry === gS ? { x: vx, z: vz } : null;
                try {
                    return HKroh.call(this, entry, k, x0, z0, vx, vz, ...rest);
                } finally {
                    vEin = alt;
                }
            };
            const annaeherung = (gx, gz, nx, nz) => {
                if (vEin && !(vEin.x * nx + vEin.z * nz > gx * nx + gz * nz + 1e-6)) m.ohneAnnaeherung++;
            };
            const KSroh = r._kreaturStoss;
            r._kreaturStoss = function (c, nx, nz, dv) {
                const ud = c.userData;
                const sw = ud._steuer;
                const sv = ud._stossV;
                const v = sw && Number.isFinite(sw.v) ? sw.v : 0;
                annaeherung(
                    (v ? Math.sin(sw.gier) * v : 0) + (sv ? sv.x : 0),
                    (v ? Math.cos(sw.gier) * v : 0) + (sv ? sv.z : 0),
                    nx,
                    nz
                );
                return KSroh.call(this, c, nx, nz, dv);
            };
            const WSroh = r._fahrWagenStoss;
            r._fahrWagenStoss = function (e, G, dvx, dvz) {
                const d = Math.hypot(dvx, dvz);
                const f = e._fahr;
                const fahrt = f && Number.isFinite(f.vlong) && Number.isFinite(f.yaw);
                if (d > 0)
                    annaeherung(
                        fahrt ? f.vlong * Math.cos(f.yaw) - f.vlat * Math.sin(f.yaw) : 0,
                        fahrt ? -f.vlong * Math.sin(f.yaw) - f.vlat * Math.cos(f.yaw) : 0,
                        dvx / d,
                        dvz / d
                    );
                return WSroh.call(this, e, G, dvx, dvz);
            };
            const evRoh = r._stossEreignis;
            if (typeof evRoh === "function")
                r._stossEreignis = function (...a) {
                    m.ereignisse++;
                    return evRoh.apply(this, a);
                };
            st._landImpactPending = 0;
            const PF = r._stepFixedSim;
            let vPrev = 0;
            r._stepFixedSim = function (simTime, dt) {
                PF.call(this, simTime, dt);
                const v = st.playerVel.x() * ux + st.playerVel.z() * uz;
                m.ruck = Math.max(m.ruck, st._landImpactPending || 0);
                if (m.kontakt < 0 && vPrev > 2 && z.kontakt) {
                    m.kontakt = m.schritte;
                    m.vVor = vPrev;
                    m.vNach = v;
                    m.vMinNach = v;
                } else if (m.kontakt >= 0 && m.schritte - m.kontakt <= 8) m.vMinNach = Math.min(m.vMinNach, v);
                vPrev = v;
                m.schritte++;
            };
            tasten(true, false);
            for (let i = 0; i < 150; i++) frame(i);
            tasten(false);
            r._stepFixedSim = PF;
            if (typeof evRoh === "function") delete r._stossEreignis;
            delete r._fahrHuelleKontakt;
            delete r._kreaturStoss;
            delete r._fahrWagenStoss;
            if (!Number.isFinite(m.vMinNach)) m.vMinNach = m.vNach;
            const p1 = h.lage(ziel);
            m.zielWeg = (p1.x - p0.x) * ux + (p1.z - p0.z) * uz;
            weg(gS);
            h.weg(ziel);
            return m;
        };
        S.stossFels = await stossProbe({
            setzen: (x, zz) => {
                const b = r.spawnArchitecture(
                    "stein_block",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true }
                );
                return b && b.blockerAABBs && b.blockerAABBs.length ? b : null;
            },
            lage: (b) => ({ x: b.position.x, z: b.position.z }),
            weg: (b) => r.removeArchitecture(b),
        });
        S.stossWagen = await stossProbe({
            setzen: async (x, zz) => {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: gasse.fahrt - Math.PI / 2 }
                );
                if (!e) return null;
                const dlP = performance.now() + 45000;
                while (!e.instanced && !e.mesh && performance.now() < dlP) {
                    r._rebuildArchitectureMesh(e);
                    if (e.instanced || e.mesh) break;
                    await new Promise((r4) => setTimeout(r4, 200));
                }
                return e.blockerAABBs && e.blockerAABBs.length ? e : null;
            },
            lage: (e) => ({ x: e.position.x, z: e.position.z }),
            weg: (e) => r.removeArchitecture(e),
        });
        S.stossBaer = await stossProbe({
            setzen: (x, zz) => {
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
                // Größe 1 (die Gestalt-Masse wächst mit der Größe hoch drei: ein Bär der Größe 2 wiegt 2,7 t, mehr als der GT)
                const c = r.spawnCreatureAt(x, hh(x, zz) + 0.5, zz, "calm", "baer", { precise: true, bodySize: 1 });
                if (!c) return null;
                c.position.set(x, hh(x, zz), zz);
                c.rotation.y = gasse.fahrt + Math.PI / 2; // quer zur Fahrt, die Flanke zum Bug
                if (typeof r.assignCreatureTask === "function") r.assignCreatureTask(c, "wait");
                // Der Bär steht still (sein Hirn wählte Flucht oder Wandern mit Math.random — 07.10. kippte L5 so von
                // 7,99 → 6,07 auf 7,92 → 3,70 m/s): ein Steuer-Gesetz, dessen Schritt das Tempo nullt; nur der Stoß bewegt ihn.
                const A = Object.getPrototypeOf(r).constructor;
                if (!A.__steuerRoh) {
                    A.__steuerRoh = A._steuerGesetz;
                    const steht = Object.create(A.__steuerRoh.call(A));
                    steht.steuerSchritt = (sw) => {
                        sw.v = 0;
                    };
                    A._steuerGesetz = () => steht;
                }
                return c;
            },
            lage: (c) => ({ x: c.position.x, z: c.position.z }),
            weg: (c) => {
                const A = Object.getPrototypeOf(r).constructor;
                if (A.__steuerRoh) {
                    A._steuerGesetz = A.__steuerRoh;
                    delete A.__steuerRoh;
                }
                r.removeCreature(c);
            },
        });
        // L6 SPIELER UND WAGEN (0710-4): (a) der Spieler läuft (W) gegen die Flanke eines geparkten GT — der Stoß nimmt ihm
        // die Fahrt in den Wagen (er prallt ab, statt in die Box zu drücken), die Handbremse hält den Wagen (sie nimmt den
        // Stoß eines Menschen auf), der Spieler steckt nicht in ihm; (b) ein GT, angestoßen mit 5 m/s, rutscht auf den
        // stehenden Spieler zu — der Spieler bekommt seinen Impuls, der Wagen schiebt ihn nicht durch.
        if (gasse) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            const ux = Math.sin(gasse.fahrt);
            const uz = Math.cos(gasse.fahrt);
            const gt = async (x, zz, rotY) => {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: rotY }
                );
                const dlG = performance.now() + 45000;
                while (e && !e.instanced && !e.mesh && performance.now() < dlG) {
                    r._rebuildArchitectureMesh(e);
                    if (e.instanced || e.mesh) break;
                    await new Promise((r5) => setTimeout(r5, 200));
                }
                return e && e.blockerAABBs && e.blockerAABBs.length ? e : null;
            };
            // der Abstand der Spieler-Kapsel (r 0,35) zur Hülle des Wagens (< 0: sie steckt in ihm), längs der Gasse gemessen
            const kapselAbstand = (e) => {
                const pmP = st.playerMesh.position;
                let d = Infinity;
                for (const b of e.blockerAABBs) {
                    const ix = Math.max(b.minX - pmP.x, 0, pmP.x - b.maxX);
                    const iz = Math.max(b.minZ - pmP.z, 0, pmP.z - b.maxZ);
                    const aussen = Math.hypot(ix, iz);
                    const innen =
                        aussen > 0 ? 0 : Math.min(pmP.x - b.minX, b.maxX - pmP.x, pmP.z - b.minZ, b.maxZ - pmP.z);
                    d = Math.min(d, aussen > 0 ? aussen : -innen);
                }
                return d - 0.35;
            };
            const sw = { a: null, b: null };
            // (a) der GT quer zur Gasse 8 m voraus, der Spieler 3,5 m vor der Gasse, Blick und W längs der Gasse
            {
                const e = await gt(gasse.x + ux * 8, gasse.z + uz * 8, gasse.fahrt);
                if (e) {
                    const sx = gasse.x + ux * 3.5;
                    const sz = gasse.z + uz * 3.5;
                    st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
                    st.playerVel.setValue(0, 0, 0);
                    st._fieldVy = 0;
                    st.yaw = gasse.fahrt;
                    const p0 = { x: e.position.x, z: e.position.z };
                    const m = { minAbstand: Infinity, wagenWeg: 0, kontakt: -1, vorKontakt: 0, nachKontakt: Infinity };
                    tasten(true);
                    let vorher = 0;
                    for (let i = 0; i < 240; i++) {
                        frame(i);
                        const ab = kapselAbstand(e);
                        m.minAbstand = Math.min(m.minAbstand, ab);
                        const vU = st.playerVel.x() * ux + st.playerVel.z() * uz; // die Fahrt des Spielers in den Wagen
                        if (m.kontakt < 0 && ab <= 0.02) {
                            m.kontakt = i;
                            m.vorKontakt = vorher;
                        }
                        if (m.kontakt >= 0 && i - m.kontakt <= 10) m.nachKontakt = Math.min(m.nachKontakt, vU);
                        vorher = vU;
                    }
                    tasten(false);
                    for (let i = 0; i < 60; i++) frame(240 + i);
                    m.wagenWeg = Math.hypot(e.position.x - p0.x, e.position.z - p0.z);
                    r.removeArchitecture(e);
                    sw.a = m;
                }
            }
            // (b) der GT längs der Gasse, sein Bug 0,8 m vor dem stehenden Spieler; ein Stoß von 5 m/s gegen den Spieler
            {
                const sx = gasse.x + ux * 1.5;
                const sz = gasse.z + uz * 1.5;
                const e = await gt(gasse.x + ux * 5.2, gasse.z + uz * 5.2, gasse.fahrt - Math.PI / 2);
                if (e) {
                    st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
                    st.playerVel.setValue(0, 0, 0);
                    st._fieldVy = 0;
                    tasten(false);
                    for (let i = 0; i < 20; i++) frame(i); // der Spieler steht
                    const G = r._fahrStossSatz(e);
                    const m = { minAbstand: Infinity, spielerDv: 0, angestossen: !!G };
                    if (G) r._fahrWagenStoss(e, G, -ux * 5, -uz * 5);
                    for (let i = 0; i < 180; i++) {
                        frame(20 + i);
                        m.minAbstand = Math.min(m.minAbstand, kapselAbstand(e));
                        m.spielerDv = Math.max(m.spielerDv, Math.hypot(st.playerVel.x(), st.playerVel.z()));
                    }
                    r.removeArchitecture(e);
                    sw.b = m;
                }
            }
            S.spielerWagen = sw;
        }
        // L7 DER GESTOSSENE LEIB VOR DÜNNER WAND (0710-5): ein Bär (Größe 1, sein Steuer-Schritt steht) 3 m vor einer 0,35 m
        // dünnen Wand wird mit 13,7 m/s gegen sie gedrückt (ein Wagen, der nachschiebt: 45 Frames je Frame neu gesetzt) — je
        // Kadenz (60 fps, 30 fps, gemischte Frames 8–33 ms)
        // zehn Versuche, Start-Abstand (über einen Frame-Weg), Lage quer und Phase des Akkumulators je Versuch versetzt. Gezählt: wie oft die Mitte des
        // Bären hinter die Wand gerät. Vorher (der Stoß im Frame-Takt ohne Weg-Prüfung) 30 fps 9/10, gemischt 9/10.
        // L8 LOCKSTEP (0710-5): ein GT (W) gegen einen stehenden Bären, die Lage des Wagens nach genau 200 Sim-Schritten bei
        // 60 fps und bei gemischten Frames — sie muss gleich sein (der Stoß des Leibs lebt im festen Schritt).
        if (start && gasse) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            const A = Object.getPrototypeOf(r).constructor;
            const steuerRoh = A._steuerGesetz;
            const steht = Object.create(steuerRoh.call(A));
            steht.steuerSchritt = (sw2) => {
                sw2.v = 0;
            };
            const KADENZ = { 60: [1000 / 60], 30: [1000 / 30], gemischt: [8, 33, 16, 25, 12, 30, 20, 9, 33, 14] };
            const lauf = (muster, n, nachJedem) => {
                for (let i = 0; i < n; i++) {
                    tMs += muster[i % muster.length];
                    r._gameLoopTick(tMs);
                    if (nachJedem && nachJedem(i) === false) break;
                }
            };
            A._steuerGesetz = () => steht;
            try {
                // L7
                const wx = start.x + 14;
                const wz = start.z;
                const g = hh(wx, wz);
                const wand = r.spawnArchitecture(
                    "stein_block",
                    { x: wx, y: g + 0.5, z: wz },
                    { silent: true, precise: true }
                );
                if (wand) {
                    const platte = () => {
                        wand.blockerAABBs = [
                            {
                                minX: wx - 0.175,
                                maxX: wx + 0.175,
                                minZ: wz - 2,
                                maxZ: wz + 2,
                                botY: g - 0.5,
                                topY: g + 3,
                                dick: 3.5,
                            },
                        ];
                        wand._blockerReach = 3;
                    };
                    // der Spieler steht zu Fuß neben der Probe (die Tiere ticken im Nah-Band)
                    st.playerMesh.position.set(wx - 4, hh(wx - 4, wz + 6) + 1.2, wz + 6);
                    st.playerVel.setValue(0, 0, 0);
                    tasten(false);
                    const L7 = {};
                    for (const [name, muster] of Object.entries(KADENZ)) {
                        let durch = 0;
                        let n = 0;
                        let tiefstX = -Infinity;
                        for (let v = 0; v < 10; v++) {
                            platte();
                            const bz = wz - 0.9 + v * 0.2;
                            // der Start-Abstand je Versuch um 4,5 cm versetzt: zehn Versuche decken einen ganzen Frame-Weg (30 fps,
                            // ~0,45 m) — durch geht nur, wessen vordere Achse im Sprung über die Wandmitte kommt, ein Fenster von cm
                            st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1); // die Probe braucht ihren Bären
                            const bx = wx - 0.175 - 3 - v * 0.045;
                            const b = r.spawnCreatureAt(bx, hh(bx, bz) + 0.5, bz, "calm", "baer", {
                                precise: true,
                                bodySize: 1,
                            });
                            if (!b) continue;
                            b.position.set(bx, hh(bx, bz), bz);
                            b.rotation.y = Math.PI / 2;
                            b.userData._steuer = { gier: Math.PI / 2, v: 0 };
                            b.userData._stossV = null;
                            lauf([1 + v * 1.3], 1); // die Phase des Akkumulators je Versuch
                            b.userData._stossV = { x: 13.7, z: 0 };
                            let maxX = -Infinity;
                            // der Stoß DRÜCKT wie ein Wagen, der nachschiebt: je Frame neu 13,7 m/s gegen die Wand (die Gegenprüfung:
                            // Bär vor der Wand, Wagen 13,7 m/s) — liegt der Leib an der Wand, beginnt jeder Frame mit der Achse an ihr
                            lauf(muster, 90, (i) => {
                                maxX = Math.max(maxX, b.position.x);
                                if (i < 45) b.userData._stossV = { x: 13.7, z: 0 };
                            });
                            n++;
                            tiefstX = Math.max(tiefstX, maxX - (wx + 0.175));
                            if (maxX > wx + 0.175) durch++;
                            r.removeCreature(b);
                        }
                        L7[name] = { durch, n, ueber: +tiefstX.toFixed(3) };
                    }
                    r.removeArchitecture(wand);
                    S.leibWand = L7;
                }
                // L8
                const ux = Math.sin(gasse.fahrt);
                const uz = Math.cos(gasse.fahrt);
                const lockProbe = async (muster) => {
                    const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
                    if (!gS) return null;
                    const bx = gasse.x + ux * 9;
                    const bz = gasse.z + uz * 9;
                    st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
                    // die Gasse frei von anderen Tieren (dieselbe Räumung wie die Stoß-Proben)
                    for (const cr of (st.creatures || []).slice())
                        if (cr && cr.position && Math.hypot(cr.position.x - bx, cr.position.z - bz) < 30)
                            r.removeCreature(cr);
                    const b = r.spawnCreatureAt(bx, hh(bx, bz) + 0.5, bz, "calm", "baer", {
                        precise: true,
                        bodySize: 1,
                    });
                    if (!b) {
                        weg(gS);
                        return null;
                    }
                    b.position.set(bx, hh(bx, bz), bz);
                    b.rotation.y = gasse.fahrt + Math.PI / 2;
                    b.userData._steuer = { gier: b.rotation.y, v: 0 };
                    b.userData._stossV = null;
                    st._fixedAccumulator = 0;
                    const PF = r._stepFixedSim;
                    let schritte = 0;
                    let lage = null;
                    const spur = [];
                    r._stepFixedSim = function (simTime, dt) {
                        PF.call(this, simTime, dt);
                        schritte++;
                        {
                            const sv = b.userData._stossV;
                            const pmT = st.playerMesh.position;
                            spur.push([
                                pmT.x,
                                pmT.z,
                                b.position.x,
                                b.position.z,
                                b.position.y,
                                sv ? Math.hypot(sv.x, sv.z) : 0,
                            ]);
                        }
                        // die Sim-Lage des Reiters (im Schritt die Wahrheit; die Lage des Werks folgt ihr je Frame)
                        const pmS = st.playerMesh.position;
                        if (schritte === 200) lage = { x: pmS.x, z: pmS.z, bx: b.position.x, bz: b.position.z };
                    };
                    tasten(true);
                    try {
                        lauf(muster, 2000, () => lage === null);
                    } finally {
                        r._stepFixedSim = PF;
                        tasten(false);
                    }
                    weg(gS);
                    r.removeCreature(b);
                    if (lage) lage.spur = spur;
                    return lage;
                };
                const l60 = await lockProbe(KADENZ[60]);
                const lMix = await lockProbe(KADENZ.gemischt);
                // der erste Schritt, in dem die Läufe auseinandergehen, und die Größe, die zuerst abweicht (die Linse nennt sie)
                let erst = null;
                if (l60 && lMix) {
                    const namen = ["Wagen x", "Wagen z", "Bär x", "Bär z", "Bär y", "Bär Stoß"];
                    for (let i = 0; i < Math.min(l60.spur.length, lMix.spur.length) && !erst; i++)
                        for (let k = 0; k < namen.length; k++)
                            if (l60.spur[i][k] !== lMix.spur[i][k]) {
                                erst = {
                                    schritt: i + 1,
                                    groesse: namen[k],
                                    d: +(lMix.spur[i][k] - l60.spur[i][k]).toFixed(5),
                                };
                                break;
                            }
                }
                S.lockstep =
                    l60 && lMix
                        ? {
                              abw: +Math.hypot(l60.x - lMix.x, l60.z - lMix.z).toFixed(6),
                              baerAbw: +Math.hypot(l60.bx - lMix.bx, l60.bz - lMix.bz).toFixed(6),
                              erst,
                          }
                        : null;
            } finally {
                A._steuerGesetz = steuerRoh;
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
            huelleBlock: { tief: 0.0, abstand: 0.02 },
            huelleSchub: { weg: 0 },
            huelleHang: { schub: 0.8, eindringen: 0 },
            huelleBaer: { tief: 0.01, abstand: 0.0 },
            huelleHaus: { tief: 0.0, abstand: 0.4, nah: 0.02 },
            huelleTeil: { tief: 0.0, abstand: 0.2, nah: 0.03 },
            pflicht: { satz: "bruch", ebene: "bruch" },
            hangfuss: { ziel: true, kontakte: 4, unterMax: 0.12, unterN: 2, schubMax: 0.17, weg: 21 },
            spalt: { rand: 32.4, grund: 15, xMax: -896, yMin: 18 },
            stossFels: { kontakt: 40, vVor: 6.5, vNach: -1.3, vMinNach: -1.3, ereignisse: 1, ruck: 3, zielWeg: 0 },
            stossWagen: { kontakt: 40, vVor: 6.5, vNach: 2.3, vMinNach: 2.3, ereignisse: 1, ruck: 3, zielWeg: 2.1 },
            stossBaer: { kontakt: 40, vVor: 6.5, vNach: 5.0, vMinNach: 5.0, ereignisse: 1, ruck: 2, zielWeg: 3.2 },
            spielerWagen: {
                a: { minAbstand: 0, wagenWeg: 0.002, kontakt: 100, vorKontakt: 4.2, nachKontakt: -0.1 },
                b: { minAbstand: 0, spielerDv: 3.2, angestossen: true },
            },
            leibWand: { 60: { durch: 0, n: 10 }, 30: { durch: 0, n: 10 }, gemischt: { durch: 0, n: 10 } },
            lockstep: { abw: 0, baerAbw: 0 },
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
                { spalt: { rand: 32.4, grund: 15, xMax: -904.09, yMin: 32.42 } },
                "spalt-wand",
            ],
            ["Spalt ohne Spalt (vakuös)", { spalt: { rand: 32.4, grund: 31, xMax: -896, yMin: 18 } }, "spalt vakuös"],
            [
                "Fels: 10,41 → 0,16 m/s in EINEM Frame, kein Rückprall (Leben-Schau 07.10.)",
                {
                    stossFels: {
                        kontakt: 40,
                        vVor: 10.41,
                        vNach: 0.16,
                        vMinNach: 0.16,
                        ereignisse: 1,
                        ruck: 3,
                        zielWeg: 0,
                    },
                },
                "stoss-fels: kein Rückprall",
            ],
            [
                "geparkter GT: 11,28 → 0,00 m/s, er bewegt sich nicht (Leben-Schau 07.10.)",
                {
                    stossWagen: { kontakt: 40, vVor: 11.28, vNach: 0, vMinNach: 0, ereignisse: 1, ruck: 3, zielWeg: 0 },
                },
                "stoss-wagen: der geparkte GT bewegt sich",
            ],
            [
                "Bär: 9,27 → 0,17 m/s, der Bär bewegt sich nicht (Leben-Schau 07.10.)",
                {
                    stossBaer: {
                        kontakt: 40,
                        vVor: 9.27,
                        vNach: 0.17,
                        vMinNach: 0.17,
                        ereignisse: 1,
                        ruck: 2,
                        zielWeg: 0,
                    },
                },
                "stoss-baer: der Bär bewegt sich",
            ],
            [
                "Stoß ohne Ereignis (keine Kamera, kein Klang)",
                {
                    stossFels: {
                        kontakt: 40,
                        vVor: 6.5,
                        vNach: -1.3,
                        vMinNach: -1.3,
                        ereignisse: 0,
                        ruck: 0,
                        zielWeg: 0,
                    },
                },
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
                        a: { minAbstand: 0, wagenWeg: 0, kontakt: 100, vorKontakt: 4.2, nachKontakt: 4.1 },
                        b: { minAbstand: -0.6, spielerDv: 0, angestossen: true },
                    },
                },
                "spieler-wagen",
            ],
            [
                "der gestoßene Bär geht bei 30 fps durch die Wand (Gegenprüfung 0710-5: 9/10)",
                { leibWand: { 60: { durch: 0, n: 10 }, 30: { durch: 9, n: 10 }, gemischt: { durch: 0, n: 10 } } },
                "leib-wand 30",
            ],
            [
                "der Wagen steht je nach Bildrate anders (Gegenprüfung 0710-5: 0,06 m nach 200 Schritten)",
                { lockstep: { abw: 0.06, baerAbw: 0 } },
                "lockstep",
            ],
            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",
                { lockstep: { abw: 0, baerAbw: 1.39 } },
                "lockstep",
            ],
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
            ["Bug 1,85 m im Fels (F-D4)", { huelleBlock: { tief: 1.85, abstand: 0 } }, "huelle-fels Eindringen"],
            [
                "die starre Instanz: kein Rad-Leaf (F-D8)",
                { raeder: { leaves: 0, rolle: 0, lenk: 0, lenkHinten: 0, tauchBremse: 0.0, spaltP75: 0.01 } },
                "raeder starr",
            ],
            [
                "Vorderräder 0,09 m im Boden beim Bremsen (F-D8)",
                {
                    raeder: {
                        leaves: 4,
                        stehend: 4,
                        stehRolle: 0,
                        rolle: 12,
                        lenk: 0.4,
                        lenkHinten: 0,
                        tauchBremse: 0.09,
                        spaltP75: 0.01,
                    },
                },
                "raeder tauchen",
            ],
            [
                "die Räder lenken nicht (F-D8)",
                {
                    raeder: {
                        leaves: 4,
                        stehend: 4,
                        stehRolle: 0,
                        rolle: 12,
                        lenk: 0,
                        lenkHinten: 0,
                        tauchBremse: 0,
                        spaltP75: 0.01,
                    },
                },
                "raeder lenken nicht",
            ],
            [
                "der Bremssattel rollt mit dem Rad (Gegenprüfung 07.10.)",
                {
                    raeder: {
                        leaves: 4,
                        stehend: 4,
                        stehRolle: 3.1,
                        rolle: 12,
                        lenk: 0.4,
                        lenkHinten: 0,
                        tauchBremse: 0,
                        spaltP75: 0.01,
                    },
                },
                "raeder Sattel rollt",
            ],
            [
                "kein Sattel an der Nabe",
                {
                    raeder: {
                        leaves: 4,
                        stehend: 0,
                        stehRolle: 0,
                        rolle: 12,
                        lenk: 0.4,
                        lenkHinten: 0,
                        tauchBremse: 0,
                        spaltP75: 0.01,
                    },
                },
                "raeder ohne Sattel",
            ],
            ["der Bär ganz im Wagen (F-L5)", { huelleBaer: { tief: 1.6, abstand: 0 } }, "huelle-baer Eindringen"],
            [
                "der Wagen hält an der Welt-AABB des gedrehten Hauses, 1,5 m vor der Wand (D5)",
                { huelleHaus: { tief: 0, abstand: 1.5, nah: 1.5 } },
                "huelle-haus keine Berührung",
            ],
            [
                "der Bug in der gedrehten Wand",
                { huelleHaus: { tief: 0.4, abstand: 0, nah: 0 } },
                "huelle-haus Eindringen",
            ],
            [
                "der Wagen hält vor der Welt-AABB einer gedrehten Teil-Box, 2,2 m vor dem Teil (D5)",
                { huelleTeil: { tief: 0, abstand: 2.2, nah: 2.2 } },
                "huelle-teil keine Berührung",
            ],
            [
                "der Bug in der gedrehten Teil-Box",
                { huelleTeil: { tief: 0.5, abstand: 0, nah: 0 } },
                "huelle-teil Eindringen",
            ],
            [
                "der Wagen hält am zweiten Kreis (separation × bodySize), 0,8 m vor dem Leib (D2)",
                { huelleBaer: { tief: 0, abstand: 0.8 } },
                "huelle-baer keine Berührung",
            ],
            ["nie berührt (vakuös)", { huelleBlock: { tief: 0, abstand: 6.5 } }, "huelle-fels keine Berührung"],
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
        ]) {
            const v = stationVerdict(Object.assign({}, gutS, bruch));
            check(
                `Selbst-Test S: ‚${name}' → die Linse nennt ${soll}`,
                v.length >= 1 && v[0].startsWith(soll),
                v.join(" · ")
            );
        }
        // Die statischen Wände feuern auf den Vor-Stand.
        const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const garage = fs.readFileSync(path.join(root, "worlds/garage/garage.js"), "utf8");
        const kern = fs.readFileSync(path.join(root, "vehicle-core.js"), "utf8");
        const gruen = taktWand(quelle);
        check(
            "Selbst-Test W: der Arbeitsbaum ist grün",
            gruen.every((w) => w[1]),
            gruen
                .filter((w) => !w[1])
                .map((w) => w[0])
                .join(" | ")
        );
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
        check(
            "Selbst-Test K1: der Arbeitsbaum ist grün",
            kGruen.every((w) => w[1]),
            kGruen
                .filter((w) => !w[1])
                .map((w) => w[0])
                .join(" | ")
        );
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
            pGruen
                .filter((w) => !w[1])
                .map((w) => w[0] + " " + w[2])
                .join(" | ")
        );
        const hGruen = huelleWand(quelle);
        check(
            "Selbst-Test H5: der Arbeitsbaum ist grün",
            hGruen.every((w) => w[1]),
            hGruen.map((w) => w[2]).join(" | ")
        );
        const hRot = huelleWand(
            quelle.replace(
                /(\n {4}_fahrHuelleKontakt\([^)]*\) \{)/,
                "$1\n        for (let pl = 0; pl < AnazhRealm.SLIDE_CLIP_PLANES; pl++) break;"
            )
        );
        check("Selbst-Test H5: der Vor-Stand (eine zweite Schleife in der Hülle) → H5 feuert", !hRot[0][1], hRot[0][2]);
        // der Vor-Stand von D2: der Wagen-Kontakt rechnet den Kreis VERHALTEN.separation × bodySize statt des Leibs
        const h6Rot = huelleWand(
            quelle.replace(
                /(\n {4}_fahrHuelleKontakt\([^)]*\) \{)/,
                "$1\n        const SEP = AnazhRealm._verhaltenGesetz().separation;\n        const rcAlt = 0.5 * SEP.radiusBaseM;"
            )
        );
        check(
            "Selbst-Test H6: der Vor-Stand (der zweite Kreis im Wagen-Kontakt, D2) → H6 feuert",
            !h6Rot[1][1],
            h6Rot[1][2]
        );
        // der Vor-Stand von D5: der Löser der Hülle liest die Welt-AABB (kein box.obb)
        const h7Rot = huelleWand(
            quelle.replace(/\n {4}_resolveHuelleVsAABB\([^)]*\) \{[\s\S]*?\n {4}\}/, (m) =>
                m.replace(/\bbox\.obb\b/g, "box.aabb")
            )
        );
        check(
            "Selbst-Test H7: der Vor-Stand (der Löser der Hülle ohne box.obb, D5) → H7 feuert",
            !h7Rot[2][1],
            h7Rot[2][2]
        );
        // der Vor-Stand der zweiten Rolle: die Teil-Box ohne obb (die Welt-AABB jedes gedrehten Teils)
        const h8Rot = huelleWand(
            quelle.replace(/\n {4}_blockerComputePartAABB\([^)]*\) \{[\s\S]*?\n {4}\}/, (m) =>
                m.replace(/\bobb:\s*\{/g, "aabbAlt: {")
            )
        );
        check(
            "Selbst-Test H8: der Vor-Stand (gedrehte Teile als Welt-AABB, D5) → H8 feuert",
            !h8Rot[3][1],
            h8Rot[3][2]
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
        console.log(
            "\n✅ SELBST-TEST GRÜN — die Fahr-Linse nennt Teleport, Weg, Luft, Gier, Halt, Kopie, Sprung und Querhang beim Namen."
        );
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
    // der Messort der Mess-Wiese (spec/profiband/haushalt.json `messorte`, S1 W1f) — derselbe Leser wie gate:vehicle-drive B-e
    const messort = require("./lib/band-urteil.cjs").ladeSpec("wiese").ort.spieler;
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
            ? `Bahn geräumt ${S.klippe.geraeumt} · Fall ${S.klippe.fall.toFixed(1)} m bei (${S.klippeOrt.x}, ${S.klippeOrt.z}) · größter Sprung ${S.klippe.sprung.toFixed(2)} m · Luft ${S.klippe.luft}/${S.klippe.schritte} · danach ${S.klippe.ueberGrund.toFixed(2)} m über dem Grund`
            : vS.join(" · ")
    );
    check(
        "S4 Absteigen im Flug: der Wagen fällt ballistisch auf seinen Boden und steht dort (nie in der Luft, kein Sprung)",
        !hat("kern") && !hat("absteigen"),
        S.absteigen
            ? `Bahn geräumt ${S.absteigen.geraeumt} · abgestiegen ${S.absteigen.hoehe.toFixed(2)} m über dem Boden (im Flug ${S.absteigen.imFlug}) · nach 240 Frames ${S.absteigen.ueberBoden.toFixed(3)} m über der Ebene seiner Räder · größter Sprung ${S.absteigen.sprung.toFixed(2)} m`
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
        R
            ? `Eintauchen beim Bremsen ${R.tauchBremse.toFixed(3)} m · Rad-Spalt p75 ${R.spaltP75.toFixed(3)} m (max ${R.spaltMax.toFixed(3)})` +
                  ` · gegen den GEZEICHNETEN Boden (Sicht, nur gemessen — D1): ${
                      R.sichtSchritte
                          ? `p75 ${R.sichtP75.toFixed(3)} m, max ${R.sichtMax.toFixed(3)} m in ${R.sichtSchritte} Schritten`
                          : "keine Boden-Karte"
                  }`
            : "keine Probe"
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
        "H2 der GT fährt mit W gegen die Flanke eines Bären: die Hülle hält an SEINEM Leib (`_kreaturLeib`, D2 — Eindringen ≤ 0,05 m, Berührung ≤ 0,3 m)",
        !hat("kern") && !hat("huelle-baer"),
        hz(S.huelleBaer, "baer") +
            (S.huelleBaer && S.huelleBaer.leib
                ? ` · Leib: Radius ${S.huelleBaer.leib.radius.toFixed(2)} m, Achsen ±${S.huelleBaer.leib.halb.toFixed(2)} m (der Kreis vor D2: ${S.huelleBaer.leib.kreis.toFixed(2)} m)`
                : "")
    );
    check(
        "H3 ein Bär steht 0,5 m im Bug des stehenden Wagens: der Wagen bleibt stehen (ein Wesen schiebt keinen Wagen)",
        !hat("kern") && !hat("huelle-schub"),
        S.huelleSchub ? `Weg des Wagens in 60 Frames ${S.huelleSchub.weg.toFixed(3)} m` : "keine Probe"
    );
    check(
        "H4 ein Kasten schiebt die Hülle zur Gelände-Wand: sie dringt nie ins Gelände (die echte Methode, synthetische Welt)",
        !hat("kern") && !hat("huelle-hang"),
        S.huelleHang
            ? `Schub des Kastens ${S.huelleHang.schub.toFixed(2)} m · Eindringen in die Wand ${S.huelleHang.eindringen.toFixed(3)} m`
            : "keine Probe"
    );
    const H7 = S.huelleHaus;
    check(
        "H7 der GT fährt mit W gegen eine 34° gedrehte Haus-Wand: die Hülle hält an der ECHTEN Wand (Berührung ≤ 0,3 m, Eindringen ≤ 0,05 m), nicht an ihrer Welt-AABB",
        !hat("kern") && !hat("huelle-haus"),
        H7
            ? `kleinster Abstand zur Wand ${H7.nah.toFixed(3)} m · Eindringen ${H7.tief.toFixed(3)} m · am Ende ${H7.abstand.toFixed(3)} m · ${H7.vorn.toFixed(1)} m gefahren · ${H7.schritte} Schritte`
            : "keine Probe (Haus-Wand)"
    );
    const H8 = S.huelleTeil;
    check(
        "H8 der GT fährt mit W gegen eine 34° gedrehte Mauer aus EINEM Teil (die Teil-Box jedes Hindernisses — Wagen, Fels, Tor, Bauwerk): die Hülle hält am ECHTEN Teil (Berührung ≤ 0,3 m, Eindringen ≤ 0,05 m), nicht an seiner Welt-AABB",
        !hat("kern") && !hat("huelle-teil"),
        H8
            ? `kleinster Abstand zum Teil ${H8.nah.toFixed(3)} m · Eindringen ${H8.tief.toFixed(3)} m · am Ende ${H8.abstand.toFixed(3)} m · ${H8.vorn.toFixed(1)} m gefahren · ${H8.schritte} Schritte`
            : "keine Probe (gedrehte Teil-Box)"
    );
    for (const [name, ok, detail] of huelleWand(quelle)) check(name, ok, detail);
    console.log("=== L — DIE ORTE DER LEBEN-SCHAU (Auftrag 0710-2), echter Sim-Schritt ===");
    const L1 = S.hangfuss;
    check(
        "L1 Hangfuß (−852/−861,2, 9,3 m/s, Gier 92,3°, die Box des Glutbrunnens): nach JEDER Kontakt-Antwort steht der Wagen auf dem Gesetz (≤ 0,2 m unter der Ebene seiner Räder, ≤ 3 Schritte), der Schub je Schritt ≤ 0,2 m über die eigene Fahrt, er fährt weiter",
        !hat("kern") && !hat("hangfuss"),
        L1
            ? `unter dem Gesetz höchstens ${L1.unterMax.toFixed(3)} m (${L1.unterN} Schritte > 0,05 m) · größter Schub ${L1.schubMax.toFixed(3)} m · ${L1.kontakte} Kontakt-Schritte · ${L1.weg.toFixed(1)} m gefahren`
            : "keine Probe"
    );
    const L2 = S.spalt;
    check(
        "L2 Spaltkante (−904/−975, 11,4 m/s in +x): der Wagen fährt über die Kante und FÄLLT (keine unsichtbare Wand)",
        !hat("kern") && !hat("spalt"),
        L2
            ? `Rand ${L2.rand.toFixed(1)} m, Grund ${L2.grund.toFixed(1)} m · bis x ${L2.xMax.toFixed(2)} · tiefste Höhe ${L2.yMin.toFixed(2)} m · größter Schub ${L2.schubMax.toFixed(3)} m · ${L2.weg.toFixed(1)} m gefahren`
            : "keine Probe"
    );
    const z2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
    const sz = (m) =>
        m
            ? `Fahrt ${z2(m.vVor)} → ${z2(m.vNach)} m/s (kleinste danach ${z2(m.vMinNach)}) · Gegner ${z2(m.zielWeg)} m · ${m.ereignisse} Stoß-Ereignisse · Kamera-Ruck ${z2(m.ruck)} · ohne Annäherung ${m.ohneAnnaeherung}`
            : "keine Probe";
    check(
        "L3 Stoß am Fels (der Baum der Schau: 10,41 → 0,16 m/s): der Wagen prallt zurück (≤ −0,3 m/s), Kamera und Klang hören den Stoß",
        !hat("kern") && !hat("stoss-fels"),
        sz(S.stossFels)
    );
    check(
        "L4 Stoß an den geparkten GT (Schau: 11,28 → 0,00): er bekommt seinen Impuls und rutscht (≥ 0,3 m), der stoßende behält Fahrt (≥ 20 %)",
        !hat("kern") && !hat("stoss-wagen"),
        sz(S.stossWagen)
    );
    check(
        "L5 Stoß an den Bären (Schau: 9,27 → 0,17): der Bär bekommt seinen Impuls (≥ 0,5 m), der schwerere Wagen behält Fahrt (≥ 50 %)",
        !hat("kern") && !hat("stoss-baer"),
        sz(S.stossBaer)
    );
    const swz = S.spielerWagen || {};
    check(
        "L6 Spieler und Wagen (0710-4): der laufende Spieler prallt am gebremsten GT ab (der Wagen hält), ein rutschender GT stößt den stehenden Spieler — Impuls nach Masse, keine Durchdringung",
        !hat("kern") && !hat("spieler-wagen") && !hat("wagen-spieler"),
        swz.a && swz.b
            ? `Spieler → GT: Fahrt in den Wagen ${swz.a.vorKontakt.toFixed(2)} → ${swz.a.nachKontakt.toFixed(2)} m/s, Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m · GT → Spieler: Spieler ${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung ${swz.b.minAbstand.toFixed(3)} m`
            : "keine Probe"
    );
    const lwz = S.leibWand || {};
    const lwT = (k) =>
        lwz[k] ? `${k}: ${lwz[k].durch}/${lwz[k].n} durch (am weitesten ${lwz[k].ueber} m hinter der Wand)` : k + " –";
    check(
        "L7 der gestoßene Leib vor dünner Wand (0710-5): 13,7 m/s gegen 0,35 m — bei 60 fps, 30 fps und gemischten Frames geht er nie hindurch",
        !hat("kern") && !hat("leib-wand"),
        ["60", "30", "gemischt"].map(lwT).join(" · ")
    );
    check(
        "L8 Lockstep (0710-5): der Wagen steht nach 200 Sim-Schritten gegen einen Bären bei 60 fps und gemischten Frames an derselben Stelle",
        !hat("kern") && !hat("lockstep"),
        S.lockstep
            ? `Abweichung Wagen ${S.lockstep.abw} m · Bär ${S.lockstep.baerAbw} m${S.lockstep.erst ? ` · zuerst Schritt ${S.lockstep.erst.schritt}: ${S.lockstep.erst.groesse} ${S.lockstep.erst.d}` : ""}`
            : "keine Probe"
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
