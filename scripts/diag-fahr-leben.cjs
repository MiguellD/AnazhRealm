// diag-fahr-leben.cjs — DIE FAHR-LINSE DES LEBENS (Welle L, Familie fahren): sie fährt den Ritt durch den ECHTEN
// Spiel-Takt (`_gameLoopTick` — Akkumulator, Sim-Schritte, Interpolation, Frame-Tick), nie an ihm vorbei, und sie ruft
// den Fahr-Schritt des Kerns selbst (vehicle-core), nie einen Nachbau. Befund 06.10.
// (artifacts/profiband/leben/befund-fahren-gelaende.md +
// artifacts/profiband/leben/karte-fahren-gelaende.md, sichtbar gespielt auf der Radeon):
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
//   F (K12) — DIE FAHR-BAHN, im zweiten Boot derselben Linse (die Fahr-Bahn-Linse der Leben-Schau 2 ging hier auf): der
//       Platz an jedem Tor des Genesis-Rings und am Vorschau-GT, rückwärts aus dem Stand, die Befreiung nach dem Stoß, die
//       Natur-Wand um den Wagen, Tacho, Stimme und Tasten — die Zeilen FK…F7 stehen am Block `BAHN`.
//
//   node scripts/diag-fahr-leben.cjs [--selftest]          Port: FAHR_LEBEN_PORT (Standard 4413)
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.FAHR_LEBEN_PORT || 4413);
const root = path.resolve(__dirname, "..");

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
const ohneKommentare = stammLib.ohneKommentare;
// der EINE Rumpf-Schneider (scripts/lib/stamm.cjs): der Block an der Definition, nie am ersten Text-Treffer
function fnBody(src, kopf) {
    return stammLib.rumpf(src, kopf);
}
function taktWand(src) {
    const nc = ohneKommentare(src);
    const sim = fnBody(nc, /\n {4}_stepFixedSim\([^)]*\) \{/);
    const frame = fnBody(nc, /\n {4}_tickMountedMovement\([^)]*\) \{/);
    const ritt = fnBody(nc, /\n {4}_rittSchritt\([^)]*\) \{/);
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
    const lpm = fnBody(st, /\n {4}_loopPlayerMovement\([^)]*\) \{/) || "";
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
    const kapsel = fnBody(st, /\n {4}_stepCharacter\([^)]*\) \{/) || "";
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
    // S4: die Flug-Höhe der Station (Räder über dem Grund), ab der abgestiegen wird — 10× die Stand-Toleranz: ein Wagen, der in
    // der Luft hängen bliebe, steht dort sichtbar über ihr. Die Landform (K16) trägt an der Wiese einen Hang von 3,7 m: der Wagen
    // fliegt 87 Takte, höchstens 0,69 m über dem Grund (die 1 m davor fand nur die 8,5-m-Klippe der alten Welt).
    flugM: 0.5,
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
    wagenHaltM: 0.05, // m: so weit rutscht ein gebremster GT höchstens, wenn ein Mensch gegen ihn läuft
    lockstepM: 1e-6, // m: so weit dürfen Wagen und Bär nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)
    sitzM: 0.03, // m: so weit dürfen die Oberschenkel über oder in der Sitzfläche liegen (0710-4 Klasse 4)
    ankerM: 0.05, // m: so weit darf das Hüftgelenk neben dem Sitz-Anker stehen
    blickGrad: 5, // °: so weit darf der sitzende Leib neben die Fahrt schauen
    schwimmTiefM: 0.25, // m: so tief darf ein gleitender Schwimmer unter seiner Schwimm-Linie liegen (die Wellen ±0,2)
    hautAussen: 0.005, // Anteil der Haut des Reiters, der je Richtung außerhalb der Hülle des Wagens liegen darf
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
            out.push(
                `hangfuss-schub: der Kontakt-Löser versetzt den Wagen in EINEM Schritt ${hf.schubMax.toFixed(2)} m`
            );
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
    // L9 DER REITER IM WAGEN (0710-4 Klasse 4)
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
    else if (s.lockstep.ruhe !== true)
        out.push(`lockstep start: der Wagen kommt vor der Probe nicht zur Ruhe (600 Bilder, der Fahr-Zustand nie drei Bilder lang ≤ 1 nm; zuletzt ${(s.lockstep.unruhe || []).join(" / ")})`);
    else if (s.lockstep.gleicherStart !== true)
        out.push(`lockstep start: die Läufe beginnen an verschiedenen Ständen des ruhenden Wagens (${s.lockstep.startAbw} > 1e-7)`);
    else if (!(s.lockstep.abw <= STATION.lockstepM) || !(s.lockstep.baerAbw <= STATION.lockstepM))
        out.push(
            `lockstep: nach 200 Sim-Schritten steht der Wagen bei gemischten Frames ${s.lockstep.abw.toFixed(3)} m anders als bei 60 fps (Bär ${s.lockstep.baerAbw.toFixed(3)} m)${s.lockstep.erst ? ` — zuerst in Schritt ${s.lockstep.erst.schritt}: ${s.lockstep.erst.groesse} um ${s.lockstep.erst.d}${s.lockstep.erst.tiere ? ` (Tiere nahe dem Wagen ${s.lockstep.erst.tiere.join(" / ")})` : ""}` : ""}`
        );
    // L2 DIE SPALTKANTE (0710-2): der Wagen fährt über die Kante und fällt.
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

const server = statikServer();

const { probeLeben } = require("./lib/fahr-proben.cjs");

// ════ F — DIE FAHR-BAHN (K12; Leben-Schau 2 #6 und Auge 06 — die Fahr-Bahn-Linse der Schau geht hier auf) ════
// Der Wagen, den die Welt hinstellt, steht auf fahrbarem Grund, kommt rückwärts und nach einem Stoß frei, zeigt sein
// Tempo und klingt. Befund (artifacts/profiband/leben-schau-2/befund.md §2 Spur B, §6 #6): der Vorschau-GT klebte 38–40°
// gekippt am Fels hinter dem Garage-Tor, rückwärts kam er 0,1 m in 2,5 s, jede Befreiung brachte −0,7 km/h, die Fahrt war
// stumm, ohne Tacho, ihre Tasten fehlten in der Hilfe. Eigenes Boot (Takt-Zähler statt Wanduhr):
//   FK  (Node, der Kern) RÜCKWÄRTS AUS DEM STAND: jedes Rezept fährt S (und S + Gegenlenkung je Seite) 2,5 s eben, 10° und
//       15° bergauf ≥ 3 m.
//   FK2 (Node) DIE DREHZAHL ÜBER 0…vmax: klang:FAHRT trägt sie vom Leerlauf (v 0) zum Begrenzer (vmax), steigt in jedem
//       Gang, der Motor-Ton ist die Zünd-Folge U/min/60 · Zylinder/2.
//   F1  DER PLATZ AN JEDEM TOR des Genesis-Rings: die Welt stellt den GT an den Wunsch-Ort der Vorschau (`_portalVorschauOrt`,
//       spawnArchitecture autonomous wie die Vorschau; alle zugleich); nach 1 s Welt (die Wald-Schlange setzt ihre Würfe):
//       Neigung der Rad-Ebene ≤ 15°, keine Wand im Umriss, kein Blocker im Band, E steigt ein und aus.
//   F2  DIE VORSCHAU DES SPIELS (`_portalApproachPrefetch`, der Befund-Ort, die Platz-Suche im Takt) — dasselbe Urteil und
//       die Fahrt: W 2 s ≥ 2 m, bremsen, S 2,5 s rückwärts aus dem Stand ≥ 3 m.
//   F3  DIE NATUR-WAND KENNT DEN WAGEN: ein Wurf der Natur in der Hülle eines stehenden GT fällt ("wagen"); der Wagen ist
//       kein Grundriss (`_imGrundriss` false: kein Haus räumt die Natur aus einem Wagen und nennt dafür seinen Grundriss).
//   F4  DER STOSS UND DIE BEFREIUNG: Gas gegen den Glutbrunnen der Schau (−875/−732) und gegen einen Kiefern-Stamm; danach
//       S + Gegenlenkung je Seite — frei (≥ 1 m vom Stoß) in ≤ 2 s.
//   F5  DER TACHO zeigt |vlong| × vehicle:FAHR.kmh (die Zahl der Probefahrt), nach dem Absteigen ist er fort.
//   F6  DIE STIMME: im Sattel klingt die Fahrt aus klang-core fahrtStimme, der Motor-Ton folgt klang:FAHRT (±1 %, Spanne
//       ≥ 100 Hz), absteigen macht still.
//   F7  DIE TASTEN: „hilfe" nennt E und Shift, Shift kommt als Handbremse im Fahr-Schritt an.
//   SCHMUGGEL (im selben Boot): die Vorschau ohne Platz-Gesetz (`_fahrPlatzSuche` gestubbt) und die Natur-Wand ohne die
//       Wagen (das Blocker-Netz ohne „moveable") → ROT beim Namen.
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
    tachoKmh: 1, // F5: Anzeige gegen |vlong| × FAHR.kmh (Rundung)
    hzSpanne: 100, // F6
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
function bahnStimmeVerdict(m) {
    if (!m) return ["keine Probe"];
    if (!m.symphonie) return ["keine Symphonie (AudioContext)"];
    if (!(m.quellen > 0)) return ["Fahren stumm (keine Quelle aus klang-core fahrtStimme)"];
    const out = [];
    if (m.fremd > 0) out.push(`${m.fremd} Quellen der Fahrt außerhalb des Gesetzbuchs`);
    if (!(m.hzSpanne >= BAHN.hzSpanne))
        out.push(`Motor-Ton folgt dem Tempo nicht (Spanne ${m.hzSpanne} Hz über ${m.proben} Proben)`);
    if (m.abweichend > 0) out.push(`${m.abweichend}/${m.proben} Proben ≠ klang:FAHRT (${m.beispiel})`);
    if (m.laufendNachAb > 0) out.push(`${m.laufendNachAb} Quellen klingen nach dem Absteigen`);
    return out;
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
        const P = Object.assign({}, VC.DEFAULT_P, VC.presetPatch(rezept));
        const G = VC.fahrGesetz(VC.exportDrive(P));
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
        const G = VC.fahrGesetz(VC.exportDrive(Object.assign({}, VC.DEFAULT_P, VC.presetPatch(rezept))));
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
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const dl0 = performance.now() + 120000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0)
        await sleep(100);
    const r = window.anazhRealm;
    const st = r.state;
    const VC = window.__vehicleCore;
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 90000;
    while (performance.now() < dl) {
        if (f && f.ready && f.recipes && st.blueprints && st.blueprints.fahrzeug_gt) break;
        await sleep(100);
    }
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
    const TASTE = {
        w: { key: "w", code: "KeyW" },
        s: { key: "s", code: "KeyS" },
        a: { key: "a", code: "KeyA" },
        d: { key: "d", code: "KeyD" },
        shift: { key: "Shift", code: "ShiftLeft" },
        e: { key: "e", code: "KeyE" },
    };
    const gehalten = new Set();
    const ereignis = (art, k) =>
        window.dispatchEvent(new KeyboardEvent(art, Object.assign({ bubbles: true }, TASTE[k])));
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
    const gebaut = async (e) => {
        for (let i = 0; i < 60 && e && !e.instanced && !e.mesh; i++) {
            r._rebuildArchitectureMesh(e);
            await sleep(50);
        }
    };
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
            if (r._portalOverlay && typeof r.exitPortal === "function") r.exitPortal(); // die Probe geht weiter in der Heimat
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
        const dlV = performance.now() + 30000;
        let e = null;
        // der Ort-Takt des Spiels: je Takt Ring und Vorschau (die Platz-Suche läuft im Takt, FAHR_PLATZ_JE_TAKT Orte)
        for (let t = 0; performance.now() < dlV; t++) {
            r._genesisPortalRing(st.playerMesh.position);
            r._portalApproachPrefetch(st.playerMesh.position);
            e = st.architectures.find((a) => a && a.id === "portal-preview-garage");
            if (e) break;
            if (t % 20 === 19) await sleep(20); // das Buch und der Bau dürfen ankommen
        }
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
        const ort = typeof r._portalVorschauOrt === "function" ? r._portalVorschauOrt(t) : null;
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
        // außerhalb der Lichtung des Genesis-Platzes samt der Krone einer Tanne (K52: die Lichtung trägt den Ring der Tore,
        // 15 m — bei M + 14/14 urteilte die Wand „lichtung", bevor sie den Wagen fragte)
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
        // DER ORT, AN DEM DAS GESETZ ZÄHLT (K16): ein Kiefern-Stamm auf dem Wunsch-Ort der Vorschau (`_portalVorschauOrt`) —
        // ohne Platz-Gesetz steht der Wagen in ihm. Die Welt allein trägt dort nicht immer ein Hindernis: am Flussnetz-Gelände
        // ist der Wunsch-Ort am Garage-Tor frei (3°, keine Wand, kein Blocker), und der Schmuggel fiel vakuös grün.
        const torG = st.architectures.find((a) => a && a.type === "welt_garage" && a.position);
        const wo = torG && typeof r._portalVorschauOrt === "function" ? r._portalVorschauOrt(torG) : null;
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
    let symphonie = false;
    try {
        symphonie = !!r.initSymphony();
    } catch (e) {
        out.log.push("initSymphony: " + (e && e.message));
    }
    const Q = window.__fahrQuellen || [];
    // DIE STELLE AUS DER WELT (K16): die Schau stand auf ebenem Grund (−875/−732, Kurs auf −765/−752); am Flussnetz-Gelände liegt
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
        // JEDER VERSUCH VON DER STATION: der Wagen steht je Seite neu am Ort der Schau, Bug auf das Ziel. Fuhr der zweite
        // Versuch dort los, wo die Befreiung des ersten endete, lag das Ziel um deren Lenk-Drehung schief vor dem Bug (K16:
        // 19,4° — bei 5,7 m Abstand 1,9 m quer, mehr als halbe Wagen-Breite + Ring-Radius, der GT fuhr 23 m vorbei).
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
                if (r._portalOverlay && typeof r.exitPortal === "function") r.exitPortal();
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
    // ════ F5 + F6 + F7 — DIE FAHRT AUF DER MESS-WIESE (die Vollgas-Gerade der Schau, Kurs 127,7°): Tacho, Stimme und
    // Handbremse, nie der Wald — die Bahn-Wache räumt die Gerade (70 × 12 m) vor und während der Fahrt. ════
    const tacho = { element: !!document.getElementById("fahr-tacho"), proben: 0, unsichtbar: 0, falsch: 0, maxKmh: 0 };
    const stimme = { symphonie, quellen: 0, fremd: 0, proben: 0, hzSpanne: 0, abweichend: 0, laufendNachAb: 0 };
    const hilfe = { zeilen: [], handbremseWirkt: false };
    {
        const sx = -909.82;
        const sz = -851.89;
        const fahrt = (127.7 * Math.PI) / 180;
        const ux = Math.sin(fahrt);
        const uz = Math.cos(fahrt);
        let geraeumt = 0;
        const raeume = () => {
            for (const a of st.architectures.slice()) {
                if (!a || !a.blockerAABBs || !a.position || /^fahrzeug_/.test(a.type || "")) continue;
                const dx = a.position.x - sx;
                const dz = a.position.z - sz;
                const l = dx * ux + dz * uz;
                if (l > -8 && l < 70 && Math.abs(dx * uz - dz * ux) < 6) {
                    r.removeArchitecture(a);
                    geraeumt++;
                }
            }
        };
        stelle(sx - Math.cos(fahrt) * 1.5, sz + Math.sin(fahrt) * 1.5);
        raeume();
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: sx, y: boden(sx, sz) + 0.5, z: sz },
            { silent: true, precise: true, rotationY: fahrt - Math.PI / 2, id: "fahr-bahn-fahrt" }
        );
        if (e) {
            await gebaut(e);
            tippe("e");
            frame();
        }
        if (e && st.player.mountedArch === e.id) {
            const fahre = (n, jede) => {
                for (let i = 0; i < n; i++) {
                    const vVor = e._fahr ? e._fahr.vlong : 0;
                    frame();
                    if (i % 15 === 0) raeume();
                    if (jede) jede(i, vVor);
                }
            };
            fahre(12);
            const tachoProbe = () => {
                const el = document.getElementById("fahr-tacho");
                if (!el || !e._fahr) return;
                tacho.proben++;
                if (el.hidden || getComputedStyle(el).display === "none") tacho.unsichtbar++;
                const zahl = Number(((el.querySelector("[data-kmh]") || el).textContent.match(/-?\d+/) || [NaN])[0]);
                const soll = Math.round(Math.abs(e._fahr.vlong) * VC.FAHR.kmh);
                tacho.maxKmh = Math.max(tacho.maxKmh, soll);
                if (!(Math.abs(zahl - soll) <= B.tachoKmh)) {
                    tacho.falsch++;
                    if (!tacho.beispiel) tacho.beispiel = `zeigt ${zahl}, Fahrt ${soll} km/h`;
                }
            };
            // die Motor-Quelle der Fahrt (Abgriff: Quellen, deren Stapel klang-core fahrtStimme trägt): ihr Frequenz-Ziel
            const motorHz = () => {
                const osc = Q.find((q) => q.fahrt && !q.gestoppt && q.art === "createOscillator");
                return osc && osc.knoten.frequency && Number.isFinite(osc.knoten.frequency.__ziel)
                    ? +osc.knoten.frequency.__ziel.toFixed(1)
                    : null;
            };
            const KC = window.__klangCore;
            let hzMin = Infinity;
            let hzMax = -Infinity;
            // Der Klang-Takt des Frames liest den Fahr-Zustand vor oder nach dem Sim-Schritt desselben Frames: das Gesetz
            // zu einem der beiden Tempi zählt.
            const stimmProbe = (vVor) => {
                const hz = motorHz();
                if (hz === null || !e._fahr || !e._fahrSatz) return;
                stimme.proben++;
                hzMin = Math.min(hzMin, hz);
                hzMax = Math.max(hzMax, hz);
                const vmax = e._fahrSatz.vmax;
                const gesetz = (v) =>
                    KC && typeof KC.fahrtMischung === "function"
                        ? KC.fahrtMischung({ v, vmax, rueckVmax: vmax * VC.FAHR.schritt.rueckVmax }).motorHz
                        : NaN;
                const passt = (soll) => Math.abs(hz - soll) <= 0.01 * soll + 0.1;
                const soll = gesetz(e._fahr.vlong);
                if (!passt(soll) && !passt(gesetz(vVor))) {
                    stimme.abweichend++;
                    if (!stimme.beispiel)
                        stimme.beispiel = `${(e._fahr.vlong * 3.6).toFixed(0)} km/h: ${hz} Hz, Gesetz ${Number(soll).toFixed(1)} Hz`;
                }
            };
            halte(["w"]);
            fahre(150, (i, vVor) => {
                if (i % 10 === 0) {
                    tachoProbe();
                    stimmProbe(vVor);
                }
            });
            stimme.hzSpanne = stimme.proben ? +(hzMax - hzMin).toFixed(1) : 0;
            // DIE HANDBREMSE: was Shift im Fahr-Schritt des Kerns ankommen lässt (der Aufruf vc.fahrKraefte mit dem Zustand
            // DIESES Wagens, die Eingabe e.hand) — je 0,5 s ohne Gas, ohne und mit Shift — und der Tempo-Verlust.
            const kraefte = VC.fahrKraefte;
            let zaehle = null;
            VC.fahrKraefte = function (zf, ein) {
                if (zaehle && zf === e._fahr) {
                    zaehle.schritte++;
                    if (ein && ein.hand) zaehle.hand++;
                }
                return kraefte.apply(this, arguments);
            };
            const auslauf = (mitShift) => {
                halte(["w"]);
                fahre(60);
                const v0 = e._fahr ? Math.abs(e._fahr.vlong) : 0;
                zaehle = { schritte: 0, hand: 0 };
                halte(mitShift ? ["shift"] : []);
                fahre(30);
                const z = zaehle;
                zaehle = null;
                const v1 = e._fahr ? Math.abs(e._fahr.vlong) : 0;
                return { v0, v1, verlust: v0 - v1, schritte: z.schritte, hand: z.hand };
            };
            const ohne = auslauf(false);
            const mit = auslauf(true);
            VC.fahrKraefte = kraefte;
            hilfe.handbremseWirkt = mit.schritte > 0 && mit.hand >= 0.9 * mit.schritte && ohne.hand === 0;
            hilfe.handbremseDetail = `Shift im Fahr-Schritt ${mit.hand}/${mit.schritte} (ohne ${ohne.hand}/${ohne.schritte}) · 0,5 s ohne Gas: Verlust ohne ${ohne.verlust.toFixed(2)} · mit Shift ${mit.verlust.toFixed(2)} m/s`;
            halte([]);
            stimme.quellen = Q.filter((q) => q.fahrt).length;
            stimme.fremd = Q.filter((q) => q.fahrtFremd).length;
            // absteigen: Tacho fort, Stimme still
            fahre(60);
            tippe("e");
            fahre(10);
            const el = document.getElementById("fahr-tacho");
            tacho.nachAbsteigenSichtbar = !!el && !el.hidden && getComputedStyle(el).display !== "none";
            stimme.laufendNachAb = Q.filter((q) => q.fahrt && !q.gestoppt).length;
        } else out.log.push("Fahrt-Station: E steigt nicht ein");
        out.log.push(`Fahrt-Station: Bahn geräumt ${geraeumt}`);
        wagenWeg(e);
    }
    phase("F5–F7");
    out.log.push("Dauer: " + uhr.zeilen.join(" · "));
    hilfe.zeilen = typeof r._hilfeZeilen === "function" ? r._hilfeZeilen() : [];
    out.tacho = tacho;
    out.stimme = stimme;
    out.hilfe = hilfe;
    out.log.push(...logs.slice(0, 20));
    return out;
}

// DER QUELLEN-ABGRIFF (vor jedem Seiten-Skript der Bahn): jede Quelle mit ihrem Stapel; die Quellen der Fahrt (Stapel mit
// `fahrtStimme`) und ihre Frequenz-Ziele (die letzte Automation des AudioParam), ihr Stop.
function quellenAbgriff() {
    if (window.__fahrQuellen) return;
    const Q = (window.__fahrQuellen = []);
    const proto = window.BaseAudioContext && BaseAudioContext.prototype;
    if (!proto) return;
    const AP = AudioParam.prototype;
    for (const m of ["setValueAtTime", "setTargetAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime"]) {
        const org = AP[m];
        AP[m] = function (v) {
            this.__ziel = v;
            return org.apply(this, arguments);
        };
    }
    const setV = Object.getOwnPropertyDescriptor(AP, "value");
    Object.defineProperty(AP, "value", {
        get() {
            return setV.get.call(this);
        },
        set(v) {
            this.__ziel = v;
            setV.set.call(this, v);
        },
    });
    for (const art of ["createOscillator", "createBufferSource", "createConstantSource"]) {
        const org = proto[art];
        proto[art] = function () {
            const knoten = org.apply(this, arguments);
            const stapel = (new Error().stack || "").split("\n").slice(2, 8).join(" | ");
            const fahrt = /fahrtStimme/.test(stapel);
            const q = {
                art,
                knoten,
                fahrt: fahrt && /klang-core\.js/.test(stapel),
                fahrtFremd: fahrt && !/klang-core\.js/.test(stapel),
                gestoppt: false,
            };
            if (knoten.frequency) knoten.frequency.__ziel = knoten.frequency.value;
            const stop = knoten.stop;
            knoten.stop = function () {
                q.gestoppt = true;
                return stop.apply(this, arguments);
            };
            Q.push(q);
            return knoten;
        };
    }
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
            spalt: { rand: 32.4, grund: 15, vor: 8, yMin: 18 },
            stossFels: { kontakt: 40, vVor: 6.5, vNach: -1.3, vMinNach: -1.3, ereignisse: 1, ruck: 3, zielWeg: 0 },
            stossWagen: { kontakt: 40, vVor: 6.5, vNach: 2.3, vMinNach: 2.3, ereignisse: 1, ruck: 3, zielWeg: 2.1 },
            stossBaer: { kontakt: 40, vVor: 6.5, vNach: 5.0, vMinNach: 5.0, ereignisse: 1, ruck: 2, zielWeg: 3.2 },
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
            leibWand: { 60: { durch: 0, n: 10 }, 30: { durch: 0, n: 10 }, gemischt: { durch: 0, n: 10 } },
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
                        a: { minAbstand: 0, wagenWeg: 0, kontakt: 100, vorKontakt: 4.2, nachKontakt: 4.1, paare: 0 },
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
                {
                    reiter: [
                        {
                            typ: "fahrzeug_gt",
                            oben: 2.175,
                            dach: 1.2,
                            schenkel: 0.72,
                            sitz: 0.475,
                            ankerL: 0.3,
                            ankerQ: 0.4,
                            blickGrad: 90,
                            lehneGrad: 0,
                        },
                    ],
                },
                "reiter fahrzeug_gt",
            ],
            [
                "die Füße des Reiters hängen unter dem Wagen (Gegenprüfung 0710-4, das Auge)",
                {
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
        const quelle = stammLib.text(root);
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
        const vorStand = stammLib.ersetze(quelle, [
            ["_stepFixedSim", "        this._rittSchritt(dt);\n", ""],
            [null, /(\n {4}_tickMountedMovement\([^)]*\) \{)/,
                "$1\n        const pm = this.state.playerMesh.position;\n        pm.y = 0;\n        entry._rideSteer = false;"],
        ]);
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
            stammLib.ersetze(quelle, null, /(\n {4}_loopPlayerMovement\([^)]*\) \{)/, "$1\n        let FlatF = 0;"),
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
            stammLib.ersetze(quelle, null,
                /(\n {4}_fahrHuelleKontakt\([^)]*\) \{)/,
                "$1\n        for (let pl = 0; pl < AnazhRealm.SLIDE_CLIP_PLANES; pl++) break;"
            )
        );
        check("Selbst-Test H5: der Vor-Stand (eine zweite Schleife in der Hülle) → H5 feuert", !hRot[0][1], hRot[0][2]);
        // der Vor-Stand von D2: der Wagen-Kontakt rechnet den Kreis VERHALTEN.separation × bodySize statt des Leibs
        const h6Rot = huelleWand(
            stammLib.ersetze(quelle, null,
                /(\n {4}_fahrHuelleKontakt\([^)]*\) \{)/,
                "$1\n        const SEP = AnazhRealm._verhaltenGesetz().separation;\n        const rcAlt = 0.5 * SEP.raumKugel;"
            )
        );
        check(
            "Selbst-Test H6: der Vor-Stand (der zweite Kreis im Wagen-Kontakt, D2) → H6 feuert",
            !h6Rot[1][1],
            h6Rot[1][2]
        );
        // der Vor-Stand von D5: der Löser der Hülle liest die Welt-AABB (kein box.obb)
        const h7Rot = huelleWand(
            stammLib.ersetze(quelle, null, /\n {4}_resolveHuelleVsAABB\([^)]*\) \{[\s\S]*?\n {4}\}/, (m) =>
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
            stammLib.ersetze(quelle, null, /\n {4}_blockerComputePartAABB\([^)]*\) \{[\s\S]*?\n {4}\}/, (m) =>
                m.replace(/\bobb:\s*\{/g, "aabbAlt: {")
            )
        );
        check(
            "Selbst-Test H8: der Vor-Stand (gedrehte Teile als Welt-AABB, D5) → H8 feuert",
            !h8Rot[3][1],
            h8Rot[3][2]
        );
        const pRot = pflichtWand(
            stammLib.ersetze(quelle, [
                [null, /(\n {4}_fahrSatz\([^)]*\) \{)/,
                    '$1\n        const VC = globalThis.__vehicleCore;\n        if (!VC || typeof VC.fahrGesetz !== "function") return null;'],
                [null, /(\n {4}_fahrHuelle\([^)]*\) \{)/, "$1\n        const radR = 0.34;"],
            ])
        );
        check(
            "Selbst-Test P: der Vor-Stand (typeof → null im Fahr-Satz, Literal-Zwilling in der Hülle) → P2 P3 feuern",
            !pRot[1][1] && !pRot[2][1],
            pRot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        {
            // F — DIE FAHR-BAHN (K12): jedes Urteil nennt seinen eingeschmuggelten Täter
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
            const gutK = {
                symphonie: true,
                quellen: 3,
                fremd: 0,
                proben: 15,
                hzSpanne: 300,
                abweichend: 0,
                laufendNachAb: 0,
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
                    !bahnStimmeVerdict(gutK).length &&
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
                ["F6 stumm", bahnStimmeVerdict(Object.assign({}, gutK, { quellen: 0 })), /Fahren stumm/],
                [
                    "F6 Ton folgt dem Tempo nicht",
                    bahnStimmeVerdict(Object.assign({}, gutK, { hzSpanne: 0 })),
                    /folgt dem Tempo nicht/,
                ],
                [
                    "F6 Ton ≠ Gesetz",
                    bahnStimmeVerdict(Object.assign({}, gutK, { abweichend: 4, beispiel: "40 km/h: 53 Hz" })),
                    /4\/15 Proben ≠ klang:FAHRT/,
                ],
                [
                    "F6 klingt nach",
                    bahnStimmeVerdict(Object.assign({}, gutK, { laufendNachAb: 2 })),
                    /nach dem Absteigen/,
                ],
                [
                    "F6 Zwilling im Stamm",
                    bahnStimmeVerdict(Object.assign({}, gutK, { fremd: 1 })),
                    /außerhalb des Gesetzbuchs/,
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
            }
        }
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log(
            "\n✅ SELBST-TEST GRÜN — die Fahr-Linse nennt Teleport, Weg, Luft, Gier, Halt, Kopie, Sprung und Querhang beim Namen."
        );
        process.exit(0);
    }

    const quelle = stammLib.text(root);
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
    const browser = await starteBrowser({
        art: "linse",
        frist: 300000,
        zusatz: ["--autoplay-policy=no-user-gesture-required"],
    });
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
    // die Orte des Wassers aus der Welt (L10: der See, `__wasserOrte`)
    await page.evaluate(require("./lib/wasser-linse.cjs").WASSER_INSTALL);
    // F — die Fahr-Bahn im eigenen Boot nach dem Leben (der Quellen-Abgriff der Stimme vor jedem Seiten-Skript)
    const bahnLauf = async () => {
        const page2 = await browser.newPage();
        await page2.evaluateOnNewDocument(() => {
            window.__anazhForceFoundry = true;
            window.__anazhHeadlessNullRenderer = true;
        });
        await page2.evaluateOnNewDocument(quellenAbgriff);
        page2.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
        await page2.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        return page2.evaluate(probeBahn, BAHN);
    };
    const out = await page.evaluate(probeLeben, {
        messort,
        dorf: require("./lib/welt-orte.cjs").messort("dorf"),
        randM: STATION.randM,
        flugM: STATION.flugM,
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
            ? `Bahn geräumt ${S.klippe.geraeumt} (+${S.klippe.wache} durch die Bahn-Wache) · Fall ${S.klippe.fall.toFixed(1)} m bei (${S.klippeOrt.x}, ${S.klippeOrt.z}) · größter Sprung ${S.klippe.sprung.toFixed(2)} m · Luft ${S.klippe.luft}/${S.klippe.schritte} · danach ${S.klippe.ueberGrund.toFixed(2)} m über dem Grund`
            : vS.join(" · ")
    );
    check(
        "S4 Absteigen im Flug: der Wagen fällt ballistisch auf seinen Boden und steht dort (nie in der Luft, kein Sprung)",
        !hat("kern") && !hat("absteigen"),
        S.absteigen
            ? `Bahn geräumt ${S.absteigen.geraeumt} (+${S.absteigen.wache} durch die Bahn-Wache) · abgestiegen ${S.absteigen.hoehe.toFixed(2)} m über dem Boden (im Flug ${S.absteigen.imFlug}) · nach 240 Frames ${S.absteigen.ueberBoden.toFixed(3)} m über der Ebene seiner Räder · größter Sprung ${S.absteigen.sprung.toFixed(2)} m · ${S.absteigen.diag || ""}`
            : vS.join(" · ")
    );
    check(
        "S3 Querhang: Fahrt längs der Höhenlinie ohne Lenkung driftet quer talwärts (der Quer-Hangabtrieb wirkt)",
        !hat("kern") && !hat("querhang"),
        S.quer
            ? `${S.querOrt.grad.toFixed(1)}° bei (${S.querOrt.x.toFixed(0)}, ${S.querOrt.z.toFixed(0)}) · ${S.quer.weg.toFixed(1)} m gefahren · Quer-Abdrift talwärts ${S.quer.drift.toFixed(2)} m · Bahn-Wache ${S.quer.wache}`
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
        "L1 Hangfuß (der Glutbrunnen am Dorf-Messort, 9,3 m/s, Gier 92,3°, seine Box): nach JEDER Kontakt-Antwort steht der Wagen auf dem Gesetz (≤ 0,2 m unter der Ebene seiner Räder, ≤ 3 Schritte), der Schub je Schritt ≤ 0,2 m über die eigene Fahrt, er fährt weiter",
        !hat("kern") && !hat("hangfuss"),
        L1
            ? `unter dem Gesetz höchstens ${L1.unterMax.toFixed(3)} m (${L1.unterN} Schritte > 0,05 m) · größter Schub ${L1.schubMax.toFixed(3)} m · ${L1.kontakte} Kontakt-Schritte · ${L1.weg.toFixed(1)} m gefahren`
            : "keine Probe"
    );
    const L2 = S.spalt;
    check(
        "L2 Spaltkante (die nächste Kante am Schicht-Ort des Gesetzes, 11,4 m/s über sie): der Wagen fährt über die Kante und FÄLLT (keine unsichtbare Wand)",
        !hat("kern") && !hat("spalt"),
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
        (swz.a && swz.b
            ? `Spieler → GT: Fahrt in den Wagen ${swz.a.vorKontakt.toFixed(2)} → ${swz.a.nachKontakt.toFixed(2)} m/s, Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m, Schub des Wagens in ${swz.a.schub} Schritten, ${swz.a.paare} Stöße (Rest der Fahrt in den Wagen danach höchstens ${Number.isFinite(swz.a.prallNach) ? (swz.a.prallNach * 100).toFixed(0) : "–"} %), Fuß bis ${Number.isFinite(swz.a.aufstieg) ? swz.a.aufstieg.toFixed(2) : "–"} m über dem Boden · GT → Spieler: Spieler ${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung ${swz.b.minAbstand.toFixed(3)} m`
            : "keine Probe") +
            (hat("spieler-wagen") || hat("wagen-spieler")
                ? ` — ${vS.filter((x) => x.startsWith("spieler-wagen") || x.startsWith("wagen-spieler")).join(" · ")}`
                : "")
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
        "L8 Lockstep (0710-5): der Wagen steht nach 200 Sim-Schritten gegen einen Bären bei 60 fps und gemischten Frames an derselben Stelle, ein gestoßener Schwimmer nach 20 (auch in der Höhe)",
        !hat("kern") && !hat("lockstep"),
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
        !hat("kern") && !hat("reiter"),
        (S.reiter || []).map(reiterZeile).join(" · ") +
            (S.reiterStand ? ` · abgestiegen: Wurzel ${S.reiterStand.abw} m, Gier ${S.reiterStand.gier}` : "") +
            (hat("reiter") ? ` — ${vS.filter((x) => x.startsWith("reiter")).join(" · ")}` : "")
    );
    const swm = S.schwimmer || {};
    check(
        "L10 der gestoßene Schwimmer (0710-5): ein Fuchs in tiefem Wasser gleitet nach einem Stoß an seiner Schwimm-Linie, nicht auf dem Grund",
        !hat("kern") && !hat("schwimmer"),
        swm.fehler
            ? swm.fehler
            : `Wasser ${swm.tiefe} m tief · vor dem Stoß ${swm.vorher} m, beim Gleiten tiefstens ${swm.tiefste} m gegen die Linie (${swm.gleitet} Frames gleitend)`
    );
    {
        // ════ F — DIE FAHR-BAHN (K12) ════
        console.log("=== F — DIE FAHR-BAHN (K12): Platz an jedem Tor, rückwärts, Befreiung, Tacho, Stimme, Tasten ===");
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
            bz(bahn.vorschau) + (fv.length ? " — Täter: " + fv.join(" · ") : "")
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
                sz(m) + (v.length ? " — Täter: " + v.join(" · ") : "")
            );
        }
        const tv = bahnTachoVerdict(bahn.tacho);
        check(
            "F5 im Sattel zeigt #fahr-tacho |vlong| × vehicle:FAHR.kmh (die Zahl der Probefahrt), nach dem Absteigen ist er fort",
            tv.length === 0,
            `${bahn.tacho.proben} Proben · max ${bahn.tacho.maxKmh} km/h${tv.length ? " — Täter: " + tv.join(" · ") : ""}`
        );
        const svv = bahnStimmeVerdict(bahn.stimme);
        check(
            "F6 im Sattel klingt die Fahrt aus klang-core fahrtStimme, ihr Motor-Ton folgt klang:FAHRT, absteigen macht still",
            svv.length === 0,
            `${bahn.stimme.quellen} Quellen · ${bahn.stimme.proben} Proben · Motor-Spanne ${bahn.stimme.hzSpanne} Hz · ${bahn.stimme.abweichend} abweichend · nach dem Absteigen ${bahn.stimme.laufendNachAb} laufend${svv.length ? " — Täter: " + svv.join(" · ") : ""}`
        );
        const hv = bahnTastenVerdict(bahn.hilfe);
        const fz = (bahn.hilfe.zeilen || []).find((z) => /^Fahren/.test(z)) || "—";
        check(
            "F7 „hilfe“ nennt E (einsteigen) und Shift (Handbremse), Shift kommt in Fahrt als Handbremse im Fahr-Schritt an",
            hv.length === 0,
            `„${fz}“ · ${bahn.hilfe.handbremseDetail || ""}${hv.length ? " — Täter: " + hv.join(" · ") : ""}`
        );
        for (const l of bahn.log || []) console.log("  · " + l);
    }
    if (bahn.err) check("F Probe ohne Ausnahme", false, String(bahn.err).split("\n")[0]);
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
