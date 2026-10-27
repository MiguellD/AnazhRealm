// Stationen der Gruppe VI (src/g6.js, Fundament). Format und Regeln: punkte/punkte.cjs (Kopf).
//
// Erfasst ist jedes g6-Kriterium mit Punkten (klang K2 K4 K5, speicher K4 K5), aus der Messschuld (speicher K1 K2 = M30 M35
// M37 M38, profiband K4 = M34 M39, klang K2 K5 = M33 M15) und aus dem Stau (hydro-faden: streaming K4 K5; speicher-journal:
// speicher K2 K3), dazu aus einer Karte (klang-k1-zensus: klang K1). Je Kriterium und Staffel steht hier der Befehl, mit dem
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

module.exports = [
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
        kriterium: "klang.K2",
        staffel: 1,
        kanarie: true,
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
module.exports.fehlt = [
    {
        kriterium: "klang.K4",
        staffel: 2,
        befehl: null,
        grund: "m15-schritt misst nur die Schritte je Stoff; kein Abgriff am Motor über die Drehzahl (klang-core FAHRT), an der Landung nach Aufprall und am Doppler einer Vorbeifahrt",
    },
    {
        kriterium: "speicher.K2",
        staffel: 2,
        befehl: null,
        grund: "kein Werkzeug fährt 2 h Spiel mit 10 000 Edits und ordnet Frames > 16,7 ms dem Speichern zu; echt-k1 misst nur die frische Welt",
    },
    {
        kriterium: "speicher.K4",
        staffel: 2,
        befehl: null,
        grund: "m16-k2k4 (bild-diff 6,75 % am 21.10., Radeon) setzt Bau und Edit, bringt aber kein Wasser sicher ins Bild: der Pflicht-Inhalt der Staffel (Bauten, Edits, Wasser) ist im Urteil nicht prüfbar",
    },
    {
        kriterium: "streaming.K4",
        staffel: 2,
        befehl: null,
        grund: "die Faden-Linse (`diag-worker-dichte --faden`, Zweig hydro-faden) läuft nur am Null-Renderer; keine Zählung synchroner Bauten im echten Spiel an Radeon und GTX",
    },
];
