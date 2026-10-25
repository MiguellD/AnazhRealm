// Stationen der Gruppe V (src/g5.js) — Welten und Wege. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst: jedes Kriterium mit Punkten > 0 (fahrzeug.K3/K4, siedlung.K1, leib.K1/K4, halten.K1/K2), die Messschuld M36
// (siedlung.K5) und was ein Zweig im Stau kippen soll (stadt-erwachen-2 siedlung.K5, halten-gesetz halten.K1/K3, halten-k5 halten.K5,
// teilen-sicher ultiversum.K5, gamepad-verben leib.K5; tore.K5 steht seit 24.10. ganz in fehlt: kein anderes Gerät). Was sich nicht als Station fassen lässt, steht in
// `module.exports.fehlt` (befehl null, grund) — außerhalb der Liste, damit `run` der anderen Gruppen nicht an ihr bricht.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");

// EINE echte Werkbank-Sitzung je Boot (das Muster von bericht/2210-radeon-beweise/skripte/werkbank-lauf.sh und
// 2210-messschuld-gtx-6cfce/m36.sh): eigener save-server auf {PORT}+20000, Werkbank auf {PORT} (Seite {PORT}−1), eine Linse
// neben ihr auf {PORT}+20001; jeder Boot frisch, der Spielstand des Baums fällt vor und nach jedem Boot. Die Schritte
// schreiben ihre Ausgabe unter „@@PUNKTE@@ NAME" (nie „=== " — damit beginnen die Überschriften der Linsen); das Urteil liest die Abschnitte.
// Läuft nur unter gpu-lauf.sh (gpu: true).
// Die Ports räumt das Skript selbst (netstat LISTEN | ABHÖREN — die Radeon spricht deutsch).
const KOPF = [
    "set -u",
    "WP={PORT}; SP=$(({PORT} + 20000)); LP=$(({PORT} + 20001)); export WERKBANK_PORT=$WP",
    'L="${TEMP:-/tmp}/punkte-g5-$WP"; mkdir -p "$L"; W="node scripts/werkbank.cjs"; SPID=',
    "weg() { timeout 60 $W stop > /dev/null 2>&1; [ -n \"$SPID\" ] && kill \"$SPID\" 2> /dev/null; SPID=; " +
        "for p in $(netstat -ano 2> /dev/null | grep -aE \":($WP|$((WP - 1))|$SP|$LP) .*(LISTEN|ABH)\" | awk '{print $5}' | sort -u); " +
        'do taskkill //F //T //PID "$p" > /dev/null 2>&1; done; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; }',
    "trap weg EXIT",
    'boot() { weg; PORT=$SP node save-server.js > "$L/save.log" 2>&1 & SPID=$!; ' +
        'for t in $(seq 1 30); do curl -s -o /dev/null "http://localhost:$SP/" && break; sleep 1; done; ' +
        '$W start --echt --port $WP --seite "http://localhost:$SP" "$@" > "$L/wb.log" 2>&1 & ' +
        'for t in $(seq 1 120); do grep -qE "WERKBANK bereit|FEHLER|Error" "$L/wb.log" && break; sleep 5; done; ' +
        'grep -q "WERKBANK bereit" "$L/wb.log" || { echo "@@PUNKTE@@ START ROT"; tail -5 "$L/wb.log"; exit 3; }; }',
    'teil() { echo "@@PUNKTE@@ $1"; shift; timeout 900 "$@"; echo "@@PUNKTE@@ EXIT $?"; }',
];
const sitzung = (...zeilen) => ["bash", "-c", [...KOPF, ...zeilen].join("\n")];
const K = { K: "{KOORD}" }; // die Mess-Skripte der Berichte liegen im Koordinations-Baum (bericht/…)

// Pfade (R6): die Dateien, die die Messung liest
const FAHRT = [
    "vehicle-core.js",
    "stamm/koerper-*.js",
    "stamm/dirigent-takt.js",
    "stamm/daten.js",
    "scripts/werkbank.cjs",
    "scripts/lib/welt-orte.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "save-server.js",
];
const LATENZ = [
    "stamm/koerper-*.js",
    "stamm/dirigent-*.js",
    "stamm/kampf.js",
    "stamm/studio-bruecke.js",
    "stamm/kreatur-*.js",
    "stamm/daten.js",
    "vehicle-core.js",
    "koerper-core.js",
    "scripts/werkbank.cjs",
    "scripts/lib/haenger-linse.cjs",
    "scripts/lib/welt-orte.cjs",
    "save-server.js",
];
const DORF = [
    "stamm/siedlung-*.js",
    "stamm/dienst.js",
    "stamm/dirigent-*.js",
    "stamm/gelaende-*.js",
    "stamm/daten.js",
    "fachwerk-core.js",
    "foundry-core.js",
    "foundry-bruecke.js",
    "scripts/werkbank.cjs",
    "save-server.js",
];
const KAMPF = [
    "stamm/kampf.js",
    "stamm/studio-bruecke.js",
    "stamm/bau-buch.js",
    "stamm/kreatur-*.js",
    "stamm/koerper-*.js",
    "stamm/daten.js",
    "schmiede-core.js",
    "scripts/diag-kampf-gefuehl.cjs",
    "scripts/lib/kampf-proben.cjs",
    "scripts/lib/welt-boot.cjs",
];
const PAD = [
    "stamm/koerper-*.js",
    "stamm/dirigent-*.js",
    "stamm/kampf.js",
    "stamm/klang.js",
    "stamm/feld-leben.js",
    "stamm/netz-p2p.js",
    "stamm/netz-portal.js",
    "stamm/werkstatt-*.js",
    "stamm/daten.js",
    "vehicle-core.js",
    "scripts/playtest.cjs",
    "scripts/playtest/koerper.cjs",
];

// DIE STADT VOM HÜGEL (siedlung.K2, Zweig stadt-tor-k2; das Muster von stadt-tor-k2-bild/stadt-bild.sh): die nächste Stadt
// des Rang-Gesetzes binnen 2 km vom Genesis-Ort mit Ort (`_autoSettlementFindSite`), der Spieler auf den höchsten Land-Punkt
// 180–260 m vor ihr, bis die Mauer steht und kein Zug mehr läuft; dann der Schuss vom höchsten Acker oder Feldweg 70–260 m
// vor der Stadt-Mitte auf ihre Mitte (+5 m). Der Code trägt kein einfaches Hochkomma (bash '…').
const STADT_WAHL =
    "const g = r._genesisMitte(); const out = []; " +
    "for (let cx = -10; cx <= 10; cx++) for (let cz = -10; cz <= 10; cz++) { const i = r._autoSettlementCellInfo(cx, cz); " +
    "if (!i || !(i.stufe > 0)) continue; const d = Math.hypot(i.x - g.x, i.z - g.z); if (d > 2000) continue; " +
    "out.push({ cx, cz, nH: i.nH, stufe: i.stufe, d: Math.round(d), site: r._autoSettlementFindSite(i) }); } " +
    "out.sort((a, b) => a.d - b.d); const c = out.find((o) => o.site); let hill = null; " +
    "if (c) for (const R of [180, 220, 260]) for (let k = 0; k < 32; k++) { const a = (k / 32) * 2 * Math.PI, " +
    "x = c.site.x + Math.cos(a) * R, z = c.site.z + Math.sin(a) * R, y = r.getTerrainHeightAt(x, z); " +
    "if (Number.isFinite(y) && r._landAt(x, z, 0.2) && (!hill || y > hill.y)) hill = { x, y, z, R }; } " +
    "window.__stadtWahl = { c, hill }; " +
    "return { seed: r.state.worldMeta && r.state.worldMeta.seed, staedte: out.length, wahl: c ? { cx: c.cx, cz: c.cz, nH: c.nH, stufe: c.stufe, d: c.d } : null, hill };";
const STADT_STAND =
    "const P = r.state.stlMauer, q = r._autoSettlementQueue, c = window.__stadtWahl.c.site; let haeuser = 0; " +
    "for (const e of r.state.architectures) if (e && /^haus_/.test(e.type) && Math.hypot(e.position.x - c.x, e.position.z - c.z) < 400) haeuser++; " +
    "return { mauer: P ? P.top : 0, zug: !!(q && q.plan), pending: r._autoSettlementPendingKey || null, haeuser };";
const STADT_KAMERA =
    "const c = window.__stadtWahl.c.site; let v2 = null; " +
    "for (const p of r._ortPlaene.values()) if (p && p.ort && p.mauer && (!v2 || Math.hypot(p.ort.x - c.x, p.ort.z - c.z) < Math.hypot(v2.ort.x - c.x, v2.ort.z - c.z))) v2 = p; " +
    "if (!v2) return { fehler: \"kein Ortsplan mit Mauer\" }; const o = v2.ort, cand = []; " +
    "for (const f of v2.felder || []) cand.push({ x: o.x + f.cx, z: o.z + f.cz, art: \"acker\" }); " +
    "for (const fw of v2.feldwege || []) for (const q of fw.pts) cand.push({ x: o.x + q.x, z: o.z + q.z, art: \"feldweg\" }); " +
    "let best = null; for (const q of cand) { const d = Math.hypot(q.x - o.x, q.z - o.z); if (d < 70 || d > 260) continue; " +
    "const y = r.getTerrainHeightAt(q.x, q.z); if (!Number.isFinite(y)) continue; if (!best || y > best.y) best = Object.assign({ y, d: Math.round(d) }, q); } " +
    "if (!best) return { fehler: \"kein Acker oder Feldweg 70–260 m vor der Stadt\" }; const cy = r.getTerrainHeightAt(o.x, o.z); " +
    "return { pose: [best.x, best.y + 1.7, best.z, o.x, cy + 5, o.z].map((v) => +v.toFixed(2)), art: best.art, d: best.d, " +
    "hoeher: Math.round((best.y - cy) * 10) / 10, segs: v2.mauer.segs.length, tuerme: v2.mauer.towers.length };";
const LIES = (feld) =>
    "node -e 'const t = require(\"fs\").readFileSync(process.argv[1], \"utf8\"); const e = JSON.parse(t.slice(t.indexOf(\"{\"))).ergebnis; " + feld + "'";

// DER HIT-STOP DES SPIELS neben der Linse (halten.K2, 23.10.): latenz zählt den Halt im Bild (stehende Schwung-Uhr UND Hand);
// die Haken zählen daneben, was das Spiel tut — jeder Treffer, der den Halt setzt (`_kampfHitJuice`, seine Dauer), und wie weit
// die Hand im gesetzten Halt je Takt noch gleitet. So heißt ein ROT beim Namen: kein Treffer am Ziel (gesetzt 0) ist das
// Werkzeug, ein gesetzter Halt mit gleitender Hand das Spiel. Der Code trägt kein einfaches Hochkomma (bash '…').
const HIT_HAKEN =
    "const L = (window.__hs = { n: 0, dauer: [], takte: 0, gleit: 0 }); const pj = r._kampfHitJuice.bind(r); " +
    "r._kampfHitJuice = function (c, now, u, ke) { const v = pj(c, now, u, ke); L.n++; L.dauer.push(r.state.player._hitStopUntil - now); return v; }; " +
    "const pm = r.state.playerMesh, V = new T.Vector3(); let vor = null; const tick = r._gameLoopTick.bind(r); " +
    "r._gameLoopTick = function (t) { const v = tick(t); const p = r.state.player; " +
    "if (p && p._hitStopUntil > performance.now() / 1000) { const w = pm.userData.rig.armR.wrist.getWorldPosition(V).sub(pm.position).toArray(); " +
    "if (vor && vor.id === p._hitStopUntil) { L.takte++; L.gleit = Math.max(L.gleit, Math.hypot(w[0] - vor.w[0], w[1] - vor.w[1], w[2] - vor.w[2])); } " +
    "vor = { id: p._hitStopUntil, w }; } return v; }; return 1;";
const HIT_LESEN =
    "const L = window.__hs; return { gesetzt: L.n, dauerMs: [Math.min(...L.dauer), Math.max(...L.dauer)].map((x) => Math.round(x * 1000)), haltTakte: L.takte, gleitMm: Math.round(L.gleit * 10000) / 10 };";

// latenz-Reihen: je Sicht × Verb fehlt 0 und p95 ≤ 50 ms
// DIE LATENZ IST BILDRATEN-FEST (24.10., Prüfung der Buchung 61 → 80: leib.K1#1 kippte an EINEM SHA 056330d8 von ROT auf GRÜN,
// p95 75,8 ms bei Bildzeit 32,9 ms gegen 43,3 ms bei 16,6 ms an 1d9164e9): die Bildzeit eines Laufs hängt an Gerät und Last
// (8,7–32,9 ms an der Radeon), das Kriterium an keiner. Jede Latenz-Station fährt LAEUFE eigene Boots (Sitzung je Boot,
// `{N}` = die Nummer) und urteilt über den SCHLECHTESTEN; jede Bildzeit steht in der Zahl.
const LAEUFE = 3;
const lauf = (n, zeilen) => zeilen.map((z) => z.replace(/\{N\}/g, String(n)));
const latenzLaeufe = (...zeilen) => {
    const json = Array.from({ length: LAEUFE }, (_, i) => '"{AUS}.lauf' + (i + 1) + '.json"').join(" ");
    return [
        "rm -f " + json,
        ...Array.from({ length: LAEUFE }, (_, i) => lauf(i + 1, zeilen)).flat(),
        // die Läufe in EINE Datei {AUS}: { laeufe: [ latenz-JSON | null ] }
        "node -e 'const fs = require(\"fs\"); const [aus, ...f] = process.argv.slice(1); fs.writeFileSync(aus, JSON.stringify({ laeufe: " +
            "f.map((x) => { try { return JSON.parse(fs.readFileSync(x, \"utf8\")); } catch (_e) { return null; } }) }));' \"{AUS}\" " + json,
    ];
};
// über alle Läufe: GRÜN nur, wenn JEDER Lauf jede Reihe hält; die Zahl nennt je Reihe das schlechteste p95 und jede Bildzeit
function latenzSchlechtester(j, ids, n, soll = 50) {
    const da = ((j && j.laeufe) || []).filter((l) => l && l.reihen);
    if (da.length < LAEUFE) return { gruen: false, zahl: "latenz-JSON in " + da.length + " von " + LAEUFE + " Läufen" };
    const haelt = (l) => ids.every((id) => l.reihen[id] && l.reihen[id].fehlt === 0 && l.reihen[id].n >= n && l.reihen[id].p95 <= soll);
    const schlecht = (id) => {
        const r = da.map((l) => l.reihen[id]);
        if (r.some((x) => !x)) return id + " —";
        const fehlt = r.reduce((s, x) => s + x.fehlt, 0);
        return id + " " + Math.max(...r.map((x) => x.p95)) + (fehlt ? " (fehlt " + fehlt + ")" : "");
    };
    return {
        gruen: da.every(haelt),
        zahl: "schlechtester von " + LAEUFE + " Läufen p95 ms " + ids.map(schlecht).join(" · ") + " · Bild " + da.map((l) => l.bildMs).join("/") + " ms",
        da,
    };
}

const stationen = [
    // ───────── fahrzeug.K3 — die Kamera atmet das Tempo ─────────
    {
        kriterium: "fahrzeug.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Garage: gate:garage-labor mit dem Mess-Patch bei vmax (bericht/2110-mk-kopf/garage-mk.diff, Zeile MK2110); Welt: der GT
        // auf freier Bahn an der Mess-Wiese, Third, Vollgas (bericht/2110-gtx-messschuld/tempo3.js über werkbank eval, M27)
        befehl: sitzung(
            'echo "@@PUNKTE@@ GARAGE"',
            'git apply "$K/bericht/2110-mk-kopf/garage-mk.diff" && GARAGE_LABOR_PORT=$LP LINSE_GPU=hardware timeout 600 node scripts/diag-garage-mk.cjs',
            'echo "@@PUNKTE@@ EXIT $?"; git checkout -q -- scripts/diag-garage-labor.cjs; rm -f scripts/diag-garage-mk.cjs',
            "boot",
            'teil WELT $W eval "$(cat "$K/bericht/2110-gtx-messschuld/tempo3.js")"'
        ),
        env: K,
        gpu: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const g = jsonZeile(teil("GARAGE"), /^MK2110 /);
            const b = jsonBlock(teil("WELT"));
            const w = b && (b.ergebnis || b);
            if (!g || !g.ruhe || !g.top) return { gruen: false, zahl: "Garage: keine Zeile MK2110 (Exit " + lauf.exit + ")" };
            if (!w || !w.top || w.fehler) return { gruen: false, zahl: "Welt: kein Ergebnis von tempo3.js" + (w && w.fehler ? " — " + w.fehler : "") };
            const gFov = g.top.fov - g.ruhe.fov;
            const gArm = g.top.arm / g.ruhe.arm - 1;
            const gruen = w.ende === "ok" && gFov >= 8 && gArm >= 0.15 && w.top.fovPlus >= 8 && w.top.armPlus >= 0.15;
            return {
                gruen,
                zahl:
                    "Garage FOV +" + gFov.toFixed(2) + "° Arm +" + (gArm * 100).toFixed(1) + " % bei " + Number(g.top.v).toFixed(2) + "/" +
                    Number(g.top.vmax).toFixed(2) + " m/s · Welt FOV +" + w.top.fovPlus + "° Arm +" + (w.top.armPlus * 100).toFixed(1) +
                    " % bei " + w.top.v + " m/s (Ende " + w.ende + ")",
            };
        },
        pfad: [...FAHRT, "worlds/garage/**", "scripts/diag-garage-labor.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = FOV (+≥ 8°) und Arm (+≥ 15 %) aus v/vmax in Garage UND Welt gemessen",
    },
    {
        kriterium: "fahrzeug.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // die Zusätze der 2: Drift, Rückkehr (tempo3.js in der Welt), Ruck (gate:fahr-leben T4) und EIN FOV-Schreiber (T5)
        befehl: sitzung(
            'teil FAHR env FAHR_LEBEN_PORT=$LP node scripts/diag-fahr-leben.cjs',
            "boot",
            'teil WELT $W eval "$(cat "$K/bericht/2110-gtx-messschuld/tempo3.js")"'
        ),
        env: K,
        gpu: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const t4 = jsonZeile(teil("FAHR"), /^\s*(✅|❌) T4 /);
            const t5 = jsonZeile(teil("FAHR"), /^\s*(✅|❌) T5 /);
            const b = jsonBlock(teil("WELT"));
            const w = b && (b.ergebnis || b);
            if (!t4 || !t5) return { gruen: false, zahl: "gate:fahr-leben ohne Zeile T4/T5 (Exit " + lauf.exit + ")" };
            if (!w || !w.drift || !w.rueck || w.fehler) return { gruen: false, zahl: "Welt: kein Ergebnis von tempo3.js" + (w && w.fehler ? " — " + w.fehler : "") };
            const d = w.drift;
            const r = w.rueck.rueckS;
            const schreiber = t5.schreiber || [];
            const gruen =
                w.ende === "ok" && w.phasen && w.phasen.drift === "drift" && d.bilder >= 100 && d.kameraGegenFahrtMax <= 15 &&
                r >= 1 && r <= 1.5 && t4.ruckP95 <= 0.02 && t4.ruckN >= 100 && schreiber.length === 1;
            return {
                gruen,
                zahl:
                    "Drift Kamera ≤ " + d.kameraGegenFahrtMax + "° neben dem Fahrtvektor (Schlupf bis " + d.schlupfMax + "°) · Rückkehr " + r +
                    " s nach " + w.rueck.orbitGrad + "° Orbit · Ruck p95 " + t4.ruckP95 + " m (" + t4.ruckN + ") · FOV-Schreiber [" + schreiber + "]",
            };
        },
        pfad: [...FAHRT, "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "2 = dazu Azimut auf dem Fahrtvektor im Drift (Fehler ≤ 15°), Maus-Orbit mit Rückkehr nach 1–1,5 s, seitlicher Ruck p95 ≤ 0,02 m je Bild, EIN FOV-Schreiber",
    },

    // ───────── fahrzeug.K4 — Übergänge unter Bewegung ─────────
    ...[1, 2].map((staffel) => ({
        kriterium: "fahrzeug.K4",
        staffel,
        geraet: ["radeon", "gtx"],
        // gate:fahr-leben T4 (Absteigen in Fahrt, Azimut nach 10 Bildern) + der Blick im Bild am Steilhang bergab, Third → Ego →
        // Third (bericht/2010-buendel-abab/blick.js über werkbank eval, M8): der GT in den Bildern 1–3 nach dem Wechsel
        befehl: sitzung(
            'teil FAHR env FAHR_LEBEN_PORT=$LP node scripts/diag-fahr-leben.cjs',
            "boot",
            'teil BLICK $W eval "$(cat "$K/bericht/2010-buendel-abab/blick.js")"'
        ),
        env: K,
        gpu: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const z = jsonZeile(teil("FAHR"), /^\s*(✅|❌) T4 /);
            const b = jsonBlock(teil("BLICK"));
            const e = b && (b.ergebnis || b);
            if (!z) return { gruen: false, zahl: "gate:fahr-leben ohne Zeile T4 (Exit " + lauf.exit + ")" };
            if (!e || e.fehler || !Array.isArray(e.bilder)) return { gruen: false, zahl: "Blick: kein Ergebnis" + (e && e.fehler ? " — " + e.fehler : "") };
            const nach = e.bilder.filter((x) => /^[345]-third/.test(x.name));
            const stufe = (x) => Math.max(0, ...Object.values(x.stufen || {}).filter(Boolean).map((s) => s.dmaxM));
            const sprung = Math.max(...(z.abSprung || [Infinity]));
            const az10 = Math.max(...(z.nach10 || [Infinity]));
            const gruen =
                /^\s*✅ T4 /m.test(teil("FAHR")) && sprung <= 0.5 && az10 <= 10 && e.ende === "ok" && e.mount === true && nach.length === 3 &&
                nach.every((x) => x.imBild === true && x.azimutGegenKursGrad <= 10 && stufe(x) <= 2);
            return {
                gruen,
                zahl:
                    "nach Ego → Third im Bild " + nach.filter((x) => x.imBild).length + "/" + nach.length + ", Azimut " +
                    nach.map((x) => x.azimutGegenKursGrad).join("/") + "°, Stufe ≤ " + Math.max(0, ...nach.map(stufe)) + " m · T4 Absteigen " +
                    sprung + " m je Bild, Azimut nach 10 Bildern " + az10 + "° · Hang " + (e.steil ? e.steil.neigung : "?") + "°",
            };
        },
        pfad: [...FAHRT, "stamm/siedlung-bauten.js", "stamm/siedlung-satz.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: staffel === 1 ? "1 = an einem Gerät im Bild gehalten" : "2 = an beiden Geräten im Bild, und bei jeder neuen vmax-Stufe neu gemessen",
    })),

    // ───────── siedlung.K2 — die Stadt in Reichweite (Zweig stadt-tor-k2: Rang-Gesetz im fachwerk-core, Mauer im Export) ─────────
    // Teil Z der Siedlungs-Linse (`diag-settlement --nur-z`, Node, 8 Saaten × zufälliger Spawn, Auto-Zellen binnen 2 km) und das
    // Bild der nächsten Stadt aus dem Ausgabe-Pfad am Boot-Seed (Abnahme-Urteil des Beweisbilds). An main: Z1 0/8 (ROT).
    {
        kriterium: "siedlung.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: sitzung(
            "A=$(cygpath -m '{AUS}')",
            "teil Z node scripts/diag-settlement.cjs --nur-z",
            "boot",
            "timeout 60 $W fenster 1600 900 > /dev/null 2>&1",
            "timeout 120 $W eval '" + STADT_WAHL + "' > \"$L/wahl.json\" 2>&1; echo '@@PUNKTE@@ WAHL'; cat \"$L/wahl.json\"; echo",
            "HILL=$(" + LIES("console.log(e.hill ? e.hill.x.toFixed(1) + \" \" + e.hill.z.toFixed(1) : \"\")") + " \"$L/wahl.json\" 2> /dev/null)",
            "[ -n \"$HILL\" ] || { echo '@@PUNKTE@@ KEINE STADT MIT ORT BINNEN 2 KM'; exit 4; }",
            "timeout 300 $W umstellen $HILL > /dev/null 2>&1",
            "for i in $(seq 1 60); do timeout 60 $W eval '" + STADT_STAND + "' > \"$L/stand.json\" 2>&1; " +
                LIES("process.exit(e.mauer > 0 && !e.zug && !e.pending ? 0 : 1)") + " \"$L/stand.json\" 2> /dev/null && break; sleep 5; done",
            "echo '@@PUNKTE@@ STAND'; cat \"$L/stand.json\"; echo",
            "timeout 60 $W eval '" + STADT_KAMERA + "' > \"$L/kamera.json\" 2>&1; echo '@@PUNKTE@@ KAMERA'; cat \"$L/kamera.json\"; echo",
            "K=$(" + LIES("console.log(e.pose ? e.pose.join(\" \") : \"\")") + " \"$L/kamera.json\" 2> /dev/null)",
            "[ -n \"$K\" ] || { echo '@@PUNKTE@@ KEINE KAMERA'; exit 5; }",
            "rm -f \"$L/stadt-mittag.abnahme.json\"",
            "teil BILD $W bild $K --datei \"$L/stadt-mittag.png\" --w 1600 --h 900",
            "cp \"$L/stadt-mittag.abnahme.json\" \"$A\" 2> /dev/null; true"
        ),
        gpu: true,
        minuten: 15,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const teil = (n) => out.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const z = /^\s*(✅|❌) Z1 RANG: binnen 2 km eine ummauerte Stadt in (\d+)\/8 Saaten/m.exec(out);
            const zOk = !!z && z[1] === "✅" && +z[2] >= 6;
            const wb = jsonBlock(teil("WAHL"));
            const w = (wb && wb.ergebnis) || {};
            const sb = jsonBlock(teil("STAND"));
            const s = (sb && sb.ergebnis) || {};
            const kb = jsonBlock(teil("KAMERA"));
            const k = (kb && kb.ergebnis) || {};
            const steht = s.mauer > 0 && !s.zug && !s.pending;
            const bild = !!j && j.ok === true;
            const gruen = zOk && steht && !k.fehler && k.segs > 0 && k.hoeher > 0 && bild;
            return {
                gruen,
                zahl:
                    "Z1 " + (z ? z[2] + "/8 Saaten" : "keine Zeile") + " · Boot-Seed " + w.seed + ": Stadt " +
                    (w.wahl ? w.wahl.cx + "," + w.wahl.cz + " nH " + w.wahl.nH + " " + w.wahl.d + " m vom Genesis-Ort" : "keine mit Ort") +
                    " · Mauer " + (k.segs != null ? k.segs + " Segmente/" + k.tuerme + " Türme" : k.fehler || "?") + ", Pool " + s.mauer +
                    (s.zug ? ", Zug läuft" : "") + " · Schuss vom " + k.art + " " + k.d + " m vor der Mitte, " + k.hoeher + " m höher · " +
                    (j && j.zeile ? j.zeile.slice(0, 120) : "ohne Abnahme (Exit " + lauf.exit + ")"),
            };
        },
        pfad: [
            "fachwerk-core.js",
            "stamm/siedlung-ort.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-bauten.js",
            "stamm/studio-bruecke.js",
            "worlds/fachwerk/fachwerk.js",
            "save-server.js",
            "scripts/diag-settlement.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "spec/asset-contract/v6/golden/siedlung.json",
        ],
        quelle: "1 = in ≥ 6 von 8 Saaten mit zufälligem Spawn steht binnen 2 km eine ummauerte Stadt (Auto-Zellen, nie Chat), sichtbar vom Hügel an einem Gerät",
    },

    // ───────── siedlung.K1 — das Haus von innen ─────────
    {
        kriterium: "siedlung.K1",
        staffel: 1,
        geraet: "headless",
        // gate:haus-welt W10 DER SPIELGANG (Null-Renderer, R3): EIN Gang per W-Taste über _stepFixedSim von 1 m vor der Tür bis
        // Keller und Dachboden, je Sim-Schritt der Hub; die Phase haus allein (W1 W2 W4c W5 W10 je Haus)
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=haus"],
        env: { HAUS_WELT_PORT: "{PORT}", HAUS_WELT_JSON: "{AUS}" },
        gpu: false,
        minuten: 5,
        urteil: (j) => {
            if (!j || !Array.isArray(j.haeuser)) return { gruen: false, zahl: "kein HAUS_WELT_JSON mit haeuser" };
            const g = j.haeuser.filter((h) => !h.fehler && h.gang);
            const ganz = g.filter((h) => h.gang.keller && h.gang.dach && !h.gang.fehlt.length && h.gang.hub <= 0.3);
            const hub = g.filter((h) => !(h.gang.hub <= 0.3));
            const gruen = ganz.length >= 1 && hub.length === 0;
            return {
                gruen,
                zahl:
                    ganz.length + " von " + g.length + " Gängen Tür → Keller → Dachboden ganz, Hub max " +
                    Math.max(0, ...g.map((h) => h.gang.hub)).toFixed(2) + " m, Anti-Clip-Hub " + hub.length +
                    (hub.length ? " (" + hub.map((h) => h.typ + " " + h.gang.wo).join(" · ") + ")" : ""),
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-core.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/welt-boot.cjs",
            "stamm/kreatur-*.js",
            "stamm/vegetation-baum.js",
        ],
        quelle: "1 = der Spieler geht durch die Tür bis Keller und Dachboden ohne Vertikal-Sprung > 0,3 m in einem Frame (Anti-Clip-Hub = ROT), an einem Haus",
    },

    // ───────── siedlung.K5 — das erste Haus steht sofort (M36, die Stufe am Abstand) ─────────
    // Station dorf wie M36: Werkbank --echt --ort dorf, Regler frei, die Zelle −4,−6 per Zell-Info nH 12 bzw. 300, der Spieler geht mit
    // 4 m/s ab 450 m durch den Vorlauf-Ring, bis sie erwacht; je nH ein frischer Boot. Gezählt: Erwachen → erstes Haus der Zelle im
    // Kegel, gezeichnet in der Stufe, die seine Studio-Kette für seinen Abstand wählt — in der Mesh-Zone sein Mesh, dahinter die Hülle
    // seines Gesetzbuchs im Welt-March (fernform "huelle"); der Feld-Satz einer Brücke in der Mesh-Zone zählt nie —, dazu der Bau-Hash
    // (bericht/2410-siedlung-k5/m36-stufe.js = artifacts/siedlung-k5/m36-stufe.js; `erstesMesh` trägt die alte Lesung mit).
    ...[1, 2].map((staffel) => ({
        kriterium: "siedlung.K5",
        staffel,
        geraet: ["radeon", "gtx"],
        befehl: sitzung(
            ...[12, 300].flatMap((nh) => [
                "boot --ort dorf",
                "timeout 60 $W fenster 1920 1080 > /dev/null 2>&1",
                "timeout 120 $W umstellen --ort dorf --sicht ego > /dev/null 2>&1",
                "timeout 300 $W lauf 10 --ein 20 --ruhe 120 --regler frei --tiere frei > /dev/null 2>&1",
                "teil NH" + nh + ' $W eval "window.__m36 = { zelle: [-4, -6], nH: ' + nh + ', start: 450, maxBilder: 15000 }; $(cat "$K/bericht/2410-siedlung-k5/m36-stufe.js")"',
            ])
        ),
        env: K,
        gpu: true,
        minuten: 14,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const je = [12, 300].map((nh) => {
                const b = jsonBlock(teil("NH" + nh));
                const e = b && (b.ergebnis || b);
                if (!e || e.fehler) return { nh, ok: false, text: "nH " + nh + ": kein Ergebnis" + (e && e.fehler ? " — " + e.fehler : "") };
                const ms = e.erstes ? e.erstes.ms : null;
                return {
                    nh,
                    ok: ms != null && ms <= 500 && !!e.hash,
                    text: "nH " + nh + " erstes Haus nach " + (ms == null ? "—" : ms + " ms") + " (" + (e.erstes ? e.erstes.typ + ", " + e.erstes.stufe + " in " + e.erstes.abstand + " m" : "kein Haus") + ", Bau-Hash " + e.hash + ")",
                };
            });
            return { gruen: je.every((x) => x.ok), zahl: je.map((x) => x.text).join(" · ") };
        },
        pfad: [...DORF, "stamm/stoff-instanz.js", "stamm/studio-*.js", "stamm/vegetation-baum.js", "scripts/lib/welt-orte.cjs"],
        quelle:
            staffel === 1
                ? "1 = erstes Haus sichtbar ≤ 0,5 s nach dem Erwachen der Zelle, unabhängig von nH (12 gegen 300), als Studio-L-Kette (Bau-Hash im Bild), an einem Gerät"
                : "2 = beide Geräte",
    })),

    // ───────── siedlung.K3 — die Gassen folgen dem Grund am Ort des Plans (Zweig siedlung-k3-trasse) ─────────
    // gate:settlement C-K3 (Browser, Null-Renderer, ≤ 3 min): die drei Vorräte am Mess-Ort dorf, das Auto-Dorf der Zelle −4,−4 und
    // der Akt am Hang — je Plan v2 der Abstand vom Ort seines Höhen-Rasters (Soll 0), die Lese-Punkte außerhalb des Rasters (Soll 0)
    // und das Gassen-Gefälle p95 am Grund ohne Erdbau (`gassenGefaelle`, Soll ≤ ORT_GESETZ.gefaelle = 12 %); Selbsttest: jeder
    // Export am Raster des Wunschs, den die Ort-Wahl rückt (bis siedlung-k3-trasse) → ROT.
    {
        kriterium: "siedlung.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-settlement.cjs"],
        env: { SETTLEMENT_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = /^\s*(✅|❌) C-K3: DIE TRASSE AM ORT — (\d+) Dörfer[^\n]* — (\[.*\])\s*$/m.exec(out);
            const s = /^\s*(✅|❌) C-K3 Selbsttest/m.exec(out);
            let t = [];
            try {
                t = z ? JSON.parse(z[3]) : [];
            } catch (_e) {
                t = [];
            }
            const gruen = !!z && z[1] === "✅" && +z[2] >= 4 && !!s && s[1] === "✅" && lauf.exit === 0;
            return {
                gruen,
                zahl: z
                    ? z[2] + " Dörfer, Gassen-Gefälle p95 " + t.map((x) => x.zelle + " " + x.p95 + " %").join(" · ") +
                      ", Versatz " + t.map((x) => x.versatzM).join("/") + " m, Selbsttest " + (s ? s[1] : "—") + ", Exit " + lauf.exit
                    : "keine Zeile C-K3 (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "stamm/siedlung-ort.js",
            "stamm/gelaende-boden.js",
            "worlds/fachwerk/fachwerk.js",
            "scripts/diag-settlement.cjs",
            "spec/asset-contract/v6/golden/siedlung.json",
        ],
        quelle: "1 = Gassen-Gefälle p95 ≤ 12 % VOR der Erdbau-Glättung in ≥ 4 Saaten",
    },

    // ───────── leib.K1 — Taste → Leib im Bild ─────────
    {
        kriterium: "leib.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // werkbank latenz an der Mess-Wiese: CDP-Taste bis zum ersten Ausgabe-Bild mit Leib/Kamera ≥ 1 cm bewegt, je 50 Proben —
        // in LAEUFE eigenen Boots, geurteilt über den schlechtesten (bildraten-fest)
        befehl: sitzung(
            ...latenzLaeufe(
                "boot",
                "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
                'teil LATENZ{N} $W latenz --proben 50 --sicht ego,third --verb gehen,wechsel --json "{AUS}.lauf{N}.json"'
            )
        ),
        env: K,
        gpu: true,
        minuten: 10,
        urteil: (j) => {
            const { gruen, zahl } = latenzSchlechtester(j, ["ego/gehen", "third/gehen", "ego/wechsel", "third/wechsel"], 50);
            return { gruen, zahl };
        },
        pfad: LATENZ,
        quelle: "1 = Taste → bewegter Leib im Ausgabe-Bild p95 ≤ 50 ms an einem Gerät (gehen, Sicht-Wechsel)",
    },
    {
        kriterium: "leib.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Linse über jedes Verb der Staffel (schwingen = hieb), EIN Ruf je Boot, LAEUFE Boots, der schlechteste urteilt
        befehl: sitzung(
            ...latenzLaeufe(
                "boot",
                "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
                'teil LATENZ{N} $W latenz --proben 50 --sicht ego,third --verb gehen,springen,einsteigen,hieb --json "{AUS}.lauf{N}.json"'
            )
        ),
        env: K,
        gpu: true,
        minuten: 24,
        urteil: (j) => {
            const ids = ["gehen", "springen", "einsteigen", "hieb"].flatMap((v) => ["ego/" + v, "third/" + v]);
            const { gruen, zahl } = latenzSchlechtester(j, ids, 50);
            return { gruen, zahl };
        },
        pfad: LATENZ,
        quelle: "2 = jedes Verb (gehen, springen, schwingen, einsteigen), beide Geräte",
    },

    // ───────── leib.K4 — die Kamera zu Fuß ─────────
    {
        kriterium: "leib.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // gate:kamera-leib Teil gang mit --bild (echter Renderer): Stamm, Fels, Haus im echten Spiel-Takt, rückwärts heran +
        // 360°-Orbit; Kugel in Fels/Bau, Nah-Pixel von Fels, Gelände und Rinde, Ruck p95
        // der Gang läuft NUR im Teil leib (diag-kamera-laub: `if (TEILE.includes("leib")) { … if (TEILE.includes("gang"))`), wie
        // gate:kamera-leib (`--teile leib,gang,ninja --bild`); `--teile gang` allein mass nichts (23.10.: „Gang: nicht gemessen“)
        befehl: ["node", "scripts/diag-kamera-laub.cjs", "--teile", "leib,gang", "--bild"],
        env: { KAMERA_LAUB_PORT: "{PORT}", LINSE_GPU: "hardware" },
        gpu: true,
        minuten: 6,
        // DAS URTEIL (24.10., Prüfung der Buchung): das Kriterium misst Pixel „an einem Gerät“ — unter `--bild` zeichnet die Welt
        // auf der Karte (seit gpu-wand: Rezept linse ohne Null-Renderer), kamera-nah rechnet die Nah-Pixel gegen die Szene, die sie
        // zeichnet; zeichnet sie nie (welt-boot: „das Rezept ist null“), ist das ROT (Wand GPU in punkte.cjs und hier).
        // „nie … in der Wand“: die Messung prüft Fels UND Wand vor der Kamera — Bau-Pixel im Nahbereich (der offene Tür-Flügel
        // trägt keinen Leib) zählen, die gate:kamera-leib nur nennt. Die Kugel im Stamm (Fels oder Wand nennt das Kriterium nicht)
        // und der Ruck-Höchstwert (das Kriterium misst p95) stehen in der Zahl.
        urteil: (j, lauf) => {
            const z = lauf.stdout.split(/\r?\n/).find((l) => /^\s*(✅|❌) K4 der Gang in Third/.test(l));
            if (!z) return { gruen: false, zahl: "keine Zeile K4 der Gang (Exit " + lauf.exit + ")" };
            const zeilen = lauf.stdout.split(/\r?\n/).filter((l) => /^\s+(stamm|fels|haus)\s/.test(l));
            const gaenge = zeilen.map((l) => l.trim().replace(/\s+/g, " "));
            const wand = zeilen.reduce((s, l) => {
                const m = /Nah-Pixel (\{[^}]*\})/.exec(l);
                let n = {};
                try { n = m ? JSON.parse(m[1]) : {}; } catch (_e) { n = { kaputt: 1 }; }
                return s + Object.entries(n).filter(([k]) => /: Bau$|kaputt/.test(k)).reduce((a, [, v]) => a + v, 0);
            }, 0);
            const nie = /^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout);
            const rot = [/❌/.test(z) ? z.split(" — ").slice(1).join(" — ") : null, wand ? "Wand-Pixel (Bau) im Nahbereich in " + wand + " Proben" : null,
                nie ? "die Linse zeichnet nie (welt-boot: Rezept null)" : null].filter(Boolean);
            return { gruen: /✅/.test(z) && !rot.length, zahl: (gaenge.join(" | ") || "keine Gang-Zeile") + (rot.length ? " — ROT: " + rot.join(" · ") : "") };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/vegetation-*.js",
            "stamm/siedlung-bauten.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            "scripts/diag-kamera-laub.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = Third nie im Fels oder in der Wand (0 Fels-Pixel im Nahbereich der Kamera), Ruck ≤ 0,02 m p95 beim Gehen, an einem Gerät",
    },

    // ───────── leib.K5 — das Gamepad (gamepad-verben) ─────────
    ...[1, 2].map((staffel) => ({
        kriterium: "leib.K5",
        staffel,
        geraet: "headless",
        // checkBandGamepadVerben im vollen Playtest (Null-Renderer): ein synthetisches Pad fährt jedes Verb durch den echten Takt;
        // am Kopf vor gamepad-verben fehlt die Probe (ROT „keine Zeile")
        befehl: ["node", "scripts/playtest.cjs"],
        env: { PLAYTEST_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = lauf.stdout.split(/\r?\n/).filter((l) => /^\s*(✅|❌) Gamepad-Verben \(leib\.K5\): /.test(l));
            const teile = staffel === 1 ? [/: Gehen ∝/, /: Fahren:/] : [/: jedes Verb liest NUR/, /: Gehen ∝/, /: Fahren:/, /: jeder Knopf über/];
            const je = teile.map((re) => z.find((l) => re.test(l)));
            if (je.some((l) => !l)) return { gruen: false, zahl: "keine Zeile der Gamepad-Probe für " + teile.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((l) => /✅/.test(l)), zahl: je.map((l) => l.trim().replace(/^(✅|❌) Gamepad-Verben \(leib\.K5\): /, "$1 ")).join(" | ") };
        },
        pfad: PAD,
        quelle: staffel === 1 ? "1 = Gehen, Kamera und Fahren analog über den Achs-Wert (Lenkwinkel stetig)" : "2 = jedes Verb, Rumble aus dem Zustand, Belegung frei",
    })),

    // ───────── halten.K1 — der Treffer aus dem Gesetz ─────────
    {
        kriterium: "halten.K1",
        staffel: 1,
        geraet: "headless",
        // gate:kampf-gefuehl am echten Chokepoint (_beginPlayerSwing, _kampfSweepTick, damageCreature): (A) Dauer ∝ √I zweier echter
        // Blueprints, (B) der Sweep trifft neben dem Fadenkreuz genau einmal, hinter dem Rücken nie
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = [/\(A\) beide Fixtures liegen UNGEKLEMMT/, /\(A\) Schwung-Dauer-Verhältnis ∝ √/, /\(B\) der Sweep trifft ein Ziel NEBEN/, /\(B\) dedupliziert je Schwung: GENAU EIN/, /\(B\) NIE ein Ziel hinter dem Rücken/];
            const je = soll.map((re) => l.find((x) => /^\s*(✅|❌) /.test(x) && re.test(x)));
            const a = l.find((x) => /^\s*\(A\) I1=/.test(x));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /✅/.test(x)), zahl: (a ? a.trim() : "") + " · " + je.filter((x) => /❌/.test(x)).length + " von " + je.length + " Proben ROT" };
        },
        pfad: KAMPF,
        quelle: "1 = Schwung und Treffer folgen der Trägheit des Werks (Dauer ∝ √I ±5 % an echten Blueprints, Klingen-Sweep am Chokepoint) — Mechanik",
    },

    // ───────── halten.K2 — Eingabe → Schwung, Hit-Stop ─────────
    {
        kriterium: "halten.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // werkbank latenz --verb hieb (halten-latenz): Klick per CDP bis zur Marke getCurrentTexture, an der die rechte Hand ≥ 1 cm
        // steht; Hit-Stop = präsentierte Bilder mit stehender Schwung-Uhr und Hand (halt) — in LAEUFE eigenen Boots, der
        // schlechteste urteilt (bildraten-fest, wie leib.K1)
        befehl: sitzung(
            ...latenzLaeufe(
                "boot",
                "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
                "teil HAKEN{N} $W eval '" + HIT_HAKEN + "'",
                'teil LATENZ{N} $W latenz --verb hieb --sicht third,ego --proben 30 --json "{AUS}.lauf{N}.json"',
                "teil SPIEL{N} $W eval '" + HIT_LESEN + "'"
            )
        ),
        env: K,
        gpu: true,
        minuten: 14,
        urteil: (j, lauf) => {
            const ids = ["third/hieb", "ego/hieb"];
            const r = latenzSchlechtester(j, ids, 30);
            if (!r.da) return r;
            // der Hit-Stop je Lauf (die längere Sicht), der schlechteste Lauf urteilt
            const halt = Math.min(...r.da.map((l) => Math.max(0, ...ids.map((id) => (l.reihen[id] && l.reihen[id].halt) || 0))));
            const out = String(lauf.stdout || "");
            const spiel = Array.from({ length: LAEUFE }, (_, i) => {
                const sp = out.indexOf("@@PUNKTE@@ SPIEL" + (i + 1));
                const s = sp >= 0 ? jsonBlock(out.slice(sp)) : null;
                const e = s && s.ergebnis;
                return e ? e.gesetzt + "-mal" + (e.gesetzt ? " (" + e.dauerMs.join("–") + " ms, gleitet bis " + e.gleitMm + " mm je Takt)" : "") : "ungezählt";
            });
            return { gruen: r.gruen && halt >= 2, zahl: r.zahl + " · Hit-Stop im schlechtesten Lauf " + halt + " Bilder · im Spiel Halt gesetzt " + spiel.join(" / ") };
        },
        pfad: LATENZ,
        quelle: "1 = Eingabe → erstes Schwung-Bild ≤ 50 ms und Hit-Stop sichtbar im Ausgabe-Bild an einem Gerät",
    },

    // ───────── halten.K3 — das Werkzeug wirkt nach seiner Form (halten-gesetz) ─────────
    {
        kriterium: "halten.K3",
        staffel: 1,
        geraet: "headless",
        // gate:kampf-gefuehl Q11 halten.K3 (Fällaxt fällt, Spaten gräbt, die umgeformte Gestalt folgt der Form); die Sichel hat
        // kein Kern-Rezept und keine Probe — bis eine Zeile „Sichel … erntet" grün steht, ist die Station ROT beim Namen
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q11 halten\.K3/.test(x));
            const sichel = l.find((x) => /^\s*(✅|❌) .*Sichel.*ernte/i.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q11 halten.K3 (Exit " + lauf.exit + ")" };
            const form = l.find((x) => /^\s+form \{/.test(x));
            return {
                gruen: /✅/.test(q) && !!sichel && /✅/.test(sichel),
                zahl: "Q11 " + (/✅/.test(q) ? "grün" : "ROT") + " (" + (form ? form.trim().slice(0, 240) : "keine Form-Zeile") + ") · Sichel " + (sichel ? (/✅/.test(sichel) ? "grün" : "ROT") : "ungemessen (keine Probe)"),
            };
        },
        pfad: KAMPF,
        quelle: "1 = Axt fällt, Spaten gräbt, Sichel erntet über die echte Eingabe, und eine umgeformte Klinge (Axt mit Spaten-Blatt) wirkt nach der neuen Form",
    },
    // gate:kampf-gefuehl Q11 (der Werkzeug-Satz an der Mess-Wiese): jede der 22 Gestalten des Gesetzbuchs und die Hand, je Ziel EIN
    // Klick über die echte Eingabe — Eiche, Fels, Erde, Wiese, Wild, Schuss —, gezählt Wirkung und Verschleiß, am Ziel der Aufgabe
    // dazu wear 0,5 (der Faktor in der Kraft) und 0,02 (die Wand); die Form-Mutation (Grab-Blatt, Axt-Kopf, Krümmung, Recurve)
    // und der Stoff (Stahl, Eisen, Bronze aus der Tradition, 16 Hiebe in Folge, die halbe Härte der Stahl-Zeile). Die Selbst-Tests
    // S6 (Pfeil ohne Verschleiß), S13 (Art-Tafel), S15 (Name), S16 (Spender) müssen feuern. An main 6f8a2c66 ROT: 19 von 22,
    // Stahl, Eisen und Bronze zehren je 0,0032, Graben zehrt nicht und kennt keine Wand, die Recurve schießt gleich.
    {
        kriterium: "halten.K3",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q11 halten\.K3 Staffel 2/.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q11 halten.K3 Staffel 2 (Exit " + lauf.exit + ")" };
            const selbst = ["S6", "S13", "S15", "S16"].map((k) => [k, l.find((x) => x.includes("SELBST-TEST (" + k + ")"))]);
            const stumm = selbst.filter(([, x]) => !x || !/✅/.test(x)).map(([k]) => k);
            const [, gut, alle] = q.match(/\((\d+) von (\d+)\)/) || [];
            const stoff = (q.match(/Stoff-Zeile \(([^)]*)\)/) || [])[1];
            return {
                gruen: /✅/.test(q) && +gut === +alle && +alle >= 22 && !stumm.length,
                zahl:
                    (gut || "?") + " von " + (alle || "?") + " Gestalten · zehrt " + (stoff || "ungemessen") +
                    (/❌/.test(q) ? " · ROT: " + q.split(" — ").slice(1).join(" — ").slice(0, 300) : "") +
                    (stumm.length ? " · Selbst-Test stumm: " + stumm.join(", ") : ""),
            };
        },
        pfad: KAMPF.concat(["stamm/vegetation-wiese.js", "stamm/bau-vorlagen.js"]),
        quelle: "2 = jede Werkzeug-Form der Schmiede, Verschleiß aus dem Stoff",
    },

    // ───────── ultiversum.K5 — Vertrauen (teilen-sicher) ─────────
    {
        kriterium: "ultiversum.K5",
        staffel: 1,
        geraet: "headless",
        // gate:praegung-welt (K) KORPUS: fremde, gültig signierte Codes fallen bei B laut beim Namen (op:rule), die P2P-Regel mit
        // verbotenem Effekt fällt benannt (rule_effect_forbidden), B schreibt 0; am Kopf vor teilen-sicher fehlt (K)
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = [/^\s*(✅|❌) op:rule /, /^\s*(✅|❌) P2P: eine Regel mit verbotenem Effekt fällt benannt/, /^\s*(✅|❌) 0 Schreibe: /];
            const je = soll.map((re) => l.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 140)).join(" | ") };
        },
        pfad: [
            "stamm/netz-identitaet.js",
            "stamm/netz-p2p.js",
            "stamm/feld-dsl.js",
            "stamm/feld-leben.js",
            "stamm/studio-bruecke.js",
            "stamm/werkstatt-*.js",
            "stamm/daten.js",
            "scripts/diag-praegung-welt.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = eine geteilte Regel oder Welt mit verbotenen Ops wird beim Laden benannt abgewiesen (RULE_FORBIDDEN_EFFECT_OPS), 0 Schreibe auf den frozen Kern",
    },
    {
        kriterium: "ultiversum.K5",
        staffel: 2,
        geraet: "headless",
        // ultiversum-k5-korpus: gate:v1-pfad --feind schickt den Korpus spec/abnahme/ki-feind-korpus.json (Kanarie-Marker in Bauplan,
        // Namen, Regeln, Tür) durch die echten Eingänge zu einem gehorsamen Modell; die Wand liest jede Erinnerung im ganzen Stamm
        befehl: ["node", "scripts/diag-v1-pfad.cjs", "--feind"],
        env: { V1_PFAD_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = ["Wand", "erreicht", "ausgeführt", "Signatur", "Anzeige"].map((k) => new RegExp("^\\s*(✅|❌) FEIND " + k + ":"));
            const je = soll.map((re) => l.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt (Exit " + lauf.exit + ")" };
            return { gruen: lauf.exit === 0 && je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 120)).join(" | ") };
        },
        pfad: [
            "stamm/*.js",
            "scripts/diag-v1-pfad.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
            "spec/abnahme/ki-feind-korpus.json",
            "spec/golden/v1/blueprint-signed.json",
        ],
        quelle: "2 = ein Korpus aus Prompt-Injektionen in Bauplänen, Namen und Regeln lenkt die KI nicht (0 ausgeführte fremde Anweisungen), die Signatur-Prüfung schlägt bei Manipulation an",
    },

    // ───────── halten.K4 — der Bogen (halten-k4-bogen) ─────────
    // gate:kampf-gefuehl Q12 (headless, 3 Winkel × 30/60/144 Hz): Staffel 1 die Bahn gegen die Parabel des Abschusses, Staffel 2 der
    // steckende Pfeil (Wand, Boden, Hirsch) über den Speicher-Rundlauf und die Zug-Kraft aus BOGENMAT; S14 nennt die alte Bahn beim
    // Namen. Am Kopf vor dem Zweig fehlt Q12 (ROT beim Namen). schmiede-core.js liegt im Baum an der Wurzel (KAMPF nennt worlds/schmiede/)
    ...[1, 2].map((staffel) => ({
        kriterium: "halten.K4",
        staffel,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => new RegExp("^\\s*(✅|❌) Q12 halten\\.K4 Staffel " + staffel).test(x));
            const s = l.find((x) => /^\s*(✅|❌) SELBST-TEST \(S14\)/.test(x));
            const z = l.find((x) => /^\s*\(Q12\) Bahn /.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q12 halten.K4 Staffel " + staffel + " (Exit " + lauf.exit + ")" };
            return { gruen: /✅/.test(q) && !!s && /✅/.test(s), zahl: (z ? z.trim() : "") + (/❌/.test(q) ? " · " + q.trim() : "") };
        },
        pfad: [...KAMPF, "schmiede-core.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "stamm/gelaende-chunks.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js"],
        quelle:
            staffel === 1
                ? "1 = Flugbahn folgt Abschuss-Tempo und Schwerkraft (±5 % gegen die Parabel)"
                : "2 = der Pfeil steckt im getroffenen Ding und bleibt über den Reload, Zug-Kraft aus dem Bogen-Gesetz",
    })),
    // ───────── halten.K5 — Sturz, Tod und Wiederkehr als Zustand (halten-k5) ─────────
    // gate:kampf-gefuehl --k5 (echter Renderer, ?holz=kienspan): Q13 fährt den Takt des Spiels selbst — fünf Stürze über den
    // Leib-Löser (2 · 4 · 8 · 12 m und ein Wurf aus 4 m mit 8 m/s abwärts: der Schaden aus dem Aufprall-Tempo; ein fester Schaden
    // je Sturz fällt an der Reihe, ein Höhen-Zähler am Wurf — S17), zwei Wölfe fallen bei 60 Hz mit Leerlauf und bei 15 Hz ohne
    // (die Tod-Lage bei 0,6 s gleich), ein Wolf tötet den Spieler über den Biss-Weg, die Rückkehr am Genesis-Anker, verwundet
    // speichern, Reload; der Abdruck (Ort, Inventar, Lebenswerte, Bindung eines Fuchses) vor dem Speichern gleicht dem nach dem
    // Laden je Teil (S18: ohne Inventar ROT am Teil). An main 45c6aa19 ROT (swiftshader): Sturz 0 · 0 · 0 · 0 · 0 hp, Tod-Lage
    // 53,8° gegen 0° (ohne Leerlauf steht der Leib), Abdruck f0bd7b3a8baf → bb9065e89f5f (Leben und Bindung fallen im Reload);
    // am Zweig halten-k5 grün: 0 · 10,7 · 57,0 · 101,7 · 47,7 hp, 29,2° · 4,5 cm beide, 84864b15008e → 84864b15008e.
    {
        kriterium: "halten.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs", "--k5"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}", LINSE_GPU: "hardware" },
        gpu: true,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q13 halten\.K5 Staffel 1/.test(x));
            const z = l.find((x) => /^\s*\(Q13\) /.test(x));
            if (!q || !z) return { gruen: false, zahl: "keine Zeile Q13 halten.K5 Staffel 1 (Exit " + lauf.exit + ")" };
            const stumm = ["S17", "S18"].filter((k) => !l.some((x) => /^\s*✅/.test(x) && x.includes("SELBST-TEST (" + k + ")")));
            const [, h1, h2, roh] = z.match(/\(Q13\) (\w+) → (\w+) (\{.*\})\s*$/) || [];
            let K = null;
            try { K = JSON.parse(roh); } catch (_e) { K = null; }
            const f = (v, n = 1) => (Number.isFinite(v) ? v.toFixed(n) : "?");
            const zahl = K
                ? "Sturz 2 · 4 · 8 · 12 m · Wurf: " + K.sturz.map((x) => f(x.d)).join(" · ") + " hp (Aufprall " + K.sturz.map((x) => f(x.v)).join(" · ") +
                  " m/s) · Tod-Lage 60 / 15 Hz " + K.lage.map(([w, y]) => f(w) + "° " + f(100 * y) + " cm").join(" / ") + " · Tod " + K.tod.q +
                  ", Anker " + f(K.tod.anker) + " m · Abdruck " + h1 + " → " + h2
                : "Q13-Zeile ohne Abdruck";
            const rot = /❌/.test(q) ? " · ROT: " + q.split("Zustand ").slice(1).join("").trim() : "";
            return { gruen: lauf.exit === 0 && /✅/.test(q) && !stumm.length, zahl: zahl + rot + (stumm.length ? " · Selbst-Test stumm: " + stumm.join(", ") : "") };
        },
        pfad: [...KAMPF, "koerper-core.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js"],
        quelle: "1 = Fall-Schaden aus dem Aufprall-Tempo, Tod und Wiederkehr am Ort mit Zustand (Inventar, Bindung) über Speichern, an einem Gerät",
    },
    // ───────── fahrzeug.K1 — das Fahr-Gesetz: der Reifen mit Spitze (Staffel 1 Weg (a), fahrzeug-k1-reifen 2d01a8a7) ─────────
    // gate:fahr-leben K8 Reifen (--kern, Node): je Rezept und Achse die Seitenkraft des Kerns (`fahrKraefte`, dieselbe Funktion wie
    // Probefahrt und Welt) über den Schlupf 0,1–30°; das Urteil liest `REIFEN {achsen:[{wo, spitze, abfall}], hz, kostenUs}` —
    // an main 833bbc24 ROT: Spitze 8,7–11,5° (Plateau), Abfall 0 % an allen 10 Achsen
    {
        kriterium: "fahrzeug.K1", staffel: 1, geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kern"], env: { FAHR_LEBEN_PORT: "{PORT}" }, gpu: false, minuten: 1,
        urteil: (j, lauf) => {
            const m = jsonZeile(lauf.stdout, /^REIFEN {/);
            const A = (m && m.achsen) || [];
            if (!A.length) return { gruen: false, zahl: "keine REIFEN-Zeile (Exit " + lauf.exit + ")" };
            const aus = A.filter((a) => !(a.spitze >= 6 && a.spitze <= 10 && a.abfall >= 0.15));
            const sp = A.map((a) => a.spitze);
            const ab = A.map((a) => Math.round(a.abfall * 100));
            return {
                gruen: A.length >= 10 && aus.length === 0,
                zahl: A.length + " Achsen (" + A.length / 2 + " Rezepte): Spitze " + Math.min(...sp) + "–" + Math.max(...sp) +
                    "°, Abfall bis 30° " + Math.min(...ab) + "–" + Math.max(...ab) + " %" +
                    (aus.length ? " · außer Soll: " + aus.map((a) => a.wo + " " + a.spitze + "°/" + Math.round(a.abfall * 100) + " %").join(", ") : ""),
            };
        },
        pfad: ["vehicle-core.js", "scripts/diag-fahr-leben.cjs"],
        quelle: "1 = (a) Seitenkraft mit Spitze bei 6–10° Schlupf und ≥ 15 % Abfall",
    },
    // ───────── fahrzeug.K1 — Staffel 2: das Fahr-Gesetz IN DER WELT (fahrzeug-k1-reifen, 25.10.) ─────────
    // gate:fahr-leben --kette (Node, Null-Renderer, ≤ 1 min): (a) aus der Zeile REIFEN (der Kern, wie #1); die Bremsungen der
    // W-Kette ab 50 km/h bis bremsV auf der Mess-Wiese (Gras: μ(kraut) der Stoff-Zeile über dem Grün der Boden-Karte) und auf
    // demselben Streifen als Weg (`_stlWegeBuild`, μ(erde)) je trocken und im Sturm (die EINE Nässe), dazu Gras mit halbem
    // μ(kraut) in der Stoff-Zeile (die Zeile wirkt, kein Grip-Faktor im Wirt); S1 (Labor = Welt) mit dem Takt des Kerns an
    // jedem Schritt der Welt — alles aus der Zeile `KETTE {roh}`. An main 206b395a ROT: die Welt reichte trocken μ 1 auf jeden
    // Boden (Gras/Weg 1,0), nass 0,7 (Bremsweg 1,28×), keine Zeile `weg`.
    {
        kriterium: "fahrzeug.K1", staffel: 2, geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kette"], env: { FAHR_LEBEN_PORT: "{PORT}" }, gpu: false, minuten: 1,
        urteil: (j, lauf) => {
            const A = (jsonZeile(lauf.stdout, /^REIFEN {/) || {}).achsen || [];
            const r = (jsonZeile(lauf.stdout, /^KETTE {/) || {}).roh || {};
            const q = (a, b) => (r[a] && r[b] ? r[a].s / r[b].s : NaN);
            const L = r.labor || {};
            const z = (x) => (Number.isFinite(x) ? x.toFixed(2) : "?");
            const teile = {
                a: A.length >= 10 && A.every((x) => x.spitze >= 6 && x.spitze <= 10 && x.abfall >= 0.15),
                b: q("trocken", "weg") >= 1.5,
                nass: Math.min(q("sturm", "trocken"), q("wegNass", "weg")) >= 1.3,
                zeile: q("zeile", "trocken") >= 1.3,
                takt: L.hz >= 240,
                s1: L.schritte > 0 && L.maxM <= 0.01,
            };
            const aus = Object.keys(teile).filter((k) => !teile[k]);
            return {
                gruen: !aus.length,
                zahl: "(a) Spitze " + (A.length ? Math.min(...A.map((x) => x.spitze)) + "–" + Math.max(...A.map((x) => x.spitze)) + "°, Abfall ab " +
                    Math.round(Math.min(...A.map((x) => x.abfall)) * 100) + " %" : "?") +
                    " · (b) Bremsweg 50 → 0 km/h Gras " + z(r.trocken && r.trocken.s) + " / Weg " + z(r.weg && r.weg.s) + " m = " + z(q("trocken", "weg")) + "×" +
                    " · nass Gras " + z(q("sturm", "trocken")) + "×, Weg " + z(q("wegNass", "weg")) + "× · μ(kraut) halb " + z(q("zeile", "trocken")) + "×" +
                    " · Takt " + L.hz + " Hz · S1 " + L.maxM + " m (" + L.schritte + " Schritte)" + (aus.length ? " · außer Soll: " + aus.join(", ") : "") +
                    " · Exit " + lauf.exit,
            };
        },
        pfad: [
            "vehicle-core.js",
            "stamm/koerper-*.js",
            "stamm/bau-buch.js",
            "stamm/bau-vorlagen.js",
            "stamm/vegetation-wiese.js",
            "stamm/siedlung-satz.js",
            "stamm/gelaende-boden.js",
            "stamm/stoff-material.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-takt.js",
            "scripts/diag-fahr-leben.cjs",
            "scripts/lib/fahr-proben.cjs",
        ],
        quelle: "2 = (a) + (b) + nass ≥ 1,3× aus der EINEN Nässe + Sim-Takt im Fahr-Schritt ≥ 240 Hz, Labor = Welt S1 ≤ 0,01 m",
    },
    // ───────── tore.K3 — was der Spieler trägt, reist mit (tore-k3-abdruck) ─────────
    // gate:portal-konformanz K8: der Spieler geht in der echten Heimat durch jedes Studio-Tor des Genesis-Rings (W durch die
    // Apertur, am Teile-Tor E — nie ein Ruf der Übergabe) und mit Esc zurück; je Ring-Welt × Teil (Leib = Seele · Teile ·
    // Prägung des Mensch-Rezepts, Inventar = Slots · Hotbar, wield = Haupt-, Neben-Hand, Rüstung) der Abdruck (kanonisches
    // JSON + FNV-1a) vor dem Tor, drüben aus der Hülle (`AnazhHuelle.reisender`) und nach der Heimkehr. Das Urteil vergleicht
    // die Abdrücke der Zeile `K8 [[welt, weg, vor, drüben, nach, esc], …]` selbst, nie ein ok-Flag der Übergabe; Esc muss
    // heimbringen. An main 206b395a ROT: 0/30 (drüben hält keine Hülle etwas, daheim vor = nach).
    {
        kriterium: "tore.K3", staffel: 1, geraet: ["radeon", "gtx"],
        befehl: ["node", "scripts/diag-portal-konformanz.cjs"], env: { PORTAL_KONFORMANZ_PORT: "{PORT}" }, gpu: true, minuten: 5,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/).find((l) => l.startsWith("K8 ["));
            let R = null;
            try {
                R = z ? JSON.parse(z.slice(3)) : null;
            } catch (_e) {
                R = null;
            }
            if (!Array.isArray(R) || !R.length) return { gruen: false, zahl: "keine K8-Tafel (Exit " + lauf.exit + ")" };
            const T = ["leib", "inventar", "wield"];
            const rot = [];
            let heil = 0;
            for (const [welt, weg, vor, dr, nach, esc] of R)
                for (const t of T)
                    if (esc === true && vor && dr && nach && vor[t] === dr[t] && vor[t] === nach[t]) heil++;
                    else rot.push(welt + " " + t + (esc === true ? "" : " (Esc bringt nicht heim)"));
            return {
                gruen: R.length >= 10 && heil === R.length * T.length,
                zahl: heil + "/" + R.length * T.length + " Ring-Welten × Teile byte-gleich vor dem Tor · drüben · daheim (" +
                    R.map((r) => r[0] + " " + r[1]).join(", ") + ")" + (rot.length ? " · rot: " + rot.join(", ") : ""),
            };
        },
        pfad: [
            "stamm/netz-portal.js",
            "stamm/siedlung-ort.js",
            "stamm/koerper-bewegung.js",
            "worlds/huelle/huelle.js",
            "scripts/diag-portal-konformanz.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Leib, Inventar und Gehaltenes stehen nach Tor hin und zurück byte-gleich, an einem Gerät",
    },
];

module.exports = stationen;

// NICHT FASSBAR als Station (befehl null): das Werkzeug fehlt oder die Staffel verlangt, was EIN Lauf auf EINEM Gerät nie misst.
module.exports.fehlt = [
    {
        kriterium: "tore.K5", staffel: 1, befehl: null,
        grund: "die Probe (T) von gate:praegung-welt misst KEIN anderes Gerät: B ist ein zweiter BrowserContext im selben Chrome " +
            "(scripts/diag-praegung-welt.cjs:297 createBrowserContext — derselbe Prozess, derselbe GPU-Prozess, dieselbe Maschine), " +
            "und „steht an B's Pose“ ist eine NDC-Projektion am Null-Renderer (:421, :505), kein Bild an B's Pose (Schlupfloch der " +
            "Karte: Bau-Hash und Bild); ein anderes Gerät verlangt mindestens einen eigenen Browser-Prozess mit eigenem Profil und " +
            "Speicher, besser die OMEN als B über die Warteschlange — gemessen an 1d9164e9: Code 530 Zeichen, Bau-Hash A = B 9c183437/12, 640 ms",
    },
    {
        kriterium: "tore.K5", staffel: 2, befehl: null,
        grund: "der Welt-Fluss hat keine Linse: der Einladungs-Code lädt die Seite neu (joinWorldFromCode → _weltWechselNeuLaden), Kontrolle ≤ 5 s verlangt das Welt-Tor ohne Neuladen; dazu beide Flüsse an zwei Geräten (#1 steht ebenfalls hier: B ist kein anderes Gerät)",
    },
    {
        kriterium: "tore.K3", staffel: 2, befehl: null,
        grund: "Werkzeug fehlt: der Abdruck von gate:portal-konformanz K8 trägt Leib, Inventar und Gehaltenes (#1); das Reittier/Fahrzeug " +
            "(`state.player.mountedArch`) reist nicht im Gepäck der Übergabe (`_portalEnterPayload`), und die Rundreise eines Werks " +
            "Studio → Welt → Studio misst keine Linse — der Hinweg steht (gate:studio-uebergabe (K): Bau-Hash Studio = Welt, im vm), den " +
            "Rückweg trägt keine Ziel-Seite: keines der 8 Studios mit `werk()` nimmt das Werk der Welt in seine Bühne, und der Bau-Hash " +
            "der Welt verlangt die Foundry (K8 fährt ohne). Ist an tore-k3-abdruck: Reittier 0/10, Werk-Rundreise 0/8",
    },
    {
        kriterium: "siedlung.K1", staffel: 2, befehl: null,
        grund: "W10 geht 8 Häuser des Drehbuch-Dorfs, nicht jedes Haus des Start-Dorfs; keine Probe misst die Innen-Luma gegen den Außen-Schatten (≥ 15 %) im Ausgabe-Bild",
    },
    {
        kriterium: "siedlung.K2", staffel: 2, befehl: null,
        grund: "Werkzeug fehlt: der Zipf-Fit über 32 × 32 km mit Intervall steht in keiner Linse (einmal von Hand gemessen, α 0,916, kein Tor); der Export mit mauer und graph prüft gate:settlement, die Dämmerung und beide Geräte bindet keine Station",
    },
    {
        kriterium: "leib.K4", staffel: 2, befehl: null,
        grund: "gate:kamera-leib Teil gang kennt Stamm, Fels und Haus an der Mess-Wiese — kein Gang am Steilhang und keiner im Sprint",
    },
    {
        kriterium: "halten.K1", staffel: 2, befehl: null,
        grund: "Q11 mutiert MAT (rho, sigY) und misst den Treffer headless; dass dieselbe Mutation das Labor-Werk ändert, und der Treffer im Bild beider Geräte, misst keine Linse",
    },
    {
        kriterium: "halten.K2", staffel: 2, befehl: null,
        grund: "kein Klang-Abgriff je Stoff-Paar (Stahl/Holz, Stahl/Stein, Holz/Fell) und keine Funken-Probe; latenz zählt nur den Hit-Stop",
    },
];
