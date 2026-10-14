// diag-kamera-laub.cjs — DIE KAMERA STECKT NIE IN LAUB, STRAUCH ODER FELS (Leben-Schau 2, 09.10., Befund §6 #5, V1-Lücke
// „laufen und sehen"). Befund: in allen drei Spuren füllte Laub, Strauch oder Ast das Bild (A 12 · 27 · 44–47,
// B 24 · 28 · 31 · 35 · 53, C 12) — zu Fuß in der Eichenkrone ein Loch um die Figur, im Ritt Weidenstränge und Fichtenäste
// vor der Linse, im Ich-Auge ein Strauch vor dem Gesicht; durchsichtig wurde nur, was im Rohr um den Sicht-Strahl lag.
//
// Die Linse fährt die echte Welt (headless, Foundry an, Null-Renderer) an die Orte der Schau — die Ankunft (A 27), das Ufer
// mit dem Eichenhain des Satzes (−872/−1127, A 41–47) und den 30°-Hang (−744/−1356, B 28–31, C 05–12) — und stellt dort an
// jeder nahen Pflanze den Spieler in acht Richtungen auf: zu Fuß in 3rd, im Ritt (der GT, die Verfolger-Kamera des Kerns)
// und im Ich-Auge. Je Stellung misst sie die NAH-DECKUNG (scripts/lib/kamera-nah.cjs): den Anteil des Schirms, den eine
// Fläche näher am Auge deckt als der Nah-Radius der Stellung — 3rd 2,0 m, Ritt 3,0 m (beide höchstens bis einen Saum vor
// das Ziel: der Stamm vor dem Spieler bleibt), Ich-Auge 0,8 m (nur Laub: der Leib steht an der Rinde) — mit dem Täter beim
// Namen (Laub · Rinde · Fels · Wagen und das Werk). Urteil: keine Stellung über NAH_DECKUNG_MAX. Die Radien stehen fest in
// der Linse (Vorher und Nachher unter derselben Bedingung).
//
// DER EINGESCHMUGGELTE TÄTER (in derselben Welt, nach der Messung): ein Laub-Stoff ohne Durchsicht und ein Fels vor der
// Linse — die Linse muss beide beim Namen nennen, sonst ist sie vakuös. `--selftest` (ohne Welt): das Urteil über
// synthetische Messungen nennt jeden Täter, die statische Wand fällt am Vor-Stand.
//
//   node scripts/diag-kamera-laub.cjs [--selftest] [--teile laub,leib,ninja]   Port: KAMERA_LAUB_PORT (Standard 4611)
//   KAMERA_LAUB_STUDIO=<datei>                             ein anderes Körper-Studio (koerperstudio.js) — das Vorher von NP-03
//   KAMERA_LAUB_STAMM=<datei>                              ein anderer Stamm (anazhRealm.js) — das Vorher eines A/B
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const { WASSER_INSTALL } = require("./lib/wasser-linse.cjs");
const stammLib = require("./lib/stamm.cjs");
const { KAMERA_NAH_INSTALL } = require("./lib/kamera-nah.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
// DAS BILD-PAAR am echten Renderer: `--bilder <ordner> --seite http://localhost:<port>` (der save-server des Arbeitsbaums)
const BILDER = opt("--bilder", null);
const SEITE = opt("--seite", null);

const PORT = Number(process.env.KAMERA_LAUB_PORT || 4611);
const STAMM = process.env.KAMERA_LAUB_STAMM ? path.resolve(process.env.KAMERA_LAUB_STAMM) : null;
// das Körper-Studio eines anderen Stands (das Vorher des NP-03-A/B)
const STUDIO = process.env.KAMERA_LAUB_STUDIO ? path.resolve(process.env.KAMERA_LAUB_STUDIO) : null;
// die Teile des Laufs (Standard alle): laub (die Nah-Deckung, K1) · leib (Mess-Wiese + Prüfbühnen-Hang, K2) · ninja (NP-03, K3) —
// die CI fährt sie in zwei Schritten (gate:kamera-laub · gate:kamera-leib), je unter 3 min
const TEILE = (process.argv.includes("--teile") ? process.argv[process.argv.indexOf("--teile") + 1] : process.env.KAMERA_LAUB_TEILE || "laub,leib,ninja").split(",");
const root = path.resolve(__dirname, "..");
// Die Nah-Radien der Messung (m) — fest in der Linse, damit Vorher und Nachher unter derselben Bedingung stehen.
const RADIUS = Object.freeze({ third: 2.0, ritt: 3.0, first: 0.8 });
const SAUM = 0.6; // der Saum der Durchsicht (KAMERA_DURCHSICHT.saumM): in 3rd endet die Nah-Kugel samt Saum vor dem Ziel
// Höchste Nah-Deckung einer Stellung (Anteil des Schirms).
const NAH_DECKUNG_MAX = 0.02;
// Der Schmuggel steigt höchstens so hoch am Stamm hinauf (m), bis das Laub ohne Durchsicht die Linse deckt (die Kronen-Stellung).
const SCHMUGGEL_HUB_M = 40;
// Die Orte der Schau (Befund §2): die Ankunft, das Ufer mit dem Hain des Satzes, die Lichtung der Herde (8a) und der
// 30°-Hang (2c, 8b/8c — dort steht nur Streu: Gestrüpp, Geröll, Stumpf). Jeder Ort kommt AUS DER WELT (K16, Orts-Wand):
// das Ufer ist das Ostufer des nächsten Sees am Messort (`__wasserOrte`), die Lichtung die nächste ebene trockene Stelle
// (12 m Umkreis, Spanne ≤ 1,5 m), der Hang die nächste Stelle mit 25–35° Neigung (`__weltOrt`, scripts/lib/welt-orte.cjs) —
// in der alten Welt standen sie als Zahlen (−872/−1127, −789/−1331, −744/−1356), die Landform des Kerns verschob sie.
const ORTE = [
    { id: "ankunft", bild: "A 27" },
    { id: "ufer", bild: "A 41–47", art: "ufer", satz: "pflanz mir einen eichenhain am wasser", satzWerk: "baum_eiche" },
    { id: "lichtung", bild: "C 01–04", art: "eben", such: { r: 12, spanne: 1.5 } },
    { id: "hang", bild: "B 28–31, C 05–12", art: "hang", such: { min: 25, max: 35 } },
];
const MODI = ["third", "ritt", "first"];

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const pct = (x) => (x == null ? "—" : `${(100 * x).toFixed(1)} %`);

// ── DAS URTEIL (pure Funktion; Welt UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
function urteil(m) {
    if (!m || !m.orte) return ["keine Messung"];
    const out = [];
    for (const ort of ORTE) {
        const o = m.orte[ort.id];
        if (!o) {
            out.push(`${ort.id}: nicht gemessen (Vorbedingung)`);
            continue;
        }
        if (o.err) {
            out.push(`${ort.id}: Ausnahme (${String(o.err).split("\n")[0]})`);
            continue;
        }
        for (const modus of MODI) {
            const z = (o.modi || {})[modus];
            if (!z || !(z.n > 0)) {
                out.push(`${ort.id} ${modus}: keine Stellung (Vorbedingung${z && z.grund ? `: ${z.grund}` : ""})`);
                continue;
            }
            if (z.max > NAH_DECKUNG_MAX) {
                const t = Object.entries((z.schlimmste && z.schlimmste.taeter) || {})
                    .map(([k, v]) => `${k} ${pct(v)}`)
                    .join(", ");
                out.push(`${ort.id} ${modus}: Deckung im Freiraum bis ${pct(z.max)} (Mittel ${pct(z.mittel)}; ${t || "ohne Namen"})`);
            }
            if (z.fremd) out.push(`${ort.id} ${modus}: ein Pflanzen-Stoff trägt eine fremde Maske (nicht der Knoten seiner Art)`);
        }
    }
    const s = m.schmuggel;
    if (!s) out.push("Schmuggel: nicht gelaufen (Vorbedingung)");
    else {
        if (!(s.laub && s.laub.max > NAH_DECKUNG_MAX && Object.keys(s.laub.taeter || {}).some((k) => /^Laub /.test(k))))
            out.push(`Schmuggel: ein Laub-Stoff ohne Durchsicht bleibt ungenannt (${JSON.stringify(s.laub || null)})`);
        if (!(s.fels && s.fels.max > NAH_DECKUNG_MAX && Object.keys(s.fels.taeter || {}).some((k) => /Formation/.test(k))))
            out.push(`Schmuggel: ein Fels vor der Linse bleibt ungenannt (${JSON.stringify(s.fels || null)})`);
        if (s.krone && !(s.krone.max <= NAH_DECKUNG_MAX))
            out.push(`Krone: die Durchsicht öffnet das Laub in der Krone nicht (${pct(s.krone.max)} bei +${s.krone.hub} m; ${JSON.stringify(s.krone.taeter || {})})`);
    }
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei): die Proben durch die Bildmitte treffen nur, was das Bild zeigt ──
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
function wand(quelle, studio) {
    const nc = ohneKommentare(quelle);
    const pick = fnBody(nc, /\n {4}_pickArchitectureAtCrosshair\(\) \{/) || "";
    const streu = fnBody(nc, /\n {4}_pickScatterAtCrosshair\(\) \{/) || "";
    const kam = fnBody(nc, /\n {4}_loopCamera\(currentTime\) \{/) || "";
    const lab = ohneKommentare(studio || "");
    return [
        [
            "W1 der Bau-Pick und der Streu-Pick treffen nur, was das Bild zeigt (`_durchsichtSteht` je Treffer)",
            /this\._durchsichtSteht\(/.test(pick) && /this\._durchsichtSteht\(/.test(streu),
        ],
        [
            "W2 die 3rd-Kamera ist eine Kugel: der Wurf trägt den Radius des Kerns (`radius: kr`, `fx.bewegung.kamera`), der Deckel den Stand-Leser der Sicht, kein 0,85-Rückzug, kein KAMERA_ARM_RUHE",
            /_bewegungsBlock\("kamera"/.test(kam) &&
                /this\._fieldRaycast\([^;]*radius: kr/.test(kam) &&
                /this\._standSicht\(/.test(kam) &&
                !/0\.85 \*/.test(kam) &&
                !/KAMERA_ARM_RUHE/.test(nc),
        ],
        [
            "W3 das Körper-Studio prüft die Strecke Blickziel → Kamera gegen die Park-Boxen (`_kamSeg`, `fx.bewegung.kamera`), camG ist gefallen",
            /_kamSeg\(LX,LY,LZ/.test(lab) && /_kamFrei\(/.test(lab) && /bewegung\.kamera/.test(lab) && !/camG/.test(lab),
        ],
    ];
}

// ══ DER LEIB DER KAMERA (K06: WE-05 · FZ-07 · NP-03) — die Linse steht nie im Fels, nie unter dem sichtbaren Boden, nie in
// einer Box, und zwischen Blickziel und Linse steht kein Bau und kein Gelände. Gemessen gegen die exakte Gestalt: die
// gedrehte Box wie `_segmentAABB`, ohne Pflanzen-Box (der Wurf geht `durchPflanzen` wie im Spiel, eine Pflanze wird
// durchsichtig), Ursprung das Blickziel T (`state._kamZiel`, der EINE Schreiber `_kamZielSetzen`), der Boden die Boden-Karte
// des gezeichneten Mesh (`_bodenSichtAt`), der Fels das Gesetz (`_fieldSolid`, eigener Marsch der Linse). 50 feste Posen:
// 40 an der Mess-Wiese (spec/profiband/haushalt.json; Häuser · Fels · Bäume, der Spieler 0,8 m vor der Box, der Rücken zu
// ihr, jede zweite Pose mit gesenkter Kamera) und 10 am 30°-Hang der Prüfbühne (spec/pruefbuehne/stationen.json s2-hang30,
// der Blick hangab: die Kamera hangauf hinter ihm) — zu Fuß und im Verfolger-Ritt (der GT 3,2 m vor der Box). Dazu der
// Rundgang (240 Bilder um das erste Haus: Kamera-Sprünge > 2 m) und die KOSTEN: die Feld-Proben je 3rd-Bild (jedes gemessene
// Bild einmal unter dem Zähler auf `_fieldDensityAt`) gegen den Vor-Stand V18.541 (PROBEN_VORSTAND). NP-03: das Körper-Studio (worlds/koerperstudio), 12 Parcours-Punkte × 4 Blicke, die Strecke
// Blickziel → Kamera gegen die Park-Boxen (Rand 0,3 Lab-Maß, der Boden eingeschlossen); NP-02: der Tunnel bei x > 3 bleibt zu.
const LEIB_R = 0.25; // die Kugel der Linse (m): 5 cm unter dem Leib der Kamera — die Spiel-Zahl liest sie nie
const LEIB_WIESE = { haus: 12, fels: 14, baum: 14 }; // 40 Posen
const LEIB_HANG_N = 10;
const LEIB_N = LEIB_WIESE.haus + LEIB_WIESE.fels + LEIB_WIESE.baum + LEIB_HANG_N;
// DIE KOSTEN DER KUGEL: die Feld-Proben je 3rd-Bild (Posen + Rundgang, 341 Bilder) am Vor-Stand V18.541 (2c8deda9, derselbe Lauf mit
// KAMERA_LAUB_STAMM, der Strahl ohne Kugel). Das Mittel (die Arbeit des Laufs) nie darüber, der Median höchstens um den Ring der Kugel
// (4 Proben: so viel kostet sie frei), kein Bild über dem Doppelten des teuersten (Prüfung 1: die vier Eckstrahlen marschierten
// in jedem Bild die volle Armlänge — Median 34 → 151, höchstens 50 → 275).
const PROBEN_VORSTAND = Object.freeze({ mittel: 35.4, median: 34, hoechstens: 50 });
const PROBEN_RING = 4;
const quantil = (a, q) => {
    const s = [...a].sort((x, y) => x - y);
    return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};
// Kamera-Sprünge > 2 m im Rundgang: nie häufiger als am Vor-Stand (gemessen am Kopf d47f4ce9 unter derselben Bedingung)
const SPRUENGE_MAX = 4;
const NINJA_WP = [
    [0, 7, 0.8],
    [0, 12.5, 1.8],
    [0, 18, 2.9],
    [0, 23.5, 1.8],
    [0, 26.3, 0.05],
    [0, 29, 1.0],
    [0, 32, 2.1],
    [0, 34.5, 3.3],
    [0, 39, 3.56],
    [0, 47.5, 5.26],
    [7.5, 47.5, 5.2],
    [12.5, 49.5, 6.2],
];
const NINJA_RAND = 0.3; // Lab-Maß (der Runner R10)
const WIESE = (() => {
    const h = JSON.parse(fs.readFileSync(path.join(root, "spec", "profiband", "haushalt.json"), "utf8"));
    const w = h.messorte.find((o) => o.id === "wiese");
    return { x: w.spieler[0], z: w.spieler[1] };
})();
const HANG = JSON.parse(fs.readFileSync(path.join(root, "spec", "pruefbuehne", "stationen.json"), "utf8")).stationen.find(
    (o) => o.id === "s2-hang30"
);

function urteilLeib(L) {
    if (!L) return ["Leib: nicht gemessen (Vorbedingung)"];
    const out = [];
    for (const ort of ["wiese", "hang"]) {
        if (!L[ort]) out.push(`Leib ${ort}: nicht gemessen (Vorbedingung)`);
        else if (L[ort].err) out.push(`Leib ${ort}: Ausnahme (${String(L[ort].err).split("\n")[0]})`);
    }
    for (const modus of ["fuss", "ritt"]) {
        const posen = [];
        for (const ort of ["wiese", "hang"]) posen.push(...((L[ort] && L[ort][modus] && L[ort][modus].posen) || []));
        if (posen.length < LEIB_N) out.push(`Leib ${modus}: ${posen.length} von ${LEIB_N} Posen gemessen (Vorbedingung)`);
        const fehl = posen.filter((p) => p.taeter && p.taeter.length);
        if (fehl.length)
            out.push(
                `Leib ${modus}: ${fehl.length} von ${posen.length} Posen — ` +
                    fehl
                        .slice(0, 5)
                        .map((p) => `${p.id} (${p.anker}): ${p.taeter.join(", ")}`)
                        .join(" · ")
            );
    }
    const pr = L.proben;
    if (!Array.isArray(pr) || pr.length < LEIB_N)
        out.push(`Leib: ${Array.isArray(pr) ? pr.length : 0} Bilder gezählt (Vorbedingung der Feld-Proben je 3rd-Bild)`);
    else {
        const mittel = +(pr.reduce((a, b) => a + b, 0) / pr.length).toFixed(1);
        const med = quantil(pr, 0.5);
        const hoechstens = Math.max(...pr);
        if (mittel > PROBEN_VORSTAND.mittel || med > PROBEN_VORSTAND.median + PROBEN_RING || hoechstens > 2 * PROBEN_VORSTAND.hoechstens)
            out.push(
                `Leib: Feld-Proben je 3rd-Bild Mittel ${mittel} · Median ${med} · höchstens ${hoechstens} über dem Vor-Stand V18.541 (Mittel ${PROBEN_VORSTAND.mittel} · Median ${PROBEN_VORSTAND.median} + ${PROBEN_RING} Ring · höchstens 2 × ${PROBEN_VORSTAND.hoechstens}) — der Wurf der Kugel (_fieldRaycast in _loopCamera)`
            );
    }
    if (!(L.spruenge != null && L.spruenge <= SPRUENGE_MAX))
        out.push(`Leib: ${L.spruenge} Kamera-Sprünge > 2 m im Rundgang (Vor-Stand ${SPRUENGE_MAX})`);
    return out;
}
function urteilNinja(N) {
    if (!N) return ["NP-03: nicht gemessen (Vorbedingung)"];
    if (N.err) return [`NP-03: Ausnahme (${String(N.err).split("\n")[0]})`];
    const out = [];
    const posen = N.posen || [];
    if (posen.length < NINJA_WP.length * 4) out.push(`NP-03: ${posen.length} von ${NINJA_WP.length * 4} Posen gemessen (Vorbedingung)`);
    const fehl = posen.filter((p) => p.taeter.length);
    if (fehl.length)
        out.push(
            `NP-03: ${fehl.length} von ${posen.length} Posen — ` +
                fehl
                    .slice(0, 5)
                    .map((p) => `${p.id}: ${p.taeter.join(", ")}`)
                    .join(" · ")
        );
    const t = N.tunnel;
    if (!t || !t.gueltig) out.push(`NP-02: die Figur bewegt sich keine 3 m (${JSON.stringify(t || null)})`);
    else if (t.umgangen) out.push(`NP-02: der Tunnel wird bei x > 3 umgangen (Ende ${t.ende.join("/")})`);
    return out;
}

// ── DIE PROBE DES LEIBS IN DER SEITE (installiert je Boot) ──
function leibInstall(cfg) {
    const r = window.anazhRealm;
    const st = r.state;
    const R = cfg.R;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const L = (window.__kamLeib = {});
    let T = 5000;
    // die Kosten: die Feld-Proben eines Aufrufs (der Zähler auf `_fieldDensityAt`, danach fällt er)
    L.proben = [];
    L.zaehle = (fn) => {
        let n = 0;
        r._fieldDensityAt = function (...a) {
            n++;
            return Object.getPrototypeOf(r)._fieldDensityAt.apply(this, a);
        };
        try {
            fn();
        } finally {
            delete r._fieldDensityAt;
        }
        L.proben.push(n);
        return n;
    };
    L.ruhig = (n) => {
        for (let i = 0; i < (n || 10); i++) r._loopCamera((T += 0.1));
    };
    L.tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(ms || 30);
        }
    };
    L.steht = async (ms) => {
        const dl = performance.now() + ms;
        let n = 0;
        while (performance.now() < dl) {
            await L.tick(5, 40);
            n++;
            if (n >= 4 && !r._weltbildFehlt().length) break;
        }
        return r._weltbildFehlt();
    };
    // der sichtbare Boden: die Boden-Karte des gezeichneten Mesh, null ohne Karte
    L.sichtbar = (x, z) => {
        const k = r._bodenSichtAt(x, z);
        return Number.isFinite(k) ? k : null;
    };
    L.inBox = (p, b, m) => {
        if (p.y < b.botY - m || p.y > b.topY + m) return false;
        const ob = b.obb;
        if (ob) {
            const qx = p.x - ob.cx;
            const qz = p.z - ob.cz;
            return Math.abs(qx * ob.c - qz * ob.s) < ob.hx + m && Math.abs(qx * ob.s + qz * ob.c) < ob.hz + m;
        }
        return p.x > b.minX - m && p.x < b.maxX + m && p.z > b.minZ - m && p.z < b.maxZ + m;
    };
    L.boxen = (x, z, rad) => {
        const out = [];
        for (const a of st.architectures || []) {
            if (!a || !a.position || !Array.isArray(a.blockerAABBs)) continue;
            const w = rad + (a._blockerReach || 0);
            if (Math.abs(a.position.x - x) > w || Math.abs(a.position.z - z) > w) continue;
            for (const b of a.blockerAABBs) if (b && Number.isFinite(b.minX)) out.push({ a, b });
        }
        return out;
    };
    // der Leib steht frei: keine Box (auch keine Pflanze) näher als `rand`
    L.frei = (x, z, y, rand) => !L.boxen(x, z, 20).some(({ b }) => L.inBox({ x, y: y + 0.9, z }, b, rand));
    // DIE MESSUNG der gesetzten Kamera: die Täter beim Namen
    L.messen = (ritt) => {
        const proben = L.zaehle(() => r._loopCamera((T += 0.1)));
        const c = st.camera.position;
        const k = st._kamZiel;
        const taeter = [];
        const P = [
            [0, 0, 0],
            [R, 0, 0],
            [-R, 0, 0],
            [0, R, 0],
            [0, -R, 0],
            [0, 0, R],
            [0, 0, -R],
        ];
        if (P.some(([a, b, d]) => r._fieldSolid(c.x + a, c.y + b, c.z + d))) taeter.push("im Fels (Gelände-Gesetz)");
        const kb = L.sichtbar(c.x, c.z);
        if (kb !== null && c.y < kb + R && kb - c.y < 2.5)
            taeter.push(`unter dem sichtbaren Boden (${Math.round((c.y - kb) * 100)} cm über ihm)`);
        if (k) {
            for (const { a, b } of L.boxen(c.x, c.z, 30)) {
                if (b.pflanze === true) continue;
                if (L.inBox(c, b, R)) taeter.push(`in ${a.type}`);
                else if (a !== ritt) {
                    const h = r._segmentAABB(k.x, k.y, k.z, c.x - k.x, c.y - k.y, c.z - k.z, b);
                    if (h && h.t < 1) taeter.push(`${a.type} zwischen Ziel und Linse`);
                }
            }
            const d = Math.hypot(c.x - k.x, c.y - k.y, c.z - k.z);
            for (let s = 0.1; s < d; s += 0.1) {
                const f = s / d;
                if (r._fieldSolid(k.x + (c.x - k.x) * f, k.y + (c.y - k.y) * f, k.z + (c.z - k.z) * f)) {
                    taeter.push("Gelände zwischen Ziel und Linse");
                    break;
                }
            }
        } else taeter.push("kein Blickziel (state._kamZiel)");
        return {
            proben,
            c: [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)],
            arm: k ? +Math.hypot(c.x - k.x, c.y - k.y, c.z - k.z).toFixed(2) : null,
            taeter: [...new Set(taeter)],
        };
    };
    L.fuss = (x, z, gier, pitch) => {
        r.setCameraMode("third");
        const y = r.getTerrainHeightAt(x, z);
        st.playerMesh.position.set(x, y + r.constructor.PLAYER_FOOT_OFFSET + 0.02, z);
        st._kapselTraegerY = y;
        st._kapselStruktur = false;
        st.yaw = gier;
        st.pitch = pitch;
        st._kamArm = undefined;
        L.ruhig();
    };
    L.gtHolen = async (x, z) => {
        if (L.gt && st.architectures.includes(L.gt)) return L.gt;
        const gt = r.spawnArchitecture("fahrzeug_gt", { x, y: r.getTerrainHeightAt(x, z) + 0.5, z }, { silent: true, precise: true });
        const dl = performance.now() + 45000;
        while (gt && !gt.instanced && !gt.mesh && performance.now() < dl) {
            r._rebuildArchitectureMesh(gt);
            if (gt.instanced || gt.mesh) break;
            await sleep(200);
        }
        L.gt = gt;
        return gt;
    };
    L.ritt = (gt, x, z, gier) => {
        const y = r.getTerrainHeightAt(x, z);
        gt.position.x = x;
        gt.position.y = y + 0.5;
        gt.position.z = z;
        gt.rotationY = gier - Math.PI / 2;
        gt._rideYaw = gier;
        gt._kamYaw = gier;
        st.yaw = gier;
        st.pitch = 0;
        st.playerMesh.position.set(x, y + 1.0, z);
        if (gt.instanced && typeof r._archInstanceUpdate === "function") r._archInstanceUpdate(gt);
        if (gt.mesh) {
            gt.mesh.position.set(x, y + 0.5, z);
            gt.mesh.rotation.y = gt.rotationY;
            gt.mesh.updateMatrixWorld(true);
        }
        st._kamArm = undefined;
        L.ruhig();
    };
    // die Stelle vor einer Box: die Fläche `seite` (0..3, die Normale im Rahmen der Box), der Abstand vor ihr; { x, z, gier }
    // mit dem Blick von der Box fort (die Kamera hinter dem Spieler steht zu ihr hin)
    L.vor = (b, seite, ab) => {
        const ob = b.obb;
        const cx = ob ? ob.cx : (b.minX + b.maxX) / 2;
        const cz = ob ? ob.cz : (b.minZ + b.maxZ) / 2;
        const hx = ob ? ob.hx : (b.maxX - b.minX) / 2;
        const hz = ob ? ob.hz : (b.maxZ - b.minZ) / 2;
        const c = ob ? ob.c : 1;
        const s = ob ? ob.s : 0;
        // der Leib steht frei: zu Fuß 0,35 m um den Fuß, im Ritt die halbe Länge des Wagens — je 0,25 m hinaus (bis 6 m), sonst die
        // nächste Fläche
        const rand = ab > 2 ? 2.3 : 0.35;
        let erste = null;
        for (let k = 0; k < 4; k++) {
            const [lx, lz] = [
                [1, 0],
                [0, 1],
                [-1, 0],
                [0, -1],
            ][(seite + k) % 4];
            const nx = lx * c + lz * s;
            const nz = -lx * s + lz * c;
            let d = (lx ? hx : hz) + ab;
            for (let i = 0; i <= 24; i++, d += 0.25) {
                const x = cx + nx * d;
                const z = cz + nz * d;
                const v = { x, z, gier: Math.atan2(nx, nz) };
                if (!erste) erste = v;
                if (L.frei(x, z, r.getTerrainHeightAt(x, z), rand)) return v;
            }
        }
        return erste;
    };
}

// DIE MESS-WIESE: Häuser (zwei gesetzt, der Dorf-Zug ruht), Fels und Bäume in 45 m — 40 Posen zu Fuß und im Ritt + der Rundgang
async function leibWiese(arg) {
    const L = window.__kamLeib;
    const r = window.anazhRealm;
    const st = r.state;
    const out = { fuss: { posen: [] }, ritt: { posen: [] } };
    try {
        // Bild-Paare (`arg.bilder`): der Spiel-Loop ruht (die Probe taktet selbst), die Tiere halten still
        if (arg.bilder) {
            st.renderer.setAnimationLoop(null);
            if (window.__tiereHalten) window.__tiereHalten();
            out.bilder = {};
        }
        await r._foundryAwaitBook(45000);
        st.playerMesh.position.set(arg.x, r._voxelSurfaceY(arg.x, arg.z) + 1.8, arg.z);
        out.fehlt = await L.steht(60000);
        out.haeuser = [];
        for (const [typ, dx, dz] of [
            ["haus_alemannisch", 16, 6],
            ["haus_griechisch", -14, 12],
        ]) {
            const x = arg.x + dx;
            const z = arg.z + dz;
            const e = r.spawnArchitecture(typ, { x, y: r.getTerrainHeightAt(x, z), z }, { silent: true, precise: true, absage: (g) => out.haeuser.push("abgesagt: " + g) });
            if (e) out.haeuser.push(e.type);
        }
        await L.steht(30000);
        // DIE ANKER je Art: Bau (größte, ggf. gedrehte Box; Hülle ≥ 2 m), Fels (Natur ohne Pflanzen-Box: die Hülle aller Boxen),
        // Baum (Pflanzen-Boxen: ihre Hülle, ≥ 2 m)
        const je = { haus: [], fels: [], baum: [] };
        const typen = {};
        for (const a of st.architectures || []) {
            if (!a || !a.position) continue;
            const d = Math.hypot(a.position.x - arg.x, a.position.z - arg.z);
            if (d > 45) continue;
            const boxen = Array.isArray(a.blockerAABBs) ? a.blockerAABBs.filter((b) => b && Number.isFinite(b.minX)) : [];
            typen[a.type] = (typen[a.type] || 0) + 1;
            if (!boxen.length) continue;
            const art = boxen.every((b) => b.pflanze === true) ? "baum" : typeof r._istNatur === "function" && r._istNatur(a) ? "fels" : "haus";
            let b = null;
            if (art === "haus") b = boxen.slice().sort((u, v) => (v.maxX - v.minX) * (v.maxZ - v.minZ) - (u.maxX - u.minX) * (u.maxZ - u.minZ))[0];
            else {
                b = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, botY: Infinity, topY: -Infinity };
                for (const q of boxen) {
                    b.minX = Math.min(b.minX, q.minX);
                    b.maxX = Math.max(b.maxX, q.maxX);
                    b.minZ = Math.min(b.minZ, q.minZ);
                    b.maxZ = Math.max(b.maxZ, q.maxZ);
                    b.botY = Math.min(b.botY, q.botY);
                    b.topY = Math.max(b.topY, q.topY);
                }
            }
            const hoehe = Math.max(...boxen.map((q) => q.topY)) - Math.min(...boxen.map((q) => q.botY));
            if (art !== "fels" && hoehe < 2) continue;
            je[art].push({ id: a.id, typ: String(a.type), b, d });
        }
        for (const k of Object.keys(je)) je[k].sort((u, v) => u.d - v.d || String(u.id).localeCompare(String(v.id)));
        out.anker = Object.fromEntries(Object.entries(je).map(([k, v]) => [k, v.length]));
        out.typen = typen;
        const posen = [];
        for (const art of ["haus", "fels", "baum"]) {
            const A = je[art];
            for (let j = 0; j < arg.quote[art] && A.length; j++) {
                const a = A[j % A.length];
                posen.push({
                    id: `pose-${String(posen.length).padStart(2, "0")}`,
                    anker: a.typ,
                    b: a.b,
                    // je Anker die vier Flächen, die Neigung wechselnd (keine Pose doppelt)
                    seite: (Math.floor(j / A.length) + (A.length >= 4 ? j : 0)) % 4,
                    pitch: (j + Math.floor(j / (4 * A.length))) % 2 ? 0.4 : 0,
                });
            }
        }
        for (const p of posen) {
            const v = L.vor(p.b, p.seite, 0.8);
            L.fuss(v.x, v.z, v.gier, p.pitch);
            out.fuss.posen.push(
                Object.assign(
                    { id: p.id, anker: p.anker, seite: p.seite, pitch: p.pitch, x: +v.x.toFixed(2), z: +v.z.toFixed(2), gier: +v.gier.toFixed(3) },
                    L.messen(null)
                )
            );
            if (arg.bilder && arg.bilder.ids.includes(p.id)) {
                window.__buehne();
                L.ruhig();
                const W = arg.bilder.w;
                const H = arg.bilder.h;
                const auf = await window.__ausgabeAufnahme(W, H, 1);
                const cv = document.createElement("canvas");
                cv.width = W;
                cv.height = H;
                const ctx = cv.getContext("2d");
                const img = ctx.createImageData(W, H);
                img.data.set(auf.u8.subarray(0, W * H * 4));
                ctx.putImageData(img, 0, 0);
                out.bilder[p.id] = { png: cv.toDataURL("image/png"), dc: auf.info.drawCalls, dreiecke: auf.info.triangles };
                if (Object.keys(out.bilder).length >= arg.bilder.ids.length) return out;
            }
        }
        // DER RUNDGANG: 240 Bilder um das erste Haus (Radius Box + 1,2 m), der Blick tangential — Kamera-Sprünge > 2 m
        const h = je.haus[0] || je.fels[0];
        if (h) {
            const b = h.b;
            const ob = b.obb;
            const cx = ob ? ob.cx : (b.minX + b.maxX) / 2;
            const cz = ob ? ob.cz : (b.minZ + b.maxZ) / 2;
            const rad = Math.max(ob ? ob.hx : (b.maxX - b.minX) / 2, ob ? ob.hz : (b.maxZ - b.minZ) / 2) + 1.2;
            r.setCameraMode("third");
            st._kamArm = undefined;
            let vor = null;
            let spr = 0;
            let tt = 9000;
            for (let i = 0; i <= 240; i++) {
                const th = (i / 240) * Math.PI * 2;
                const x = cx + Math.sin(th) * rad;
                const z = cz + Math.cos(th) * rad;
                const y = r.getTerrainHeightAt(x, z);
                st.playerMesh.position.set(x, y + r.constructor.PLAYER_FOOT_OFFSET + 0.02, z);
                st._kapselTraegerY = y;
                st.yaw = th + Math.PI / 2;
                st.pitch = 0.2;
                L.zaehle(() => r._loopCamera((tt += 1 / 30)));
                const c = st.camera.position;
                if (vor && Math.hypot(c.x - vor.x, c.y - vor.y, c.z - vor.z) > 2) spr++;
                vor = { x: c.x, y: c.y, z: c.z };
            }
            out.spruenge = spr;
            out.rundgang = h.typ;
        }
        // DER VERFOLGER-RITT: dieselben Posen, der GT 3,2 m vor der Box, sein Heck zu ihr
        const gt = await L.gtHolen(arg.x + 30, arg.z);
        const mr = gt ? r.mountArchitecture(gt) : null;
        if (mr && mr.ok) {
            r.setCameraMode("third");
            for (const p of posen) {
                const v = L.vor(p.b, p.seite, 3.2);
                L.ritt(gt, v.x, v.z, v.gier);
                out.ritt.posen.push(Object.assign({ id: p.id, anker: p.anker, seite: p.seite, x: +v.x.toFixed(2), z: +v.z.toFixed(2) }, L.messen(gt)));
            }
            r.dismountArchitecture();
        } else out.ritt.grund = gt ? "Aufsitzen scheiterte" : "kein GT";
    } catch (e) {
        out.err = (e && e.stack) || String(e);
    }
    out.proben = L.proben;
    return out;
}

// DER 30°-HANG DER PRÜFBÜHNE (s2-hang30): 10 Posen auf der Rampe, der Blick hangab (die Kamera hangauf hinter dem Spieler)
async function leibHang(arg) {
    const L = window.__kamLeib;
    const r = window.anazhRealm;
    const st = r.state;
    const out = { fuss: { posen: [] }, ritt: { posen: [] } };
    try {
        await r._foundryAwaitBook(45000);
        const S = arg.hang;
        st.playerMesh.position.set(S.x, r._voxelSurfaceY(S.x, S.z) + 1.8, S.z);
        out.fehlt = await L.steht(60000);
        const posen = [];
        for (let i = 0; i < arg.n; i++) {
            const z = S.fusZ + 4 + ((S.kroneZ - S.fusZ - 8) * i) / Math.max(1, arg.n - 1);
            posen.push({ id: `hang-${String(i).padStart(2, "0")}`, anker: "s2-hang30", x: S.x + (i % 2 ? 5 : -5), z, gier: Math.PI, pitch: i % 2 ? 0 : 0.4 });
        }
        for (const p of posen) {
            L.fuss(p.x, p.z, p.gier, p.pitch);
            out.fuss.posen.push(Object.assign({ id: p.id, anker: p.anker, pitch: p.pitch, x: +p.x.toFixed(2), z: +p.z.toFixed(2) }, L.messen(null)));
        }
        const gt = await L.gtHolen(S.x + 12, S.fusZ - 10);
        const mr = gt ? r.mountArchitecture(gt) : null;
        if (mr && mr.ok) {
            r.setCameraMode("third");
            for (const p of posen) {
                L.ritt(gt, p.x, p.z, p.gier);
                out.ritt.posen.push(Object.assign({ id: p.id, anker: p.anker, x: +p.x.toFixed(2), z: +p.z.toFixed(2) }, L.messen(gt)));
            }
            r.dismountArchitecture();
        } else out.ritt.grund = gt ? "Aufsitzen scheiterte" : "kein GT";
    } catch (e) {
        out.err = (e && e.stack) || String(e);
    }
    out.proben = L.proben;
    return out;
}

// NP-03 + NP-02 im Körper-Studio (Seiten-Funktion über die Lab-Globalen play · parkBoxes · playInput · playPhysics · camera)
/* global play, parkBoxes, playInput, playPhysics, camera, character, keys, enterPlay, resetRun */
function ninja(arg) {
    const out = { posen: [] };
    try {
        enterPlay();
        resetRun();
        play.cam = "third";
        const schritt = (n) => {
            for (let i = 0; i < n; i++) {
                playInput(1 / 60);
                playPhysics(1 / 60);
            }
        };
        for (let i = 0; i < arg.wp.length; i++)
            for (const yw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
                // `arg.nur`: nur diese Pose (das Bild), keine Tunnel-Probe
                if (arg.nur != null && i * 4 + [0, Math.PI / 2, Math.PI, -Math.PI / 2].indexOf(yw) !== arg.nur) continue;
                const [x, z, y] = arg.wp[i];
                for (const k in keys) keys[k] = false;
                character.position.x = x;
                character.position.z = z;
                play.posY = y;
                play.vx = play.vy = play.vz = 0;
                play.yaw = yw;
                play.faceYaw = yw;
                play.pitch = 0.22;
                schritt(90);
                const c = camera.position;
                const Lk = [play.lookX, play.lookY, play.lookZ];
                const D = [c.x - Lk[0], c.y - Lk[1], c.z - Lk[2]];
                const taeter = [];
                for (let bi = 0; bi < parkBoxes.length; bi++) {
                    const b = parkBoxes[bi];
                    const lo = [b.cx - b.sx / 2, b.cy - b.sy / 2, b.cz - b.sz / 2];
                    const hi = [b.cx + b.sx / 2, b.cy + b.sy / 2, b.cz + b.sz / 2];
                    const m = arg.rand;
                    const name = bi === 0 ? "Boden" : `Box ${bi}`;
                    if (c.x > lo[0] - m && c.x < hi[0] + m && c.y > lo[1] - m && c.y < hi[1] + m && c.z > lo[2] - m && c.z < hi[2] + m) {
                        taeter.push(`Kamera in ${name}`);
                        continue;
                    }
                    let t0 = 0;
                    let t1 = 1;
                    let ok = true;
                    for (let a = 0; a < 3 && ok; a++) {
                        if (Math.abs(D[a]) < 1e-9) {
                            if (Lk[a] < lo[a] || Lk[a] > hi[a]) ok = false;
                            continue;
                        }
                        let u = (lo[a] - Lk[a]) / D[a];
                        let v = (hi[a] - Lk[a]) / D[a];
                        if (u > v) [u, v] = [v, u];
                        t0 = Math.max(t0, u);
                        t1 = Math.min(t1, v);
                        if (t0 > t1) ok = false;
                    }
                    if (ok) taeter.push(`${name} zwischen Ziel und Kamera`);
                }
                out.posen.push({
                    id: `pose-${String(i * 4 + [0, Math.PI / 2, Math.PI, -Math.PI / 2].indexOf(yw)).padStart(2, "0")} P${i} ${Math.round((yw * 180) / Math.PI)}°`,
                    cam: [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)],
                    ziel: Lk.map((q) => +q.toFixed(2)),
                    figur: [+character.position.x.toFixed(2), +play.posY.toFixed(2), +character.position.z.toFixed(2)],
                    taeter,
                });
            }
        if (arg.nur != null) return out;
        for (const k in keys) keys[k] = false;
        character.position.x = 3.6;
        character.position.z = 21;
        play.posY = 0.05;
        play.vx = play.vy = play.vz = 0;
        play.yaw = play.faceYaw = 0;
        schritt(30);
        keys.KeyW = true;
        keys.ShiftLeft = true;
        schritt(240);
        for (const k in keys) keys[k] = false;
        const e = [+character.position.x.toFixed(2), +play.posY.toFixed(2), +character.position.z.toFixed(2)];
        const weg = Math.hypot(e[0] - 3.6, e[2] - 21);
        const umgangen = e[2] > 28 && Math.abs(e[0]) > 3;
        out.tunnel = { ende: e, weg: +weg.toFixed(2), umgangen, gueltig: weg >= 3 || umgangen };
    } catch (e) {
        out.err = (e && e.stack) || String(e);
    }
    return out;
}

// KAMERA_LAUB_STAMM: der Stamm-Text des Vorher (eine Stamm-Datei oder ein Baum, scripts/lib/stamm.cjs), ausgeliefert in
// der Form dieses Baums (`liefere`: die Datei, die die Zeile trägt)
const STAMM_TEXT = STAMM ? stammLib.text(STAMM) : null;
const server = statikServer({
    root,
    wandle: (p, data) => {
        const vorher = STAMM_TEXT ? stammLib.liefere(root, p, STAMM_TEXT) : null;
        if (vorher) return vorher;
        return STUDIO && p === "/worlds/koerperstudio/koerperstudio.js" ? fs.readFileSync(STUDIO) : data;
    },
});

// ── DIE PROBE IN DER SEITE (r = die Welt) ──
async function probe(arg) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const dl0 = performance.now() + 90000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0) await sleep(100);
    const r = window.anazhRealm;
    const st = r.state;
    const nahDeckung = window.__nahDeckung;
    // Bild-Paare: der Spiel-Loop ruht (die Probe taktet selbst), die Tiere halten still
    if (arg.bilder) {
        r.state.renderer.setAnimationLoop(null);
        if (window.__tiereHalten) window.__tiereHalten();
    }
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(ms || 30);
        }
    };
    const out = { orte: {}, zeiten: {} };
    const t0 = performance.now();
    await r._foundryAwaitBook(45000);
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    // die Welt wächst, bis ihr Bild steht (`_weltbildFehlt` leer)
    const steht = async (ms) => {
        const dl = performance.now() + ms;
        let n = 0;
        while (performance.now() < dl) {
            await tick(5, 40);
            n++;
            if (n >= 4 && !r._weltbildFehlt().length) break;
        }
        return r._weltbildFehlt();
    };
    await steht(90000);
    out.zeiten.boot = Math.round(performance.now() - t0);
    let T = 1000;
    const ruhig = () => {
        for (let i = 0; i < 10; i++) r._loopCamera((T += 0.1));
    };
    // DIE ANKER: die Stämme der Mesh-Zone (Rinde-Instanzen jeder Quelle: gesetzte und gestreute Bäume, Büsche) und die
    // belaubten Pflanzen der Nah-Streu (Gestrüpp, Farn — der Strauch vor dem Ich-Auge, C 12)
    const v = new THREE.Vector3();
    const m4 = new THREE.Matrix4();
    const streuLaub = () => {
        const out2 = [];
        const ns = st.nahStreu;
        if (!ns) return out2;
        for (const a of ns.senken.values()) {
            const k = a.mat && a.mat.userData ? a.mat.userData.foundryKind : null;
            if (k !== "foliage" && k !== "foliageTex") continue;
            for (const b of a.bloecke.values())
                for (let i = 0; i < b.n; i++) {
                    m4.fromArray(b.matrizen, i * 16);
                    v.setFromMatrixPosition(m4);
                    out2.push({ x: v.x, z: v.z, werk: "Streu " + a.preset, e: null });
                }
        }
        return out2;
    };
    const staemme = () => {
        const out2 = [];
        st.scene.traverseVisible((o) => {
            if (!o.isInstancedMesh || !o.userData || !o.userData.archInstanceKey) return;
            const k = o.material && o.material.userData ? o.material.userData.foundryKind : null;
            if (k !== "bark" && k !== "stem") return;
            const g = st.archInstanceGroups ? st.archInstanceGroups.get(o.userData.archInstanceKey) : null;
            for (let i = 0; i < o.count; i++) {
                m4.fromArray(o.instanceMatrix.array, i * 16);
                if (Math.abs(m4.determinant()) < 1e-12) continue;
                m4.premultiply(o.matrixWorld);
                v.setFromMatrixPosition(m4);
                const e = g && g.slotEntry ? g.slotEntry[i] : null;
                out2.push({ x: v.x, z: v.z, werk: (e && e.type) || "Streu", e });
            }
        });
        return out2;
    };
    // der Spieler steht nie in einem Stamm (die Physik hält ihn davor): eine Stellung, deren Fuß in einem festen Blocker steht,
    // fällt
    const imBlocker = (x, z) => {
        for (const a of st.architectures || [])
            if (a && a.blockerAABBs && a.position && Math.abs(a.position.x - x) < 20 && Math.abs(a.position.z - z) < 20)
                for (const b of a.blockerAABBs) if (x > b.minX - 0.3 && x < b.maxX + 0.3 && z > b.minZ - 0.3 && z < b.maxZ + 0.3) return true;
        return false;
    };
    // ── DER EINGESCHMUGGELTE TÄTER (am ersten Ort mit Laub in der Nah-Kugel, an der Stellung mit den meisten Täter-Flächen):
    // einmal jeder Laub-Stoff der Szene ohne Durchsicht, einmal ein Fels (eine Formation) 1 m vor der Linse — die Linse muss
    // beide beim Namen nennen ──
    const schmuggle = (sl) => {
        const s = { stellung: sl };
        try {
            const tS = performance.now();
            r.setCameraMode("third");
            // DIE KRONEN-STELLUNG (K20, 12.10.): der Bestandsbaum trägt seine Krone auf dem Schaft (phyto-core schaftHub) — am
            // Stamm-Fuß steht kein Laub in der Nah-Kugel, der Schmuggel dort maß 0,0 % und die Linse war blind. Die Stellung
            // steigt je 1 m am Stamm hinauf (der Spieler schwebt, die 3rd-Kamera folgt), bis das Laub ohne Durchsicht die Linse
            // deckt; an DERSELBEN Stellung muss die Durchsicht es wieder öffnen (≤ NAH_DECKUNG_MAX).
            let hub = 0;
            const stelle = () => {
                st.playerMesh.position.set(sl.x, hh(sl.x, sl.z) + 1.0 + hub, sl.z);
                st.yaw = sl.gier;
                st.pitch = sl.pitch;
                ruhig();
            };
            const nimmLaub = (d) => d.deckung > arg.nahMax && Object.keys(d.taeter || {}).some((k) => /^Laub /.test(k));
            // (1) die Laub-Stoffe der Szene ohne Durchsicht
            const laub = new Map();
            st.scene.traverse((o) => {
                const mt = o && o.material;
                const k = mt && mt.userData ? mt.userData.foundryKind : null;
                if ((k === "foliage" || k === "foliageTex") && mt.maskNode) laub.set(mt, mt.maskNode);
            });
            for (const mt of laub.keys()) mt.maskNode = null;
            for (hub = 0; hub <= arg.hubMax; hub += 1) {
                stelle();
                s.laub = nahDeckung({ radien: sl.radien, gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null, neu: hub > 0 });
                if (nimmLaub(s.laub)) break;
            }
            s.laub.max = s.laub.deckung;
            s.laub.hub = hub;
            for (const [mt, kn] of laub) mt.maskNode = kn;
            // (1b) dieselbe Kronen-Stellung MIT Durchsicht
            if (nimmLaub(s.laub)) {
                stelle();
                s.krone = nahDeckung({ radien: sl.radien, gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null });
                s.krone.max = s.krone.deckung;
                s.krone.hub = hub;
            }
            hub = 0;
            // (2) ein Fels 1 m vor der Linse (eine Formation ohne Durchsicht)
            stelle();
            const c = st.camera.position;
            const f = st.camera.getWorldDirection(new THREE.Vector3());
            const fels = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial());
            fels.name = "formationenSatz";
            fels.position.set(c.x + f.x, c.y + f.y, c.z + f.z);
            st.scene.add(fels);
            fels.updateMatrixWorld(true);
            s.fels = nahDeckung({ radien: sl.radien, gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null, neu: true });
            s.fels.max = s.fels.deckung;
            st.scene.remove(fels);
            fels.geometry.dispose();
            window.__nahSpeicher = null; // der Fels liegt im Speicher: die nächste Stellung rechnet ihn neu
            s.ms = Math.round(performance.now() - tS);
        } catch (e) {
            s.err = (e && e.stack) || String(e);
        }
        return s;
    };
    let gt = null;
    let speicherOrt = null;
    // DIE RADIEN je Sicht (die Täter-Klassen mit ihrem Radius um das Auge): in 3rd und im Ritt fallen Laub und Rinde im
    // FREIRAUM der Kamera (bis einen Saum vor die Ebene des Ziels), die Boden-Streu, Fels und der eigene Wagen in der Nähe der
    // Linse (3rd 2,0 m, Ritt 3,0 m); im Ich-Auge Laub und Boden-Streu bis 0,8 m (die Rinde, an der der Leib steht, bleibt)
    const radienFuer = (modus) => {
        if (modus === "first") return { Laub: arg.radius.first, Streu: arg.radius.first };
        const kz = st._kamZiel;
        const frei = kz ? Math.max(0, Math.hypot(kz.x - kz.ex, kz.y - kz.ey, kz.z - kz.ez) - arg.saum) : 0;
        const nah = Math.min(arg.radius[modus], frei);
        return { Laub: frei, Rinde: frei, Streu: nah, Fels: nah, Wagen: nah };
    };
    // ── DAS BILD-PAAR (`--bilder`, echte GPU): an der schlimmsten Stellung des Vorher dieselbe Welt zweimal aus dem
    // Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs, Bühne Mittag · Sonne · Sommer) — vorher mit der Nah-Kugel aus (die
    // Formel des Vor-Stands), nachher wie im Spiel; dazu die Nah-Deckung beider ──
    const schuss = async (modus, stelle, sl) => {
        const res = { stellung: sl };
        if (!sl || !arg.bilder) return res;
        const lu = st.lodUniforms;
        for (const phase of ["vorher", "nachher"]) {
            stelle(sl.x, hh(sl.x, sl.z), sl.z, sl.gier);
            st.pitch = sl.pitch;
            ruhig();
            window.__buehne();
            if (phase === "vorher" && lu && lu.uKamNah) lu.uKamNah.value.set(-arg.saum, -arg.saum, -arg.saum);
            const d = nahDeckung({ radien: radienFuer(modus), gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null });
            const W = arg.bilder.w;
            const H = arg.bilder.h;
            const auf = await window.__ausgabeAufnahme(W, H, 1);
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            img.data.set(auf.u8.subarray(0, W * H * 4));
            ctx.putImageData(img, 0, 0);
            res[phase] = { deckung: d.deckung, taeter: d.taeter, dc: auf.info.drawCalls, dreiecke: auf.info.triangles, png: cv.toDataURL("image/png") };
        }
        return res;
    };
    for (const ort of arg.orte) {
        const tO = performance.now();
        const z = (out.orte[ort.id] = { bild: ort.bild, modi: {} });
        try {
            if (ort.art) {
                // der Ort aus der Welt (s. ORTE): findet die Suche keinen, bricht der Ort laut — nie ein Ersatz
                const see = ort.art === "ufer" ? window.__wasserOrte({}).see : null;
                const O = ort.art === "ufer" ? see && see.ufer && { x: see.ufer[0], z: see.ufer[1] } : window.__weltOrt(ort.art, ort.such);
                if (!O) throw new Error(`kein Ort der Art ${ort.art} aus der Welt`);
                z.ortAusWelt = [O.x, O.z];
                st.playerMesh.position.set(O.x, r._voxelSurfaceY(O.x, O.z) + 1.8, O.z);
                z.fehlt = await steht(45000);
            }
            z.ms = { boden: Math.round(performance.now() - tO) };
            const P = st.playerMesh.position.clone();
            // der Orts-Speicher der Linse (scripts/lib/kamera-nah.cjs): die Region um den Ort, neu je Ort
            speicherOrt = { id: ort.id, x: P.x, z: P.z, r: 60 };
            window.__nahSpeicher = null;
            // die Stämme des Orts wachsen nach dem Boden (Buch → Bäcker → Instanz): gewartet wird, bis ihre Zahl ruht
            {
                const dlS = performance.now() + 30000;
                let vorN = -1;
                let ruhe = 0;
                while (performance.now() < dlS && ruhe < 4) {
                    await tick(5, 40);
                    const n = staemme().filter((s2) => Math.hypot(s2.x - P.x, s2.z - P.z) < 25).length;
                    ruhe = n === vorN ? ruhe + 1 : 0;
                    vorN = n;
                }
                z.staemme = vorN;
                z.ms.staemme = Math.round(performance.now() - tO);
            }
            z.P = [+P.x.toFixed(1), +P.z.toFixed(1)];
            let hain = [];
            if (ort.satz) {
                const vor = new Set(st.architectures);
                r.processChatCommand(ort.satz);
                await steht(30000);
                hain = st.architectures.filter((a) => a && !vor.has(a) && a.type === ort.satzWerk);
                z.satz = hain.map((a) => a.type);
                z.ms.satz = Math.round(performance.now() - tO);
            }
            // die nahen Stämme (der Hain des Satzes zuerst) und Sträucher der Streu, je 1,5 m einer
            const anker = [];
            const nimm = (s, max) => {
                if (anker.length >= max) return;
                if (anker.some((a) => Math.hypot(a.x - s.x, a.z - s.z) < 1.5)) return;
                anker.push(s);
            };
            const nach = (a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z);
            const alle = staemme().filter((s2) => Math.hypot(s2.x - P.x, s2.z - P.z) < 40);
            for (const s of alle.filter((s2) => s2.e && hain.includes(s2.e))) nimm(s, arg.jeOrt);
            for (const s of alle.sort(nach)) nimm(s, arg.jeOrt);
            const grenzeStreu = anker.length + Math.max(arg.jeStreu, arg.jeOrt - anker.length);
            for (const s of streuLaub()
                .filter((s2) => Math.hypot(s2.x - P.x, s2.z - P.z) < 25)
                .sort(nach)) nimm(s, grenzeStreu);
            z.anker = anker.map((a) => `${a.werk}@${a.x.toFixed(0)}/${a.z.toFixed(0)}`);
            const messe = (modus, stelle, abstand, gieren, nicken) => {
                const m = { n: 0, max: 0, summe: 0, jeKlasse: {}, taeter: {}, schlimmste: null, dichteste: null };
                let dicht = -1;
                for (const a of anker)
                    for (let k = 0; k < 8; k++) {
                        const g = (k / 8) * Math.PI * 2;
                        // aus dem Stamm hinaus (der Leib steht nie in seinem Blocker): je 0,25 m, bis der Fuß frei steht
                        let ab = abstand;
                        while (ab < abstand + 3 && imBlocker(a.x + Math.sin(g) * ab, a.z + Math.cos(g) * ab)) ab += 0.25;
                        const x = a.x + Math.sin(g) * ab;
                        const zz = a.z + Math.cos(g) * ab;
                        const y = hh(x, zz);
                        if (!Number.isFinite(y)) continue;
                        for (const dg of gieren)
                            for (const pitch of nicken) {
                                stelle(x, y, zz, g + dg);
                                st.pitch = pitch;
                                ruhig();
                                // das Vorher in derselben Welt (Bild-Paare): die Nah-Kugel aus, die Formel des Vor-Stands
                                if (arg.nahAus && st.lodUniforms && st.lodUniforms.uKamNah) st.lodUniforms.uKamNah.value.set(-arg.saum, -arg.saum, -arg.saum);
                                const radien = radienFuer(modus);
                                if (!(Math.max(...Object.values(radien)) > 0)) continue;
                                const d = nahDeckung({ radien, gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null });
                                m.n++;
                                m.summe += d.deckung;
                                for (const [kk, vv] of Object.entries(d.jeKlasse)) m.jeKlasse[kk] = +((m.jeKlasse[kk] || 0) + vv).toFixed(4);
                                for (const [kk, vv] of Object.entries(d.taeter)) m.taeter[kk] = +((m.taeter[kk] || 0) + vv).toFixed(4);
                                if (d.fremd) m.fremd = true;
                                const stellung = { anker: a.werk, x: +x.toFixed(3), z: +zz.toFixed(3), gier: +(g + dg).toFixed(4), pitch, auge: d.auge, radien, taeter: d.taeter };
                                if (d.deckung > m.max) {
                                    m.max = d.deckung;
                                    m.schlimmste = stellung;
                                }
                                // die Stellung mit den meisten Täter-Flächen in der Nah-Kugel (dort schmuggelt die Linse)
                                if (d.taeterDreiecke > dicht) {
                                    dicht = d.taeterDreiecke;
                                    m.dichteste = Object.assign({ dreiecke: d.taeterDreiecke }, stellung);
                                }
                            }
                    }
                m.mittel = m.n ? +(m.summe / m.n).toFixed(4) : null;
                delete m.summe;
                m.max = +m.max.toFixed(4);
                return m;
            };
            const fuss = (x, y, zz, gier) => {
                st.playerMesh.position.set(x, y + 1.0, zz);
                st.yaw = gier;
            };
            // ZU FUSS (3rd): der Spieler 1,5 m vor dem Stamm, der Blick von ihm weg (die Kamera in der Krone) und quer;
            // Neigung 0 und −0,35 (die Kamera hoch über der Figur)
            r.setCameraMode("third");
            z.modi.third = messe("third", fuss, 1.5, [0, Math.PI / 2], [0, -0.35]);
            if (arg.bilder) (z.bilder = z.bilder || {}).third = await schuss("third", fuss, z.modi.third.schlimmste);
            if (!arg.bilder && !out.schmuggel && z.modi.third.dichteste && z.modi.third.dichteste.dreiecke > 0) out.schmuggel = schmuggle(z.modi.third.dichteste);
            // DAS ICH-AUGE: der Spieler 0,9 m vor dem Stamm, der Blick zu ihm und von ihm weg, geradeaus und gehoben
            r.setCameraMode("first");
            z.modi.first = messe("first", fuss, 0.9, [0, Math.PI], [0, 0.3]);
            if (arg.bilder) (z.bilder = z.bilder || {}).first = await schuss("first", fuss, z.modi.first.schlimmste);
            r.setCameraMode("third");
            // DER RITT: ein GT, aufgesessen, 3 m vor dem Stamm (die Verfolger-Kamera des Kerns hinter ihm)
            if (!gt) {
                gt = r.spawnArchitecture("fahrzeug_gt", { x: P.x + 30, y: hh(P.x + 30, P.z) + 0.5, z: P.z }, { silent: true, precise: true });
                const dlG = performance.now() + 45000;
                while (gt && !gt.instanced && !gt.mesh && performance.now() < dlG) {
                    r._rebuildArchitectureMesh(gt);
                    if (gt.instanced || gt.mesh) break;
                    await sleep(200);
                }
            }
            const mr = gt ? r.mountArchitecture(gt) : null;
            if (mr && mr.ok) {
                const rittStelle = (x, y, zz, gier) => {
                        gt.position.x = x;
                        gt.position.y = y + 0.5;
                        gt.position.z = zz;
                        gt.rotationY = gier - Math.PI / 2;
                        gt._rideYaw = gier;
                        gt._kamYaw = gier;
                        st.yaw = gier;
                        st.playerMesh.position.set(x, y + 1.0, zz);
                        // der Wagen steht im Bild, wo er steht (Instanz-Matrizen bzw. Mesh)
                        if (gt.instanced && typeof r._archInstanceUpdate === "function") r._archInstanceUpdate(gt);
                        if (gt.mesh) {
                            gt.mesh.position.set(x, y + 0.5, zz);
                            gt.mesh.rotation.y = gt.rotationY;
                            gt.mesh.updateMatrixWorld(true);
                        }
                    };
                z.modi.ritt = messe("ritt", rittStelle, 3.0, [0, Math.PI / 2], [0]);
                if (arg.bilder) (z.bilder = z.bilder || {}).ritt = await schuss("ritt", rittStelle, z.modi.ritt.schlimmste);
                r.dismountArchitecture();
            } else z.modi.ritt = { n: 0, grund: gt ? "Aufsitzen scheiterte" : "kein GT" };
        } catch (e) {
            z.err = (e && e.stack) || String(e);
        }
        out.zeiten[ort.id] = Math.round(performance.now() - tO);
    }
    if (gt) r.removeArchitecture(gt);
    return out;
}

(async () => {
    const quelle = STAMM_TEXT || stammLib.text(root);
    const studioQuelle = fs.readFileSync(STUDIO || path.join(root, "worlds", "koerperstudio", "koerperstudio.js"), "utf8");
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST (ohne Welt) ===");
        const ort = (max, taeter) => ({
            modi: Object.fromEntries(MODI.map((k) => [k, { n: 64, max, mittel: max / 4, schlimmste: { taeter } }])),
        });
        // DER LEIB (K2) und NP-03 (K3): gesund und je ein Bruch beim Namen
        const pose = (id, taeter) => ({ id, anker: "haus_basis", x: 0, z: 0, c: [0, 0, 0], arm: 4, taeter });
        const posenN = (n, kaputt) => Array.from({ length: n }, (_, i) => pose(`pose-${i}`, i === 0 && kaputt ? kaputt : []));
        const leibGesund = (kaputtFuss, kaputtRitt) => ({
            wiese: { fuss: { posen: posenN(LEIB_N - LEIB_HANG_N, kaputtFuss) }, ritt: { posen: posenN(LEIB_N - LEIB_HANG_N, kaputtRitt) } },
            hang: { fuss: { posen: posenN(LEIB_HANG_N) }, ritt: { posen: posenN(LEIB_HANG_N) } },
            proben: Array.from({ length: LEIB_N + 241 }, (_, i) => 30 + (i % 9)),
            spruenge: 0,
        });
        check("Selbst-Test K2: gesund == 0 Täter", urteilLeib(leibGesund()).length === 0, urteilLeib(leibGesund()).join(" · "));
        const leibBrueche = [
            ["Kamera unter dem sichtbaren Boden (R-CAM unterBoden)", leibGesund(["unter dem sichtbaren Boden (-12 cm über ihm)"]), "Leib fuss: 1 von 50 Posen — pose-0 (haus_basis): unter dem sichtbaren Boden"],
            ["Verfolger im Haus (FZ-07)", leibGesund(null, ["in haus_basis"]), "Leib ritt: 1 von 50 Posen — pose-0 (haus_basis): in haus_basis"],
            ["Fels zwischen Ziel und Linse", leibGesund(["Gelände zwischen Ziel und Linse"]), "Leib fuss: 1 von 50"],
            ["der Hang fehlt", Object.assign(leibGesund(), { hang: null }), "Leib hang: nicht gemessen"],
            ["kein Zähler der Feld-Proben", Object.assign(leibGesund(), { proben: null }), "Leib: 0 Bilder gezählt"],
            ["die Eckstrahlen marschieren ohne Treffer (Prüfung 1: 35 → 156)", Object.assign(leibGesund(), { proben: Array(LEIB_N + 241).fill(156) }), "Leib: Feld-Proben je 3rd-Bild Mittel 156"],
            ["ein Bild sucht ohne Ende (höchstens über 2 × Vor-Stand)", Object.assign(leibGesund(), { proben: Array.from({ length: LEIB_N + 241 }, (_, i) => (i === 7 ? 101 : 30)) }), "Leib: Feld-Proben je 3rd-Bild Mittel 30.2 · Median 30 · höchstens 101"],
            ["mehr Sprünge als vorher", Object.assign(leibGesund(), { spruenge: SPRUENGE_MAX + 1 }), "Leib: " + (SPRUENGE_MAX + 1) + " Kamera-Sprünge"],
        ];
        for (const [name, bruch, soll] of leibBrueche) {
            const v = urteilLeib(bruch);
            check(`Selbst-Test K2: ‚${name}' → die Linse nennt „${soll}"`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const ninjaGesund = (kaputt, tunnel) => ({
            posen: Array.from({ length: NINJA_WP.length * 4 }, (_, i) => ({ id: `pose-${i}`, cam: [0, 0, 0], taeter: i === 14 && kaputt ? kaputt : [] })),
            tunnel: tunnel || { ende: [3.6, 0, 24.15], weg: 3.15, umgangen: false, gueltig: true },
        });
        check("Selbst-Test K3: gesund == 0 Täter", urteilNinja(ninjaGesund()).length === 0, urteilNinja(ninjaGesund()).join(" · "));
        for (const [name, bruch, soll] of [
            ["Box 7 zwischen Ziel und Kamera (NP-03 pose-14)", ninjaGesund(["Box 7 zwischen Ziel und Kamera"]), "NP-03: 1 von 48 Posen — pose-14: Box 7"],
            ["der Tunnel wird umgangen (NP-02)", ninjaGesund(null, { ende: [3.6, 0, 30], weg: 9, umgangen: true, gueltig: true }), "NP-02: der Tunnel wird bei x > 3 umgangen"],
            ["die Figur steht (NP-02 ohne Urteil)", ninjaGesund(null, { ende: [3.6, 0, 21], weg: 0, umgangen: false, gueltig: false }), "NP-02: die Figur bewegt sich keine 3 m"],
        ]) {
            const v = urteilNinja(bruch);
            check(`Selbst-Test K3: ‚${name}' → die Linse nennt „${soll}"`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const gesund = {
            orte: { ankunft: ort(0, {}), ufer: ort(0.004, {}), lichtung: ort(0, {}), hang: ort(0, {}) },
            schmuggel: { laub: { max: 0.4, taeter: { "Laub baum_eiche": 0.4 } }, fels: { max: 0.3, taeter: { "Fels Formation": 0.3 } } },
        };
        check("Selbst-Test: gesund == 0 Täter", urteil(gesund).length === 0, urteil(gesund).join(" · "));
        const brueche = [
            ["Eichenkrone vor der Linse (Befund A 44)", { orte: Object.assign({}, gesund.orte, { ufer: ort(0.437, { "Laub baum_eiche": 0.43 }) }) }, "ufer third: Deckung im Freiraum bis 43.7 %"],
            ["Strauch vor dem Ich-Auge (Befund C 12)", { orte: Object.assign({}, gesund.orte, { hang: ort(0.99, { "Laub Streu": 0.99 }) }) }, "hang third: Deckung im Freiraum bis 99.0 %"],
            ["kein GT", { orte: Object.assign({}, gesund.orte, { ankunft: { modi: { third: { n: 4, max: 0 }, first: { n: 4, max: 0 }, ritt: { n: 0, grund: "kein GT" } } } }) }, "ankunft ritt: keine Stellung"],
            ["fremde Maske", { orte: Object.assign({}, gesund.orte, { hang: { modi: { third: { n: 4, max: 0, fremd: true }, first: { n: 4, max: 0 }, ritt: { n: 4, max: 0 } } } }) }, "hang third: ein Pflanzen-Stoff trägt eine fremde Maske"],
            ["Linse blind für Laub", { schmuggel: { laub: { max: 0, taeter: {} }, fels: gesund.schmuggel.fels } }, "Schmuggel: ein Laub-Stoff ohne Durchsicht bleibt ungenannt"],
            ["Linse blind für Fels", { schmuggel: { laub: gesund.schmuggel.laub, fels: { max: 0, taeter: {} } } }, "Schmuggel: ein Fels vor der Linse bleibt ungenannt"],
            ["Krone ohne Durchsicht (die Kronen-Stellung, K20)", { schmuggel: Object.assign({}, gesund.schmuggel, { krone: { max: 0.31, hub: 14, taeter: { "Laub baum_tanne": 0.31 } } }) }, "Krone: die Durchsicht öffnet das Laub in der Krone nicht"],
            ["ein Ort fehlt", { orte: { ankunft: gesund.orte.ankunft, ufer: gesund.orte.ufer } }, "hang: nicht gemessen"],
        ];
        for (const [name, bruch, soll] of brueche) {
            const v = urteil(Object.assign({}, gesund, bruch));
            check(`Selbst-Test: ‚${name}' → die Linse nennt „${soll}"`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const gruen = wand(quelle, studioQuelle);
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        // der Vor-Stand: die Picks ohne Durchsicht, der Wurf ohne Radius mit dem 0,85-Rückzug, das Studio mit camG
        const vorStand = quelle
            .replace(/this\._durchsichtSteht\([^)]*\)/g, "true")
            .replace(/radius: kr/g, "durchPflanzen: true")
            .replace("const t = wurf.t;", "const t = 0.85 * wurf.t;");
        const vorStudio = studioQuelle.replace(/_kamSeg\(LX,LY,LZ/g, "camG(LX,LY,LZ");
        const rot = wand(vorStand, vorStudio);
        check("Selbst-Test W: der Vor-Stand (Picks ohne Durchsicht · Wurf ohne Kugel · Studio mit camG) → W1 W2 W3 feuern", rot.every((w) => !w[1]), rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" "));
        // K4 — DAS BEWEISBILD PRÜFT SICH SELBST (K32, scripts/lib/abnahme-urteil.cjs): dieselbe Nah-Deckung steht in der EINEN
        // Aufnahme jedes Beweisbilds. Die ABNAHME-Zeile nennt jeden eingeschmuggelten Fall beim Namen (Kamera im Laub, Ziel hinter
        // Fels oder außerhalb, Schwarz-, Weiß-, Flachbild, fremder Stand, Bühne, Gerät, null und vakuös, das Bild-Paar), die
        // Beweisbilder vom 13.10. (spec/abnahme) fallen ROT, und die Aufnahme misst, urteilt und wirft (der Vor-Stand ohne Wurf feuert).
        const AU = require("./lib/abnahme-urteil.cjs");
        const fdir = path.join(root, "spec", "abnahme");
        const abnahmeBrueche = AU.abnahmeSelbsttest(fdir);
        check("K4 Selbst-Test: die Abnahme-Zeile nennt jeden eingeschmuggelten Fall und jede Fixture beim Namen", abnahmeBrueche.length === 0, abnahmeBrueche.join(" · "));
        for (const f of JSON.parse(fs.readFileSync(path.join(fdir, "faelle.json"), "utf8")).faelle)
            console.log(`   Fixture ${f.name}: ${AU.abnahmeUrteil(AU.fixtureMessung(f, fdir), AU.SCHWELLEN).zeile}`);
        // K5 — DIE SOLL-TAFEL (K63, spec/abnahme/soll-tafel.json, AAAA Schritt 0): je sichtbarer Klasse Soll (eigen oder als
        // Verweis auf KOPF_SOLL · BLATT_ATLAS_WEDEL · die Albedo-Tafel), Budget je LOD-Stufe aus dem Haushalt und EIN Maß mit
        // Ist aus dem Ausgabe-Pfad. Die Wand: die Tafel trägt keinen Bruch (Verweis ohne Ziel, Haushalt-Klasse fehlt, Reihenfolge
        // nicht nach Wirkung, ROT ohne Täter), die Maske trennt Schatten, Wurzel und Verdecker von der Klasse, jeder eingeschmuggelte
        // Bruch fällt beim Namen; ein ROTES Maß ist der Auftrag der nächsten AAAA-Karte, nie ein Bruch der Wand.
        const sollTafel = JSON.parse(fs.readFileSync(path.join(fdir, "soll-tafel.json"), "utf8"));
        const sollQ = {
            haushalt: JSON.parse(fs.readFileSync(path.join(root, "spec", "profiband", "haushalt.json"), "utf8")),
            lesen: (d) => (fs.existsSync(path.join(root, d)) ? fs.readFileSync(path.join(root, d), "utf8") : null),
        };
        const sollBrueche = AU.sollTafelSelbsttest(sollTafel, sollQ);
        check("K5 Selbst-Test: die Soll-Tafel ohne Bruch, Maske und Maße geeicht, jeder Tafel-Bruch beim Namen", sollBrueche.length === 0, sollBrueche.join(" · "));
        const sollU = AU.sollTafelUrteil(sollTafel, sollQ);
        console.log(`   SOLL-TAFEL: ${sollU.rot} von ${sollU.zeilen.length} Klassen ROT (nach Wirkung):`);
        for (const z of sollU.zeilen) console.log(`     ${AU.sollTafelZeile(z)}`);
        const aufWand = (q) =>
            /window\.__abnahmeUrteil\(m\)/.test(q) &&
            /fehler\.abnahme = m;\s*throw fehler;/.test(q) &&
            /return \{ u8, info, ms, abnahme: abnahme\(u8, W, H\) \}/.test(q) &&
            /return \{ u8: voll, info, ms, abnahme: abnahme\(voll, W, H\) \}/.test(q);
        const aufQuelle = fs.readFileSync(path.join(root, "scripts", "lib", "ausgabe-aufnahme.cjs"), "utf8");
        check("K4 W: die EINE Aufnahme misst, urteilt und wirft beim Namen (jeder Rückweg trägt die Abnahme)", aufWand(aufQuelle), "");
        check("K4 W: der Vor-Stand (die Aufnahme ohne Wurf) → die Wand feuert", !aufWand(aufQuelle.replace("throw fehler;", "")), "");
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Kamera-Laub-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    if (opt("--leib-bilder", null)) return leibBilder(opt("--leib-bilder", null));
    if (BILDER) return bildPaare();

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle, studioQuelle)) check(name, ok, detail);

    const t0 = Date.now();
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await starteBrowser({ art: "linse", frist: 900000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhAutoSettlement = false; // der Dorf-Zug ruht: die Häuser der Mess-Wiese setzt die Linse (fest)
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    const bereit = () =>
        page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", { timeout: 90000 });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const zeiten = {};
    let m = null;
    if (TEILE.includes("laub")) {
        const tL = Date.now();
        await page.evaluate(KAMERA_NAH_INSTALL);
        await page.evaluate(WASSER_INSTALL); // __wasserOrte + __weltOrt: die Orte aus der Welt
        m = await page.evaluate(probe, { orte: process.env.KAMERA_LAUB_NUR ? ORTE.filter((o) => process.env.KAMERA_LAUB_NUR.split(",").includes(o.id)) : ORTE, radius: RADIUS, saum: SAUM, nahMax: NAH_DECKUNG_MAX, hubMax: SCHMUGGEL_HUB_M, jeOrt: 5, jeStreu: 2, gw: 48, gh: 27 });
        zeiten.laub = Date.now() - tL;
    }
    let leib = null;
    if (TEILE.includes("leib")) {
        const tW = Date.now();
        await bereit();
        await page.evaluate(leibInstall, { R: LEIB_R });
        leib = { wiese: await page.evaluate(leibWiese, { x: WIESE.x, z: WIESE.z, quote: LEIB_WIESE }) };
        zeiten.wiese = Date.now() - tW;
        // die Prüfbühne, geboren wie im Spiel: Welt-Tor importWorldBeside + aktiv + Reload
        const tH = Date.now();
        const buehne = JSON.parse(fs.readFileSync(path.join(root, "spec", "pruefbuehne", "welt.json"), "utf8"));
        const id = await page.evaluate((j) => {
            const r = window.anazhRealm;
            const res = r.importWorldBeside(j);
            if (!res || !res.ok) return null;
            r.activeWorldSet(res.worldId);
            return res.worldId;
        }, buehne);
        if (id) {
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
            await bereit();
            await page.evaluate(leibInstall, { R: LEIB_R });
            leib.hang = await page.evaluate(leibHang, { hang: HANG, n: LEIB_HANG_N });
        } else leib.hang = { err: "die Prüfbühne ließ sich nicht importieren" };
        zeiten.hang = Date.now() - tH;
        leib.proben = [...(leib.wiese.proben || []), ...(leib.hang.proben || [])];
        leib.spruenge = leib.wiese.spruenge;
    }
    let nin = null;
    if (TEILE.includes("ninja")) {
        const tN = Date.now();
        await page.goto(`http://127.0.0.1:${PORT}/worlds/koerperstudio/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(
            // eslint-disable-next-line no-undef
            () => typeof enterPlay === "function" && typeof playPhysics === "function" && typeof parkBoxes !== "undefined" && parkBoxes.length > 0,
            { timeout: 90000 }
        );
        nin = await page.evaluate(ninja, { wp: NINJA_WP, rand: NINJA_RAND });
        zeiten.ninja = Date.now() - tN;
    }
    await browser.close();
    server.close();
    if (process.env.KAMERA_LAUB_JSON) fs.writeFileSync(process.env.KAMERA_LAUB_JSON, JSON.stringify({ laub: m, leib, ninja: nin, zeiten }, null, 1));

    if (m) {
        console.log(`=== K1 DIE DECKUNG IM FREIRAUM DER KAMERA JE ORT UND SICHT (3rd/Ritt: Laub und Rinde bis vor die Ebene des Ziels, Streu · Fels · Wagen bis ${RADIUS.third}/${RADIUS.ritt} m; Ich: Laub und Streu bis ${RADIUS.first} m) ===`);
        for (const ort of ORTE) {
            const o = m.orte[ort.id] || {};
            console.log(`  ${ort.id} (${ort.bild}) bei ${(o.P || []).join("/")} · Anker ${(o.anker || []).join(", ")}${o.satz ? ` · Satz: ${o.satz.length} Werke` : ""}`);
            for (const modus of MODI) {
                const z = (o.modi || {})[modus] || {};
                const kl = Object.entries(z.jeKlasse || {})
                    .map(([k, v]) => `${k} ${pct(v / Math.max(1, z.n))}`)
                    .join(", ");
                console.log(`    ${modus.padEnd(5)} ${String(z.n || 0).padStart(3)} Stellungen · Mittel ${pct(z.mittel)} · max ${pct(z.max)}${kl ? ` · je Klasse (Mittel) ${kl}` : ""}${z.schlimmste && z.max > 0 ? ` · schlimmste ${z.schlimmste.anker} (${z.schlimmste.x}/${z.schlimmste.z}): ${Object.entries(z.schlimmste.taeter || {}).map(([k, v]) => `${k} ${pct(v)}`).join(", ")}` : ""}`);
            }
        }
        const s = m.schmuggel || {};
        console.log(`  Schmuggel: Laub ohne Durchsicht → ${pct(s.laub && s.laub.max)} (${Object.keys((s.laub && s.laub.taeter) || {}).join(", ")}) · Fels vor der Linse → ${pct(s.fels && s.fels.max)} (${Object.keys((s.fels && s.fels.taeter) || {}).join(", ")})`);
        console.log(`  Kronen-Stellung: +${s.laub && s.laub.hub != null ? s.laub.hub : "—"} m am Stamm · mit Durchsicht → ${pct(s.krone && s.krone.max)} (${Object.keys((s.krone && s.krone.taeter) || {}).join(", ")})`);
        console.log(`  Zeiten (ms): ${JSON.stringify(m.zeiten)}`);
        const v = urteil(m);
        check("K1 keine Stellung mit Laub, Strauch, Ast oder Fels vor der Linse (Deckung im Freiraum ≤ 2 %), die Linse nennt den eingeschmuggelten Täter", v.length === 0, v.length ? "Täter: " + v.join(" · ") : "");
    }
    if (TEILE.includes("leib")) {
        console.log(`=== K2 DER LEIB DER KAMERA (Kugel der Linse ${LEIB_R} m): Mess-Wiese ${WIESE.x}/${WIESE.z} und Prüfbühne ${HANG.id} ===`);
        for (const ort of ["wiese", "hang"]) {
            const o = (leib && leib[ort]) || {};
            if (o.err) console.log(`  ${ort}: Ausnahme ${String(o.err).split("\n")[0]}`);
            if (o.anker) console.log(`  ${ort}: Anker je Art ${JSON.stringify(o.anker)}`);
            if (o.typen) console.log(`  ${ort}: Werke in 45 m ${JSON.stringify(o.typen)}`);
            if (o.haeuser) console.log(`  ${ort}: gesetzte Häuser ${JSON.stringify(o.haeuser)}`);
            if (o.fehlt && o.fehlt.length) console.log(`  ${ort}: Weltbild fehlt ${o.fehlt.length}`);
            for (const modus of ["fuss", "ritt"]) {
                const z = o[modus] || {};
                const posen = z.posen || [];
                const fehl = posen.filter((q) => q.taeter.length);
                const hist = {};
                for (const q of fehl)
                    for (const t of q.taeter) {
                        const k = t.replace(/ \(.*\)$/, "");
                        hist[k] = (hist[k] || 0) + 1;
                    }
                console.log(`    ${ort} ${modus.padEnd(4)} ${fehl.length}/${posen.length} Posen mit Täter${z.grund ? ` (${z.grund})` : ""} · ${JSON.stringify(hist)}`);
                for (const q of fehl.slice(0, 3)) console.log(`      ${q.id} ${q.anker} @${q.x}/${q.z}: ${q.taeter.join(", ")} · Kamera ${q.c.join("/")} · Arm ${q.arm} m`);
            }
        }
        const pr = (leib && leib.proben) || [];
        console.log(`  Feld-Proben je 3rd-Bild (${pr.length} Bilder): Mittel ${pr.length ? (pr.reduce((a, b) => a + b, 0) / pr.length).toFixed(1) : "-"} · Median ${pr.length ? quantil(pr, 0.5) : "-"} · p95 ${pr.length ? quantil(pr, 0.95) : "-"} · höchstens ${pr.length ? Math.max(...pr) : "-"} (Vor-Stand Mittel ${PROBEN_VORSTAND.mittel} · Median ${PROBEN_VORSTAND.median} · höchstens ${PROBEN_VORSTAND.hoechstens}) · Kamera-Sprünge > 2 m im Rundgang ${leib && leib.spruenge} (${leib && leib.wiese && leib.wiese.rundgang})`);
        const v = urteilLeib(leib);
        check(`K2 die Linse steht nie im Fels, nie unter dem sichtbaren Boden, nie in einer Box, nichts zwischen Ziel und Linse — 0 von ${LEIB_N} zu Fuß und im Verfolger-Ritt, Feld-Proben je 3rd-Bild und Sprünge ≤ Vor-Stand`, v.length === 0, v.length ? "Täter: " + v.join(" · ") : "");
    }
    if (TEILE.includes("ninja")) {
        const posen = (nin && nin.posen) || [];
        console.log(`=== K3 NP-03 DIE KAMERA DES KÖRPER-STUDIOS (Rand ${NINJA_RAND} Lab-Maß) · NP-02 der Tunnel ===`);
        console.log(`  ${posen.filter((q) => q.taeter.length).length}/${posen.length} Posen mit Täter · Tunnel ${JSON.stringify(nin && nin.tunnel)}`);
        for (const q of posen.filter((q2) => q2.taeter.length).slice(0, 4)) console.log(`      ${q.id}: ${q.taeter.join(", ")} · Kamera ${q.cam.join("/")} · Ziel ${q.ziel.join("/")} · Figur ${q.figur.join("/")}`);
        const v = urteilNinja(nin);
        check(`K3 NP-03 0 von ${NINJA_WP.length * 4} Posen mit Park-Geometrie zwischen Blickziel und Kamera oder um die Kamera, NP-02 der Tunnel bleibt zu`, v.length === 0, v.length ? "Täter: " + v.join(" · ") : "");
    }
    console.log(`  Zeiten (ms): ${JSON.stringify(zeiten)} · Lauf ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — die Kamera steckt nie in Laub, Strauch, Fels oder Boden.");
    process.exit(0);
})().catch((e) => {
    console.error("Kamera-Laub-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

// ── DIE BILD-PAARE am echten Renderer (Fenster, Hardware-Adapter) — das Ufer mit dem Hain (A 41–47) und der Hang (B 28–31,
// C 05–12), je Sicht die schlimmste Stellung des Vorher ──
async function bildPaare() {
    if (!SEITE) throw new Error("--bilder braucht --seite http://localhost:<port> (der save-server des Arbeitsbaums)");
    fs.mkdirSync(BILDER, { recursive: true });
    const profil = path.join(require("os").tmpdir(), `kamera-laub-profil-${Date.now()}`);
    const browser = await starteBrowser({ art: "echt", headless: false, profil: profil, frist: 3600000, viewport: { width: 1280, height: 720, deviceScaleFactor: 1 }, zusatz: ["--window-size=1300,860"] });
    try {
        const page = await browser.newPage();
        const fehler = [];
        page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
        page.on("console", (m) => {
            if (m.type() === "error" && /WebGPU|GPUValidation|Invalid/.test(m.text())) fehler.push("[konsole] " + m.text().slice(0, 200));
        });
        await page.goto(`${SEITE.replace(/\/$/, "")}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(KAMERA_NAH_INSTALL);
        await page.evaluate(WASSER_INSTALL); // __wasserOrte + __weltOrt: die Orte aus der Welt
        const nur = (process.env.KAMERA_LAUB_NUR || "ufer,hang").split(",");
        const m = await page.evaluate(probe, { orte: ORTE.filter((o) => nur.includes(o.id)), radius: RADIUS, saum: SAUM, nahMax: NAH_DECKUNG_MAX, hubMax: SCHMUGGEL_HUB_M, jeOrt: 5, jeStreu: 2, gw: 48, gh: 27, nahAus: true, bilder: { w: 1280, h: 720 } });
        console.log(`=== DIE BILD-PAARE (echte GPU, Ausgabe-Pfad) → ${BILDER} ===`);
        for (const [id, o] of Object.entries(m.orte)) {
            if (o.err) console.log(`  ${id}: Ausnahme ${String(o.err).split("\n")[0]}`);
            for (const [modus, b] of Object.entries(o.bilder || {})) {
                for (const phase of ["vorher", "nachher"]) {
                    const z = b[phase];
                    if (!z) continue;
                    const datei = path.join(BILDER, `${id}-${modus}-${phase}.png`);
                    fs.writeFileSync(datei, Buffer.from(z.png.split(",")[1], "base64"));
                    delete z.png;
                }
                const sl = b.stellung || {};
                console.log(
                    `  ${id} ${modus.padEnd(5)} (${sl.x}/${sl.z}, Gier ${sl.gier}, Neigung ${sl.pitch}, Freiraum ${sl.radien ? (sl.radien.Rinde || sl.radien.Laub || 0).toFixed(1) : "?"} m): ` +
                        `vorher ${pct(b.vorher && b.vorher.deckung)} (${Object.entries((b.vorher && b.vorher.taeter) || {}).map(([k, v]) => `${k} ${pct(v)}`).join(", ")}) → ` +
                        `nachher ${pct(b.nachher && b.nachher.deckung)} · Befehle ${b.vorher && b.vorher.dc}/${b.nachher && b.nachher.dc}`
                );
            }
        }
        fs.writeFileSync(path.join(BILDER, "messung.json"), JSON.stringify(m, null, 1));
        if (fehler.length) console.log(`  Seiten-Fehler: ${fehler.length} (${fehler.slice(0, 3).join(" | ")})`);
    } finally {
        await browser.close();
        try {
            fs.rmSync(profil, { recursive: true, force: true });
        } catch (_e) {}
    }
    process.exit(0);
}

// ── DIE BILD-PAARE DES LEIBS am echten Renderer (`--leib-bilder <ordner>`; Fenster, Hardware-Adapter): die Posen pose-00 und
// pose-01 der Mess-Wiese aus dem Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs, Bühne Mittag · Sonne · Sommer) und NP-03
// pose-14 des Körper-Studios (sein Bild-Schirm). Vorher und Nachher sind zwei Läufe: KAMERA_LAUB_STAMM / KAMERA_LAUB_STUDIO
// tragen den Vor-Stand, `--phase vorher|nachher` den Datei-Namen. ──
async function leibBilder(ordner) {
    const phase = opt("--phase", "nachher");
    fs.mkdirSync(ordner, { recursive: true });
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const profil = path.join(require("os").tmpdir(), `kamera-leib-profil-${Date.now()}`);
    const browser = await starteBrowser({ art: "echt", headless: false, profil: profil, frist: 3600000, viewport: { width: 1280, height: 720, deviceScaleFactor: 1 }, zusatz: ["--window-size=1300,860"] });
    const bericht = { phase, posen: {} };
    try {
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(() => {
            window.__anazhForceFoundry = true;
            window.__anazhAutoSettlement = false;
        });
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", { timeout: 120000 });
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(leibInstall, { R: LEIB_R });
        const w = await page.evaluate(leibWiese, { x: WIESE.x, z: WIESE.z, quote: LEIB_WIESE, bilder: { ids: ["pose-00", "pose-01"], w: 1280, h: 720 } });
        if (w.err) console.log(`  Wiese: Ausnahme ${String(w.err).split("\n")[0]}`);
        for (const [id, b] of Object.entries(w.bilder || {})) {
            fs.writeFileSync(path.join(ordner, `${id}-${phase}.png`), Buffer.from(b.png.split(",")[1], "base64"));
            const p = w.fuss.posen.find((q) => q.id === id) || {};
            bericht.posen[id] = { anker: p.anker, kamera: p.c, arm: p.arm, taeter: p.taeter, dc: b.dc, dreiecke: b.dreiecke };
            console.log(`  ${id}-${phase}.png  ${p.anker} · Kamera ${(p.c || []).join("/")} · Arm ${p.arm} m · Täter ${(p.taeter || []).join(", ") || "keiner"}`);
        }
        // NP-03 pose-14 (P3, 180°): die Pose stellen, 90 Schritte, dann zeichnet das Studio sein Bild; der Regler-Panel weicht
        await page.goto(`http://127.0.0.1:${PORT}/worlds/koerperstudio/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(
            // eslint-disable-next-line no-undef
            () => typeof enterPlay === "function" && typeof playPhysics === "function" && typeof parkBoxes !== "undefined" && parkBoxes.length > 0,
            { timeout: 120000 }
        );
        const n = await page.evaluate(ninja, { wp: NINJA_WP, rand: NINJA_RAND, nur: 14 });
        await new Promise((res) => setTimeout(res, 600));
        await page.addStyleTag({ content: "#ui{display:none!important}" });
        await new Promise((res) => setTimeout(res, 300));
        await page.screenshot({ path: path.join(ordner, `np03-pose-14-${phase}.png`) });
        const q = (n.posen || [])[0] || {};
        bericht.posen["np03-pose-14"] = q;
        console.log(`  np03-pose-14-${phase}.png  ${q.id} · Kamera ${(q.cam || []).join("/")} · Täter ${(q.taeter || []).join(", ") || "keiner"}`);
        fs.writeFileSync(path.join(ordner, `bericht-${phase}.json`), JSON.stringify(bericht, null, 1));
    } finally {
        await browser.close();
        server.close();
        try {
            fs.rmSync(profil, { recursive: true, force: true });
        } catch (_e) {}
    }
    process.exit(0);
}
