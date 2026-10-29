// Stationen der Gruppe V (src/g5.js) — Welten und Wege. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst: jedes Kriterium mit Punkten > 0 und jede Staffel, die ein Zweig kippen soll — den Zweig nennt der Kommentar-Kopf
// des Eintrags (die Aufzählung hier war bei jedem Stations-Merge ein Konflikt). Was sich nicht als Station fassen lässt, steht in
// `module.exports.fehlt` (befehl null, grund) — außerhalb der Liste, damit `run` der anderen Gruppen nicht an ihr bricht.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");
const PW = require("./proben-welt.cjs"); // die Proben der Welt in der Sitzung (fahrzeug.K5#1, fahrzeug.K2#1)

// DIE PROBE IN DER SITZUNG (punkte.cjs fahreSitzung, 29.10.): die Welt steht schon — save-server {PORT}, `werkbank start --echt`
// auf {PORT}+20000 (WERKBANK_PORT), eine Linse neben ihr auf {PORT}+20001. `boot` holt eine FRISCHE Welt: die erste ist es schon
// (die Sitzung stellt vor jeder Probe den Grund: Spielstand weg, die Seite neu im warmen Browser), jede weitere über
// `punkte.cjs grundstellung` (dieselbe Grundstellung) — nie ein eigener Boot; `boot --ort X` stellt danach um. Die Schritte
// schreiben ihre Ausgabe unter „@@PUNKTE@@ NAME" (nie „=== " — damit beginnen die Überschriften der Linsen); das Urteil liest die
// Abschnitte. Bis 29.10. bootete jede Station hier ihre eigene Welt (weg/boot: save-server, werkbank start, netstat je Boot).
const KOPF = [
    "set -u",
    "WP=$(({PORT} + 20000)); LP=$(({PORT} + 20001)); export WERKBANK_PORT=$WP",
    'L="${TEMP:-/tmp}/punkte-g5-$WP"; mkdir -p "$L"; W="node scripts/werkbank.cjs"; FRISCH=1',
    'boot() { if [ -z "$FRISCH" ]; then node "$PUNKTE_MASCHINE" grundstellung > "$L/grund.txt" 2>&1 || { echo "@@PUNKTE@@ START ROT"; cat "$L/grund.txt"; exit 3; }; fi; FRISCH=; ' +
        'if [ $# -gt 0 ]; then timeout 300 $W umstellen "$@" > "$L/boot.txt" 2>&1 || { echo "@@PUNKTE@@ START ROT"; tail -5 "$L/boot.txt"; exit 3; }; fi; }',
    'teil() { echo "@@PUNKTE@@ $1"; shift; timeout 900 "$@"; echo "@@PUNKTE@@ EXIT $?"; }',
];
// die Probe einer Station: Deckel sek, die Schritte nach dem KOPF
const sitzung = (sek, ...zeilen) => ({ sek, befehl: ["bash", "-c", [...KOPF, ...zeilen].join("\n")] });
// DER EIGENE BOOT — nur wo das Kriterium Kälte misst (siedlung.K5: das erste Haus nach dem Erwachen der Zelle in einem kalten Profil,
// je nH ein frischer Boot; die warme Welt der Sitzung trüge Asset- und Chunk-Cache der Proben davor): eigener save-server auf
// {PORT}+20000, Werkbank auf {PORT} (Seite {PORT}−1), eine Linse neben ihr auf {PORT}+20001; der Spielstand des Baums fällt vor und
// nach jedem Boot; die Ports räumt das Skript selbst (netstat LISTEN | ABHÖREN — die Radeon spricht deutsch). Nur unter gpu-lauf.sh.
const KOPF_BOOT = [
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
const bootSitzung = (...zeilen) => ["bash", "-c", [...KOPF_BOOT, ...zeilen].join("\n")];
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

// der Weg zur Stadt vom Hügel (siedlung.K2 Staffel 1 und 2): Boot, Wahl, Hügel, bis die Mauer steht, die Kamera
const STADT_HUEGEL = [
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
];

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
        probe: sitzung(600,
            'echo "@@PUNKTE@@ GARAGE"',
            'git apply "$K/bericht/2110-mk-kopf/garage-mk.diff" && GARAGE_LABOR_PORT=$LP LINSE_GPU=hardware timeout 600 node scripts/diag-garage-mk.cjs',
            'echo "@@PUNKTE@@ EXIT $?"; git checkout -q -- scripts/diag-garage-labor.cjs; rm -f scripts/diag-garage-mk.cjs',
            "boot",
            'teil WELT $W eval "$(cat "$K/bericht/2110-gtx-messschuld/tempo3.js")"'
        ),
        env: K,
        gpu: true,
        zeit: false,
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
        probe: sitzung(480,
            'teil FAHR env FAHR_LEBEN_PORT=$LP node scripts/diag-fahr-leben.cjs',
            "boot",
            'teil WELT $W eval "$(cat "$K/bericht/2110-gtx-messschuld/tempo3.js")"'
        ),
        env: K,
        gpu: true,
        zeit: false,
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
        probe: sitzung(480,
            'teil FAHR env FAHR_LEBEN_PORT=$LP node scripts/diag-fahr-leben.cjs',
            "boot",
            'teil BLICK $W eval "$(cat "$K/bericht/2010-buendel-abab/blick.js")"'
        ),
        env: K,
        gpu: true,
        zeit: false,
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
        probe: sitzung(720,
            "A=$(cygpath -m '{AUS}')",
            "teil Z node scripts/diag-settlement.cjs --nur-z",
            ...STADT_HUEGEL,
            "rm -f \"$L/stadt-mittag.abnahme.json\"",
            "teil BILD $W bild $K --datei \"$L/stadt-mittag.png\" --w 1600 --h 900",
            "cp \"$L/stadt-mittag.abnahme.json\" \"$A\" 2> /dev/null; true"
        ),
        gpu: true,
        zeit: false,
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

    // siedlung.K2 Staffel 2 (Zweig sk2-zipf): der Zipf-Fit der Siedlungs-Linse (`diag-settlement --zipf`: ζ nach Gabaix-Ibragimov
    // über die Orte ab der ersten Rang-Stufe je 32 × 32 km um einen zufälligen Spawn, das Intervall [kleinste, größte] über
    // 8 Saaten, dazu Mauer und Graph im Export der Stadt jeder Saat) und die Stadt vom Hügel wie in Staffel 1, geschossen
    // mittags (Uhr 0,5) und in der Dämmerung (Uhr 0,25, die Stunde der Licht-Linsen); {AUS} trägt beide Abnahmen. Ohne den Modus
    // endet `--nur-z` nach Teil Z, die Zeile fehlt: ROT. An sk2-zipf (Node): ζ 1,329 [1,294; 1,384], Mauer und Graph 7/7 — ROT,
    // die oberste Rang-Stufe endet bei 4 · 96 Häusern (eine dritte Stufe desselben Gesetzes: ζ 1,091 [1,06; 1,154]).
    {
        kriterium: "siedlung.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: sitzung(720,
            "A=$(cygpath -m '{AUS}')",
            "teil ZIPF node scripts/diag-settlement.cjs --nur-z --zipf",
            ...STADT_HUEGEL,
            "rm -f \"$L/stadt-mittag.abnahme.json\" \"$L/stadt-daemmerung.abnahme.json\"",
            "teil MITTAG $W bild $K --uhr 0.5 --datei \"$L/stadt-mittag.png\" --w 1600 --h 900",
            "teil DAEMMERUNG $W bild $K --uhr 0.25 --datei \"$L/stadt-daemmerung.png\" --w 1600 --h 900",
            "node -e 'const f = require(\"fs\"), l = (n) => { try { return JSON.parse(f.readFileSync(process.argv[2] + \"/stadt-\" + n + \".abnahme.json\", \"utf8\")); } catch (e) { return null; } }; " +
                "f.writeFileSync(process.argv[1], JSON.stringify({ mittag: l(\"mittag\"), daemmerung: l(\"daemmerung\") }))' \"$A\" \"$L\""
        ),
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const teil = (n) => out.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            // Zipf-Exponent 0,8–1,2 mit Konfidenz-Intervall: das ganze Intervall im Band; der Export jeder Stadt trägt Mauer und Graph
            const z = jsonZeile(out, /^ZIPF /);
            const ex = /^Mauer und Graph (\d+)\/(\d+)$/.exec((z && z.export) || "");
            const zipf = !!z && Array.isArray(z.ki) && z.ki[0] >= 0.8 && z.ki[1] <= 1.2;
            const mauerGraph = !!ex && +ex[1] > 0 && ex[1] === ex[2];
            const wb = jsonBlock(teil("WAHL"));
            const w = (wb && wb.ergebnis) || {};
            const sb = jsonBlock(teil("STAND"));
            const s = (sb && sb.ergebnis) || {};
            const kb = jsonBlock(teil("KAMERA"));
            const k = (kb && kb.ergebnis) || {};
            const steht = s.mauer > 0 && !s.zug && !s.pending;
            // mittags und in der Dämmerung: je Stunde das Beweisbild grün UND zu ihr geschossen (die Bühne trägt die Uhr)
            const bild = (b, uhr) => !!b && b.ok === true && !!b.buehne && Math.abs(b.buehne.uhr - uhr) < 0.01;
            const [mi, da] = [j && j.mittag, j && j.daemmerung];
            const gruen = zipf && mauerGraph && steht && !k.fehler && k.segs > 0 && k.hoeher > 0 && bild(mi, 0.5) && bild(da, 0.25);
            const zeile = (b) => (b ? (b.zeile || "").slice(0, 60) + " Uhr " + (b.buehne && b.buehne.uhr) : "fehlt");
            return {
                gruen,
                zahl:
                    "ZIPF " + (z ? "ζ " + z.zeta + " [" + z.ki.join("; ") + "] über " + (z.je || []).length + " Saaten, " + z.export : "keine Zeile") +
                    " · Boot-Seed " + w.seed + ": Stadt " + (w.wahl ? w.wahl.cx + "," + w.wahl.cz + " nH " + w.wahl.nH : "keine mit Ort") +
                    " · Mauer " + (k.segs != null ? k.segs + " Segmente, Pool " + s.mauer : k.fehler || "?") + (s.zug ? ", Zug läuft" : "") +
                    " · mittags " + zeile(mi) + " · Dämmerung " + zeile(da) + " (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "stamm/siedlung-ort.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-bauten.js",
            "stamm/studio-bruecke.js",
            "stamm/bild-himmel.js",
            "worlds/fachwerk/fachwerk.js",
            "save-server.js",
            "scripts/diag-settlement.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "spec/asset-contract/v6/golden/siedlung.json",
        ],
        quelle: "2 = Zipf-Exponent 0,8–1,2 über 32 × 32 km mit Konfidenz-Intervall, Export trägt mauer und graph, mittags und in der Dämmerung, beide Geräte",
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
        zeit: false,
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
    // siedlung.K1 Staffel 2 (Zweig siedlung-k1-innen): ZWEI Läufe von gate:haus-welt. (1) W10 headless, Phasen haus + start: der
    // Takt der Welt hebt das Start-Dorf, gegangen wird JEDES Haus seines Plans (der Plan v2 im Gedächtnis des Orts unter
    // `settlementCells.start.ort`, je Haus-Slot das Haus an seinem Ort; ein Slot ohne Haus ist ROT) von der Tür bis Keller und
    // Dachboden, je Sim-Schritt der Hub. (2) `--bild` auf der Karte (Rezept linse, `[linse-gpu]`): W9 schießt je Haus des
    // Start-Dorfs seine Innen-Blicke aus dem Ausgabe-Pfad (das Auge 1,3 m über der Diele), W10 dazu den Boden im Schatten
    // zur selben Stunde (Mittag der Bühne; von DIESEM Haus gegen die Sonne der erste Boden 1 m vor jedem Bau, dessen Strahl
    // zur Sonne einen Werfer trifft). Die Quote: dunkelster Innen-Blick ÷ Schatten-Fleck außen, Median der Luminanz (sRGB
    // linear), Soll ≥ 0,15 je Haus. Die Cloud (swiftshader) trägt den echten Renderer nicht bis zum Bild (Ankunft 79, Karten 3 offen nach
    // 28 066 Takten) — das Urteil fällt an Radeon und GTX. Erwartet: Quote ≥ 0,4 (M41, Radeon 23.10.: Innen-Median 0,017–0,177;
    // Schatten-Boden 0,014–0,034 im Radeon-Bild bericht/1110-5/bilder/dorf-an.png). Headless am Zweig: 18 von 18 Häusern ganz.
    {
        kriterium: "siedlung.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            'A=$(cygpath -m "$1" 2> /dev/null || echo "$1"); ' +
                'HAUS_WELT_JSON="$A.gang" node scripts/diag-haus-welt.cjs --phasen=haus,start; echo "GANG EXIT $?"; ' +
                'HAUS_WELT_JSON="$A.bild" node scripts/diag-haus-welt.cjs --phasen=grund --bild; echo "BILD EXIT $?"; ' +
                "node -e 'const f = require(\"fs\"), a = process.argv[1]; f.writeFileSync(a, JSON.stringify({ gang: JSON.parse(f.readFileSync(a + \".gang\")), bild: JSON.parse(f.readFileSync(a + \".bild\")) }))' \"$A\"",
            "siedlung-k1",
            "{AUS}",
        ],
        env: { HAUS_WELT_PORT: "{PORT}", HAUS_WELT_PARALLEL: "1" },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j) => {
            const [g, b] = [j && j.gang, j && j.bild];
            if (!g || !b || !g.startDorf || !b.startDorf || !b.w9 || !b.w9.bild)
                return { gruen: false, zahl: "kein JSON beider Läufe (gang: Phasen haus,start · bild: --bild mit W9)" };
            const sd = g.startDorf;
            const gaenge = g.haeuser.filter((h) => h.start && !h.fehler && h.gang);
            const ganz = gaenge.filter((h) => !h.gang.fehlt.length && h.gang.hub <= 0.3);
            const innen = b.w9.haeuser.filter((h) => h.start);
            const dunkel = innen.filter((h) => !(h.quote >= 0.15));
            const q = innen.map((h) => h.quote).filter(Number.isFinite).sort((x, y) => x - y);
            const gruen =
                sd.slots >= 1 && !sd.fehlt.length && ganz.length === sd.slots &&
                !b.startDorf.fehlt.length && innen.length === b.startDorf.slots && !dunkel.length;
            return {
                gruen,
                zahl:
                    ganz.length + " von " + sd.slots + " Häusern des Start-Dorfs Tür → Keller → Dachboden ganz, Hub max " +
                    Math.max(0, ...gaenge.map((h) => h.gang.hub)).toFixed(2) + " m" + (sd.fehlt.length ? " (ohne Haus: " + sd.fehlt.join(" ") + ")" : "") +
                    " · Innen-Bild " + (innen.length - dunkel.length) + " von " + innen.length + " lesbar (Plan " + b.startDorf.slots +
                    "), innen ÷ Außen-Schatten min " + q[0] + " · Median " + q[q.length >> 1] + " (Soll ≥ 0,15)" +
                    (dunkel.length ? " · dunkel: " + dunkel.map((h) => h.typ + " " + h.innen + "/" + h.aussen).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-core.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "stamm/kreatur-*.js",
            "stamm/vegetation-*.js",
        ],
        quelle: "2 = jedes Haus des Start-Dorfs, Innenraum lesbar (Luma ≥ 15 % des Außen-Schattens, Schatten K4), beide Geräte",
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
        befehl: bootSitzung(
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
        zeit: true,
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
        zeit: false,
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
    // siedlung.K3 Staffel 2 (Zweig siedlung-k3-hang): die Steil-Wand ist die Böschung des Erdbaus (gelaende-core ERDBAU.boeschung
    // 0,6 statt SIEDLUNG.slopeMax 0,35), EIN Grundriss-Leser (`_grundrissVon`; `_slotGrundriss` und `_werkGrundriss` fielen).
    // gate:settlement C-K3 (Browser, Null-Renderer): am Hang-Ort −400/−3175 die Vorräte der Welt (`_dorfBereiten`) der Zellen,
    // deren Ort steiler liegt als 0,35 — je Dorf Steilheit, Gassen-Gefälle p95 am Grund ohne Erdbau, Erdbau-Median je Haus (m³),
    // dazu die Zahl der Grundriss-Leser; Selbsttests: dieselben Gassen am Grund 24 m daneben ROT, die Wand 0,35 zurück ROT (am
    // Kopf 2 statt 4 Hangdörfer). An siedlung-k3-hang: 4 Dörfer 0,38–0,57, p95 8,5–11,2 %, Erdbau 449–801 m³ (flach 86–94), 1 Leser.
    {
        kriterium: "siedlung.K3",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-settlement.cjs"],
        env: { SETTLEMENT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const zeile = (re) => re.exec(out);
            const t = zeile(/^\s*(✅|❌) C-K3: DIE TRASSE AM ORT — (\d+) Dörfer/m);
            const h = zeile(/^\s*(✅|❌) C-K3: DIE HANGDÖRFER — (\d+) Dörfer[^\n]*?, (\d+) Grundriss-Leser — (\[.*\])\s*$/m);
            const s1 = zeile(/^\s*(✅|❌) C-K3 Selbsttest: die Gassen am Grund 24 m daneben/m);
            const s2 = zeile(/^\s*(✅|❌) C-K3 Selbsttest: die Wand 0,35 zurück/m);
            let d = [];
            try {
                d = h ? JSON.parse(h[4]) : [];
            } catch (_e) {
                d = [];
            }
            const gruen =
                !!t && t[1] === "✅" && !!h && h[1] === "✅" && +h[2] >= 4 && +h[3] === 1 &&
                [s1, s2].every((s) => s && s[1] === "✅") && lauf.exit === 0;
            return {
                gruen,
                zahl: h
                    ? h[2] + " Hangdörfer " + d.map((x) => x.zelle + " " + x.hang + "/" + x.p95 + " %/" + x.erdbauM3 + " m³").join(" · ") +
                      ", " + h[3] + " Grundriss-Leser, Selbsttests " + [s1, s2].map((s) => (s ? s[1] : "—")).join("") + ", Exit " + lauf.exit
                    : "keine Zeile C-K3 HANGDÖRFER (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "stamm/siedlung-ort.js",
            "stamm/gelaende-boden.js",
            "stamm/vegetation-baum.js",
            "stamm/feld-leben.js",
            "stamm/studio-bruecke.js",
            "scripts/diag-settlement.cjs",
        ],
        quelle: "2 = dazu Hangdörfer über slopeMax 0,35 hinaus, Erdbau-Median je Haus als Kosten, EIN Grundriss-Leser statt drei",
    },

    // ───────── siedlung.K4 — durch die Jahrhunderte (Zweig w3s-jahrhunderte: die Chronik im fachwerk-core) ─────────
    // gate:settlement Teil J (`--nur-j`, Node, kein Browser): je Saat (8) dieselbe Zelle unter 1320 · 1560 · 1860 · 1935 (die
    // Epochen ohne Zahl — die Chronik ihrer Region, `chronikJahr`); je Paar die Überdeckung je Slot (3 × 3 Punkte des
    // Grundrisses im Grundriss des jüngeren), die kleinste ≥ 0,8; die Mutante ohne Erbe (jede Epoche ihr eigener Plan) bricht
    // sie (< 0,8). J2: moderne ergibt stadt mit Turm, vier Epochen vier Kirchen, jedes Baujahr bis zum Schnitt, kein Turm vor
    // 1905, keine Halle vor 1850, die Kultur aus REGION_HIST ihres Baujahrs, die Kleidung die Tracht der Epoche; die Mutante
    // (Turm von 1455, keine Tracht) fällt beim Namen. Am Kopf vor w3s-jahrhunderte: 0,222 und 162 Brüche (ROT); am Zweig
    // 0,915, ohne Erbe 0,274, 0 Brüche.
    {
        kriterium: "siedlung.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-settlement.cjs", "--nur-j"],
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = jsonZeile(out, /^JAHRESRINGE /);
            const j1 = /^\s*(✅|❌) J1 JAHRESRINGE/m.exec(out);
            const j2 = /^\s*(✅|❌) J2 EPOCHE: (\d+) Brüche, die Mutante (\d+)/m.exec(out);
            const gruen =
                !!z && z.min >= 0.8 && z.ohneErbe < 0.8 && Array.isArray(z.fehl) && !z.fehl.length &&
                !!j1 && j1[1] === "✅" && !!j2 && j2[1] === "✅" && +j2[3] > 0 && lauf.exit === 0;
            return {
                gruen,
                zahl: z
                    ? "Überdeckung je Slot " + z.min + " über " + (z.paare || []).length + " Saaten × 3 Paare (ohne Erbe " + z.ohneErbe +
                      "), Rolle/Bauart/Kleidung " + (z.fehl || []).length + " Brüche" + (j2 ? ", Mutante " + j2[3] : "") + ", Exit " + lauf.exit
                    : "keine Zeile JAHRESRINGE (Exit " + lauf.exit + ")",
            };
        },
        pfad: ["fachwerk-core.js", "scripts/diag-settlement.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = dieselbe Zelle unter 1320/1560/1860/1935: der ältere Kern liegt zu ≥ 80 % im jüngeren (Jahresringe), die Epoche moderne ergibt stadt, die Epoche bestimmt Rolle, Bauart und Kleidung im Export",
    },

    // ───────── leib.K1 — Taste → Leib im Bild ─────────
    {
        kriterium: "leib.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // werkbank latenz an der Mess-Wiese: CDP-Taste bis zum ersten Ausgabe-Bild mit Leib/Kamera ≥ 1 cm bewegt, je 50 Proben —
        // in LAEUFE eigenen Boots, geurteilt über den schlechtesten (bildraten-fest)
        probe: sitzung(600,
            ...latenzLaeufe(
                "boot",
                "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
                'teil LATENZ{N} $W latenz --proben 50 --sicht ego,third --verb gehen,wechsel --json "{AUS}.lauf{N}.json"'
            )
        ),
        env: K,
        gpu: true,
        zeit: true,
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
        probe: sitzung(1080,
            ...latenzLaeufe(
                "boot",
                "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
                'teil LATENZ{N} $W latenz --proben 50 --sicht ego,third --verb gehen,springen,einsteigen,hieb --json "{AUS}.lauf{N}.json"'
            )
        ),
        env: K,
        gpu: true,
        zeit: true,
        minuten: 24,
        urteil: (j) => {
            const ids = ["gehen", "springen", "einsteigen", "hieb"].flatMap((v) => ["ego/" + v, "third/" + v]);
            const { gruen, zahl } = latenzSchlechtester(j, ids, 50);
            return { gruen, zahl };
        },
        pfad: LATENZ,
        quelle: "2 = jedes Verb (gehen, springen, schwingen, einsteigen), beide Geräte",
    },

    // ───────── leib.K2 — der Fuß steht (leib-k2-fuss) ─────────
    {
        kriterium: "leib.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // gate:koerper-stand K8 mit --bild (die Welt zeichnet auf der Karte, Rezept linse; derselbe Befehl läuft headless auf
        // swiftshader, dann ohne LINSE_GPU): die Sohlen-Fläche von Knöchel und Zehe im Fuß-Lock gegen das gezeichnete Mesh
        // (`__gezeichnet` und die Dreiecke der Stufen) — die Rollen fuss (längs der Höhenlinie), falllinie (hinauf und hinab)
        // und stufe (zehn Stufen, Steigung 0,17 m, hinauf und hinab) an Mess-Wiese und 25°-Hang, je ≥ 200 Kontakte; die
        // Steckenbleiber über alle sechs Gänge (je halbe Sekunde mit gehaltener Taste < 15 cm voran, oder das Ende nie erreicht).
        // Das Urteil liest nur den Fuß aus dem JSON — die übrigen Rollen der Linse richten gelaende.K5.
        befehl: ["node", "scripts/diag-koerper-stand.cjs", "--k8", "--bild"],
        env: { KOERPER_STAND_PORT: "{PORT}", KOERPER_STAND_JSON: "{AUS}", LINSE_GPU: "hardware" },
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const k = j && j.k8;
            if (!k || !k.hang || !k.wiese) return { gruen: false, zahl: "kein K8 der Linse (Exit " + lauf.exit + ")" };
            const teile = [
                ["hang", k.hang.fuss],
                ["falllinie", k.hang.falllinie],
                ["treppe hang", k.hang.stufe],
                ["treppe wiese", k.wiese.stufe],
            ];
            const rot = [];
            for (const [n, t] of teile)
                if (!t || !(t.n >= 200) || !(t.p95 <= 3)) rot.push(n + " p95 " + (t ? t.p95 : "?") + " cm an " + (t ? t.n : 0) + " Kontakten");
            const gaenge = ["wiese", "hang"].flatMap((o) => ["fuss", "falllinie", "stufe"].map((r) => k[o][r] || {}));
            const stecken = gaenge.reduce((a, t) => a + (t.stecken || 0), 0);
            if (gaenge.some((t) => !Number.isFinite(t.stecken))) rot.push("ein Gang ohne Steckenbleiber-Zahl");
            if (stecken) rot.push(stecken + " Steckenbleiber");
            if (/^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout)) rot.push("die Linse zeichnet nie (welt-boot: Rezept null)");
            const zahl =
                teile.map(([n, t]) => n + " " + (t ? t.p95 + " (n " + t.n + ")" : "?")).join(" · ") +
                " cm p95 · Steckenbleiber " + stecken + (rot.length ? " — ROT: " + rot.join(" · ") : "");
            return { gruen: !rot.length, zahl };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "koerper-core.js",
            "tetrapoda-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-koerper-stand.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = Fuß p95 ≤ 3 cm am 25°-Hang und auf Stufen, 0 Steckenbleiber auf dem Spielgang, an einem Gerät",
    },

    // ───────── leib.K2#2 — der Sprung aus dem Leib-Gesetz (leib-k2-sprung) ─────────
    {
        kriterium: "leib.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // derselbe Lauf wie leib.K2#1 (Zwilling: gleicher Befehl und Umgebung, er fährt EINMAL): gate:koerper-stand K8 und K9
        // mit --bild. K9 (an der Mess-Wiese, je Sicht Ego und Third): der Sprung aus dem Sprint, die Taste einen Takt gehalten,
        // bis der Leib landet — der Hub der Kapsel, der gezeichneten Hüfte und des Auges, die Weite vom Abdruck bis zur Landung;
        // je Leib der heutige, die Masse ×1,25 (`_leibMasse`) und die Kraft ×1,25 (`_sprungKraft`). Der Abdruck folgt dem
        // Gesetz koerper LEIB.sprung (v = √(2d(F/m − g)), `_sprungAbdruck`). Das Urteil: der Fuß von #1 (dazu) und je Sicht
        // das Bild (die Hüfte in Third, das Auge in Ego heben sich mit der Kapsel, ≥ 80 %), die Masse senkt Höhe UND Weite um
        // ≥ 10 %, die Kraft hebt beide um ≥ 10 %. Headless (Null-Renderer, leib-k2-sprung 27.10.): Ego und Third 0,323/2,85 m,
        // Masse 0,179/2,16 m, Kraft 0,504/3,45 m, Auge 0,315 m, Hüfte 0,326 m.
        befehl: ["node", "scripts/diag-koerper-stand.cjs", "--k8", "--bild"],
        env: { KOERPER_STAND_PORT: "{PORT}", KOERPER_STAND_JSON: "{AUS}", LINSE_GPU: "hardware" },
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const fuss = stationen.find((s) => s.kriterium === "leib.K2" && s.staffel === 1).urteil(j, lauf);
            const sp = (j && j.k8 && j.k8.sprung) || {};
            const rot = fuss.gruen ? [] : ["der Fuß (#1)"];
            const r2 = (x) => Math.round(x * 1000) / 1000;
            const teile = ["first", "third"].map((b) => {
                const [g, masse, kraft] = sp[b] || [];
                if (!g || !masse || !kraft) {
                    rot.push((b === "first" ? "Ego" : "Third") + " ohne Sprung");
                    return "";
                }
                const [h, w] = [(x) => x.hub[0], (x) => x.weite];
                const blick = g.hub[b === "first" ? 2 : 1];
                if (!(h(g) > 0.1 && blick >= 0.8 * h(g))) rot.push(b + " Bild " + r2(blick) + " von " + r2(h(g)) + " m");
                if (!(h(masse) <= 0.9 * h(g) && w(masse) <= 0.9 * w(g))) rot.push(b + " Masse ×1,25 zieht den Sprung nicht");
                if (!(h(kraft) >= 1.1 * h(g) && w(kraft) >= 1.1 * w(g))) rot.push(b + " Kraft ×1,25 zieht den Sprung nicht");
                return (b === "first" ? "Ego " : "Third ") + [g, masse, kraft].map((x) => r2(h(x)) + "/" + r2(w(x))).join(" → ");
            });
            if (/^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout)) rot.push("die Linse zeichnet nie");
            const zahl = teile.join(" · ") + " m (Leib → Masse ×1,25 → Kraft ×1,25) · Fuß " + fuss.zahl;
            return { gruen: !rot.length, zahl: zahl + (rot.length ? " — ROT: " + rot.join(" · ") : "") };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/kreatur-verhalten.js",
            "stamm/bau-buch.js",
            "stamm/dienst.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "koerper-core.js",
            "tetrapoda-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-koerper-stand.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = dazu Sprung-Höhe und -Weite aus dem Leib-Gesetz (Mutation von Leib-Masse/Kraft zieht sie), Ego und Third, beide Geräte",
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
        zeit: false,
        minuten: 6,
        // DAS URTEIL (24.10., Prüfung der Buchung): das Kriterium misst Pixel „an einem Gerät“ — unter `--bild` zeichnet die Welt
        // auf der Karte (seit gpu-wand: Rezept linse ohne Null-Renderer), kamera-nah rechnet die Nah-Pixel gegen die Szene, die sie
        // zeichnet; zeichnet sie nie (welt-boot: „das Rezept ist null“), ist das ROT (Wand GPU in punkte.cjs und hier).
        // „nie … in der Wand“: die Messung prüft Fels UND Wand vor der Kamera — Bau-Pixel im Nahbereich zählen (vor kamera-bau
        // trug der offene Tür-Flügel keinen Leib; seitdem urteilt gate:kamera-leib sie selbst, der gedrehte Flügel frisch je
        // Probe). Die Kugel im Stamm (Fels oder Wand nennt das Kriterium nicht) und der Ruck-Höchstwert (das Kriterium misst p95)
        // stehen in der Zahl.
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
            // der Leib des Tür- und Tor-Flügels (kamera-bau: `_fluegelLeib` beim Setzen der Slots und nach jedem Schwenk)
            "stamm/siedlung-satz.js",
            "stamm/siedlung-ort.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            "scripts/diag-kamera-laub.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = Third nie im Fels oder in der Wand (0 Fels-Pixel im Nahbereich der Kamera), Ruck ≤ 0,02 m p95 beim Gehen, an einem Gerät",
    },
    {
        kriterium: "leib.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // diag-kamera-laub mit dem Teil gang2 (der Gang der Staffel 2, mit --bild auf der Karte): derselbe Gang wie Staffel 1 dazu
        // IM HAUS (rückwärts durch die Tür des haus_alemannisch, `innen`: der Spieler steht über 1 m hinter der Schwelle) und am
        // STEILHANG (die Stelle des EINEN Orts-Gesetzes `__weltOrt("hang")`, 25–35° um die Mess-Wiese, der Blick hangab, die
        // Kamera hangauf), beide auch im SPRINT (`innen-sprint`, `steil-sprint`); die Kugel urteilt auch den sichtbaren Boden, der
        // Ruck gilt je Gang, und die Kamera, die nach dem Takt in den Hang sinkt, muss die Linse nennen (Zeile „K4 Staffel 2").
        // „auch": die Zeile der Staffel 1 (Stamm, Fels, Haus beim Gehen) zählt mit; Wand-Pixel (Bau) zählen in jedem Gang, die
        // Weiche „zeichnet nie" ist ROT (Wand GPU in punkte.cjs und hier). gate:kamera-leib (CI) fährt gang2 nicht, solange er ROT
        // ist (26.10., swiftshader mit --bild am Code-Zweig lk4-steil: Ruck p95 im Haus-Sprint 0,048 m, sonst grün).
        befehl: ["node", "scripts/diag-kamera-laub.cjs", "--teile", "leib,gang,gang2", "--bild"],
        env: { KAMERA_LAUB_PORT: "{PORT}", LINSE_GPU: "hardware" },
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const zeilen = lauf.stdout.split(/\r?\n/);
            const z1 = zeilen.find((l) => /^\s*(✅|❌) K4 der Gang in Third/.test(l));
            const z2 = zeilen.find((l) => /^\s*(✅|❌) K4 Staffel 2: /.test(l));
            if (!z1 || !z2) return { gruen: false, zahl: "keine Zeile K4 " + (z1 ? "Staffel 2" : "der Gang in Third") + " (Exit " + lauf.exit + ")" };
            const gang = zeilen.filter((l) => /^\s+(stamm|fels|haus|innen|innen-sprint|steil|steil-sprint)\s/.test(l));
            const gaenge = gang.map((l) => l.trim().replace(/\s+/g, " "));
            const wand = gang.reduce((s, l) => {
                const m = /Nah-Pixel (\{[^}]*\})/.exec(l);
                let n = {};
                try { n = m ? JSON.parse(m[1]) : {}; } catch (_e) { n = { kaputt: 1 }; }
                return s + Object.entries(n).filter(([k]) => /: Bau$|kaputt/.test(k)).reduce((a, [, v]) => a + v, 0);
            }, 0);
            const fehlt = ["innen", "innen-sprint", "steil", "steil-sprint"].filter((a) => !gaenge.some((g) => g.startsWith(a + " ")));
            const nie = /^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout);
            const rot = [/❌/.test(z1) ? "Staffel 1: " + z1.split(" — ").slice(1).join(" — ") : null, /❌/.test(z2) ? z2.split(" — ").slice(1).join(" — ") : null,
                fehlt.length ? "kein Gang " + fehlt.join(", ") : null, wand ? "Wand-Pixel (Bau) im Nahbereich in " + wand + " Proben" : null,
                nie ? "die Linse zeichnet nie (welt-boot: Rezept null)" : null].filter(Boolean);
            return { gruen: !rot.length, zahl: (gaenge.filter((g) => /^(innen|steil)/.test(g)).join(" | ") || "keine Gang-Zeile") + (rot.length ? " — ROT: " + rot.join(" · ") : "") };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/vegetation-*.js",
            "stamm/siedlung-bauten.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-ort.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            // die Kugel der Kamera und ihr Arm (`fx.bewegung.kamera`), das Haus mit Tür und Treppe, der Hang des Gesetzes
            "koerper-core.js",
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-kamera-laub.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = auch am Steilhang, im Haus, beim Sprint, beide Geräte",
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
        zeit: false,
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
        zeit: false,
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
        probe: sitzung(600,
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
        zeit: true,
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
    {
        kriterium: "halten.K2",
        staffel: 2,
        geraet: "headless",
        // gate:kampf-gefuehl Q11 halten.K2 (hk2-klang): je Stoff-Paar EIN Klick über den echten Dispatcher — Langschwert an Eiche
        // (Stahl/Holz) und Fels (Stahl/Stein), Keule am Hirsch (Holz/Fell, die Zeile fleisch) —, in Ego und Third; der Master-Bus
        // der Symphonie liegt für den Klick an einem OfflineAudioContext: Schwerpunkt (klang `schwerpunkt`), Pegel, Latenz
        // Treffer → Ton, die Funken der Marke `_trefferPaar`. GRÜN: die Stoffe des Gesetzes, Pegel > −60 dB binnen 5 ms, Funken
        // genau bei Stahl auf Stein, Third = Ego, je zwei Paare ≥ 300 Hz auseinander, und der Selbsttest S19 (alle Paare gleich)
        // feuert. Der Klang rechnet ohne GPU (Web Audio auf der CPU, deterministisch) — headless urteilt für beide Geräte.
        // An hk2-klang d7cb5c9b (headless, Ego = Third): stahl/holz 954 Hz −37 dB · stahl/stein 2179 Hz −34 dB, 24 Funken ·
        // holz/fleisch 192 Hz −49 dB, Latenz 0 ms, S19 feuert; dieselbe Linse an main b2c6c627 ROT (Abbau stumm 0 Hz, der Hirsch
        // 304 Hz nach seinem Spawn-Rumpf, kein Paar, keine Funken).
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q11 halten\.K2 Staffel 2/.test(x));
            const s19 = l.find((x) => /^\s*(✅|❌) SELBST-TEST \(S19\)/.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q11 halten.K2 (Exit " + lauf.exit + ")" };
            const m = /am Bus (\{.*\})(?: — ROT (.*))?$/.exec(q);
            let P = null;
            try {
                P = m && JSON.parse(m[1]);
            } catch (_e) {
                P = null;
            }
            const je = P ? Object.entries(P).map(([k, [e]]) => k + " " + e.hz + " Hz " + e.db + " dB Funken " + e.funken + " Latenz " + e.ms + " ms") : ["keine Messung"];
            return {
                gruen: /✅/.test(q) && !!s19 && /✅/.test(s19),
                zahl: je.join(" · ") + (m && m[2] ? " — ROT " + m[2].slice(0, 200) : "") + " · S19 " + (s19 && /✅/.test(s19) ? "feuert" : "stumm"),
            };
        },
        pfad: [...KAMPF, "klang-core.js", "stamm/klang.js", "stamm/bau-vorlagen.js", "stamm/dirigent-takt.js"],
        quelle: "2 = Klang und Funken aus dem Stoff-Paar (Spektrum je Paar verschieden), Ego und Third, beide Geräte",
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
        zeit: false,
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
        zeit: false,
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

    // ───────── ultiversum.K2 — Welten heiraten (fusion-determ) ─────────
    {
        kriterium: "ultiversum.K2",
        staffel: 1,
        geraet: "headless",
        // gate:praegung-welt (U) FUSION: dieselben Eltern-Bytes in ZWEI Geräten (zwei Browser-Prozesse, frische Profile) → fuseWorlds
        // A+B (random-mix: Id, Saat, Geburt, Münzwurf) byte-gleich, B+A eine andere Welt (gerichtet: A ist die Welt der Seite), der
        // Täter „Date.now zurück in die Geburt" ROT. Am Kopf vor fusion-determ ROT (randomUUID, Math.random-Saat, Date.now, Münzwurf
        // aus Math.random: A+B ≠ zwischen den Geräten); an fusion-determ 21c275fb GRÜN (1150 Bytes je Gerät, Exit 0). Zwilling von ultiversum.K5#1 (ein Lauf).
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = [/^\s*(✅|❌) FUSION A\+B byte-gleich/, /^\s*(✅|❌) GERICHTET: /, /^\s*(✅|❌) TÄTER-PROBE: Date\.now /];
            const je = soll.map((re) => l.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 100)).join(" | ") };
        },
        pfad: ["stamm/speicher-*.js", "stamm/netz-identitaet.js", "stamm/siedlung-ort.js", "scripts/diag-praegung-welt.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = fuseWorlds(A, B) byte-gleich auf zwei Geräten",
    },

    // ───────── ultiversum.K3 — Die Bibliothek (w3s-bibliothek) ─────────
    // gate:praegung-welt (L) --bibliothek (Null-Renderer, ein Gerät, ~20 s): je Art (Welt, Regel, Bauplan) legt bibliothekLege einen
    // Eintrag an — die EINE Hülle des Teilens (_werkCode), signiert, Code = SHA-256 der Bytes; bibliothekFinde(code) findet ihn
    // durch den EINEN Eingang (Größe, Signatur, Rückruf) wieder. Mutanten: ein Byte (everySec 30 → 31) auf der Platte → „signatur",
    // ein Eintrag unter fremdem Code → „code", ein Mesh (2400 Zahlen) im Welt-Gesetz → „gross" (> 8192 B). Am Kopf vor w3s-bibliothek
    // ROT (bibliothekLege fehlt: ABSTURZ, Exit 2); an w3s-bibliothek 24b9ccaa GRÜN: Welt 1041 B (Akten 1, Regeln 7), Regel 335 B,
    // Bauplan 428 B, Mesh 17850 B ROT, Exit 0.
    {
        kriterium: "ultiversum.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-praegung-welt.cjs", "--bibliothek"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const soll = ["BIBLIOTHEK welt:", "BIBLIOTHEK regel:", "BIBLIOTHEK bauplan:", "MUTANTE Byte:", "MUTANTE Code:", "MUTANTE Mesh:"];
            const je = soll.map((k) => l.find((x) => x.includes(k) && /^\s*(✅|❌) /.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).join(" ") + " (Exit " + lauf.exit + ")" };
            const bytes = je.slice(0, 3).map((x) => (x.match(/— (\d+) B/) || [])[1]);
            return {
                gruen: lauf.exit === 0 && je.every((x) => /✅/.test(x)) && bytes.every((b) => b && +b <= 8192),
                zahl: "Welt " + bytes[0] + " B · Regel " + bytes[1] + " B · Bauplan " + bytes[2] + " B · " + je.slice(3).map((x) => x.split(" — ")[1]).join(" · "),
            };
        },
        pfad: ["stamm/netz-identitaet.js", "stamm/speicher-welten.js", "stamm/feld-dsl.js", "scripts/diag-praegung-welt.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = Welten, Regeln und Baupläne liegen signiert vor, je Gesetz ≤ 8 KB, auffindbar über einen Code",
    },
    {
        kriterium: "ultiversum.K3",
        staffel: 2,
        geraet: "headless",
        // derselbe Lauf: bibliothekForke(Welt) verändert das Gesetz (wetter storm) und signiert mit dem eigenen Pass, ein zweiter Fork
        // darauf; die Kette des Enkels nennt je Vorgänger Autor und Code ([Welt-Code, Fork-Code]), der Eintrag ist offenes JSON —
        // sein Gesetz byte-gleich das Gesetz der Welt (Stand-Tafel). Offen bleibt der Pull eines Codes über das Mesh (ein Gerät).
        befehl: ["node", "scripts/diag-praegung-welt.cjs", "--bibliothek"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const je = ["FORK: Herkunfts-Kette", "BIBLIOTHEK offen lesbar:"].map((k) => l.find((x) => x.includes(k) && /^\s*(✅|❌) /.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt (Exit " + lauf.exit + ")" };
            return { gruen: lauf.exit === 0 && je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 90)).join(" | ") };
        },
        pfad: ["stamm/netz-identitaet.js", "stamm/speicher-welten.js", "scripts/diag-praegung-welt.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "2 = forkbar mit Herkunfts-Kette, offen lesbar",
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
        zeit: false,
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
        zeit: false,
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
        zeit: false,
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
        zeit: false,
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
    // halten.K5 Staffel 2 (halten-masse): derselbe Lauf `--k5` (Zwilling der Staffel 1, fährt einmal), Q14 nach dem Tod: die Werte des
    // Leibs (hpMax · staminaMax · manaMax · defense, `recomputePlayerStats`) je Mutation — der Brustpanzer aus Eisen · Bronze · Holz,
    // der Lebenssaft mit Kraut · Fleisch (`activateConsumable`) —, dann getragen und gegessen über den Reload (der Abdruck `werte`
    // ohne die Wunde, die Quellen der Nahrung). GRÜN: je Mutation andere Werte als die Geschwister und der leere Leib, Werte und
    // Nahrung nach dem Reload wie vor dem Speichern, S20 feuert. An halten-masse (headless, Null-Renderer): leer 116,0 hp ·
    // Eisen 154,9 · Bronze 152,7 · Holz 131,9 · Kraut 125,9 · Fleisch 127,2, Stand 184,01/104,48/92,87/19,84 vor = nach; an main
    // f1faa046 fiel die Nahrung im Reload (der Boost lebte nur auf der Wanduhr der Seite).
    {
        kriterium: "halten.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs", "--k5"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}", LINSE_GPU: "hardware" },
        gpu: true,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q14 halten\.K5 Staffel 2/.test(x));
            const z = l.find((x) => /^\s*\(Q14\) \{/.test(x));
            if (!q || !z) return { gruen: false, zahl: "keine Zeile Q14 halten.K5 Staffel 2 (Exit " + lauf.exit + ")" };
            const s20 = l.some((x) => /^\s*✅/.test(x) && x.includes("SELBST-TEST (S20)"));
            let Q = null;
            try { Q = JSON.parse(z.trim().slice(6)); } catch (_e) { Q = null; }
            const w = (a) => (Array.isArray(a) ? a.map((v) => (Number.isFinite(v) ? v.toFixed(1) : "?")).join("/") : "?");
            const zahl = Q
                ? "hpMax/staminaMax/manaMax/defense leer " + w(Q.leer) + " · Werk " + Object.entries(Q.werk || {}).map(([k, v]) => k + " " + w(v)).join(" · ") +
                  " · Nahrung " + Object.entries(Q.nahrung || {}).map(([k, v]) => k + " " + w(v)).join(" · ") + " · Stand " + (Q.stand || []).slice(0, 2).map(w).join(" → ") +
                  " · Nahrung im Stand " + JSON.stringify((Q.stand || []).slice(2))
                : "Q14-Zeile ohne Zahlen";
            const rot = /❌/.test(q) ? " · ROT: " + q.split("Werk und Nahrung ").slice(1).join("").trim() : "";
            return { gruen: /✅/.test(q) && s20, zahl: zahl + rot + (s20 ? "" : " · Selbst-Test S20 stumm") };
        },
        pfad: [...KAMPF, "koerper-core.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "stamm/bau-*.js"],
        quelle: "2 = Lebenswerte lesen Werk und Nahrung (Mutation), beide Geräte",
    },
    // ───────── halten.K1 Staffel 2 — der Treffer aus dem Gesetz im Bild, Labor = Welt (halten-masse) ─────────
    // gate:kampf-gefuehl --k1 (echter Renderer, ?holz=kienspan, der ewige Loop läuft): das Langschwert trifft einen Hirsch über den
    // Klick-Dispatcher je Lauf vor · masse (MAT.*.rho × 1,25) · schneide (sigY der Stoff-Zeile × 1,5), am Treffer das Urteil des
    // Kerns (KE · p · edgeQ), das Bild hält (PNG {AUS}-<lauf>.png, Third) und die Schneide der gezeichneten Pose; dann dieselbe
    // Mutation im Labor (worlds/schmiede, `measure(P)`). GRÜN: jede Schneide ≥ 0,9 in der Bahn (Urteil und Bild), Labor = Welt
    // (Masse, Fase ± 0,5 %), Masse × 1,25 in Werk und wirksamer Masse des Treffers (± 2 %), die Schneide senkt die Fase und hebt
    // KE ÷ v², der Schaden folgt KE, S21 feuert. Das Vorher (main f1faa046): die Welt reichte edgeQ 1, die gezeichnete Pose
    // legte die Breitseite in die Bahn (edgeQ im Treffer-Takt 0,176–0,192, T18); an halten-masse 1,000.
    {
        kriterium: "halten.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs", "--k1"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}", LINSE_GPU: "hardware", KAMPF_BILDER: "{AUS}" },
        gpu: true,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q15 halten\.K1 Staffel 2/.test(x));
            const z = l.find((x) => /^\s*\(Q15\) \{/.test(x));
            if (!q || !z) return { gruen: false, zahl: "keine Zeile Q15 halten.K1 Staffel 2 (Exit " + lauf.exit + ")" };
            const s21 = l.some((x) => /^\s*✅/.test(x) && x.includes("SELBST-TEST (S21)"));
            let K = null;
            try { K = JSON.parse(z.trim().slice(6)); } catch (_e) { K = null; }
            const f = (v, n = 2) => (Number.isFinite(v) ? v.toFixed(n) : "?");
            const je = (k) => {
                const [w, b] = [K.welt[k] || {}, K.labor[k] || {}];
                return k + ": Treffer KE " + f(w.KE, 1) + " J · p " + f(w.p) + " · v " + f(w.v, 1) + " · Schaden " + f(w.schaden, 1) + " · edgeQ " + f(w.edgeQ, 3) +
                    "/Bild " + f(w.schneideBild, 3) + " · Werk " + f(w.kg, 3) + " kg β " + f(w.edgeWinkel, 1) + "° · Labor " + f(b.kg, 3) + " kg β " + f(b.edgeWinkel, 1) + "°";
            };
            const zahl = K && K.welt && K.labor ? ["vor", "masse", "schneide"].map(je).join(" | ") : "Q15-Zeile ohne Zahlen";
            const rot = /❌/.test(q) ? " · ROT: " + q.split("Labor-Werk ").slice(1).join("").trim() : "";
            return { gruen: lauf.exit === 0 && /✅/.test(q) && s21, zahl: zahl + rot + (s21 ? "" : " · Selbst-Test S21 stumm") };
        },
        pfad: [...KAMPF, "stamm/dirigent-takt.js", "worlds/schmiede/schmiede.js", "worlds/schmiede/index.html"],
        quelle: "2 = Schaden und Impuls aus Masse × Schneide × Tempo, eine Mutation in schmiede-core ändert Treffer UND Labor-Werk, im Bild beider Geräte",
    },
    // ───────── fahrzeug.K5 — Rückmeldung: der Körper fühlt die Fahrt (fahr-rueckmeldung) ─────────
    // (1) gate:fahr-leben --rueckmeldung (Rezept linse, `[linse-gpu]`): der GT fährt Glatt (auf dem Weg der Strecke, Vollgas), Drift
    // (12 m daneben auf der Wiese: Vollgas, dann Handbremse und volle Lenkung) und Hang (bergauf); je Kanal das Paar an seinem
    // Ausgang und die Mutante (Kopplung aus) ROT — RM2 die Federung im gezeichneten Bild (die Instanz-Matrix eines Aufbau-Blatts
    // gegen den Rahmen der Räder, je Ecke der Hülle): Drift-Wank ≥ 3 mm und ≥ 1,5× Glatt, die Antwort auf den Boden-Stoß
    // (vehicle-core `bodenStoss` ≥ 10 m/s²) ≥ 5 mm auf Glatt und am Hang; RM3 das Rumble an einem Pad mit Stub-vibrationActuator:
    // Drift stark ≥ 0,5, Glatt ≤ 0,1, das schwache Summen im Bild des Stoßes ≥ 0,4; RM1 die Stimme der Fahrt im Sattel, still
    // danach. (2) Der Motor-Klang am Klang-Abgriff: gate:klang-zensus (F) — der Grundton je Drehzahl am Master-Bus
    // (OfflineAudioContext), Hz je 1000 Upm fest ± 2 % über ≥ 4 Stufen (Mutante S13 „motor stumm“). An main ea07267e ROT (RM2
    // 0 Stöße: der Aufbau folgte jeder Unebenheit starr, die Antwort der Mutante 1,0–2,7 mm; RM3 kein Summen); am Zweig headless
    // Antwort Glatt/Hang 7,2/7,7 mm, Summen 0,54–0,60, Drift-Wank 8,6 gegen 0,5 mm, Rumble Drift 1,0 gegen Glatt 0,004;
    // swiftshader dasselbe Urteil (Antwort 8,0/9,9 mm). Erwartet an Radeon und GTX: RM1–RM3 ✅ und die Zeile (F) ohne „motor stumm“.
    // IN DER SITZUNG (29.10., proben-welt.cjs `fahrRueck`): RM über die Seiten-Probe des Gates (`probeLeben`, `nurRueck`) und der
    // Motor über `koerperSeite` der Klang-Linse (Landung und Doppler per Anker aus: klang.K4) in der warmen Welt — bis 29.10. zwei
    // eigene Boots samt ganzem Klang-Zensus (Radeon b3f9ae95: 5,06 min Arbeit). Die Strecke legt eine Straße und räumt Natur: mutiert.
    {
        kriterium: "fahrzeug.K5", staffel: 1, geraet: ["radeon", "gtx"],
        probe: { befehl: PW.torBefehl(PW.fahrRueck), sek: 45, mutiert: true },
        gpu: true, zeit: false, minuten: 30,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const rm = jsonZeile(teil("RM"), /^RUECKMELDUNG /);
            const gruen3 = [1, 2, 3].map((n) => new RegExp("^\\s*✅ RM" + n + " ", "m").test(teil("RM")));
            const motor = (teil("KLANG").match(/^── \(F\) DER KÖRPER KLINGT: Motor ([\d.]+) Hz je 1000 Upm/m) || [])[1];
            const stumm = /F motor stumm/.test(teil("KLANG"));
            if (!rm || !rm.echt) return { gruen: false, zahl: "keine Zeile RUECKMELDUNG (Exit " + lauf.exit + ")" };
            const w = (r, n, k) => (r && r[n] ? r[n][k] : "?");
            const [e, m] = [rm.echt, rm.mutiert];
            return {
                gruen: gruen3.every(Boolean) && !!motor && !stumm,
                zahl:
                    "Federung im Bild: Drift-Wank " + w(e, "drift", "wankMm") + " gegen Glatt " + w(e, "glatt", "wankMm") + " mm, Stoß-Antwort Glatt/Hang " +
                    w(e, "glatt", "antwortMm") + "/" + w(e, "hang", "antwortMm") + " mm (Mutante " + w(m, "glatt", "antwortMm") + "/" + w(m, "hang", "antwortMm") +
                    ") · Rumble Drift " + w(e, "drift", "stark") + " gegen Glatt " + w(e, "glatt", "stark") + ", Summen " + w(e, "glatt", "summen") + "/" +
                    w(e, "hang", "summen") + " (Mutante " + w(m, "drift", "stark") + ", " + w(m, "glatt", "summen") + ") · Motor " + (motor ? (+motor).toFixed(1) : "?") +
                    " Hz je 1000 Upm (klang-zensus F" + (stumm ? ", STUMM" : "") + ") · RM1–3 " + gruen3.map((g) => (g ? "✅" : "❌")).join(""),
            };
        },
        pfad: [...FAHRT, "stamm/klang.js", "klang-core.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/lib/welt-boot.cjs", "scripts/diag-klang-zensus.cjs", "scripts/lib/wasser-linse.cjs"],
        quelle: "1 = ≥ 3 Kanäle mit gemessenem Paar aus dem Ausgabe-Pfad bzw. am Klang-Abgriff",
    },
    // ───────── fahrzeug.K1 — das Fahr-Gesetz: der Reifen mit Spitze (Staffel 1 Weg (a), fahrzeug-k1-reifen 2d01a8a7) ─────────
    // gate:fahr-leben K8 Reifen (--kern, Node): je Rezept und Achse die Seitenkraft des Kerns (`fahrKraefte`, dieselbe Funktion wie
    // Probefahrt und Welt) über den Schlupf 0,1–30°; das Urteil liest `REIFEN {achsen:[{wo, spitze, abfall}], hz, kostenUs}` —
    // an main 833bbc24 ROT: Spitze 8,7–11,5° (Plateau), Abfall 0 % an allen 10 Achsen
    {
        kriterium: "fahrzeug.K1", staffel: 1, geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kern"], env: { FAHR_LEBEN_PORT: "{PORT}" }, gpu: false, zeit: false, minuten: 1,
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
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kette"], env: { FAHR_LEBEN_PORT: "{PORT}" }, gpu: false, zeit: false, minuten: 1,
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
        befehl: ["node", "scripts/diag-portal-konformanz.cjs"], env: { PORTAL_KONFORMANZ_PORT: "{PORT}" }, gpu: true, zeit: false, minuten: 5,
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
    // ───────── tore.K3 Staffel 2 — auch Reittier/Fahrzeug und die Rundreise eines Werks (tk3-reittier) ─────────
    // Dieselbe Tafel `K8 [[welt, weg, vor, drüben, nach, esc], …]` von gate:portal-konformanz: der Spieler sitzt auf dem Pferd
    // (`state.player.mountedArch`), reitet durch jedes Tor des Genesis-Rings und kommt mit Esc zurück. Der Teil `reittier` (Art ·
    // Gestalt aus Bauplan, Saat, Maß, Tönung, Prägung · Glut · Bindung des gerittenen Werks) steht vor dem Tor aus der Heimat,
    // drüben aus der Hülle (das Gepäck der Übergabe, `_portalEnterPayload`) und daheim; ohne Abdruck vor dem Tor ritt er nicht
    // (rot, nie vakuös). Die Rundreise eines Werks Studio → Welt → Studio verlangt je Ziel-Seite den Teil `werk` (der Bau-Hash
    // des getragenen Werks, die Messung der Karte) — die Tafel trägt ihn nicht: ROT beim Namen, bis eine Linse ihn misst.
    // Ist an tk3-reittier (main eeaff9d6 + Schnitt, swiftshader): Leib, Inventar, Gehaltenes und Reittier je 10/10, Werk 0/10;
    // am Grund eeaff9d6 Reittier 0/10 (drüben fehlte es — das Gepäck trug es nicht).
    {
        kriterium: "tore.K3", staffel: 2, geraet: ["radeon", "gtx"],
        befehl: ["node", "scripts/diag-portal-konformanz.cjs"], env: { PORTAL_KONFORMANZ_PORT: "{PORT}" }, gpu: true, zeit: false, minuten: 5,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/).find((l) => l.startsWith("K8 ["));
            let R = null;
            try {
                R = z ? JSON.parse(z.slice(3)) : null;
            } catch (_e) {
                R = null;
            }
            if (!Array.isArray(R) || !R.length) return { gruen: false, zahl: "keine K8-Tafel (Exit " + lauf.exit + ")" };
            const T = ["leib", "inventar", "wield", "reittier", "werk"];
            const rot = Object.fromEntries(T.map((t) => [t, []]));
            for (const [welt, , vor, dr, nach, esc] of R)
                for (const t of T)
                    if (!(esc === true && vor && dr && nach && vor[t] && vor[t] === dr[t] && vor[t] === nach[t]))
                        rot[t].push(welt + (esc === true ? (vor && vor[t] ? "" : " (kein Abdruck vor dem Tor)") : " (Esc bringt nicht heim)"));
            return {
                gruen: R.length >= 10 && T.every((t) => !rot[t].length),
                zahl: T.map((t) => t + " " + (R.length - rot[t].length) + "/" + R.length).join(" · ") +
                    " Ziel-Seiten byte-gleich vor dem Tor · drüben · daheim" +
                    T.filter((t) => rot[t].length).map((t) => " · rot " + t + ": " + rot[t].join(", ")).join(""),
            };
        },
        pfad: [
            "stamm/netz-portal.js",
            "stamm/siedlung-ort.js",
            "stamm/koerper-bewegung.js",
            "stamm/koerper-fahrt.js",
            "stamm/bau-vorlagen.js",
            "worlds/huelle/huelle.js",
            "scripts/diag-portal-konformanz.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = auch Reittier/Fahrzeug und die Rundreise eines Werks Studio → Welt → Studio mit gleichem Bau-Hash, für jede Ziel-Seite",
    },
    // ───────── tore.K5 — Teilen in EINER Geste an ein anderes Gerät (tore-k5-zweit) ─────────
    // gate:praegung-welt (T): B ist ein eigener Browser-Prozess mit frischem Profil (IDB + localStorage vor dem Boot leer), nie ein
    // Kontext im Chrome von A; beide treten per initP2PSync in einen Raum des signaling-servers, B kennt A erst am offenen
    // DataChannel und an der Vibe-Identität, die A dort bewies. A klickt Werkstatt → GT → Teilen, B gibt den Code in den Chat;
    // das Urteil liest die Zeilen der Probe am Text: anderes Gerät, der Selbsttest (B als Kontext ist ROT), Signatur von A, an
    // B's Pose (≤ 24 m, NDC im Sichtfeld am Null-Renderer — ein Bild an B's Pose misst die Station nicht), ≤ 10 s, Stempel und
    // Same, Bau-Hash A = B ≠ ungeprägt. An main 9ceeca71 ROT (die Geräte-Zeile fehlt: B war ein Kontext im selben Chrome); an
    // tk5-zweit GRÜN: Profil A ≠ B, Bau-Hash 9c183437/12 = 9c183437/12, 530 Zeichen, 866 ms.
    {
        kriterium: "tore.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: true,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const soll = [
                ["Gerät", /^\s*(✅|❌) B ist ein ANDERES GERÄT: /],
                ["Selbsttest", /^\s*(✅|❌) SELBST-TEST: B als zweiter Kontext im Chrome von A ist ROT/],
                ["Signatur", /^\s*(✅|❌) B: Chat-Taste · Code · Enter — das Werk steht, Signatur von A/],
                ["Pose", /^\s*(✅|❌) B: gezeichnet an der eigenen Pose/],
                ["Zeit", /^\s*(✅|❌) ZEIT: Klick bis Code \+ Enter bis gezeichnet ≤ 10 s/],
                ["Stempel", /^\s*(✅|❌) B: Stempel und Same reisen tief gleich/],
                ["Bau-Hash", /^\s*(✅|❌) BAU-HASH A ↔ B byte-gleich/],
            ];
            const je = soll.map(([, re]) => l.find((x) => re.test(x)));
            const fehlt = soll.filter((_, i) => !je[i]).map(([n]) => n);
            if (fehlt.length) return { gruen: false, zahl: "Zeile fehlt: " + fehlt.join(", ") + " (Exit " + lauf.exit + ")" };
            const rot = soll.filter((_, i) => !/✅/.test(je[i])).map(([n]) => n);
            const nach = (i) => je[i].split(" — ").slice(1).join(" — ").slice(0, 160);
            return {
                gruen: !rot.length && lauf.exit === 0,
                zahl: (rot.length ? "ROT: " + rot.join(", ") + " · " : "") + "Zeit " + nach(4) + " · " + nach(6) +
                    " · Profil A, B, Kontext-Probe: " + (je[0].match(/profile-[\w-]+/g) || ["?"]).join(" · "),
            };
        },
        pfad: [
            "stamm/netz-identitaet.js",
            "stamm/netz-p2p.js",
            "stamm/feld-dsl.js",
            "stamm/feld-leben.js",
            "stamm/studio-bruecke.js",
            "stamm/werkstatt-*.js",
            "signaling-server.js",
            "scripts/diag-praegung-welt.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ein Fluss (Bauplan oder Welt) an einem Gerät: A teilt, B (anderes Gerät, frisches Profil, IDB leer) öffnet; das Werk steht an B's Pose mit gleichem Bau-Hash und studioOv, Signatur gültig, ≤ 10 s",
    },
    // ───────── tore.K5 Staffel 2 — beide Flüsse an beiden Geräten (tore-k5-welt) ─────────
    // DIESELBE Probe wie #1 (gate:praegung-welt), B zeichnet mit `PRAEGUNG_WELT_B=echt` auf der Karte. Nach dem Bauplan (≤ 4 KB,
    // Bau-Hash A = B) teilt A seine Welt in EINER Geste (Bibliothek → Teilen: dieselbe Hülle `anazh-werk:`, signiert wie jede
    // Welt-Adresse), B gibt den Code in den Chat und tritt bei (die Tür `_weltBetreten`, Neuladen); die Kontrolle ist das
    // Ereignis `_weltbildKommt` in A's Welt (Klick bis Code + Enter bis dahin ≤ 5 s), dann trägt W den Leib ≥ 1 m. Das Urteil
    // verlangt jede Zeile von #1, die vier WELT-Zeilen und „B echt" (ein Lauf mit Null-Renderer zählt nie). Headless (B null)
    // an tore-k5-welt: Bauplan 530 Zeichen, Welt-Code 515, Welt 136 KB, Kontrolle 1 610 ms, Leib 1 236 ms, Bau-Hash
    // 9c183437/12 = 9c183437/12. Vorher (main 19606f2e) kam keine Welt über 128 KB an: Chrome teilt die Nachricht in Rahmen,
    // der signaling-server las nur den ersten (Join-Timeout 10 s).
    {
        kriterium: "tore.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}", PRAEGUNG_WELT_B: "echt" },
        gpu: true,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const soll = [
                ["Bauplan", /^\s*(✅|❌) A: Werkstatt → GT → Teilen liefert EINEN Code ≤ 4 KB/],
                ["Gerät", /^\s*(✅|❌) B ist ein ANDERES GERÄT: /],
                ["Selbsttest", /^\s*(✅|❌) SELBST-TEST: B als zweiter Kontext im Chrome von A ist ROT/],
                ["Signatur", /^\s*(✅|❌) B: Chat-Taste · Code · Enter — das Werk steht, Signatur von A/],
                ["Pose", /^\s*(✅|❌) B: gezeichnet an der eigenen Pose/],
                ["Zeit", /^\s*(✅|❌) ZEIT: Klick bis Code \+ Enter bis gezeichnet ≤ 10 s/],
                ["Stempel", /^\s*(✅|❌) B: Stempel und Same reisen tief gleich/],
                ["Bau-Hash", /^\s*(✅|❌) BAU-HASH A ↔ B byte-gleich/],
                ["Welt-Code", /^\s*(✅|❌) WELT: A teilt die Welt — EIN Code, die Hülle des Werks, Signatur von A/],
                ["Beitritt", /^\s*(✅|❌) WELT: B steht in A's Welt \(Id, Same, Gast, > 128 KB\) und kennt A am Anschluss/],
                ["Kontrolle", /^\s*(✅|❌) WELT: KONTROLLE ≤ 5 s — Klick bis Code \+ Enter bis zum ersten Weltbild — .*, B echt\)/],
                ["Leib", /^\s*(✅|❌) WELT: der Leib geht unter W ≥ 1 m/],
            ];
            const je = soll.map(([, re]) => l.find((x) => re.test(x)));
            const fehlt = soll.filter((_, i) => !je[i]).map(([n]) => n);
            if (fehlt.length) return { gruen: false, zahl: "Zeile fehlt: " + fehlt.join(", ") + " (Exit " + lauf.exit + ")" };
            const rot = soll.filter((_, i) => !/✅/.test(je[i])).map(([n]) => n);
            const nach = (i) => je[i].split(" — ").pop().slice(0, 120);
            return {
                gruen: !rot.length && lauf.exit === 0,
                zahl: (rot.length ? "ROT: " + rot.join(", ") + " · " : "") + "Bauplan " + nach(0) + " · Welt-Code " + nach(8) +
                    " · Welt " + nach(9) + " · Kontrolle " + nach(10) + " · Leib " + nach(11) + " · " + nach(7),
            };
        },
        pfad: [
            "stamm/netz-identitaet.js",
            "stamm/netz-p2p.js",
            "stamm/netz-portal.js",
            "stamm/feld-dsl.js",
            "stamm/feld-leben.js",
            "stamm/studio-bruecke.js",
            "stamm/werkstatt-*.js",
            "stamm/speicher-laden.js",
            "stamm/dirigent-ankunft.js",
            "index.html",
            "signaling-server.js",
            "scripts/diag-praegung-welt.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = beide Flüsse (Welt per Einladungs-Code, Kontrolle ≤ 5 s) an beiden Geräten, Bauplan ≤ 4 KB",
    },

    // ───────── spielgang.K3 — Bedienung: HUD und Menü antworten, ohne das Bild zu verdecken (Zweig hud-zugang) ─────────
    {
        kriterium: "spielgang.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // `werkbank bedienung` an der Mess-Wiese, 1920×1080, echtes Fenster: der Klick fängt den Zeiger (im Spiel), die HUD-Maske
        // aus dem Bild des Spielers (Canvas + DOM, der Loop steht: die Pixel, die sich mit verborgenem HUD ändern); dann je Runde
        // ein Klick auf jeden Hotbar-Platz (HUD) und Tab, Tab, I, Esc (Menü) als echte Eingabe im laufenden Loop — die INP (p98 der
        // Interaktionen, Event-Timing) misst das Bedienungs-Ohr des Spiels (`_bedienungInp`); gezählt sind die Interaktionen, die
        // der Browser zählt (performance.interactionCount: 5 Runden ≈ 50 HUD, 20 Menü — ein Klick, der in ein Bild fällt, das noch
        // rechnet, zählt nicht doppelt). Am Grund a03b7b06 fehlt das Verb
        // (ROT „keine Bedienung"); swiftshader in der Cloud: Deckung 12,51 % ohne → 3,18 % mit dem Spiel-Zustand (zwei Läufe gleich, HUD 50 · Menü 21 Interaktionen), INP Sekunden
        // (CPU-Raster, kein Urteil).
        probe: sitzung(180,
            "boot",
            "timeout 60 $W fenster 1920 1080 > /dev/null 2>&1",
            "timeout 600 $W umstellen --ort wiese > /dev/null 2>&1",
            "teil BEDIENUNG $W bedienung --runden 5"
        ),
        env: K,
        gpu: true,
        zeit: true,
        minuten: 10,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const b = jsonBlock(teil("BEDIENUNG"));
            if (!b || !b.inp || !b.inp.hud || !b.inp.menue) return { gruen: false, zahl: "keine Bedienung" + (b && b.fehler ? " — " + b.fehler : "") + " (Exit " + lauf.exit + ")" };
            const { hud, menue } = b.inp;
            const gruen = b.imSpiel === true && b.bild[0] === 1920 && b.deckungPct <= 5 && hud.n >= 30 && menue.n >= 15 && hud.inpMs <= 200 && menue.inpMs <= 200;
            return {
                gruen,
                zahl: "HUD deckt " + b.deckungPct + " % (" + b.bild.join("×") + (b.imSpiel ? ", im Spiel" : ", OHNE Zeiger-Fang") + ") · INP HUD " + hud.inpMs +
                    " ms (" + hud.n + ") · Menü " + menue.inpMs + " ms (" + menue.n + ")",
            };
        },
        pfad: [
            "index.html",
            "stamm/werkstatt-hud.js",
            "stamm/dirigent-*.js",
            "stamm/werkstatt-bauen.js",
            "scripts/werkbank.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "save-server.js",
        ],
        quelle: "1 = HUD und Menü antworten INP ≤ 200 ms und das HUD deckt ≤ 5 % des Bilds, an einem Gerät",
    },

    // ───────── spielgang.K4 — Zugänglichkeit aus dem Gesetz: die Untertitel (Zweig hud-zugang) ─────────
    {
        kriterium: "spielgang.K4",
        staffel: 1,
        geraet: "headless",
        // die Wand (Ü) der Klang-Linse, Zwilling von klang.K1#1: EIN Klang-Ereignis, zwei Leser (Ton und Zeile) — jedes Ereignis der
        // Tour mit Quelle (Treffer, Wasser, Abschied, Singen, Inventar, der Ruf auf Auftrag und Stufe) trägt seine Zeile, ein stilles
        // (Wasser auf trockenem Land, der Ruf ohne Leib) keine, jede gespielte Stimme an jedem Ort steht in der Umgebungs-Zeile, und
        // die Tafel `UNTERTITEL` deckt jeden Namen des Gesetzes (Stimmen · Ruf-Stimmungen · SUBSTANZ). Am Grund a03b7b06 fehlt die
        // Zeile (ROT); am Zweig 31 von 31. Die Mutante „Untertitel aus" fällt im Selbsttest der Linse (S14, gate:klang-zensus).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = (lauf.stdout.match(/^── \(Ü\) UNTERTITEL: (\d+) von (\d+) /m) || []).slice(1).map(Number);
            if (z.length !== 2) return { gruen: false, zahl: "keine Zeile (Ü) UNTERTITEL (Exit " + lauf.exit + ")" };
            const rot = ((j && j.rot) || []).filter((t) => /^Ü /.test(t));
            return {
                gruen: z[1] > 0 && z[0] === z[1] && rot.length === 0,
                zahl: z[0] + " von " + z[1] + " Klang-Ereignissen und Stimmen tragen ihre Zeile" + (rot.length ? " · " + rot.slice(0, 3).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/werkstatt-hud.js",
            "stamm/dirigent-kern.js",
            "index.html",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Untertitel für jede Stimme und jeden Ruf aus dem Klang-Gesetz ODER ein Farb-Modus (jede Klassen-Grenze unter Deuteranopie-Simulation ΔE ≥ 10)",
    },

    // ───────── ultiversum.K4 — Spieler schreiben Gesetze und teilen sie (Zweig w3t-spielergesetz) ─────────
    {
        kriterium: "ultiversum.K4",
        staffel: 1,
        geraet: "headless",
        // gate:mp-sync (h), zwei Seiten einer Maschine, ein echter Broker (Zwilling von feld.K2 — EIN Lauf): A schreibt im Gespräch
        // „wann immer es zufällig passt, dann erzähle …" (der EINE Satz-Parser `_regelAusSatz` → `rule` → `_registerWorldRule`,
        // der dsl-Kanal `p2pBroadcastDsl`); neu heißt: sein Hash (`_regelHash`) steht in keiner Vorlage (`GESETZ_VORLAGEN` und die
        // Gesetze, die A's Welt schon trägt). B trägt es, würfelt in 40 Scheiben der Welt-Uhr denselben Wurf, obwohl B drei
        // Platz-Nummern mehr zählt, und die Wirkung steht bei beiden (die Erzählung im Wissen, B's Tagebuch „Das Gesetz von …"),
        // gewartet bis zur Scheibe nach dem ersten wahren Wurf (die Welt-Uhr ist die Frist). Mutanten im selben Lauf: A sagt die
        // Vorlage → nicht neu; B's dsl-Kanal taub → B ohne das Gesetz. Am Grund 675a3889 fehlt (h) (ROT „keine (h)-Zeile"); mit
        // der alten Saat (Platz-Nummer + Feuer) und dem Gesetz des Mitspielers als Experiment ROT (Wurf VERSCHIEDEN, das Gesetz
        // schlief auf beiden Seiten, B's Tagebuch schweigt); am Zweig 0708ba56 GRÜN (Hash d7ff724d, Wurf gleich, wirkt bei A und B).
        befehl: ["node", "scripts/diag-mp-sync.cjs"],
        env: { MP_SYNC_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const soll = [/^\s*(OK|ROT)\s+\(h\) A schreibt ein neues Gesetz/, /^\s*(OK|ROT)\s+\(h\) Selbsttest: /];
            const je = soll.map((re) => z.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "keine (h)-Zeile (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /^\s*OK/.test(x)), zahl: je.map((x) => x.trim().slice(0, 220)).join(" | ") };
        },
        pfad: [
            "stamm/feld-*.js",
            "stamm/netz-*.js",
            "stamm/werkstatt-*.js",
            "stamm/dienst.js",
            "stamm/dirigent-*.js",
            "signaling-server.js",
            "save-server.js",
            "scripts/diag-mp-sync.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ein Spieler schreibt eine DSL-Regel im Spiel, sie wirkt und reist zum Mitspieler",
    },

    // ───────── fahrzeug.K2 — die Fahrt kommt durch: das Wegenetz trägt das Rad (Staffel 1, w3t-wegenetz) ─────────
    // gate:fahr-leben --wegenetz: die feste Route der Saat — von der Mess-Wiese über die Orte −1,−5 · 0,−5 · 1,−6 · 2,−7 · 3,−6 ·
    // 4,−7 (je zwei Nachbarn im Wegenetz, `_wegenetzNachbarn`), die am Spieler erwachen wie im Spiel; die Feldwege zwischen ihnen
    // und die Nähte ihrer Netze legt das Gesetz (fachwerk `wegZwischen`, `wegeNetz`), die Route ist die kürzeste über das Netz
    // (`_wegenetzRoute`, 2632 m, Weg 98 %, Boden Wiese/Wald/Dorf); der GT fährt sie mit dem Fahrer am Steuer (`fahrerSetzen`:
    // Verb-Tafel → der EINE Fahr-Schritt des Kerns), die Telemetrie zählt der Sim-Schritt (FIXED_DT). Das Urteil liest
    // `WEGENETZ {…}`. An main 675a3889 ROT (kein Feldweg zwischen Orten, die Dorf-Netze in 4–6 Teilen: keine Route); die Mutante
    // (`--mutante`, die Weg-Erkennung aus: die Luftlinie) ROT (Weg 0, fest nach 120 m). Am Zweig headless: 0 Steckenbleiber, über
    // 0,8 · vmax 73,7 % (gemischte Bilder 8,3–33,3 ms) bzw. 75,3 % (`--gleich`, 60 fps) — der Sim-Schritt ist fest, die Welt
    // (Natur-Strom, Boden) kommt je Bild: 12 444 gegen 12 225 Takte, darum urteilen Radeon und GTX. Erwartet dort: Route ✅,
    // an ✅, Steckenbleiber 0 ✅, Tempo ❌ (~74 % gegen 80 %: drei Bäche quer — zwei Feldwege und eine Gasse von 4,−7 — und
    // die Ecken der Dörfer, je ~210 Takte unter 0,8 · vmax).
    // IN DER SITZUNG (29.10., proben-welt.cjs `fahrWegenetz`): die Seiten-Probe des Gates (`probeLeben`, `wegenetz`) in der warmen
    // Welt, der Dorf-Zug an wie das Gate vor dem Boot; die Route sind ~12 000 Sim-Schritte in den Bildern der Probe (die Welt kommt
    // je Bild) — die Ausnahme trägt sie. Kennt der Stand die Fahrt nicht, ROT beim Namen in Sekunden. Die Orte erwachen: mutiert.
    {
        kriterium: "fahrzeug.K2", staffel: 1, geraet: ["radeon", "gtx"],
        probe: {
            befehl: PW.torBefehl(PW.fahrWegenetz),
            sek: 90,
            mutiert: true,
            ausnahme: "die feste Route ist das Kriterium: 2,6 km mit dem Fahrer am Steuer, ~12 000 Sim-Schritte in den Bildern der Probe, sechs Orte erwachen",
        },
        gpu: true, zeit: false, minuten: 10,
        urteil: (j, lauf) => {
            const m = jsonZeile(lauf.stdout, /^WEGENETZ {/);
            if (!m) return { gruen: false, zahl: "keine WEGENETZ-Zeile (Exit " + lauf.exit + ")" };
            const b = m.boden || {};
            const teile = {
                route: m.lang >= 2000 && m.wegAnteil >= 0.95,
                an: m.ende === true,
                steck: (m.steck || []).length === 0,
                tempo: m.anteil >= 0.8,
                boden: b.wiese > 0 && b.wald >= 0.1 && b.dorf >= 0.05,
            };
            const aus = Object.keys(teile).filter((k) => !teile[k]);
            const p = (x) => Math.round((x || 0) * 1000) / 10 + " %";
            return {
                gruen: !aus.length && lauf.exit === 0,
                zahl: "Route " + m.lang + " m (Weg " + p(m.wegAnteil) + "), gefahren " + m.weg + " m · Steckenbleiber " + (m.steck || []).length +
                    " · über 0,8 · vmax " + p(m.anteil) + " von " + m.schritte + " Sim-Schritten · Boden Wiese " + p(b.wiese) + " / Wald " + p(b.wald) +
                    " / Dorf " + p(b.dorf) + (aus.length ? " · außer Soll: " + aus.join(", ") : "") + " · Exit " + lauf.exit,
            };
        },
        pfad: ["vehicle-core.js", "fachwerk-core.js", "voxel-worker.js", "stamm/koerper-*.js", "stamm/siedlung-*.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/werkbank.cjs"],
        quelle: "1 = auf der festen 2-km-Route entlang Weg und Feldweg (Wiese → Wald → Dorf) 0 Steckenbleiber und ≥ 80 % der Takte über 0,8 × vmax, an einem Gerät",
    },
];

module.exports = stationen;

// NICHT FASSBAR als Station (befehl null): das Werkzeug fehlt oder die Staffel verlangt, was EIN Lauf auf EINEM Gerät nie misst.
module.exports.fehlt = [
    { kriterium: "ultiversum.K4", staffel: 2, befehl: null, grund: "nicht gebaut (w3t-spielergesetz baute Staffel 1): ein Spieler-Gesetzbuch dockt über den Weg von studios.K5 an (ein neuntes Gesetzbuch mit PARAMS_BY_KIND und Bauer, `git diff stamm/` = 0), und der Weg ist selbst ungebaut — die Übergabe kennt eine Positivliste (`stamm/netz-portal.js`, koerper und kreatur), der Wirt kennt Arten beim Namen. Ein Gesetz aus dem Satz („wann immer …“) ist eine Welt-Regel (`_registerWorldRule`), kein Gesetzbuch" },
];
