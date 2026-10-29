// Stationen der Gruppe VI (src/g6.js, Fundament). Format und Regeln: punkte/punkte.cjs (Kopf).
//
// Erfasst ist jedes g6-Kriterium mit Punkten (klang K2 K4 K5, speicher K4 K5), aus der Messschuld (speicher K1 K2 = M30 M35
// M37 M38, profiband K4 = M34 M39, klang K2 K5 = M33 M15) und aus dem Stau (hydro-faden: streaming K4 K5; speicher-journal:
// speicher K2 K3), dazu aus Karten (klang-k1-zensus: klang K1#1; klang-k1-nacht: klang K1#2; streaming-sprung: streaming K3#1;
// ankunft-aussen: ankunft K2#1 K3#1). Je Kriterium und Staffel steht hier der Befehl, mit dem
// der Beleg gemessen wurde.
//
// HARNESS-STATIONEN: einige Belege maß eine Mess-Bahn mit Scratch-Werkzeug aus dem Zweig koordination
// (`bericht/2210-messschuld-6cfce/skripte/`: spiel.cjs, m14-spielgang, m15-wind, m15-schritt; `bericht/2310-messschuld-gtx-452972/
// echt-k1.cjs`). Diese Dateien tragen den Baum ihres Mess-Platzes fest im Text. Die Station kopiert sie darum neben ihre Ausgabe
// (`{AUS}` ohne .json + "-werk"/), setzt dort {BAUM} und {KOORD} ein und schreibt nichts in den Bericht zurück. Der Befehl selbst
// steht hier wörtlich, ist also Teil des Abdrucks. Den Text des Scratch-Werkzeugs liest der Abdruck nicht: wer es ändert, muss
// den Befehl hier mitändern (z. B. das Datum im Kommentar-Feld `# werk`), sonst zählt die alte Messung weiter.
//
// Nicht fassbar (Werkzeug fehlt) steht unten in `fehlt`, mit befehl: null und dem Grund beim Namen. Diese Einträge zählen 0,
// und der Läufer sieht sie nicht: `module.exports` bleibt die Liste der fahrbaren Stationen.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");

// Vorspann jeder bash-Station: Pfade in Vorwärts-Schreibweise und ein frisches Werk-Verzeichnis neben der Ausgabe.
const VOR =
    "set -u; B=$(cygpath -m '{BAUM}'); K=$(cygpath -m '{KOORD}'); A=$(cygpath -m '{AUS}'); D=\"${A%.json}-werk\"; " +
    'rm -rf "$D"; mkdir -p "$D/roh"; ';
// Die Spiel-Harness der Radeon-Mess-Bahn (spiel.cjs): das echte Spiel im Fenster über einen Host ohne save-server-Pfad
// (save-server auf {PORT}, nie 4312 — dort hieße der Host save-server, R5: der Pfad des Spielers).
const HARNESS =
    VOR +
    'cp -r "$K/bericht/2210-messschuld-6cfce/skripte/." "$D/"; ' +
    'sed -i -e "s#C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-6cfce#$B#g" ' +
    '-e "s#C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination#$K#g" "$D"/*.cjs; ' +
    '(PORT={PORT} node save-server.js > "$D/save.log" 2>&1 < /dev/null &); ' +
    "for t in $(seq 1 60); do curl -s -o /dev/null http://localhost:{PORT}/ && break; sleep 1; done; " +
    "export SPIEL_URL=http://localhost:{PORT}; ";
// DER ZYKLUS OHNE ALTER beim Namen (echt-k1 zählt ihn als halbe Welt mit Alter 999): die Probe sucht den Schreiber, dessen
// Stand x/z/b/e dem geladenen GENAU gleicht. 23.10. an 7c6f4b49 (Radeon) gab es ihn je Lauf einmal nicht — der geladene Stand
// lag mit gleichen Blöcken und Edits 4/−25 mm neben dem letzten Schreiber vor dem Tod (z8: 388/93905 → 392/93880): der Spieler
// wird nach dem Laden versetzt, bevor die Probe liest. Genannt wird je Zyklus der jüngste Schreiber vor dem Tod mit gleichem
// b/e, sein Abstand zum Tod und der Versatz; das Urteil bleibt beim Werkzeug (den Lese-Haken baut die OMEN).
function ohneAlter(j) {
    const tz = Array.isArray(j.todZeiten) ? j.todZeiten : [];
    const alle = Array.isArray(j.alle) ? j.alle : [];
    return j.zyklen
        .filter((z) => z.z > 0 && z.alterS == null)
        .map((z) => {
            const tot = tz[z.z - 1], g = z.g || {};
            const w = alle.filter((e) => e.rec && e.t <= tot && e.rec.b === g.b && e.rec.e === g.e).sort((a, b) => b.t - a.t)[0];
            return "z" + z.z + (w ? " " + (g.x - w.rec.x) + "/" + (g.z - w.rec.z) + " mm neben dem Schreiber " + ((tot - w.t) / 1000).toFixed(2) + " s vor dem Tod (b/e gleich)" : " ohne Schreiber mit gleichem b/e");
        });
}
// Der Tab-Tod am Pfad des Spielers (statischer Host ohne save-server), Stand M37: Tod im Dorf-Erwachen in Zyklus 1 und 2.
const ECHT_K1 =
    VOR +
    'sed -e "s#C:/Users/micha/Desktop/AnazhRealm-OMEN/koordination#$K#g" -e "s#C:/Users/micha/Desktop/AnazhRealm-OMEN/n2010-b2b#$B#g" ' +
    '"$K/bericht/2310-messschuld-gtx-452972/echt-k1.cjs" > "$D/echt-k1.cjs"; ' +
    // werk: echt-k1 mit dem Lese-Haken der OMEN (042f681a, 23.10.: das Alter am gelesenen Stand, die Versetzung als eigene Zahl)
    ': werk 2310-lese-haken; WT="$B" OUT_DIR="$D" ECHT_PORT={PORT} node "$D/echt-k1.cjs" ';

// DIE MESS-BAHN speicher-zwei (Karte speicher-zwei, 27.10.): `bericht/2710-speicher-zwei/skripte/speicher-zwei.cjs` fährt das
// echte Spiel aus dem Spiel-Baum (dessen welt-boot, Ausgabe-Aufnahme, Messort) — `takt` für speicher.K2#2, `bild` für
// speicher.K4#2. Unter scripts/ des Spiels trüge die Decke die zwei Bahnen nicht (+2 139 Atome); die Bahn kopiert sich neben die
// Ausgabe wie die HARNESS, `# werk` nennt ihren Stand.
const SPEICHER_ZWEI =
    VOR +
    'cp "$K/bericht/2710-speicher-zwei/skripte/speicher-zwei.cjs" "$D/"; ' +
    ': werk 2710-speicher-zwei; cd "$B"; BAUM="$B" PORT={PORT} node "$D/speicher-zwei.cjs" ';
const HYDRO_PFAD = [
    "voxel-worker.js",
    "gelaende-core.js",
    "foundry-bruecke.js",
    "stamm/gelaende-*.js",
    "stamm/wasser-*.js",
    "stamm/dirigent-ankunft.js",
    "stamm/dirigent-kern.js",
    "stamm/dirigent-takt.js",
    "stamm/studio-bruecke.js",
    "stamm/klang.js",
    "stamm/vegetation-wiese.js",
    "scripts/diag-worker-dichte.cjs",
    "scripts/lib/welt-boot.cjs",
];
const SPEICHER_PFAD = [
    "stamm/dienst.js",
    "stamm/speicher-*.js",
    "stamm/dirigent-takt.js",
    "stamm/dirigent-regler.js",
    "stamm/dirigent-kern.js",
    "stamm/dirigent-ankunft.js",
    "stamm/werkstatt-sozial.js",
    "stamm/werkstatt-bauen.js",
    "stamm/siedlung-ort.js",
    "stamm/siedlung-satz.js",
    "stamm/siedlung-bauten.js",
    "stamm/gelaende-chunks.js",
    "scripts/lib/welt-boot.cjs",
    "scripts/lib/software-gpu.cjs",
];
// DER VOLLE LAUF von speicher.K4/K5 (Korpus, Tab-Tod, save-server) ohne den Gang (D): keiner der drei urteilt ihn, speicher.K3 geht
// ihn mit 5 km in 30 Spielminuten — PERSISTENCE_WEG=0-0 spart 1 km in 6 Spielminuten (3 600 Takte). Ein Stand vor dem Schalter geht
// ihn mit 0 km; seine (D)-Zeilen und sein Exit tragen kein Urteil der drei. Dazu bootet der Korpus drei Stände zugleich (Spiel-Zweig
// pruef-kurz-c 886669a3): derselbe volle Lauf in der CI (Teil 2) 403–410 s → 198 s, der Korpus darin 201 → 88 s, Urteile 11/11.
const PERSISTENZ_ENV = { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_SERVER_PORT: "2{PORT}", PERSISTENCE_WEG: "0-0" };
// speicher.K3: was der Weg berührt — die Würfe des Felds und der Streu, die Orte und ihr Gedächtnis, das Leben im Stand
const K3_PFAD = [
    "stamm/gelaende-boden.js",
    "stamm/vegetation-*.js",
    "stamm/feld-*.js",
    "stamm/kreatur-*.js",
    "gelaende-core.js",
    "fachwerk-core.js",
    "scripts/diag-persistence.cjs",
];

// Profiband K4 Staffel 2 — die Übergänge im Mess-Fenster über die echten Tasten (Seiten-Code für `werkbank eval`, ohne ').
// GEHEN: V alle 4 s für 90 s, je Druck die Sicht danach; FAHRT: 30 s nach dem Aufsitzen im GT E (aus), 2 s später E (ein).
const K4_TASTE =
    'const t = (c, k) => { for (const a of ["keydown", "keyup"]) window.dispatchEvent(new KeyboardEvent(a, { bubbles: true, code: c, key: k })); }; ';
const K4_GEH =
    "const st = r.state; clearInterval(window.__k4iv); const z = (window.__k4 = { v: 0, modi: [] }); " + K4_TASTE +
    'window.__k4iv = setInterval(() => { t("KeyV", "v"); z.v++; setTimeout(() => z.modi.push(st.cameraMode), 200); }, 4000); ' +
    "setTimeout(() => clearInterval(window.__k4iv), 90000); return 1;";
const K4_FAHR =
    'const st = r.state; clearInterval(window.__k4iv); const z = (window.__k4 = { wagen: "-", aus: "-", ein: "-" }); ' + K4_TASTE +
    "const bis = performance.now() + 120000; " +
    'const iv = setInterval(() => { if (st.player.mountedArch !== "werkbank-fahrt" && performance.now() < bis) return; clearInterval(iv); ' +
    'setTimeout(() => { z.wagen = st.player.mountedArch; t("KeyE", "e"); setTimeout(() => { z.aus = st.player.mountedArch; t("KeyE", "e"); ' +
    "setTimeout(() => { z.ein = st.player.mountedArch; }, 500); }, 2000); }, 30000); }, 100); return 1;";

// DIE ANKUNFT VON AUSSEN (Karte ankunft-aussen): die Kalt- und die Zweit-Zeile von diag-boot-stage — t(Kontrolle) ist die Prozess-Uhr
// ab Navigation, als die von außen gehaltene Taste W den Leib um ≥ 0,1 m trug (nie `_weltbildDa`); was sie liest. Seit 29.10. in der
// Sitzung: die EINE Probe der Ankunft (stationen/sitzung-seite.js `probeAnkunft`, Zwilling von pipeline.K4#1/#2).
const { ANKUNFT_PROBE, ANKUNFT_AUSNAHME } = require("./sitzung-seite.js");
const ANKUNFT_PFAD = [
    "index.html",
    "stamm/dirigent-*.js",
    "stamm/studio-*.js",
    "stamm/gelaende-*.js",
    "stamm/bild-kosten.js",
    "stamm/koerper-bewegung.js",
    "foundry-bruecke.js",
    "voxel-worker.js",
    "scripts/diag-boot-stage.cjs",
    "scripts/lib/welt-boot.cjs",
];
const HW = (t) => {
    const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
    return { ad: ad || "Adapter ungenannt", hw: !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad) };
};

// ─────────────────── DER MESS-GANG DES BANDS (profiband K1 · K2 · K3 · K5, Karte w3v-profiband) ───────────────────
// K1 · K2 · K3 lesen EINEN Lauf je Gerät (derselbe Befehl: Zwillinge, die Maschine fährt ihn einmal): 4 frische Sitzungen (save-server +
// Werkbank --echt, 1920×1080, Dorf-Zug aus wie K4), je Sitzung jede Zelle mit `werkbank lauf 30 --regler voll --tiere frei` — der Lauf
// trägt die Frame-Zeit (rAF), den CPU-Takt, die GPU-Zeit je Bild (Pass-Stempel, gültig ohne Pool-Überlauf), Befehle und Dreiecke je
// Bild (p95), den VRAM am Ende des Fensters und die BELEGUNG des Haupt-Fadens zwischen zwei Bildern aus der CDP-Spur
// (`belegungAuswerten`, nie `_gameLoopTick`). Nach jedem Lauf liest die Probe in der Seite, was der Lauf nicht nennt: ob ein
// Halte-Griff die Tiere je hielt (`__tiereGehalten` am Prototyp — er bleibt für die Sitzung), die Sicht, Geh- und Sprint-Tempo.
// DIE ZELLEN — stehend (die Zellen von PFLICHT E): Wiese und Genesis, je Ego und Third; bewegt: Wiese Ego gehend (die Bahn, 4 m/s),
// Sprint (Shift+W über die Tasten des Spielers, wer 1 s steckt, dreht ab wie im Gang), GT-Fahrt (`--wandern fahrt`, V alle 4 s:
// Third ↔ Ego), Genesis Third gehend, die Stadt gehend durch die Hauptgasse (Messort `stadt`: „dorf 7 120", Dorf-Zug an) und der
// Sturm mit 50 Tieren (`--tiere 50 --wetter stormy`; zuletzt, die Tiere der Bühne bleiben in der Welt). In Sitzung 1 vor der Stadt
// `werkbank band` je Ort × Sicht (wiese, genesis, dorf × ego, third): Haushalt und Ratsche, VRAM nach dem Collector, gpu-bank.
// JE ZELLE zählt der obere Median der 4 Sitzungen (≥ 3 von 4 halten das Soll), und nur, wenn jede Sitzung gilt (`pbFehl`): Regler
// voll und ungedrosselt, Szenen-Skala ≥ 0,75, kein Tier gehalten, das Wetter gehalten, ≥ 300 Bilder, die Sicht und der Weg der Zelle.
// Die Schlupflöcher der Soll-Tafel stehen als Mutanten in den `proben` (punkte.cjs selbsttest). Cloud: kein Bild-Lauf (Kartenkopf N7).
const PB_STEHT = ["wiese-ego-steht", "wiese-third-steht", "genesis-ego-steht", "genesis-third-steht"];
const PB_BEWEGT = ["wiese-ego-geht", "wiese-ego-sprint", "wiese-fahrt", "genesis-third-geht", "stadt-ego-geht", "wiese-ego-sturm"];
const PB_BAND = ["wiese-ego", "wiese-third", "genesis-ego", "genesis-third", "dorf-ego", "dorf-third"];
const PB_PFAD = [
    "stamm/*.js",
    "*-core.js",
    "voxel-worker.js",
    "foundry-bruecke.js",
    "index.html",
    "worlds/huelle/huelle.js",
    "spec/profiband/haushalt.json",
    "spec/profiband/ratsche-*.json",
    "scripts/werkbank.cjs",
    "scripts/lib/zerlege-linse.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/band-urteil.cjs",
    "scripts/lib/draw-zaehler.cjs",
    "scripts/lib/software-gpu.cjs",
    "scripts/lib/welt-boot.cjs",
];
// Seiten-Code (`werkbank eval`, ohne '): die Probe nach jedem Lauf · Sprint an (Shift+W je s, ein Steckender dreht ab) und aus ·
// Tor und Bau (K5): ein Haus 12 m neben dem Spieler, bis es steht, 10 s durch das Welt-Portal (Skelett-Welt) und heim, das Haus
// geräumt — der Spiel-Loop läuft dabei
const PB_PROBE =
    "const st = r.state; return { gehalten: !!Object.getPrototypeOf(r).__tiereGehalten, sicht: st.cameraMode, speed: st.speed, " +
    "sprint: st.sprintSpeed, skala: r._szeneSkalaWirk() };";
const PB_SPRINT =
    'const st = r.state; clearInterval(window.__pbiv); let vor = null; const t = (c, k) => window.dispatchEvent(new KeyboardEvent("keydown", ' +
    '{ bubbles: true, code: c, key: k })); window.__pbiv = setInterval(() => { t("ShiftLeft", "Shift"); t("KeyW", "w"); ' +
    "const p = st.playerMesh.position; if (vor && Math.hypot(p.x - vor[0], p.z - vor[1]) < 1) st.yaw += 1.7; vor = [p.x, p.z]; }, 1000); return 1;";
const PB_SPRINT_AUS =
    'clearInterval(window.__pbiv); for (const [c, k] of [["KeyW", "w"], ["ShiftLeft", "Shift"]]) window.dispatchEvent(new KeyboardEvent("keyup", ' +
    "{ bubbles: true, code: c, key: k })); return 1;";
const PB_TORBAU =
    "const st = r.state, rend = st.renderer, raf = () => new Promise((f) => requestAnimationFrame(f)), o = { bau: false, tor: false, heim: false }; " +
    "rend.setAnimationLoop((t) => r._gameLoopTick(t)); try { const p = st.playerMesh.position, x = p.x + 12; " +
    'const e = r.spawnArchitecture("haus_alemannisch", { x, y: r.getTerrainHeightAt(x, p.z) + 0.5, z: p.z }, { silent: true, precise: true }); ' +
    "await __gebautNach(e, { bau: () => {}, takt: raf }); o.bau = r._archIsRendered(e); " +
    'r.enterPortal({ type: "welt_portal", affordances: { isPortal: true } }); o.tor = !!r._portalOverlay; ' +
    "for (let i = 0; i < 600; i++) await raf(); r.exitPortal(); o.heim = !r._portalOverlay; " +
    "for (let i = 0; i < 120; i++) await raf(); r.removeArchitecture(e); } finally { rend.setAnimationLoop(null); } return o;";
// node-Code der Zusammenfassung (bash '…', ohne '): E das Ergebnis eines eval · J der JSON-Block einer Ausgabe · SUM ein Lauf und
// seine Probe · BSUM ein Band und seine Probe · GSUM der Gang (`puffer --gang`) · PSUM die Puffer-Linse am Start und am Ende
const PB_E =
    'let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => { let e = null; try { e = JSON.parse(s).ergebnis; } catch (x) {} ' +
    "console.log(JSON.stringify(e === undefined ? null : e)); });";
const PB_J =
    'const fs = require("fs"); const J = (f) => { let z = []; try { z = fs.readFileSync(f, "utf8").split(String.fromCharCode(10)).map((l) => l.trimEnd()); ' +
    'return JSON.parse(z.slice(z.indexOf("{"), z.lastIndexOf("}") + 1).join(" ")); } catch (e) { return { fehler: "kein JSON: " + z.slice(-2).join(" ").slice(0, 120) }; } }; ' +
    "const q = (x) => x || {}; let p = null; try { p = JSON.parse(process.argv[2]); } catch (e) {} ";
const PB_SUM =
    PB_J +
    "const o = J(process.argv[1]), b = q(o.belegung), s = q(o.stellgroessen); console.log(JSON.stringify({ " +
    'fehler: typeof o.fehler === "string" ? o.fehler : undefined, regler: o.regler, sek: o.sekunden, frames: o.frames, frame: o.frameMs, ' +
    "takt: q(o.cpuTaktMs).p95, belegung: q(b.belegungMs).p95, pflicht: q(b.pflichtMs).p95, gpu: q(o.gpuMs).p95, gpuN: q(o.gpuMs).n, " +
    "stempel: q(o.stempel).gueltig, befehle: q(o.befehle).p95, dreiecke: q(o.dreiecke).p95, vram: q(o.vramMB).jetzt, last: s.loadScale, " +
    "skala: s.szeneSkala, holz: s.holz, wache: q(o.wetterHalt).urteil, wetter: o.wetter, weg: o.bahnM, buehne: o.buehnenTiere, probe: p }));";
const PB_BSUM =
    PB_J +
    "const u = J(process.argv[1]), g = {}, m = q(u.messung); for (const x of u.groessen || []) g[x.name] = x.ist; console.log(JSON.stringify({ " +
    'fehler: u.fehler, urteil: u.urteil, befehle: g.Befehle, dreiecke: g.Dreiecke, vram: g["VRAM MB"], gpu: q(u.gpu).gpuJeFrameMs, ' +
    "stempel: u.stempel ? u.stempel.urteil : null, eingeschwungen: m.eingeschwungen, last: q(m.stand).loadScale, amMessort: u.amMessort, " +
    "gestellt: u.ortGestellt, geraet: q(u.geraet).schluessel, rot: (u.rot || []).slice(0, 3).map((x) => x.text), probe: p }));";
const PB_GSUM =
    PB_J +
    'const o = J(process.argv[1]); console.log(JSON.stringify({ fehler: typeof o.fehler === "string" ? o.fehler : undefined, urteil: o.urteil, ' +
    "heap: o.heapMB, vram: o.vramMB, min: o.min }));";
const PB_PSUM =
    PB_J +
    "const a = J(process.argv[1]), b = J(process.argv[2]), h = q(q(b.puffer).halter); console.log(JSON.stringify({ fehler: a.fehler || b.fehler, " +
    "zensus: !!b.puffer, vram: [q(a.vram).mb, q(b.vram).mb], heap: [a.heapMB, b.heapMB], ruhend: h.ruhend || 0, verwaist: h.verwaist || 0 }));";

// Die Zeilen des Mess-Gangs beim Namen: ZELLE <sitzung> <zelle> EXIT=<e> {…} · BAND <ort>-<sicht> EXIT=<e> {…} · TORBAU {…} ·
// GANG EXIT=<e> {…} · PUFFER {…}
function pbZeilen(stdout) {
    const o = { zellen: {}, band: {}, sonst: {} };
    const json = (s) => {
        try {
            return JSON.parse(s) || {};
        } catch (_e) {
            return {};
        }
    };
    for (const l of String(stdout || "").split(/\r?\n/)) {
        let m;
        if ((m = /^ZELLE (\d) (\S+) EXIT=(\d+) (\{.*\})$/.exec(l))) (o.zellen[m[2]] = o.zellen[m[2]] || []).push({ ...json(m[4]), n: +m[1], exit: +m[3] });
        else if ((m = /^BAND (\S+) EXIT=(\d+) (\{.*\})$/.exec(l))) o.band[m[1]] = { ...json(m[3]), exit: +m[2] };
        else if ((m = /^(TORBAU|GANG|PUFFER) (?:EXIT=(\d+) )?(\{.*\}|null)$/.exec(l))) o.sonst[m[1].toLowerCase()] = { ...json(m[3]), exit: m[2] == null ? null : +m[2] };
    }
    return o;
}
// Was eine Sitzung einer Zelle ungültig macht — die Schlupflöcher der Soll-Tafel beim Namen: der Lauf brach, blind, Regler nicht
// voll oder gedrosselt, Skala unter 0,75, Tiere gehalten, das Wetter gedreht, die Sicht und der Weg der Zelle (steht ≤ 2 m · geht
// ≥ 3 m/s · Sprint schneller als Gehen und ≥ halbes Sprint-Tempo · Fahrt ≥ 15 m/s · Sturm im Sturm mit 50 Tieren der Bühne)
function pbFehl(name, z) {
    const f = [], p = z.probe || {}, sek = z.sek || 0, weg = Number.isFinite(z.weg) ? z.weg : NaN;
    if (z.fehler) f.push("Lauf brach (" + String(z.fehler).slice(0, 80) + ")");
    if (!(z.frames >= 300)) f.push(z.frames + " Bilder");
    if (z.regler !== "voll") f.push("Regler " + z.regler);
    if (!(z.last >= 0.95)) f.push("gedrosselt (loadScale " + z.last + ")");
    if (!(z.skala >= 0.75)) f.push("Skala " + z.skala + " < 0,75");
    if (p.gehalten !== false) f.push(z.probe ? "Tiere angehalten" : "ohne Probe");
    if (z.wache === "ROT") f.push("Wetter gedreht");
    if (/-steht$/.test(name) && !(weg <= 2)) f.push("Weg " + weg + " m im Stand");
    if (/-(geht|sturm)$/.test(name) && !(weg >= 3 * sek)) f.push("Weg " + weg + " m in " + sek + " s");
    if (/-sprint$/.test(name) && !(p.sprint > p.speed && weg > p.speed * sek && weg >= 0.5 * p.sprint * sek))
        f.push("Sprint-Weg " + weg + " m in " + sek + " s (Gehen " + p.speed + " · Sprint " + p.sprint + " m/s)");
    if (/-fahrt$/.test(name) && !(weg >= 15 * sek)) f.push("Fahrt-Weg " + weg + " m in " + sek + " s");
    if (/-sturm$/.test(name) && !(z.wetter === "stormy" && z.buehne >= 50)) f.push("Sturm: " + z.wetter + " mit " + z.buehne + " Tieren der Bühne");
    const sicht = /-ego-/.test(name) ? "first" : /-third-/.test(name) ? "third" : null;
    if (sicht && p.sicht !== sicht) f.push("Sicht " + p.sicht);
    return f;
}
// DER RICHTER des Mess-Gangs: je Regel { zellen, wort, soll, feld } die Zahl jeder Zelle — der obere Median ihrer 4 Sitzungen —
// gegen das Soll, jede Sitzung gültig; `band`: jede Stand-Zählung je Ort × Sicht im Band (Haushalt, Ratsche, Befehle, Dreiecke,
// VRAM: der Exit des Bands), gpu-bank ≤ 12 ms, eingeschwungen, ungedrosselt, am Messort, Skala, Tiere und Sicht.
function pbRichter(lauf, { regeln = [], band = false }) {
    const t = String(lauf.stdout || "");
    const { ad, hw } = HW(t);
    const { zellen, band: baender } = pbZeilen(t);
    const rot = [], teile = [];
    for (const r of regeln) {
        const werte = r.zellen.map((name) => {
            const zs = zellen[name] || [];
            if (zs.length !== 4) rot.push(name + ": " + zs.length + " von 4 Sitzungen");
            for (const z of zs) {
                const f = pbFehl(name, z);
                if (f.length) rot.push(name + " s" + z.n + ": " + f.join(", "));
            }
            const w = zs.map((z) => r.feld(z)).map((x) => (Number.isFinite(x) ? x : Infinity)).sort((a, b) => a - b);
            const v = w.length ? w[w.length >> 1] : Infinity;
            if (!(v <= r.soll)) rot.push(name + " " + r.wort + " " + v + " > " + r.soll + " (" + w.join("/") + ")");
            return name + " " + v;
        });
        teile.push(r.wort + " ≤ " + r.soll + ": " + werte.join(" · "));
    }
    if (band) {
        const werte = PB_BAND.map((name) => {
            const b = baender[name], p = (b && b.probe) || {}, f = [];
            if (!b) f.push("ungemessen");
            else {
                if (b.exit !== 0 || b.urteil !== "GRUEN") f.push("Band " + (b.urteil || b.fehler) + " " + (b.rot || []).join(" · ").slice(0, 160));
                if (!(b.gpu <= 12)) f.push("gpu-bank " + b.gpu + " ms > 12");
                if (b.eingeschwungen !== true) f.push("nicht eingeschwungen");
                if (!(b.last >= 0.95)) f.push("gedrosselt (loadScale " + b.last + ")");
                if (b.amMessort !== true || (b.gestellt || []).length) f.push("nicht am Messort");
                if (!(p.skala >= 0.75)) f.push("Skala " + p.skala + " < 0,75");
                if (p.gehalten !== false) f.push("Tiere angehalten");
                if (p.sicht !== (/-ego$/.test(name) ? "first" : "third")) f.push("Sicht " + p.sicht);
            }
            if (f.length) rot.push("Band " + name + ": " + f.join(", "));
            return name + " " + (b ? b.befehle + " · " + Math.round(b.dreiecke / 1000) + "k · " + b.vram + " MB · " + b.gpu + " ms" : "?");
        });
        teile.push("Band im Stand (Befehle · Dreiecke · VRAM · gpu-bank): " + werte.join(" | "));
    }
    if (!hw) rot.push("Adapter: " + ad);
    return { gruen: rot.length === 0, zahl: teile.join(" ‖ ") + " · " + ad + (rot.length ? " — ROT " + rot.length + ": " + rot.slice(0, 6).join(" | ") : "") };
}
// DER RICHTER DER AUSDAUER (K5): die ersten und die letzten 5 min an derselben Zelle (Wiese Ego gehend, eingeschwungen), dazwischen
// 2,5 min GT-Fahrt, Bau und Tor, der Gang (`puffer --gang 3`: gehen, GT per Taste E, Mitternacht und Mittag per Spieler-Wort,
// zurück am Start — sein Urteil: VRAM ≤ 2 MB zurück, Heap ≤ 5 MB/min, kein ruhender oder verwaister Puffer); am Ende die
// Puffer-Linse am Start (buf:ruhend = buf:verwaist = 0). Pflicht-Weg ≥ 5 km aus den gemessenen Wegen. Takt und Drossel beim Namen.
function pbAusdauer(lauf) {
    const t = String(lauf.stdout || "");
    const { ad, hw } = HW(t);
    const { zellen, sonst } = pbZeilen(t);
    const teil = ["erste-ego-geht", "lang-fahrt", "letzte-ego-geht"].map((n) => [n, (zellen[n] || [])[0]]);
    const rot = [];
    for (const [n, z] of teil) {
        const f = z ? pbFehl(n, z) : ["fehlt"];
        if (f.length) rot.push(n + ": " + f.join(", "));
    }
    const [a, fa, b] = teil.map(([, z]) => z || {});
    const p95 = (z) => (z.frame ? z.frame.p95 : NaN);
    const faktor = p95(b) / p95(a);
    if (!(faktor <= 1.05)) rot.push("Frame p95 der letzten 5 min " + p95(b) + " > " + p95(a) + " × 1,05");
    const weg = (a.weg || 0) + (fa.weg || 0) + (b.weg || 0);
    if (!(weg >= 5000)) rot.push("Weg " + weg + " m < 5 km");
    const tb = sonst.torbau || {}, g = sonst.gang || {}, pu = sonst.puffer || {};
    if (!(tb.bau === true && tb.tor === true && tb.heim === true)) rot.push("Bau/Tor/heim " + tb.bau + "/" + tb.tor + "/" + tb.heim);
    if (!(g.exit === 0 && Array.isArray(g.urteil) && g.urteil.length === 0)) rot.push("Gang: " + ((g.urteil || []).join(" · ") || g.fehler || "kein Urteil"));
    if (!(pu.zensus === true && pu.ruhend === 0 && pu.verwaist === 0)) rot.push("Puffer am Ende ruhend " + pu.ruhend + " · verwaist " + pu.verwaist + " MB" + (pu.zensus ? "" : " (kein Zensus)"));
    if (!hw) rot.push("Adapter: " + ad);
    const paar = (x, y) => (x == null ? "?" : x) + " → " + (y == null ? "?" : y);
    return {
        gruen: rot.length === 0,
        zahl:
            "Frame p95 erste 5 min " + paar(p95(a), p95(b)) + " ms letzte (×" + faktor.toFixed(3) + ") · Takt p95 " + paar(a.takt, b.takt) +
            " ms · Drossel loadScale " + paar(a.last, b.last) + " · Weg " + (weg / 1000).toFixed(1) + " km · Gang VRAM " + paar(...(g.vram || [])) +
            " MB, Heap " + paar(...(g.heap || [])) + " MB in " + g.min + " min · 20 min VRAM " + paar(...(pu.vram || [])) + " MB · Puffer ruhend " +
            pu.ruhend + " verwaist " + pu.verwaist + " MB · " + ad + (rot.length ? " — ROT " + rot.length + ": " + rot.slice(0, 6).join(" | ") : ""),
    };
}
// Der Richter steht außerhalb der Urteile: sein Abdruck reist im Befehl mit (`: richter <sha1>`) — wer ihn oder die Zellen ändert,
// macht die Messungen alt, wie es die Änderung eines Urteils täte (ohne CR: ein Windows-Klon mit autocrlf hasht dasselbe)
const PB_MARKE =
    ": richter " +
    require("crypto")
        .createHash("sha1")
        .update([pbZeilen, pbFehl, pbRichter, pbAusdauer, PB_STEHT, PB_BEWEGT, PB_BAND].join("|").replace(/\r/g, ""))
        .digest("hex")
        .slice(0, 10) +
    "; ";
const PB_KOPF =
    VOR +
    "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
    'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
    'W() { node scripts/werkbank.cjs "$@"; }; ' +
    "E() { W eval \"$1\" | node -e '" + PB_E + "'; }; " +
    "P() { E '" + PB_PROBE + "'; }; " +
    'U() { W umstellen --ort $1 --sicht $2 > "$D/b$N-u-$1-$2.txt" 2>&1; }; ' +
    'Z() { local z=$1; shift; W lauf "$@" > "$D/b$N-$z.txt" 2>&1; local e=$?; ' +
    "echo \"ZELLE $N $z EXIT=$e $(node -e '" + PB_SUM + "' \"$D/b$N-$z.txt\" \"$(P)\")\"; }; " +
    "BOOT() { raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
    '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
    "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
    '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
    'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
    'grep -m1 "\\[linse-gpu\\]" "$D/b$N-werkbank.log"; ' +
    'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; }; ' +
    "ENDE() { W stop > /dev/null 2>&1; sleep 3; raeum; }; " +
    PB_MARKE;
const PB_LAUF = [
    "bash",
    "-c",
    PB_KOPF +
        "for N in 1 2 3 4; do BOOT; " +
        "U wiese ego; Z wiese-ego-steht 30 --ein 10 --ruhe 120 --regler voll --tiere frei; " +
        "Z wiese-ego-geht 30 --ein 5 --regler voll --tiere frei --wandern bahn; " +
        "E '" + PB_SPRINT + "' > /dev/null; Z wiese-ego-sprint 30 --ein 5 --regler voll --tiere frei; E '" + PB_SPRINT_AUS + "' > /dev/null; " +
        "U wiese ego; Z wiese-fahrt 30 --ein 10 --regler voll --tiere frei --wandern fahrt; " +
        "U wiese third; Z wiese-third-steht 30 --ein 5 --ruhe 60 --regler voll --tiere frei; " +
        "U genesis ego; Z genesis-ego-steht 30 --ein 10 --ruhe 120 --regler voll --tiere frei; " +
        "U genesis third; Z genesis-third-steht 30 --ein 5 --ruhe 60 --regler voll --tiere frei; " +
        "Z genesis-third-geht 30 --ein 5 --regler voll --tiere frei --wandern bahn; " +
        "if [ $N = 1 ]; then for o in wiese genesis dorf; do for s in ego third; do U $o $s; " +
        'W band --ort $o --datei "$D/band-$o-$s.json" > "$D/band-$o-$s.txt" 2>&1; e=$?; ' +
        "echo \"BAND $o-$s EXIT=$e $(node -e '" + PB_BSUM + "' \"$D/band-$o-$s.json\" \"$(P)\")\"; done; done; fi; " +
        "U stadt ego; Z stadt-ego-geht 30 --ein 10 --ruhe 120 --regler voll --tiere frei --wandern bahn; " +
        "U wiese ego; Z wiese-ego-sturm 30 --ein 10 --regler voll --tiere 50 --wetter stormy --wandern bahn; " +
        "ENDE; done; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
];
const PB_AUSDAUER = [
    "bash",
    "-c",
    PB_KOPF +
        "N=1; BOOT; U wiese ego; Z erste-ego-geht 300 --ein 20 --ruhe 120 --regler voll --tiere frei --wandern bahn; " +
        'W puffer --top 400 > "$D/p0.json" 2>&1; ' +
        "Z lang-fahrt 150 --ein 10 --regler voll --tiere frei --wandern fahrt; " +
        "U wiese ego; echo \"TORBAU $(E '" + PB_TORBAU + "')\"; " +
        'U wiese ego; W puffer --gang 3 > "$D/gang.txt" 2>&1; e=$?; ' +
        "echo \"GANG EXIT=$e $(node -e '" + PB_GSUM + "' \"$D/gang.txt\")\"; " +
        "U wiese ego; Z letzte-ego-geht 300 --ein 20 --ruhe 120 --regler voll --tiere frei --wandern bahn; " +
        'W puffer --top 400 > "$D/p1.json" 2>&1; ' +
        "echo \"PUFFER $(node -e '" + PB_PSUM + "' \"$D/p0.json\" \"$D/p1.json\")\"; " +
        "ENDE; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
];

// DIE PROBEN (punkte.cjs selbsttest): die Roh-Ausgabe des Mess-Gangs in der Form, die er druckt, mit Zahlen im Band (die Form
// der Felder aus `lauf`, `band` und der Probe); `zelle(name, n, s)` und `band(name, s)` setzen eine Mutante, `adapter` und
// `sitzungen` den Rahmen. Je Mutante die Stationen, die GRÜN bleiben.
function pbRoh({ zelle = () => {}, band = () => {}, adapter = "[linse-gpu] nvidia/pascal (Probe)", sitzungen = 4 } = {}) {
    const z = [adapter];
    const probe = (sicht) => ({ gehalten: false, sicht, speed: 4.5, sprint: 7.2, skala: 0.75 });
    for (let n = 1; n <= sitzungen; n++) {
        for (const name of [...PB_STEHT, ...PB_BEWEGT]) {
            const steht = PB_STEHT.includes(name);
            const s = {
                regler: "voll", sek: 30, frames: 1790, frame: { p50: 16.6, p95: 16.7, p99: 17.4, max: 33.4 }, takt: steht ? 3.1 : 4.6,
                belegung: steht ? 5.2 : 7.3, pflicht: 0.4, gpu: 10.4, gpuN: 1786, stempel: true, befehle: 158, dreiecke: 512000, vram: 109.6,
                last: 1, skala: 0.75, holz: "voll", wache: "GRUEN", wetter: /sturm/.test(name) ? "stormy" : "sunny",
                weg: steht ? 0 : /fahrt/.test(name) ? 600 : /sprint/.test(name) ? 210 : 120, buehne: /sturm/.test(name) ? 50 : 0,
                probe: probe(/-third-/.test(name) ? "third" : "first"),
            };
            zelle(name, n, s);
            z.push("ZELLE " + n + " " + name + " EXIT=0 " + JSON.stringify(s));
        }
        if (n === 1)
            for (const name of PB_BAND) {
                const s = { exit: 0, urteil: "GRUEN", befehle: 151, dreiecke: 548000, vram: 111.2, gpu: 10.9, stempel: "GRUEN", eingeschwungen: true, last: 1,
                    amMessort: true, gestellt: [], geraet: "gtx", rot: [], probe: probe(/-ego$/.test(name) ? "first" : "third") };
                band(name, s);
                const { exit, ...rest } = s;
                z.push("BAND " + name + " EXIT=" + exit + " " + JSON.stringify(rest));
            }
    }
    return z.join("\n");
}
const PB_MUTANTEN = [
    ["Roh (die Form des Mess-Gangs, Zahlen im Band)", {}, "K1#1 K1#2 K2#1 K2#2 K3#1 K3#2"],
    ["Mutante Regler herunter (Sitzung 2 frei und gedrosselt, das Band gedrosselt)",
        { zelle: (z, n, s) => n === 2 && Object.assign(s, { regler: "frei", last: 0.62 }), band: (b, s) => (s.last = 0.62) }, ""],
    ["Mutante Tiere angehalten (ab Sitzung 2, im Band)", { zelle: (z, n, s) => n > 1 && (s.probe.gehalten = true), band: (b, s) => (s.probe.gehalten = true) }, ""],
    ["Mutante Skala unter 0,75", { zelle: (z, n, s) => ((s.skala = 0.5), (s.probe.skala = 0.5)), band: (b, s) => (s.probe.skala = 0.5) }, ""],
    ["Mutante Stand statt Weg (der Sprint steht)", { zelle: (z, n, s) => z === "wiese-ego-sprint" && (s.weg = 2) }, "K2#1 K3#1"],
    ["Mutante Fahrt Frame p95 34 ms in 3 von 4", { zelle: (z, n, s) => z === "wiese-fahrt" && n < 4 && (s.frame.p95 = 34) }, "K2#1 K2#2 K3#1 K3#2"],
    ["Mutante bewegt Frame p95 25 ms", { zelle: (z, n, s) => PB_BEWEGT.includes(z) && (s.frame.p95 = 25) }, "K1#1 K2#1 K2#2 K3#1 K3#2"],
    ["Mutante Genesis Third steht Belegung 6,3 ms in 3 von 4", { zelle: (z, n, s) => z === "genesis-third-steht" && n > 1 && (s.belegung = 6.3) }, "K1#1 K1#2 K3#1 K3#2"],
    ["Mutante bewegt Belegung 8,6 ms", { zelle: (z, n, s) => PB_BEWEGT.includes(z) && (s.belegung = 8.6) }, "K1#1 K1#2 K2#1 K3#1 K3#2"],
    ["Mutante VRAM in der Fahrt 118,8 MB", { zelle: (z, n, s) => z === "wiese-fahrt" && (s.vram = 118.8) }, "K1#1 K1#2 K2#1 K2#2 K3#1"],
    ["Mutante gpu-bank Genesis Third 12,5 ms", { band: (b, s) => b === "genesis-third" && (s.gpu = 12.5) }, "K1#1 K1#2 K2#1 K2#2"],
    ["Mutante Software-Adapter", { adapter: "[linse-gpu] google/swiftshader" }, ""],
    ["Mutante Sitzung 4 fehlt", { sitzungen: 3 }, "K3#1"],
];
const pbProben = (id) => PB_MUTANTEN.map(([name, o, gruen]) => ({ name, stdout: pbRoh(o), gruen: gruen.split(" ").includes(id) }));
// die Ausdauer: erste und letzte 5 min, Fahrt, Tor und Bau, Gang, Puffer am Ende
function pbRohGang(m = () => {}, adapter = "[linse-gpu] nvidia/pascal (Probe)") {
    const lauf = (sek, weg, p95) => ({ regler: "voll", sek, frames: sek * 59, frame: { p50: 16.6, p95, p99: 17.6, max: 41.2 }, takt: 4.4, belegung: 7.1,
        pflicht: 0.4, gpu: 10.2, gpuN: sek * 59, stempel: true, befehle: 156, dreiecke: 505000, vram: 109.8, last: 1, skala: 0.75, holz: "voll",
        wache: "GRUEN", wetter: "sunny", weg, buehne: 0, probe: { gehalten: false, sicht: "first", speed: 4.5, sprint: 7.2, skala: 0.75 } });
    const t = {
        "erste-ego-geht": lauf(300, 1200, 16.7), "lang-fahrt": lauf(150, 3000, 16.8), "letzte-ego-geht": lauf(300, 1200, 17.0),
        torbau: { bau: true, tor: true, heim: true }, gang: { exit: 0, urteil: [], heap: [312.4, 318.9], vram: [109.8, 110.6], min: 4.1 },
        puffer: { zensus: true, vram: [109.9, 110.4], heap: [305.2, 322.0], ruhend: 0, verwaist: 0 },
    };
    for (const [k, v] of Object.entries(t)) m(k, v);
    const { exit, ...gang } = t.gang;
    return [adapter, "ZELLE 1 erste-ego-geht EXIT=0 " + JSON.stringify(t["erste-ego-geht"]),
        "ZELLE 1 lang-fahrt EXIT=0 " + JSON.stringify(t["lang-fahrt"]), "TORBAU " + JSON.stringify(t.torbau), "GANG EXIT=" + exit + " " + JSON.stringify(gang),
        "ZELLE 1 letzte-ego-geht EXIT=0 " + JSON.stringify(t["letzte-ego-geht"]), "PUFFER " + JSON.stringify(t.puffer)].join("\n");
}
const PB_PROBEN_GANG = [
    ["Roh (die Form des Ausdauer-Gangs)", () => {}, true],
    ["Mutante Regler herunter (die letzten 5 min frei und gedrosselt)", (k, v) => k === "letzte-ego-geht" && Object.assign(v, { regler: "frei", last: 0.62 }), false],
    ["Mutante Tiere angehalten", (k, v) => v.probe && (v.probe.gehalten = true), false],
    ["Mutante Skala unter 0,75", (k, v) => v.probe && ((v.skala = 0.5), (v.probe.skala = 0.5)), false],
    ["Mutante Drift: die letzten 5 min ×1,10", (k, v) => k === "letzte-ego-geht" && (v.frame.p95 = 18.4), false],
    ["Mutante Weg 4,6 km (kürzere Fahrt)", (k, v) => k === "lang-fahrt" && (v.weg = 2250), false],
    ["Mutante Gang VRAM +3,1 MB zurück am Start", (k, v) => k === "gang" && Object.assign(v, { exit: 1, urteil: ["vram: +3.1 MB zurück am Start — buf:szene:baum +3.1 MB"] }), false],
    ["Mutante Puffer verwaist 0,4 MB am Ende", (k, v) => k === "puffer" && (v.verwaist = 0.4), false],
    ["Mutante kein Tor", (k, v) => k === "torbau" && (v.tor = false), false],
    ["Mutante Software-Adapter", () => {}, false, "[linse-gpu] google/swiftshader"],
].map(([name, m, gruen, adapter]) => ({ name, stdout: pbRohGang(m, adapter), gruen }));

module.exports = [
    // ─────────────────────────────── Ankunft K2 · K3 (ankunft-aussen) ───────────────────────────────
    {
        kriterium: "ankunft.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10., `probeAnkunft`, Zwilling von ankunft.K3#1 und pipeline.K4#1/#2): der Schuss aus dem Ausgabe-Pfad bei
        // t(Kontrolle von außen) nach dem kalten Laden (die Herkunft leer im warmen Browser) und derselbe in derselben Pose, wenn die
        // Foundry ruht (höchstens 40 s); Lücke = Anteil der Pixel, die in einem Kanal um mehr als 32 abweichen, dazu der offene
        // Bedarf im Bild in dem Moment (`_weltbildFehlt`, im Blick). Soll: ≤ 2 % und nichts offen an einem Gerät, die Ruhe erreicht
        // (ohne sie verglich die Lücke gegen eine halbe Welt — ROT beim Namen der Frist). Bis 29.10. ein eigener Browser mit 60 s
        // Uhr-Ruhe (8 min Soll). swiftshader (Cloud, ankunft-aussen 202b23be): 7,80 % Lücke, 54 Bäume und Bauten offen im Bild.
        probe: ANKUNFT_PROBE,
        mutiert: true,
        ausnahme: ANKUNFT_AUSNAHME,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const { ad, hw } = HW(String(lauf.stdout || ""));
            if (!j || !j.tK || !j.bild) return { gruen: false, zahl: "kein Bild der Kontrolle (t(Kontrolle) " + (j ? j.tK : "?") + " ms, Exit " + lauf.exit + ") · " + ad };
            const gruen = hw && j.bild.ruhe === true && j.bild.luecke <= 0.02 && j.offen.length === 0;
            return {
                gruen,
                zahl:
                    (100 * j.bild.luecke).toFixed(2) + " % Lücke nach " + j.bild.ruheS + " s " + (j.bild.ruhe ? "bis zur Ruhe der Foundry" : "OHNE Ruhe der Foundry (Frist)") +
                    " · offen im Bild " + (j.offen.join(" · ") || "nichts") + " · t(Kontrolle) kalt " + (j.tK / 1000).toFixed(2) + " s von außen (Eigenmeldung " +
                    (j.weltbildDa / 1000).toFixed(2) + " s) · " + ad,
            };
        },
        pfad: [...ANKUNFT_PFAD, "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/abnahme-urteil.cjs", "save-server.js"],
        quelle: "1 = das Ankunftsbild ist an einem Gerät ganz (≤ 2 % Lücke gegen dieselbe Pose nach 60 s), gemessen von außen",
    },
    {
        kriterium: "ankunft.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10., `probeAnkunft`): nach dem kalten Laden bis zur Ruhe der Foundry (die Platte voll) zwei Zweit-Boots im
        // warmen Browser (der Stand gesichert, die Seite neu), je t(Kontrolle) von außen. Soll: Median ≤ 5 s an einem Gerät. Bis 29.10.
        // ein Kalt-Boot und vier Wiederkehren, je ein frischer Browser-Prozess (12 min Soll) — die Wiederkehr ist jetzt die Seite neu
        // im warmen Prozess (sein Shader- und HTTP-Cache bleiben; ein frischer Prozess ist die Kälte des Session-Starts).
        probe: ANKUNFT_PROBE,
        mutiert: true,
        ausnahme: ANKUNFT_AUSNAHME,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const { ad, hw } = HW(t);
            const w = [...t.matchAll(/t\(Kontrolle\) warm ([\d.]+) s von außen/g)].map((m) => +m[1]).sort((a, b) => a - b);
            if (w.length < 2) return { gruen: false, zahl: w.length + " von 2 Zweit-Boots mit Kontrolle von außen (Exit " + lauf.exit + ") · " + ad };
            const med = (w[(w.length - 1) >> 1] + w[w.length >> 1]) / 2;
            return { gruen: hw && med <= 5, zahl: "warm Median " + med.toFixed(2) + " s (" + w.map((x) => x.toFixed(2)).join(" · ") + ", Zweit-Boot im warmen Browser) · " + ad };
        },
        pfad: [...ANKUNFT_PFAD, "stamm/speicher-*.js", "save-server.js"],
        quelle: "1 = warm ≤ 5 s an einem Gerät",
    },
    // ─────────────────────────────── Streaming K3 (streaming-sprung) ───────────────────────────────
    {
        kriterium: "streaming.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Karte streaming-sprung: je frische Sitzung (save-server + Werkbank --echt, Wiese Ego, Regler des Spielers nach R8)
        // `haenger --wandern sprung --schwelle 50`: mit dem Mess-Fenster steht der Spieler 1 km weiter auf +x am Boden des
        // Gesetzes, gemessen wird die Kadenz, bis die Welt dort steht (`_weltSteht` in Bau-Ereignissen über `__deckel`, nachdem
        // sie einmal nicht stand) + 1 s — hängt sie, bricht der Lauf laut (kein JSON, ROT); jeder
        // Frame > 50 ms steht mit Ursache in b<N>-sprung.out, die Bauten im Haupt-Faden zählt `_syncBauten`. Vor der Karte kennt
        // der Lauf `sprung` nicht (kein Feld `sprung` im JSON): ROT. Soll: Median der Frame-p95 aus 3 Sitzungen ≤ 50 ms, jede mit
        // stehender Welt, Profil und ≥ 30 Bildern, am Adapter einer echten GPU. Cloud headless swiftshader am Kopf cd8a4d2c des Zweigs
        // streaming-sprung (Wiese, 5 Läufe): die Welt steht nach 18,4–22,3 s, CPU-Takt p95 34,5–61 ms, 0 Bauten außerhalb der
        // Sync-Stellen, Frame p95 4,6–7,5 s (Software-GPU, 3–7 Bilder im Fenster) — ROT am Adapter.
        befehl: [
            "bash",
            "-c",
            VOR +
                "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
                'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
                "W() { node scripts/werkbank.cjs \"$@\"; }; " +
                "SUM() { node -e 'try{const j=require(process.argv[1]),s=j.sprung;console.log(JSON.stringify({m:s.m,stehtS:s.stehtS&&+((s.stehtS-s.t0)/1000).toFixed(1),bau:s.bau[1].sonst-s.bau[0].sonst,frames:j.frames,frameMs:j.frameMs,taktMs:j.taktMs,profil:j.profil,ursachen:j.jeUrsache.slice(0,3).map((e)=>e.ursache+\" x\"+e.n)}))}catch(e){console.log(\"{}\")}' \"$1\"; }; " +
                "for N in 1 2 3; do raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
                '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
                "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
                '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
                'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
                'grep -m1 "\\[linse-gpu\\]" "$D/b$N-werkbank.log"; ' +
                'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; ' +
                'W umstellen --ort wiese --sicht ego > "$D/b$N-umstellen.txt" 2>&1; ' +
                'W haenger --regler frei --tiere frei --wandern sprung --schwelle 50 --json "$D/b$N-sprung.json" > "$D/b$N-sprung.out" 2>&1; E=$?; ' +
                'echo "SPRUNG $N EXIT=$E $(SUM "$D/b$N-sprung.json")"; ' +
                "W stop > /dev/null 2>&1; sleep 3; raeum; done; " +
                "rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
        ],
        gpu: true,
        zeit: true,
        minuten: 20,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const s = [];
            for (const m of t.matchAll(/^SPRUNG (\d) EXIT=(\d+) (\{.*\})$/gm)) {
                let b = {};
                try { b = JSON.parse(m[3]); } catch (_e) { b = {}; }
                s.push(b);
            }
            if (s.length !== 3) return { gruen: false, zahl: s.length + " von 3 Sitzungen gemessen (kennt der Lauf --wandern sprung?)" };
            const ok = s.filter((b) => b.m === 1000 && Number.isFinite(b.stehtS) && b.profil === true && b.frames >= 30 && b.frameMs);
            const p95 = s.map((b) => (b.frameMs ? b.frameMs.p95 : Infinity)).sort((x, y) => x - y)[1];
            return {
                gruen: hw && ok.length === 3 && p95 <= 50,
                zahl:
                    "Frame p95 Median " + p95 + " ms (" + s.map((b) => (b.frameMs ? b.frameMs.p95 : "?")).join(" · ") + ") · CPU-Takt p95 " +
                    s.map((b) => (b.taktMs ? b.taktMs.p95 : "?")).join(" · ") + " ms · die Welt steht nach " +
                    s.map((b) => (b.stehtS == null ? "nie" : b.stehtS)).join(" · ") + " s · Bauten sonst " + s.map((b) => b.bau).join("/") +
                    " · " + ok.length + " von 3 gültig · " + (s[0].ursachen || []).join(" | ") + " · " + (ad || "Adapter ungenannt"),
            };
        },
        pfad: [
            "stamm/*.js",
            "*-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "index.html",
            "spec/profiband/haushalt.json",
            "scripts/werkbank.cjs",
            "scripts/lib/haenger-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = beim Teleport um 1 km Frame p95 ≤ 50 ms an einem Gerät",
    },

    // ─────────────────────────────── Streaming K4 · K5 (hydro-faden) ───────────────────────────────
    {
        kriterium: "streaming.K4",
        staffel: 1,
        geraet: "headless",
        // die Faden-Linse (Karte hydro-faden, `--faden`): jede Hydrosphäre und jeder Bau im Haupt-Faden beim Namen des Rufers,
        // die drei Sync-Stellen ausgenommen (Mechanik am Null-Renderer, R3). Vor hydro-faden kennt die Linse `--faden` nicht: ROT.
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const h = /Hydrosphären: (\d+) aus dem Faden · (\d+) im Haupt-Faden/.exec(t);
            const b = /Bauten im Haupt-Faden \(Chunk-Stoff, Guss\): (\d+) an Sync-Stellen und Test-Nähten · (\d+) sonst/.exec(t);
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!h || !b) return { gruen: false, zahl: "keine Faden-Zeile (die Linse kennt --faden nicht?) · Exit " + lauf.exit };
            const gruen = !blind && +h[1] > 0 && +h[2] === 0 && +b[2] === 0;
            return {
                gruen,
                zahl:
                    "Hydrosphären " + h[1] + " aus dem Faden · " + h[2] + " im Haupt-Faden · Bauten " + b[1] +
                    " an Sync-Stellen · " + b[2] + " sonst" + (blind ? " · BLIND " + blind[1] : ""),
            };
        },
        pfad: HYDRO_PFAD,
        quelle:
            "1 = im Spiel 0 synchrone Bauten außerhalb der drei benannten forceSync-Stellen (Fußabdruck, Test-Naht, `_drainDirty`), Kalt-Boot-Rückfälle laut über `_bruchMelden`",
    },
    {
        kriterium: "streaming.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // der Zähler des Spiels selbst (Karte streaming-k4-zaehler): jeder Bau im Haupt-Faden meldet sich am EINEN Melder
        // (`_fadenUmgangen`) — an den Sync-Stellen (fussabdruck · naht · drain) in `_syncBau`, sonst laut im Buch
        // „FADEN-UMGANGEN"; die Faden-Linse liest ihn (`_syncBauten`) im Fenster an der echten GPU nach der Ankunft (kalt),
        // 2 min Gang, einer Minute Fahrt mit sechs Bau-Klicks und dem Damm. Vor der Karte kennt die Linse --echt und den
        // Gang nicht (die Gang-Zeile fehlt): ROT. Die Stau-Zeile (Takt) gehört gelaende.K2 und urteilt hier nicht.
        // Soll: 0 sonst an Radeon und GTX; Cloud-Fenster swiftshader (Xvfb) am Kopf 82bb2353 in 3 von 3 Läufen 0 sonst ·
        // 25 naht (der Damm-Ring der Wasser-Linse), vor dem Nexus-Schnitt 8 Güsse „kreatur" in 1 von 2.
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden", "--echt"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const g = /^ {2}gang +([\d.]+) s/m.exec(t);
            const h = /Hydrosphären: (\d+) aus dem Faden · (\d+) im Haupt-Faden/.exec(t);
            const b = /Bauten im Haupt-Faden \(Chunk-Stoff, Guss\): (\d+) an Sync-Stellen und Test-Nähten · (\d+) sonst ?(\{[^}]*\})?/.exec(t);
            const k = /Bau-Klicks in der Fahrt: (\d+)/.exec(t);
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!g || !h || !b) return { gruen: false, zahl: "keine Gang- oder Faden-Zeile (die Linse kennt --echt nicht?) · Exit " + lauf.exit };
            const gruen = hw && !blind && +h[1] > 0 && +h[2] === 0 && +b[2] === 0 && !!k && +k[1] >= 6;
            return {
                gruen,
                zahl:
                    "Bauten " + b[2] + " außerhalb der Sync-Stellen · " + b[1] + " an ihnen " + (b[3] || "") + " · Hydrosphären " + h[1] +
                    " aus dem Faden · " + h[2] + " im Haupt-Faden · Gang " + g[1] + " s · " + (k ? k[1] : 0) + " Bau-Klicks · " +
                    (ad || "Adapter ungenannt") + (blind ? " · BLIND " + blind[1] : ""),
            };
        },
        pfad: [
            ...HYDRO_PFAD,
            "stamm/dienst.js",
            "stamm/feld-dsl.js",
            "stamm/koerper-leib.js",
            "stamm/kreatur-verhalten.js",
            "stamm/siedlung-satz.js",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = 0 überall, beide Geräte",
    },
    {
        kriterium: "streaming.K5",
        staffel: 1,
        geraet: "headless",
        // das Instrument am Empfang (Faden-Linse): Klon-Bytes je Minute an jedem onmessage, Byte-Summe, eine Minute Fahrt
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const f = /^\s*fahrt\s+([\d.]+) s · ([\d.]+) MB\/min am Empfang/m.exec(t);
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!f) return { gruen: false, zahl: "keine Fahrt-Zeile am Empfang (die Linse kennt --faden nicht?) · Exit " + lauf.exit };
            const gruen = !blind && +f[1] >= 55 && +f[2] <= 5;
            return { gruen, zahl: f[2] + " MB/min am Empfang in " + f[1] + " s Fahrt" + (blind ? " · BLIND " + blind[1] : "") };
        },
        pfad: HYDRO_PFAD,
        quelle: "1 = Klon-MB je Minute am Empfang gemessen und ≤ 5 MB/min in 60 s Fahrt",
    },
    {
        kriterium: "streaming.K5",
        staffel: 2,
        geraet: "headless",
        // dieselbe Linse: ≤ 1 MB/min in der Fahrt, keine Kopie empfangener Bytes in keiner Phase, und ein Speicher-Faden unter
        // den Fäden (speicher-journal: der Save schreibt im Worker) — vor speicher-journal ROT
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const phasen = [...t.matchAll(/^\s*(\S+)\s+([\d.]+) s · ([\d.]+) MB\/min am Empfang: .*· Kopie ([\d.]+) MB/gm)];
            const f = phasen.find((p) => p[1] === "fahrt");
            const faeden = (/Fäden: (.*)/.exec(t) || [])[1] || "";
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!f) return { gruen: false, zahl: "keine Fahrt-Zeile am Empfang (die Linse kennt --faden nicht?) · Exit " + lauf.exit };
            const kopie = phasen.filter((p) => p[1] !== "selbst").reduce((s, p) => s + +p[4], 0);
            const speicher = /speicher/i.test(faeden);
            // f[2] die Dauer der Fahrt, f[3] ihre MB/min (bis streaming-k5 verglich das Urteil die Sekunden mit 1 MB/min)
            const gruen = !blind && +f[2] >= 55 && +f[3] <= 1 && kopie === 0 && speicher;
            return {
                gruen,
                zahl:
                    f[3] + " MB/min in " + f[2] + " s Fahrt · Kopie " + kopie.toFixed(2) + " MB · Speicher-Faden " +
                    (speicher ? "ja" : "nein") + " (Fäden: " + faeden.slice(0, 120) + ")",
            };
        },
        // der Speicher-Faden (speicher-worker.js) steht nur im Zweig speicher-journal — am Kopf trifft sein Glob keine Datei (Wand PFAD)
        pfad: HYDRO_PFAD.concat(["stamm/dienst.js", "stamm/speicher-*.js"]),
        quelle: "2 = ≤ 1 MB/min, 0 Kopien nach dem Empfang, Speichern im Worker",
    },

    // ─────────────────────────────── Profiband K4 (M34 · M39) ───────────────────────────────
    {
        kriterium: "profiband.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // m39.sh der OMEN wörtlich (4 frische Boots, Wiese Ego, Regler frei nach R8): je Boot save-server + Werkbank --echt,
        // `lauf 30 --ein 20 --ruhe 300 --regler frei`, dann `haenger 60 --regler frei --tiere frei --wandern bahn`
        befehl: [
            "bash",
            "-c",
            VOR +
                "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
                'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
                "W() { node scripts/werkbank.cjs \"$@\"; }; " +
                "for N in 1 2 3 4; do raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
                '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
                "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
                '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
                'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
                'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; ' +
                'W umstellen --ort wiese --sicht ego > "$D/b$N-umstellen.txt" 2>&1; ' +
                'W lauf 30 --ein 20 --ruhe 300 --regler frei > "$D/b$N-lauf.txt" 2>&1; ' +
                'W haenger 60 --regler frei --tiere frei --wandern bahn --json "$D/b$N-haenger.json" > "$D/b$N-haenger.out" 2>&1; E=$?; ' +
                'echo "BOOT $N EXIT=$E $(node -e \'try{const j=require(process.argv[1]);console.log(JSON.stringify({frames:j.frames,haengerN:j.haengerN,frameMs:j.frameMs,jeKlasse:j.jeKlasse,profil:j.profil,lauf:j.lauf}))}catch(e){console.log("{}")}\' "$D/b$N-haenger.json")"; ' +
                "W stop > /dev/null 2>&1; sleep 3; raeum; done; " +
                "rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
        ],
        gpu: true,
        zeit: true,
        minuten: 25,
        urteil: (j, lauf) => {
            const boots = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^BOOT (\d) EXIT=(\d+) (\{.*\})$/.exec(l);
                if (m) {
                    let b = {};
                    try { b = JSON.parse(m[3]); } catch (_e) { b = {}; }
                    boots.push({ n: +m[1], exit: +m[2], ...b });
                }
            }
            if (boots.length !== 4) return { gruen: false, zahl: boots.length + " von 4 Boots gemessen" };
            const ok = boots.filter((b) => b.profil === true && b.frames >= 1000 && b.haengerN === 0 && b.lauf && b.lauf.regler === "frei");
            return {
                gruen: ok.length >= 3,
                zahl:
                    ok.length + " von 4 Sitzungen ohne Frame > 100 ms (max " +
                    boots.map((b) => (b.frameMs ? b.frameMs.max : "?")).join(" · ") + " ms; Hänger " +
                    boots.map((b) => (b.haengerN == null ? "?" : b.haengerN)).join("/") + ")",
            };
        },
        pfad: [
            "stamm/*.js",
            "*-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "index.html",
            "spec/profiband/haushalt.json",
            "scripts/werkbank.cjs",
            "scripts/lib/haenger-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = eine Bewegungsart an einem Gerät in ≥ 3 von 4 Sitzungen ohne Frame > 100 ms",
    },
    {
        kriterium: "profiband.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // Der Boot von #1 (4 frische Sitzungen, Wiese Ego, Regler des Spielers nach R8: `haenger` reicht keinen Regler durch,
        // nur `voll` setzte ihn), je Sitzung ZWEI Läufe mit `--schwelle 33` — jeder Frame > 33 ms steht beim Namen, haengerN/frames
        // ist der Anteil, frameMs.max die 100-ms-Grenze. GEHEN: die Bahn, dazu V (echte Taste, cameraToggle) alle 4 s.
        // FAHRT: `--wandern fahrt` (GT, V alle 4 s aus der Werkbank); 30 s nach dem Aufsitzen, also im Mess-Fenster
        // (Einschwingen 10 s, Messen 60 s), E (Aussteigen) und 2 s später E (Einsteigen) über den Spieler-Pfad toggleMountAtPlayer.
        // Ob die Übergänge geschahen, liest `window.__k4` nach dem Lauf (Funktions-Probe 25.10. mit Software-GPU an d43cb61c:
        // V 10× Ego ↔ Third, E aus = null, E ein = werkbank-fahrt). Staffel 2: jede der 4 Sitzungen, beide Läufe, je Gerät.
        befehl: [
            "bash",
            "-c",
            VOR +
                "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
                'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
                "W() { node scripts/werkbank.cjs \"$@\"; }; " +
                "UE() { W eval 'return JSON.stringify(window.__k4 || null)' | node -e 'let s=\"\";process.stdin.on(\"data\",(d)=>(s+=d)).on(\"end\",()=>{try{console.log(JSON.parse(s).ergebnis)}catch(e){console.log(\"null\")}})'; }; " +
                "SUM() { node -e 'try{const j=require(process.argv[1]);console.log(JSON.stringify({frames:j.frames,haengerN:j.haengerN,schwelle:j.schwelle,frameMs:j.frameMs,profil:j.profil,lauf:j.lauf}))}catch(e){console.log(\"{}\")}' \"$1\"; }; " +
                "for N in 1 2 3 4; do raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
                '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
                "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
                '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
                'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
                'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; ' +
                'W umstellen --ort wiese --sicht ego > "$D/b$N-umstellen.txt" 2>&1; ' +
                'W lauf 30 --ein 20 --ruhe 300 --regler frei > "$D/b$N-lauf.txt" 2>&1; ' +
                "W eval '" + K4_GEH + "' > /dev/null 2>&1; " +
                'W haenger 60 --regler frei --tiere frei --wandern bahn --schwelle 33 --json "$D/b$N-geh.json" > "$D/b$N-geh.out" 2>&1; E=$?; ' +
                'echo "BOOT $N GEH EXIT=$E $(SUM "$D/b$N-geh.json") UE $(UE)"; ' +
                "W eval '" + K4_FAHR + "' > /dev/null 2>&1; " +
                'W haenger 60 --regler frei --tiere frei --wandern fahrt --schwelle 33 --json "$D/b$N-fahrt.json" > "$D/b$N-fahrt.out" 2>&1; E=$?; ' +
                'echo "BOOT $N FAHRT EXIT=$E $(SUM "$D/b$N-fahrt.json") UE $(UE)"; ' +
                "W stop > /dev/null 2>&1; sleep 3; raeum; done; " +
                "rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
        ],
        gpu: true,
        zeit: true,
        minuten: 35,
        urteil: (j, lauf) => {
            const laeufe = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^BOOT (\d) (GEH|FAHRT) EXIT=(\d+) (\{.*\}) UE (.*)$/.exec(l);
                if (!m) continue;
                let b = {}, ue = null;
                try { b = JSON.parse(m[4]); } catch (_e) { b = {}; }
                try { ue = JSON.parse(m[5]); } catch (_e) { ue = null; }
                laeufe.push({ n: +m[1], art: m[2], ...b, ue });
            }
            if (laeufe.length !== 8) return { gruen: false, zahl: laeufe.length + " von 8 Läufen (4 Sitzungen × Gehen/Fahrt) gemessen" };
            const anteil = (x) => (x.frames > 0 ? x.haengerN / x.frames : 1);
            const fehl = (x) => {
                const f = [];
                if (!(x.profil === true && x.frames >= 1000 && x.schwelle === 33)) f.push("Lauf blind (" + x.frames + " Frames)");
                if (!(x.lauf && x.lauf.regler === "frei")) f.push("Regler nicht frei");
                if (!(x.frameMs && x.frameMs.max <= 100)) f.push("max " + (x.frameMs ? x.frameMs.max : "?") + " ms");
                if (!(anteil(x) <= 0.01)) f.push((100 * anteil(x)).toFixed(2) + " % > 33 ms");
                const u = x.ue || {};
                if (x.art === "GEH" && !(x.lauf && x.lauf.wandern === "bahn" && u.v >= 10 && (u.modi || []).includes("first") && (u.modi || []).includes("third")))
                    f.push("kein Sicht-Wechsel im Gehen");
                if (x.art === "FAHRT" && !(x.lauf && x.lauf.wandern === "fahrt" && u.wagen === "werkbank-fahrt" && u.aus == null && u.ein === "werkbank-fahrt"))
                    f.push("Aus-/Einsteigen nicht geschehen (" + JSON.stringify(u) + ")");
                return f;
            };
            const rot = laeufe.map((x) => [x, fehl(x)]).filter(([, f]) => f.length);
            const zelle = (x) => "s" + x.n + (x.art === "GEH" ? " geh " : " fahrt ") + (x.frameMs ? x.frameMs.max : "?") + "/" + (100 * anteil(x)).toFixed(2) + " %";
            return {
                gruen: rot.length === 0,
                zahl:
                    (8 - rot.length) + " von 8 Läufen ohne Frame > 100 ms und ≤ 1 % > 33 ms mit Sicht-Wechsel und Einsteigen (max ms/Anteil: " +
                    laeufe.map(zelle).join(" · ") + ")" +
                    (rot.length ? "; ROT " + rot.map(([x, f]) => "s" + x.n + " " + x.art.toLowerCase() + ": " + f.join(", ")).join(" | ").slice(0, 300) : ""),
            };
        },
        pfad: [
            "stamm/*.js",
            "*-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "index.html",
            "spec/profiband/haushalt.json",
            "scripts/werkbank.cjs",
            "scripts/lib/haenger-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = 0 Frames > 100 ms und ≤ 1 % > 33 ms über Gehen und Fahrt (mit Sicht-Wechsel, Einsteigen) an beiden Geräten",
    },

    // ─────────────────────────────── Profiband K1 · K2 · K3 · K5 (w3v-profiband) ───────────────────────────────
    // K1 · K2 · K3 je Staffel: DER MESS-GANG DES BANDS (oben, `PB_LAUF`, ein Lauf je Gerät), geurteilt vom Richter `pbRichter`; K5 der
    // Ausdauer-Gang (`PB_AUSDAUER`, `pbAusdauer`). Vor der Karte trug keines der vier Kriterien eine Station (0 von 8 Punkten).
    {
        kriterium: "profiband.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        // Frame p95 je Bewegungszelle. Vorher (GTX 23.10., `werkbank lauf` von Hand, Zug 1–3): Stadt gehend 58,3 und 49,8 ms, Fahrt
        // 33,3 an der VSync-Kante, Sturm gehend 33,3, Wiese Ego gehend 25,1 — ROT erwartet an Stadt und Fahrt; die Radeon bewegt ungemessen.
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: PB_BEWEGT, wort: "Frame p95", soll: 33, feld: (z) => z.frame && z.frame.p95 }] }),
        pfad: PB_PFAD,
        proben: pbProben("K1#1"),
        quelle: "1 = Frame p95 ≤ 33 ms (der Boden von PFLICHT E) in jeder Bewegungszelle an beiden Geräten",
    },
    {
        kriterium: "profiband.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Messung: ≤ 16,7 ms in jeder Zelle, stehend und bewegt
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "Frame p95", soll: 16.7, feld: (z) => z.frame && z.frame.p95 }] }),
        pfad: PB_PFAD,
        proben: pbProben("K1#2"),
        quelle: "2 = ≤ 16,7 ms in jeder Zelle",
    },
    {
        kriterium: "profiband.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // die Belegung des Haupt-Fadens je Bild (p95 aus der Spur des Laufs) in den vier Stand-Zellen. Vorher (GTX 23.10., Zug 3, Trace):
        // Wiese Ego 5,95/5,93 ms, Genesis Third 7,34/7,29, Dorf 7,10/7,21 — ROT erwartet an Genesis Third
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: PB_STEHT, wort: "Belegung p95", soll: 5.8, feld: (z) => z.belegung }] }),
        pfad: PB_PFAD,
        proben: pbProben("K2#1"),
        quelle: "1 = stehend ≤ 5,8 ms an einem Gerät",
    },
    {
        kriterium: "profiband.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Messung: stehend ≤ 5,8 und in jeder Bewegungszelle ≤ 8 ms. Vorher (Radeon 21.10., M12): Wiese Ego stehend 10,43 ms
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) =>
            pbRichter(lauf, {
                regeln: [
                    { zellen: PB_STEHT, wort: "Belegung p95", soll: 5.8, feld: (z) => z.belegung },
                    { zellen: PB_BEWEGT, wort: "Belegung p95", soll: 8, feld: (z) => z.belegung },
                ],
            }),
        pfad: PB_PFAD,
        proben: pbProben("K2#2"),
        quelle: "2 = stehend ≤ 5,8 UND bewegt ≤ 8 ms an beiden",
    },
    {
        kriterium: "profiband.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        // `werkbank band` je Ort × Sicht (Sitzung 1): der Exit des Bands (Haushalt, Ratsche, Befehle ≤ 208, Dreiecke ≤ 680k, VRAM nach
        // dem Collector ≤ 118 MB, Stempel-Pool), dazu gpu-bank ≤ 12 ms (das Band selbst hält 16,7). Vorher (GTX 23.10., Zug 3): gpu-bank
        // Wiese 12,99 · Dorf 12,45 · Genesis 11,52 ms — ROT erwartet an der GTX; die Radeon ungemessen
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { band: true }),
        pfad: PB_PFAD,
        proben: pbProben("K3#1"),
        quelle: "1 = im Stand an beiden Geräten frisch am Kopf (Ratsche + gpu-bank)",
    },
    {
        kriterium: "profiband.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dazu jede Zelle des Laufs (stehend und bewegt): Befehle p95 ≤ 208, Dreiecke p95 ≤ 680k, VRAM ≤ 118 MB, GPU p95 ≤ 12 ms aus den
        // Pass-Stempeln des Fensters (nur ohne Pool-Überlauf und mit ≥ 100 Stempeln). Vorher: VRAM in der Fahrt 118,8 MB (GTX 23.10.)
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) =>
            pbRichter(lauf, {
                band: true,
                regeln: [
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "Befehle p95", soll: 208, feld: (z) => z.befehle },
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "Dreiecke p95", soll: 680000, feld: (z) => z.dreiecke },
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "VRAM MB", soll: 118, feld: (z) => z.vram },
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "GPU p95", soll: 12, feld: (z) => (z.stempel === true && z.gpuN >= 100 ? z.gpu : NaN) },
                ],
            }),
        pfad: PB_PFAD,
        proben: pbProben("K3#2"),
        quelle: "2 = alle Zellen samt Bewegung",
    },
    {
        kriterium: "profiband.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // der Ausdauer-Gang (oben, `pbAusdauer`): ~25 min am Stück in einer Sitzung — p95 der letzten 5 min ≤ der ersten × 1,05, Gang
        // GRÜN (VRAM ≤ 2 MB zurück am Start, Heap ≤ 5 MB/min, buf:ruhend/verwaist 0), Puffer am Ende 0, Weg ≥ 5 km, Bau und Tor.
        // Vorher (Radeon 21.10., M14, von Hand): VRAM 113,9 → 127,0 MB, Heap 186 → 1 118 MB, p95 16,2 → 42,3 ms unter Fremdlast — ROT
        befehl: PB_AUSDAUER,
        gpu: true,
        zeit: true,
        minuten: 35,
        urteil: (j, lauf) => pbAusdauer(lauf),
        pfad: PB_PFAD,
        proben: PB_PROBEN_GANG,
        quelle: "1 = an einem Gerät",
    },
    {
        kriterium: "profiband.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: PB_AUSDAUER,
        gpu: true,
        zeit: true,
        minuten: 35,
        urteil: (j, lauf) => pbAusdauer(lauf),
        pfad: PB_PFAD,
        proben: PB_PROBEN_GANG,
        quelle: "2 = an beiden",
    },

    // ─────────────────────────────── Klang K1 · K2 · K4 · K5 ───────────────────────────────
    {
        kriterium: "klang.K1",
        staffel: 1,
        geraet: "headless",
        // der Zensus (S)(L)(R), Zweig klang-k1-zensus: Mittag im Stand, je Ort die Mischung des Gesetzes bei mittlerer Böe
        // (daten.<ort>.mixMitte, offline am Abgriff nachgemessen) gegen das SOLL; Ruf ← Leib: an jedem Ort sind die gehörten
        // Vögel die gezeichneten (zensus.leiber), die Mutation `wieseOhneLeib` (das Revier-Gesetz ohne Revier) lässt den Chor
        // schweigen, ein Tier-Ruf ohne Leib der Welt bleibt stumm (Ereignis „tier“). Derselbe Lauf wie klang.K5#1 (Zwilling).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const d = (j && j.daten) || {};
            const orte = ["wiese", "seeufer", "wald", "dorf"];
            if (!orte.every((o) => d[o] && d[o].mixMitte) || !d.wieseOhneLeib)
                return { gruen: false, zahl: "kein Zensus der vier Orte und der Mutation (Exit " + lauf.exit + ")" };
            const db = (o, s) => d[o].mixMitte[s].db;
            // ein Spiel, das keine Leiber meldet, hat keine
            const leib = (z) => z.leiber || { gehoert: 0, gezeichnet: 0 };
            const L = leib(d.wiese.zensus);
            const ohne = d.wieseOhneLeib.zensus;
            const chorOhne = ohne.stimmen.some((v) => v.name === "vogel" && v.an);
            // die Befunde dieses Kriteriums: SOLL, Lab = Welt, Ruf ← Leib, Ort fehlt, der Tier-Ruf ohne Leib
            const rot = (j.rot || []).filter((t) => /^(S|L|R|O)[ :]|^E tier:/.test(t));
            const gruen = rot.length === 0 && L.gehoert > 0 && L.gehoert === L.gezeichnet && leib(ohne).gezeichnet === 0 && !chorOhne;
            const f = (v) => (v > -999 ? v.toFixed(1) : "−∞");
            return {
                gruen,
                zahl:
                    "Wiese wind " + f(db("wiese", "wind")) + " · vogel " + f(db("wiese", "vogel")) + " dB aus " + L.gehoert + " Leibern (" +
                    L.gezeichnet + " gezeichnet), ohne Leib " + (chorOhne ? "SINGT" : "still") + " · Ufer " + f(db("seeufer", "ufer")) +
                    " (wind " + f(db("seeufer", "wind")) + ") · Wald laub " + f(db("wald", "laub")) + " · Dorf glut " + f(db("dorf", "glut")) +
                    (rot.length ? " · " + rot.length + " Befund(e): " + rot.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/siedlung-*.js",
            "stamm/stoff-instanz.js",
            "stamm/feld-leben.js",
            "stamm/dirigent-takt.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "worlds/klang/klang.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "1 = Mittag im Stand: jedes Soll je Ort hält, und jeder Pegel einer Quelle mit Körper (Vogel, Tier) hat einen Körper in der Welt",
    },
    {
        kriterium: "klang.K1",
        staffel: 2,
        geraet: "headless",
        // der Zensus (N), Zweig klang-k1-nacht: zusätzlich zu Staffel 1 die Wiese in vier Szenen, Wetter und Uhr als Wort des
        // Spielers (R9) — nachts (Mitternacht im Sommer: die Grillen aus Nacht × Wärme des Bodens ihrer Röhre × offenem Gras, ihr
        // Ton die Harfe 4,4/4,8 kHz, Band 3,5–5,6 kHz offline nachgemessen; kein Vogel singt), im Regen (das Wort „rainy“: der
        // Regen-Teppich ≥ −34 dB, die Vögel singen nur aus Leibern), gehend (W/S pendelnd, ≥ 10 m) und fahrend (im Sattel des GT,
        // ≥ 30 m): je Szene das Soll und Ruf ← Leib in Bewegung. Unter dieser Linse am Welt-Stand von main 19606f2e ROT: nacht
        // grille −∞ (Luft 10,3 °C < 12); nach der Trägheit −40,1 dB mit Schwerpunkt 2 898 Hz (die rate trug den Ton); am Kopf von
        // klang-k1-nacht −40,1 dB bei 4 606 Hz. Derselbe Lauf wie klang.K1#1 und klang.K5#1 (Zwilling).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const d = (j && j.daten) || {};
            const orte = ["wiese", "seeufer", "wald", "dorf", "nacht", "regen", "gehend", "fahrend"];
            if (!orte.every((o) => d[o] && d[o].mixMitte && d[o].um) || !d.wieseOhneLeib)
                return { gruen: false, zahl: "kein Zensus der Orte, Szenen und der Mutation (Exit " + lauf.exit + ")" };
            const db = (o, s) => d[o].mixMitte[s].db;
            const leib = (o) => d[o].zensus.leiber || { gehoert: 0, gezeichnet: 0 };
            const chorOhne = d.wieseOhneLeib.zensus.stimmen.some((v) => v.name === "vogel" && v.an);
            // die Befunde dieses Kriteriums: SOLL, Lab = Welt, Ruf ← Leib, Ort fehlt, je Szene (N), der Tier-Ruf ohne Leib
            const rot = (j.rot || []).filter((t) => /^(S|L|R|O|N)[ :]|^E tier:/.test(t));
            const szenen = ["nacht", "regen", "gehend", "fahrend"];
            const ruf = ["wiese", ...szenen].every((o) => leib(o).gehoert === leib(o).gezeichnet);
            const bewegt = d.gehend.um.weg >= 10 && !d.gehend.um.sattel && d.fahrend.um.weg >= 30 && d.fahrend.um.sattel;
            const gruen =
                rot.length === 0 && ruf && bewegt && leib("wiese").gehoert > 0 && leib("wieseOhneLeib").gezeichnet === 0 &&
                !chorOhne && db("nacht", "grille") >= -46 && !(db("nacht", "vogel") > -64) && db("regen", "regen") >= -34;
            const f = (v) => (v > -999 ? v.toFixed(1) : "−∞");
            const m = (v) => Math.round(v);
            return {
                gruen,
                zahl:
                    "Nacht grille " + f(db("nacht", "grille")) + " · vogel " + f(db("nacht", "vogel")) + " dB (" + leib("nacht").gehoert +
                    " Leiber) · Regen regen " + f(db("regen", "regen")) + " (wind " + f(db("regen", "wind")) + ", vogel " + f(db("regen", "vogel")) +
                    " aus " + leib("regen").gehoert + " Leibern) · gehend " + m(d.gehend.um.weg) + " m wind " + f(db("gehend", "wind")) + " vogel " +
                    f(db("gehend", "vogel")) + " (" + leib("gehend").gehoert + "/" + leib("gehend").gezeichnet + ") · fahrend " + m(d.fahrend.um.weg) +
                    " m " + (d.fahrend.um.sattel ? "im Sattel" : "ZU FUSS") + " wind " + f(db("fahrend", "wind")) + " vogel " + f(db("fahrend", "vogel")) +
                    " (" + leib("fahrend").gehoert + "/" + leib("fahrend").gezeichnet + ")" +
                    (rot.length ? " · " + rot.length + " Befund(e): " + rot.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "gelaende-core.js",
            "phyto-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/siedlung-*.js",
            "stamm/stoff-*.js",
            "stamm/feld-leben.js",
            "stamm/dirigent-*.js",
            "stamm/bild-himmel.js",
            "stamm/koerper-*.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "worlds/klang/klang.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
        ],
        quelle: "2 = zusätzlich Nacht (Grillen), Regen, gehend und fahrend",
    },
    {
        kriterium: "klang.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M33 (reihe.sh `m33`): m15-wind 60 s an der Mess-Wiese, Ego, Böen frei, Tiere gehalten, Klang per CDP-Klick; Bild =
        // CDP-Screencast (|ΔLuma| im Boden-Ausschnitt je 0,5 s), Ohr = Analyser am Gain der Wind-Stimme
        befehl: ["bash", "-c", HARNESS + 'node "$D/m15-wind.cjs" 60'],
        gpu: true,
        // zeit: der Screencast liefert seine Bilder nur ungestört (27.10., Takt 8 erstmals in Bahnen: neben zwei Bild-Läufen CV Bild
        // 2,16 statt 0,26–0,29 und r 0,00 statt 0,80–0,85 an 607d0c73 · b2c6c627 · 83df2052) — das Urteil hängt an der Wanduhr
        zeit: true,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\{"stand":/);
            if (!z || !z.r0) return { gruen: false, zahl: "keine Wind-Zeile (Exit " + lauf.exit + ")" };
            const an = !!(z.stand && z.stand.enabled && z.stand.ctx === "running");
            // die Mindest-Varianz beider Signale (Schlupfloch „Wind konstant“): Variationskoeffizient ≥ 0,1 je Reihe
            const gruen = an && z.fenster >= 100 && z.r0.r >= 0.6 && z.r0.cvX >= 0.1 && z.r0.cvY >= 0.1;
            return {
                gruen,
                zahl:
                    "r " + z.r0.r.toFixed(2) + " bei Lag 0 (n " + z.r0.n + "), Spitze " + (z.best ? z.best.r.toFixed(2) + " bei " + z.best.lagS + " s" : "?") +
                    ", CV Bild " + z.r0.cvX.toFixed(2) + " / Ohr " + z.r0.cvY.toFixed(2) + ", " + z.fpsVor + " fps, Klang " + (an ? "an" : "AUS"),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/stoff-material.js",
            "stamm/stoff-instanz.js",
            "stamm/daten.js",
            "phyto-core.js",
            "stamm/vegetation-wiese.js",
            "stamm/vegetation-streu.js",
            "spec/profiband/haushalt.json",
            "scripts/lib/band-urteil.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = Wind an einem Gerät: Kreuzkorrelation Luma-Varianz der Halme/Kronen ↔ Pegel des Wind-Busses r ≥ 0,6",
    },
    {
        kriterium: "klang.K2",
        staffel: 2,
        geraet: "headless",
        // Der Lauf (U) der Klang-Linse (`diag-klang-zensus --gesehen`, Zweig kk2-ufer): der Spieler geht im echten Spiel (Ego, W
        // und S gehalten bis zum Ereignis) vom Bach der Mess-Wiese 45 m weg und zurück, derweil spricht er das Wetter (Sturm, dann
        // bewölkt). Je 0,1 s das Ohr — RMS am Gain der Stimmen fluss + ufer und regen — und das Bild: die sichtbare Strömung
        // √Σ adv · flowMix / d² über die Wasser-Vertices im Blick (die Rampe, mit der der Shader die Strähnen über |aFlow| treibt) und
        // die Deckkraft des gezeichneten Regens. Je Paar r bei Lag 0 in 0,5-s-Fenstern (Lag ±3 s wie Staffel 1), CV beider ≥ 0,1
        // (das Schlupfloch „konstant") und nie stumm im Bild (≤ 2 % der Fenster mit Bild ≥ 10 % seiner Spitze ohne Ohr); der
        // Selbsttest friert den Pegel am Ohr ein (Fluss, Ufer, Regen) und muss je Paar ROT fallen. Headless: Ohr und Bild lesen
        // dieselben Größen auf jedem Gerät (Analyser am Graph, Szene, Material) — kein Pixel urteilt, kein GPU-Abgriff.
        // An main b2c6c627 ROT: ufer r 0,69, stumm im Bild 85 von 263 Fenstern (der Hör-Ring verlor den Bach bei 13–14 und
        // 23–27 m); am Kopf von kk2-ufer ufer r 0,89–0,95, stumm 0, regen r 0,99–1,00, Selbsttest ufer r 0,00 / regen r −0,34.
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--gesehen", "--selftest", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const g = j && j.gesehen;
            if (!g || !g.ufer || !g.regen || !j.selbst) return { gruen: false, zahl: "kein Gesehen-Lauf mit Selbsttest (Exit " + lauf.exit + ")" };
            const haelt = (u) => u.r0.n >= 60 && u.r0.r >= 0.6 && u.r0.cvBild >= 0.1 && u.r0.cvOhr >= 0.1 && u.stumm <= 0.02 * u.sicht;
            const feuert = !haelt(j.selbst.ufer) && !haelt(j.selbst.regen);
            const z = (n, u) =>
                n + " r " + u.r0.r.toFixed(2) + " bei Lag 0 (n " + u.r0.n + ", Spitze " + u.best.r.toFixed(2) + " bei " + u.best.lagS + " s, CV Bild " +
                u.r0.cvBild.toFixed(2) + " / Ohr " + u.r0.cvOhr.toFixed(2) + ", stumm " + u.stumm + "/" + u.sicht + ")";
            return {
                gruen: haelt(g.ufer) && haelt(g.regen) && feuert,
                zahl: z("Ufer", g.ufer) + " · " + z("Regen", g.regen) + " · Selbsttest (eingefroren) " + (feuert ? "ROT" : "BLIND"),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-himmel.js",
            "stamm/bild-sicht.js",
            "stamm/daten.js",
            "gelaende-core.js",
            "phyto-core.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "2 = auch Ufer (Pegel ↔ sichtbare Strömung) und Regen, beide Geräte",
    },
    {
        kriterium: "klang.K3",
        staffel: 1,
        geraet: "headless",
        // der Zensus (Ra), Zweig klang-raum: derselbe Tier-Ruf (ein Leib der Welt, `_tierRuf` → Gesetzbuch `tierRuf`) in 3 · 8 ·
        // 20 m und dieselbe Glut (der Bau des Dorfs, die Lage am Ohr durch den Studio-Graphen) in 1,5 · 3 · 6 m; das Ohr dreht sich
        // (die Kamera), die Quelle klingt −90° · +90° · −30° · +30° neben dem Blick, der Master an einem Stereo-OfflineAudioContext.
        // Je Probe ILD = R − L und der Pegel in dB (j.raum.proben). GRÜN: 24 Proben (je Quelle 12), 100 % mit dem Vorzeichen der
        // Seite ≥ 3 dB, der Pegel fällt je Abstands-Stufe ≥ 1 dB, kein Befund „Ra" (dort auch: die Welt hört die Quelle in einem
        // anderen Abstand). Die Mutation „Panner aus" (S15, `--selftest`) ist ROT an Ruf und Glut. Am Kopf von klang-raum 24/24:
        // ±90° ILD ±80 … ±102 dB (die andere Seite schweigt), ±30° ±7,7 dB, tier −23,0 › −31,5 › −39,4 dB, glut −17,7 › −23,7 ›
        // −29,7 dB. Derselbe Lauf wie klang.K1#1 und klang.K5#1 (Zwilling).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const ra = j && j.raum;
            if (!ra || !Array.isArray(ra.proben)) return { gruen: false, zahl: "kein Raum-Teil (Ra) im Zensus (Exit " + lauf.exit + ")" };
            const p = ra.proben
                .map((t) => /^(tier|glut) (-?\d+)° ([\d.]+) m (-?[\d.]+)\/(-?[\d.]+)$/.exec(t))
                .filter(Boolean)
                .map((m) => ({ q: m[1], w: +m[2], d: +m[3], ild: +m[4], db: +m[5] }));
            const richtig = p.filter((x) => x.ild * Math.sign(x.w) >= 3).length;
            // der Pegel fällt mit dem Abstand: je Quelle und Winkel die Abstände aufsteigend
            const faellt = p.every((x) => p.every((y) => y.q !== x.q || y.w !== x.w || !(y.d > x.d) || y.db <= x.db - 1));
            const je = (q) => p.filter((x) => x.q === q).length;
            const rot = (j.rot || []).filter((t) => /^Ra /.test(t));
            const gruen = p.length === 24 && je("tier") === 12 && je("glut") === 12 && richtig === 24 && faellt && rot.length === 0;
            const pegel = (q, w) => p.filter((x) => x.q === q && x.w === w).map((x) => x.d + " m " + x.db.toFixed(1)).join(" › ");
            const ild = (w) => p.filter((x) => x.w === w).map((x) => Math.abs(x.ild)).reduce((a, b) => Math.min(a, b), Infinity);
            return {
                gruen,
                zahl:
                    richtig + "/" + p.length + " Vorzeichen richtig (tier " + je("tier") + ", glut " + je("glut") + ") · |ILD| ≥ " +
                    ild(90).toFixed(1) + " dB bei 90°, ≥ " + ild(30).toFixed(1) + " dB bei 30° · Pegel " + (faellt ? "fällt" : "FÄLLT NICHT") +
                    ": tier " + pegel("tier", 90) + " · glut " + pegel("glut", 90) + " dB" +
                    (rot.length ? " · " + rot.length + " Befund(e): " + rot.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/siedlung-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "1 = Richtung und Entfernung: links/rechts zu 100 % mit richtigem Vorzeichen (ILD/ITD am Stereo-Abgriff)",
    },
    {
        kriterium: "klang.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M15 K4: m15-schritt (je Stoff 10 s Gehen mit W an einem Ort, dessen 12-m-Gangstrecke `_schrittMaterialAt` — das Gesetz des
        // Schritts, bei stehender Boden-Karte — zu ≥ 80 % einen trockenen Stoff nennt; fehlt er an der Wiese, fährt die Probe ferne Kandidaten an,
        // Analyser an jedem Schritt-Gain), dann `--auswerten` je Etikett des Schritts — der Schwerpunkt-Median je Stoff
        // werk: die Ort-Wahl am Gesetz des Schritts mit Fahrt zu fernen Kandidaten (26.10., werkzeug-heil; an main 83df2052 auf der Radeon
        // gras 5648 Hz n 21 · laub 5265 Hz n 23 · quarz 3208 Hz n 21, kleinster Abstand 383 Hz — vorher 2 Stoffe mit ≥ 5 Schritten)
        befehl: ["bash", "-c", HARNESS + ': werk 2610-schritt-gesetz; node "$D/m15-schritt.cjs" && node "$D/m15-schritt.cjs" --auswerten'],
        gpu: true,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const je = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^(\S+) n (\d+) median ([\d.]+) p10 (\S+) p90 (\S+)$/.exec(l.trim());
                if (m && !/^(undefined|null)$/.test(m[1]) && +m[2] >= 5) je.push({ stoff: m[1], n: +m[2], hz: +m[3] });
            }
            if (je.length < 3) return { gruen: false, zahl: je.length + " Stoffe mit ≥ 5 Schritten (Exit " + lauf.exit + ")" };
            let min = Infinity;
            for (let a = 0; a < je.length; a++) for (let b = a + 1; b < je.length; b++) min = Math.min(min, Math.abs(je[a].hz - je[b].hz));
            return {
                gruen: min >= 300,
                zahl: je.map((s) => s.stoff + " " + Math.round(s.hz) + " Hz (n " + s.n + ")").join(" · ") + " — kleinster Abstand " + Math.round(min) + " Hz",
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/koerper-seele.js",
            "stamm/kampf.js",
            "stamm/vegetation-wiese.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "scripts/lib/band-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = am Abgriff gemessen: der Spektral-Schwerpunkt der Schritte je Stoff ≥ 300 Hz verschieden",
    },
    {
        kriterium: "klang.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // EIN Lauf, alle vier Teile: (S) die Schritte je Stoff wie klang.K4#1 (m15-schritt im echten Spiel, Analyser am Schritt-Gain,
        // stdout); (F) der Körper-Teil des Klang-Zensus (`diag-klang-zensus --json`, Port {PORT}+1, j.koerper): je Abgriff liegt der
        // Master-Bus EINEN Klang-Takt lang an einem OfflineAudioContext, die Linse fährt den festen Schritt des Leibs —
        // motor [Upm, Hz] im Sattel des GT mit Gas (der Grundton = die stärkste Linie gegen die Drehzahl klang `fahrtUpm`),
        // landung [h, Aufprall des Leib-Lösers `_sturzTempo`, Landungen, Aufprall des Klangs, dB] für einen Hopser aus 0,2 m und
        // Stürze aus 1 · 2 · 4 · 8 · 12 m, doppler [wo, soll, ist] an sechs Punkten 9 · 4,5 · 2 m vor und hinter dem nächsten Punkt
        // einer Vorbeifahrt (die Periode des Abrollens, c 343 m/s). Urteil, nie weicher als die Staffel: Schritte ≥ 3 Stoffe
        // (n ≥ 5) mit kleinstem Abstand ≥ 300 Hz UND Motor r ≥ 0,9 (≥ 10 Abgriffe) UND Landung genau einmal je Sturz mit dem
        // Aufprall des Leib-Lösers, je Stufe lauter und r(dB, Aufprall) ≥ 0,9, der Hopser stumm UND Doppler: die Radial-
        // Geschwindigkeit am Ohr v = c·(1 − 1/f) über die des Gesetzes, beide Vorzeichen, Steigung durch den Ursprung 1 ± 10 %,
        // r ≥ 0,9, jeder Punkt ± 10 % — dazu kein Befund „F …" der Linse. Der Körper-Teil rechnet am Null-Renderer (das Klang-Gesetz
        // ist CPU), die Schritte tragen die Karte (`[linse-gpu]` aus m15-schritt).
        befehl: [
            "bash",
            "-c",
            HARNESS +
                ': werk 2610-schritt-gesetz; node "$D/m15-schritt.cjs" && node "$D/m15-schritt.cjs" --auswerten; ' +
                'KLANG_ZENSUS_PORT=$(( {PORT} + 1 )) node scripts/diag-klang-zensus.cjs --json "$A" > "$D/zensus.log" 2>&1; ' +
                'echo "zensus EXIT=$?"; grep -F "(F)" "$D/zensus.log"',
        ],
        gpu: true,
        zeit: false,
        minuten: 9,
        urteil: (j, lauf) => {
            const f = (x, n) => (typeof x === "number" && isFinite(x) ? x.toFixed(n) : "—");
            const r = (a, b) => {
                const mu = (v) => v.reduce((s, x) => s + x, 0) / v.length;
                const [ma, mb] = [mu(a), mu(b)];
                const k = (u, mu1, v, mu2) => u.reduce((s, x, i) => s + (x - mu1) * (v[i] - mu2), 0);
                return a.length > 2 ? k(a, ma, b, mb) / Math.sqrt(k(a, ma, a, ma) * k(b, mb, b, mb)) : NaN;
            };
            // (S) die Schritte je Stoff — dasselbe Urteil wie klang.K4#1
            const je = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^(\S+) n (\d+) median ([\d.]+) p10 (\S+) p90 (\S+)$/.exec(l.trim());
                if (m && !/^(undefined|null)$/.test(m[1]) && +m[2] >= 5) je.push({ stoff: m[1], n: +m[2], hz: +m[3] });
            }
            let dHz = je.length >= 3 ? Infinity : NaN;
            for (let a = 0; a < je.length; a++) for (let b = a + 1; b < je.length; b++) dHz = Math.min(dHz, Math.abs(je[a].hz - je[b].hz));
            const schritt = dHz >= 300;
            const F = j && j.koerper;
            if (!F || !Array.isArray(F.motor) || !Array.isArray(F.landung) || !Array.isArray(F.doppler))
                return { gruen: false, zahl: "Schritte " + je.length + " Stoffe, Δ " + f(dHz, 0) + " Hz · kein Körper-Teil (F) im Zensus (Exit " + lauf.exit + ")" };
            // (M) der Motor-Grundton über die Drehzahl
            const M = F.motor.filter((x) => x[0] > 0 && x[1] > 0);
            const rM = r(M.map((x) => x[0]), M.map((x) => x[1]));
            const motor = M.length >= 10 && rM >= 0.9;
            // (L) die Landung mit dem Aufprall des Leib-Lösers
            const fall = F.landung.slice(1);
            const rL = r(fall.map((x) => x[1]), fall.map((x) => x[4]));
            const landung =
                !(F.landung[0] && F.landung[0][2]) &&
                fall.length === 5 &&
                fall.every((x, i) => x[2] === 1 && Math.abs(x[3] - x[1]) <= 1e-3 && (!i || x[4] >= fall[i - 1][4] + 0.5)) &&
                rL >= 0.9;
            const dbJe = fall.length > 1 ? (fall[fall.length - 1][4] - fall[0][4]) / (fall[fall.length - 1][1] - fall[0][1]) : NaN;
            // (D) Doppler proportional zur Radial-Geschwindigkeit: v = c·(1 − 1/f) am Ohr gegen die des Gesetzes
            const D = F.doppler.filter((x) => x[2] > 0);
            const [vs, vi] = [D.map((x) => 343 * (1 - 1 / x[1])), D.map((x) => 343 * (1 - 1 / x[2]))];
            const k = vs.reduce((s, x, i) => s + x * vi[i], 0) / vs.reduce((s, x) => s + x * x, 0);
            const rD = r(vs, vi);
            const doppler =
                D.length === F.doppler.length &&
                D.length >= 6 &&
                vs.some((x) => x > 0) &&
                vs.some((x) => x < 0) &&
                D.every((x) => (x[2] - 1) * (x[1] - 1) > 0 && Math.abs(x[2] - x[1]) <= 0.1 * Math.abs(x[1] - 1)) &&
                Math.abs(k - 1) <= 0.1 &&
                rD >= 0.9;
            const rotF = (j.rot || []).filter((t) => /^F /.test(t));
            return {
                gruen: schritt && motor && landung && doppler && rotF.length === 0,
                zahl:
                    (schritt ? "✅" : "❌") + " Schritte " + je.map((s) => s.stoff + " " + Math.round(s.hz) + " Hz (n " + s.n + ")").join(" · ") +
                    ", kleinster Abstand " + f(dHz, 0) + " Hz · " + (motor ? "✅" : "❌") + " Motor r " + f(rM, 4) + " (" + M.length +
                    " Abgriffe, " + f(M.length ? (M[0][1] / M[0][0]) * 1000 : NaN, 1) + " Hz je 1000 Upm) · " + (landung ? "✅" : "❌") +
                    " Landung " + f(dbJe, 2) + " dB je m/s, r " + f(rL, 4) + " (" + fall.map((x) => x[0] + " m " + f(x[1], 1) + " m/s " + f(x[4], 1) + " dB").join(" · ") +
                    ") · " + (doppler ? "✅" : "❌") + " Doppler Steigung " + f(k, 4) + " r " + f(rD, 4) + " (" +
                    F.doppler.map((x) => x[0] + " m " + f(343 * (1 - 1 / x[1]), 1) + " m/s " + f(x[2], 4) + "/" + f(x[1], 4)).join(" · ") + ")" +
                    (rotF.length ? " · " + rotF.length + " Befund(e): " + rotF.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "vehicle-core.js",
            "koerper-core.js",
            "stamm/klang.js",
            "stamm/koerper-seele.js",
            "stamm/kampf.js",
            "stamm/dirigent-takt.js",
            "stamm/vegetation-wiese.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/band-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
            "spec/profiband/haushalt.json",
        ],
        quelle: "2 = beides, die Landung skaliert mit dem Aufprall, Doppler proportional zur Radialgeschwindigkeit",
    },
    {
        kriterium: "klang.K5",
        staffel: 1,
        geraet: "headless",
        // der Zensus (K): Welt-Abfragen des Klang-Takts vor → nach 4000 fernen Bauten und 200 Fluss-Läufen (Null-Renderer, R3)
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const k = j && j.kosten;
            if (!k || !k.vor || !k.nach || !Array.isArray(k.wachsen))
                return { gruen: false, zahl: "kein Kosten-Teil im Zensus (Exit " + lauf.exit + ")" };
            const arten = Object.keys(k.vor);
            const rotK = (j.rot || []).filter((t) => /^K:/.test(t));
            const gruen = arten.length >= 6 && k.wachsen.length === 0 && rotK.length === 0;
            return {
                gruen,
                zahl:
                    "Welt-Abfragen je Takt vor " + JSON.stringify(k.vor) + " → nach 4000 Bauten + 200 Fluss-Läufen " +
                    JSON.stringify(k.nach) + (k.wachsen.length ? " · wächst: " + k.wachsen.join(", ") : " · nichts wächst"),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/dirigent-takt.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = die Kosten sind an das Hörbare gebunden (gemessen)",
    },
    {
        kriterium: "klang.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // M15 in EINER Linse (Zweig klang-takt-k5): `diag-klang-zensus --takt --echt --minuten 10` — gehen 4 · Fahrt 3 · nachts
        // 3 min an der Uhr des Klangs, Klang-ms je Bild, die Aussetzer am Ausgang über `AudioContext.playbackStats` vor und nach
        // dem Gang (j.aussetzer = { n, still, s }; null = ungezählt, die Linse meldet dann selbst ROT „T aussetzer"); m14-spielgang
        // und die HARNESS fallen für diese Station. An main fehlt der Zähler (ungezählt, ROT).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--takt", "--echt", "--minuten", "10", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: true,
        zeit: true,
        minuten: 15,
        urteil: (j, lauf) => {
            const ph = (j && j.phasen) || {};
            const takt = ["gehen", "fahrt", "nacht"].map((n) => ({ n, p: ph[n] }));
            const a = j && j.aussetzer;
            const gruen =
                lauf.exit === 0 &&
                takt.every((t) => t.p && t.p.bilder >= 600 && t.p.p95 <= 0.2) &&
                !!(ph.fahrt && ph.fahrt.sattel) &&
                !!j && Array.isArray(j.rot) && !j.rot.length &&
                !!a && a.n === 0 && a.s >= 570;
            return {
                gruen,
                zahl:
                    "Klang-Takt p95 " + takt.map((t) => t.n + " " + (t.p ? t.p.p95 : "?")).join(" · ") + " ms · Aussetzer " +
                    (a ? a.n + " in " + a.s + " s Wiedergabe (" + a.still + " s still)" : "ungezählt") + " (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/dirigent-takt.js",
            "stamm/koerper-fahrt.js",
            "stamm/koerper-seele.js",
            "stamm/kreatur-leben.js",
            "stamm/kreatur-verhalten.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/vram-abgriff.cjs",
            "scripts/lib/draw-zaehler.cjs",
        ],
        quelle: "2 = dazu Klang-Takt ≤ 0,2 ms Haupt-Faden p95 in Bewegung und 0 Aussetzer in 10 min Spielgang, beide Geräte",
    },

    // ─────────────────────────────── Speicher K1 · K2 · K3 · K4 · K5 ───────────────────────────────
    {
        kriterium: "speicher.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M37 (m37.sh): echt-k1 20 am Host ohne save-server — 20 harte Tode (taskkill /F /T) am Schreib-Haken idb · fest ·
        // platz, zufällig und im Dorf-Erwachen; Alter des geladenen Stands, halbe Welt (Blöcke und Edits), korrupt
        befehl: ["bash", "-c", ECHT_K1 + '20 punkte; E=$?; cp "$D/echt-k1-punkte.json" "$A" 2>/dev/null; exit $E'],
        gpu: true,
        zeit: true,
        minuten: 10,
        urteil: (j, lauf) => {
            if (!j || !Array.isArray(j.zyklen)) return { gruen: false, zahl: "kein Ergebnis des Tab-Tods (Exit " + lauf.exit + ")" };
            const verfehlt = j.zyklen.filter((z) => z.verfehlt).length;
            // eine Sonde ohne Messung ist ROT (23.10.: carveVoxelSphere hiess nach editform-kern carveVoxel, 20 Zyklen ohne Edit)
            const edits = Math.max(0, ...j.zyklen.map((z) => z.eGeladen || 0));
            if (!(edits > 0)) return { gruen: false, zahl: "Sonde blind: in keinem Zyklus entstand ein Edit" };
            if (j.bauFehler > 0) return { gruen: false, zahl: "Sonde wackelt: der Bauer warf " + j.bauFehler + "-mal (ausser dem Tod)" };
            const oa = ohneAlter(j);
            const gruen = j.tode >= 20 && j.ueber10 === 0 && j.halbe === 0 && j.korrupt === 0 && verfehlt === 0 && j.alterMax <= 10;
            return {
                gruen,
                zahl:
                    j.tode + " Tode: Alter max " + j.alterMax + " s, " + j.ueber10 + " über 10 s · " + j.korrupt + " korrupt · " +
                    j.halbe + " halbe Welten · " + verfehlt + " Haken verfehlt" + (oa.length ? " · ohne Alter " + oa.join(" · ") : ""),
            };
        },
        pfad: SPEICHER_PFAD,
        quelle: "1 = der Browser-Pfad (ohne save-server) besteht den Tab-Tod an einem Gerät: Stand ≤ 10 s alt, 0 korrupt, 0 halbe Welten",
    },
    {
        kriterium: "speicher.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // derselbe Lauf an beiden Geräten; dazu verlangt: Tode mitten im IDB-put und am localStorage-Platz, und der Tod im
        // laufenden Gang des Dorf-Erwachens (hart und am IDB-Schreiben des saveState, der den Gang schließt — be20b015)
        befehl: ["bash", "-c", ECHT_K1 + '20 punkte; E=$?; cp "$D/echt-k1-punkte.json" "$A" 2>/dev/null; exit $E'],
        gpu: true,
        zeit: true,
        minuten: 10,
        urteil: (j, lauf) => {
            if (!j || !Array.isArray(j.zyklen)) return { gruen: false, zahl: "kein Ergebnis des Tab-Tods (Exit " + lauf.exit + ")" };
            const verfehlt = j.zyklen.filter((z) => z.verfehlt).length;
            // eine Sonde ohne Messung ist ROT (23.10.: carveVoxelSphere hiess nach editform-kern carveVoxel, 20 Zyklen ohne Edit)
            const edits = Math.max(0, ...j.zyklen.map((z) => z.eGeladen || 0));
            if (!(edits > 0)) return { gruen: false, zahl: "Sonde blind: in keinem Zyklus entstand ein Edit" };
            if (j.bauFehler > 0) return { gruen: false, zahl: "Sonde wackelt: der Bauer warf " + j.bauFehler + "-mal (ausser dem Tod)" };
            const oa = ohneAlter(j);
            const tode = j.zyklen.filter((z) => z.tod).map((z) => z.tod);
            const gang = j.zyklen.filter((z) => z.erwachen && z.erwachen.gangAktiv).length;
            const arten = ["idb", "platz", "erwachen-hart", "erwachen-idb"].filter((a) => tode.includes(a));
            const gruen =
                j.tode >= 20 && j.ueber10 === 0 && j.halbe === 0 && j.korrupt === 0 && verfehlt === 0 && j.alterMax <= 10 && arten.length === 4 && gang >= 2;
            return {
                gruen,
                zahl:
                    j.tode + " Tode: Alter max " + j.alterMax + " s · " + j.korrupt + " korrupt · " + j.halbe + " halbe · " + verfehlt +
                    " verfehlt · Tod-Arten " + arten.join("/") + " · im laufenden Erwachen " + gang + (oa.length ? " · ohne Alter " + oa.join(" · ") : ""),
            };
        },
        pfad: SPEICHER_PFAD,
        quelle: "2 = an beiden Geräten, auch mitten im IDB- oder localStorage-Schreiben",
    },
    {
        kriterium: "speicher.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M38: derselbe Tab-Tod, 4 Zyklen (davon 2 mit erwachender Zelle): die Hülle um `saveState` zählt die Haupt-Faden-ms je
        // Ruf — die Leck-Probe des Flugschreibers (`_imLeerlauf`) liegt außerhalb der Hülle, ein eigener Posten.
        // DAS URTEIL liest das SPEICHER-BILD (Messung: „Haupt-Faden-ms des Speicher-Bilds“), also die Kosten je Save: p95 der Rufe
        // ≤ 0,3 ms. Das p95 über ALLE Bilder (echt-k1 `jeBild`: die Rufe mit Nullen auf die Bildzahl aufgefüllt) ist per
        // Konstruktion blind — 97 Rufe in 9888 Bildern geben immer 0 —, es steht nur in der Zahl. Ein Ruf ist eine untere Schranke
        // des Speicher-Bilds (zwei Rufe in einem Bild zählen einzeln).
        befehl: ["bash", "-c", ECHT_K1 + '4 k2; E=$?; cp "$D/echt-k1-k2.json" "$A" 2>/dev/null; exit $E'],
        gpu: true,
        zeit: true,
        minuten: 4,
        urteil: (j, lauf) => {
            const s = j && j.saveMs;
            if (!s || !(j.bilder > 0)) return { gruen: false, zahl: "keine Save-Zählung (Exit " + lauf.exit + ")" };
            const gruen = j.bilder >= 1000 && j.saveRufe >= 10 && s.p95 != null && s.p95 <= 0.3;
            return {
                gruen,
                zahl:
                    "je Speicher-Bild (Ruf) p50 " + s.p50 + " / p95 " + s.p95 + " / max " + s.max + " ms (Soll p95 ≤ 0,3; " + j.saveRufe +
                    " Rufe in " + j.bilder + " Bildern; aufgefüllt je Bild p95 " + (j.jeBild ? j.jeBild.p95 : "—") + ", blind)",
            };
        },
        pfad: SPEICHER_PFAD,
        quelle: "1 = ≤ 0,3 ms je Bild (p95) in einer frischen Welt, auf dem Pfad des Spielers",
    },
    {
        kriterium: "speicher.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // speicher-zwei `takt --echt`: Fenster und Karte, der echte Takt mit dem Autosave des Spiels (saveInterval); eine Hülle
        // um jeden Speicher-Schritt des Haupt-Fadens — der Ruf (saveState), das Zusammensetzen (_standNachholen), der Besen
        // (_standFegen), der Versand (schicke) — summiert je Task das SPEICHER-BILD. 20 Stände frisch, dann 10 000 Gruben am
        // Ereignis (der Zustand „nach 2 h mit 10 000 Edits", nie die Wanduhr), wieder 20 Stände. Ein Bild über 16,7 ms (am
        // vsync-Zeitstempel, Toleranz 0,5 ms) trägt das Speichern, wenn es ohne dessen ms darunter bliebe.
        befehl: ["bash", "-c", SPEICHER_ZWEI + 'takt --echt --json "$A"'],
        gpu: true,
        zeit: true,
        minuten: 12,
        urteil: (j, lauf) => {
            const ph = j ? [j.frisch, j.edits] : [];
            if (!ph[0] || !ph[1]) return { gruen: false, zahl: "keine Speicher-Bilder (Exit " + lauf.exit + ")" };
            // eine Sonde ohne Messung ist ROT: kein Stand kam an, oder die Gruben fehlen
            if (ph.some((p) => !(p.staende >= 20 && p.bilder > 0)) || !(j.edits.n >= 10000))
                return { gruen: false, zahl: "Sonde blind: " + ph.map((p) => p.staende + " Stände").join(" / ") + ", " + j.edits.n + " Edits" };
            const zeile = (p) =>
                "p50 " + p.p50 + " / p95 " + p.p95 + " / max " + p.max + " ms (" + p.bilder + " Bilder), " + p.wegen + " von " + p.ueber +
                " Bildern > 16,7 ms durch Speichern";
            return {
                gruen: ph.every((p) => p.p95 <= 0.1 && p.max <= 16.7 && p.wegen === 0),
                zahl: "Speicher-Bild frisch " + zeile(j.frisch) + " · nach " + j.edits.n + " Edits " + zeile(j.edits) + " (Soll p95 ≤ 0,1)",
            };
        },
        pfad: SPEICHER_PFAD.concat(["speicher-faden.js"]),
        quelle: "2 = ≤ 0,1 ms in der frischen Welt UND nach 2 h mit 10 000 Edits, kein Frame > 16,7 ms wegen des Speicherns, beide Geräte",
    },
    {
        kriterium: "speicher.K3",
        staffel: 1,
        geraet: "headless",
        // gate:persistence (D) `--weg`: die frische Welt (der Takt der Orte lebt wie im Spiel) speichert, der Spieler geht 5,1 km in
        // 30 Spielminuten ohne Edit, sie speichert wieder — je Schlüssel des Stands das Δ roh und auf der Platte (der Stand in
        // IndexedDB, sein .bak, das Abbild im localStorage). Geurteilt ohne das Leben (Welt = Seed + Edits + Leben: das Tagebuch,
        // das Gedächtnis des Nexus, die Kreaturen), das je Schlüssel in der Zahl steht; der Selbsttest im selben Gang schmuggelt
        // einen Weg-Zähler in den Stand und MUSS rot an seinem Namen fallen.
        // DER LAUF VON #2 (27.10., Karte lange-stationen): die 1000 Gruben folgen dem Gang, sein Δ (Stand 0 → 1) steht vor ihnen —
        // Zwillinge fahren EINMAL (e7a28b06 headless: #1 20,42 + #2 26,60 min). Statt des Exits (der trüge nun auch das Urteil der
        // Gruben, Staffel 2) liest #1, was sein Exit vorher hieß: seine drei (D)-Zeilen, das Ende des Laufs (die Summen-Zeile) und
        // keinen Fehler der Welt (welt-boot ROT) — der zählt jetzt über den ganzen Lauf, auch über die Gruben: strenger, nie weicher.
        befehl: ["node", "scripts/diag-persistence.cjs", "--weg"],
        env: { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_WEG: "5-30", PERSISTENCE_EDITS: "1000" },
        gpu: false,
        zeit: false,
        minuten: 18,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [teil(/^\s*(✅|❌) \(D\) [\d.]+ km in 30 min ohne Edit/), teil(/^\s*(✅|❌) \(D\) SELBSTTEST/)];
            const voll = teil(/^\s*(✅|❌) \(D\) jeder Stand des Speicher-Fadens/);
            const ende = z.some((x) => /^\d+\/\d+ Persistenz-Invarianten OK\./.test(x)) && !z.some((x) => /^\[welt-boot\] ROT/.test(x));
            if (t.some((x) => !x) || !voll) return { gruen: false, zahl: "Teil (D) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            const km = +/\(D\) ([\d.]+) km/.exec(t[0].l)[1];
            return {
                gruen: t.every((x) => x.ok) && voll.ok && km >= 5 && ende,
                zahl:
                    t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 300)).join(" | ") +
                    (voll.ok ? "" : " | ❌ " + voll.l.replace(/^(✅|❌)\s*/, "").slice(0, 200)) +
                    (ende ? "" : " | ❌ Lauf ohne Ende oder mit Fehlern der Welt (Exit " + lauf.exit + ")"),
            };
        },
        pfad: SPEICHER_PFAD.concat(K3_PFAD),
        quelle: "1 = nach 30 min und 5 km Wanderung ohne Edit Δ ≤ 10 kB gegen die frische Welt",
    },
    {
        kriterium: "speicher.K3",
        staffel: 2,
        geraet: "headless",
        // derselbe Gang, danach 1000 Gruben im 2-m-Raster um den Spieler: Δ roh und auf der Platte (drei Abbilder) dieser Edits
        befehl: ["node", "scripts/diag-persistence.cjs", "--weg"],
        env: { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_WEG: "5-30", PERSISTENCE_EDITS: "1000" },
        gpu: false,
        zeit: false,
        minuten: 18,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [
                teil(/^\s*(✅|❌) \(D\) [\d.]+ km in 30 min ohne Edit/),
                teil(/^\s*(✅|❌) \(D\) 1000 Edits/),
                teil(/^\s*(✅|❌) \(D\) SELBSTTEST/),
            ];
            if (t.some((x) => !x)) return { gruen: false, zahl: "Teil (D) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            const km = +/\(D\) ([\d.]+) km/.exec(t[0].l)[1];
            return {
                gruen: t.every((x) => x.ok) && km >= 5 && lauf.exit === 0,
                zahl: t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 300)).join(" | "),
            };
        },
        pfad: SPEICHER_PFAD.concat(K3_PFAD),
        quelle: "2 = dazu ≤ 100 kB je 1000 Edits, roh und auf der Platte",
    },
    {
        kriterium: "speicher.K4",
        staffel: 1,
        geraet: "headless",
        // gate:persistence aus dem Korpus (spec/speicher-korpus/, je Stand ein echter Boot): (K) das Haus mit Zahlen-id übersteht
        // den Reload mit kaltem Buch, (W) zwei Werke auf der Lichtung,
        // aus (T) die Dichte: nach dem letzten echten Reload steht die Linie der Löcher (> 256 von 300) und kein Stand ist korrupt.
        // Die halbe Welt von (T) urteilt den Tod mitten im Schreiben — das ist Speicher K1 (echt-k1), nicht der Rundlauf; unter
        // Windows meldet (T) sie zudem als Rennen der Linse (taskkill /T erreicht den Baum verzögert, Bericht 2210-messschuld-6cfce).
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: PERSISTENZ_ENV,
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [
                teil(/^\s*(✅|❌) \(K\) Reload mit kaltem Buch/),
                teil(/^\s*(✅|❌) \(K\) Gegenprobe/),
                teil(/^\s*(✅|❌) \(W\) Werke auf der Lichtung/),
            ];
            const tt = z.find((x) => /^\s*(✅|❌) \(T\) Tab-Tod/.test(x)) || "";
            const linie = /Linie (\d+) Löcher/.exec(tt), korrupt = /(\d+) korrupt/.exec(tt);
            if (t.some((x) => !x) || !linie || !korrupt) return { gruen: false, zahl: "Teil (K)/(W)/(T) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            const dichte = +linie[1] > 256 && +korrupt[1] === 0;
            return {
                gruen: t.every((x) => x.ok) && dichte,
                zahl:
                    t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 90)).join(" | ") +
                    " | " + (dichte ? "✅" : "❌") + " Dichte über den Reload: Linie " + linie[1] + " Löcher, " + korrupt[1] + " korrupt",
            };
        },
        pfad: SPEICHER_PFAD.concat(["stamm/studio-bruecke.js", "stamm/vegetation-baum.js", "scripts/diag-persistence.cjs", "spec/speicher-korpus/*"]),
        quelle: "1 = der Zahlen-Rundlauf (Dichte, Bauten) über einen echten Reload ist bewiesen",
    },
    {
        kriterium: "speicher.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // speicher-zwei `bild` (Rezept linse: am Gerät die Karte, ohne Karte das Software-Holz): am Bach der Mess-Wiese
        // (welt-boot uferStellen — das Wasser zeichnet im Blick) setzt der Spieler einen Stein-Block 6 m vor sich und gräbt eine
        // Grube (r 2 m) 9 m vor sich ans Ufer; die Welt steht, die Bühne (Mittag · Sonne · Sommer, das Wetter als Wort, die Uhr
        // gehalten) — Ausgabe-Bild A 320×180. Der Stand ist fest (__stand), die Seite lädt neu (dasselbe Profil: die
        // Wiederkehr), derselbe Ort und Blick, Bild B. diff = Anteil der Pixel mit |ΔLuma| > 8 (von 255); der Pflicht-Inhalt:
        // Bau und Grube stehen vor und nach dem Laden im Stand UND im Blick der Kamera (Third, Neigung −0,5), das Wasser zeichnet.
        // Daneben das RAUSCHEN der Bahn (derselbe Blick ohne Neuladen) und die drei Bilder neben der Ausgabe ({AUS}-vor/-vor2/-nach.png).
        befehl: ["bash", "-c", SPEICHER_ZWEI + 'bild --json "$A"'],
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            if (!j || !(j.diff >= 0)) return { gruen: false, zahl: "kein Bild-Rundlauf (Exit " + lauf.exit + ")" };
            const ganz = (q) => !!q && q.bau && q.grube && q.wasser > 0;
            return {
                gruen: j.diff <= 1 && ganz(j.vor) && ganz(j.nach),
                zahl:
                    "bild-diff " + (+j.diff).toFixed(2) + " % (Soll ≤ 1; Rauschen ohne Neuladen " + (+j.rauschen).toFixed(2) +
                    " %) · Pflicht vor " + JSON.stringify(j.vor) + " · nach " +
                    JSON.stringify(j.nach) + " · " + ((j.adapter && (j.adapter.renderer || j.adapter.vendor)) || "?"),
            };
        },
        pfad: SPEICHER_PFAD.concat([
            "speicher-faden.js",
            "stamm/bild-himmel.js",
            "stamm/wasser-*.js",
            "stamm/studio-bruecke.js",
            "stamm/vegetation-baum.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "scripts/lib/ausgabe-aufnahme.cjs",
        ]),
        quelle: "2 = bild-diff ≤ 1 % an derselben Pose bei festgehaltener Uhr und Wetter, Pflicht-Inhalt (Bauten, Edits, Wasser) im Bild, beide Geräte",
    },
    {
        kriterium: "speicher.K5",
        staffel: 1,
        geraet: "headless",
        // gate:persistence (U) aus dem Korpus: die Stände eines alten Bodens (V18.530–V18.541, vor K16) laden durch den Boot des
        // Spielers auf den neuen (Bauten in ihrer Höhe über Grund, Gruben am Boden), Gegenprobe: die Stände desselben Bodens ziehen nicht um
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: PERSISTENZ_ENV,
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [teil(/^\s*(✅|❌) \(U\) Boden-Umzug/), teil(/^\s*(✅|❌) \(U\) Gegenprobe/)];
            if (t.some((x) => !x)) return { gruen: false, zahl: "Teil (U) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            return { gruen: t.every((x) => x.ok), zahl: t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 140)).join(" | ") };
        },
        pfad: ["stamm/dienst.js", "stamm/speicher-*.js", "stamm/gelaende-boden.js", "stamm/siedlung-satz.js", "gelaende-core.js", "scripts/diag-persistence.cjs", "scripts/lib/welt-boot.cjs", "spec/speicher-korpus/*"],
        quelle: "1 = eine Migrations-Klasse bewiesen",
    },
    {
        kriterium: "speicher.K5",
        staffel: 2,
        geraet: "headless",
        // gate:persistence (V): der Korpus spec/speicher-korpus/ — je Versions-Stufe EIN Stand, den ihre Version selbst schrieb
        // (Bauten, Grabe-Hiebe, Inventar), lädt am Kopf durch den Boot des Spielers ohne Verlust; die Versions-Stufe trägt ihren
        // Stand im Baum (fehlt er, schreibt ihn der Kopf und die Zeile ist ROT, bis er committet ist)
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: PERSISTENZ_ENV,
        gpu: false,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [teil(/^\s*(✅|❌) \(V\) Korpus:/), teil(/^\s*(✅|❌) \(V\) Versions-Stufe/)];
            const n = t[0] && /(\d+) Stände/.exec(t[0].l);
            if (t.some((x) => !x) || !n) return { gruen: false, zahl: "Teil (V) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            return {
                gruen: t.every((x) => x.ok) && +n[1] >= 10,
                zahl: t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 160)).join(" | "),
            };
        },
        pfad: ["stamm/dienst.js", "stamm/speicher-*.js", "stamm/gelaende-boden.js", "stamm/siedlung-satz.js", "stamm/vegetation-baum.js", "gelaende-core.js", "scripts/diag-persistence.cjs", "scripts/lib/welt-boot.cjs", "spec/speicher-korpus/*"],
        quelle: "2 = ein Korpus aus ≥ 10 alten Versionen (aus git gezogen, unter spec/) lädt am Kopf ohne Verlust, der Korpus wächst je Versions-Stufe",
    },
];

// Nicht fassbar: das Werkzeug fehlt. Je Eintrag der Grund beim Namen; diese Staffeln zählen 0, bis eine Linse sie misst.
module.exports.fehlt = [];
