// Stationen der Gruppe VI (src/g6.js, Fundament). Format und Regeln: punkte/punkte.cjs (Kopf).
//
// Erfasst ist jedes g6-Kriterium mit Punkten (klang K2 K4 K5, speicher K4 K5), aus der Messschuld (speicher K1 K2 = M30 M35
// M37 M38, profiband K4 = M34 M39, klang K2 K5 = M33 M15) und aus dem Stau (hydro-faden: streaming K4 K5; speicher-journal:
// speicher K2 K3). Je Kriterium und Staffel steht hier der Befehl, mit dem der Beleg gemessen wurde.
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
// Der Tab-Tod am Pfad des Spielers (statischer Host ohne save-server), Stand M37: Tod im Dorf-Erwachen in Zyklus 1 und 2.
const ECHT_K1 =
    VOR +
    'sed -e "s#C:/Users/micha/Desktop/AnazhRealm-OMEN/koordination#$K#g" -e "s#C:/Users/micha/Desktop/AnazhRealm-OMEN/n2010-b2b#$B#g" ' +
    '"$K/bericht/2310-messschuld-gtx-452972/echt-k1.cjs" > "$D/echt-k1.cjs"; ' +
    'WT="$B" OUT_DIR="$D" ECHT_PORT={PORT} node "$D/echt-k1.cjs" ';

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
    "speicher-worker.js",
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
            const gruen = !blind && +f[2] <= 1 && kopie === 0 && speicher;
            return {
                gruen,
                zahl:
                    f[3] + " MB/min in der Fahrt · Kopie " + kopie.toFixed(2) + " MB · Speicher-Faden " +
                    (speicher ? "ja" : "nein") + " (Fäden: " + faeden.slice(0, 120) + ")",
            };
        },
        pfad: HYDRO_PFAD.concat(["stamm/dienst.js", "stamm/speicher-*.js", "speicher-worker.js"]),
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

    // ─────────────────────────────── Klang K2 · K4 · K5 ───────────────────────────────
    {
        kriterium: "klang.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M33 (reihe.sh `m33`): m15-wind 60 s an der Mess-Wiese, Ego, Böen frei, Tiere gehalten, Klang per CDP-Klick; Bild =
        // CDP-Screencast (|ΔLuma| im Boden-Ausschnitt je 0,5 s), Ohr = Analyser am Gain der Wind-Stimme
        befehl: ["bash", "-c", HARNESS + 'node "$D/m15-wind.cjs" 60'],
        gpu: true,
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
        kriterium: "klang.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M15 K4: m15-schritt (je Stoff 10 s Gehen mit W an einem Ort, den `_terrainMaterialAt` im Umkreis einheitlich nennt,
        // Analyser an jedem Schritt-Gain), dann `--auswerten` je Etikett des Schritts — der Schwerpunkt-Median je Stoff
        befehl: ["bash", "-c", HARNESS + 'node "$D/m15-schritt.cjs" && node "$D/m15-schritt.cjs" --auswerten'],
        gpu: true,
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
        // M15: `diag-klang-zensus --takt --echt` (gehen · Fahrt · nachts, Klang-ms je Bild) und der 10-min-Spielgang der
        // Mess-Bahn (m14-spielgang mit GEH1 4 · FAHRT 3 · GEH2 3 min, `AudioContext.playbackStats.underrunEvents` vorher/nachher)
        befehl: [
            "bash",
            "-c",
            HARNESS +
                'KLANG_ZENSUS_PORT=$(({PORT}+20000)) node scripts/diag-klang-zensus.cjs --takt --echt --json "$A" > "$D/takt.out" 2>&1; ' +
                'echo "TAKT EXIT=$?"; GEH1_MIN=4 FAHRT_MIN=3 GEH2_MIN=3 node "$D/m14-spielgang.cjs"',
        ],
        gpu: true,
        minuten: 22,
        urteil: (j, lauf) => {
            const ph = (j && j.phasen) || {};
            const takt = ["gehen", "fahrt", "nacht"].map((n) => ({ n, p: ph[n] }));
            const taktOk =
                takt.every((t) => t.p && t.p.bilder >= 600 && t.p.p95 <= 0.2) && !!(ph.fahrt && ph.fahrt.sattel) && j && Array.isArray(j.rot) && !j.rot.length;
            const s = jsonZeile(lauf.stdout, /^\{"frame":/);
            const a = s && s.audioA, b = s && s.audioB;
            const zaehlt = !!(a && b && typeof a.underrunEvents === "number" && typeof b.underrunEvents === "number");
            const aus = zaehlt ? b.underrunEvents - a.underrunEvents : null;
            const sek = zaehlt ? b.totalDurationS - a.totalDurationS : 0;
            const gruen = taktOk && zaehlt && aus === 0 && sek >= 570;
            return {
                gruen,
                zahl:
                    "Klang-Takt p95 " + takt.map((t) => t.n + " " + (t.p ? t.p.p95 : "?")).join(" · ") + " ms · Aussetzer " +
                    (zaehlt ? aus + " in " + Math.round(sek) + " s Wiedergabe" : "ungezählt (" + JSON.stringify(a || null).slice(0, 80) + ")"),
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

    // ─────────────────────────────── Speicher K1 · K2 · K4 · K5 ───────────────────────────────
    {
        kriterium: "speicher.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M37 (m37.sh): echt-k1 20 am Host ohne save-server — 20 harte Tode (taskkill /F /T) am Schreib-Haken idb · fest ·
        // platz, zufällig und im Dorf-Erwachen; Alter des geladenen Stands, halbe Welt (Blöcke und Edits), korrupt
        befehl: ["bash", "-c", ECHT_K1 + '20 punkte; E=$?; cp "$D/echt-k1-punkte.json" "$A" 2>/dev/null; exit $E'],
        gpu: true,
        minuten: 10,
        urteil: (j, lauf) => {
            if (!j || !Array.isArray(j.zyklen)) return { gruen: false, zahl: "kein Ergebnis des Tab-Tods (Exit " + lauf.exit + ")" };
            const verfehlt = j.zyklen.filter((z) => z.verfehlt).length;
            const gruen = j.tode >= 20 && j.ueber10 === 0 && j.halbe === 0 && j.korrupt === 0 && verfehlt === 0 && j.alterMax <= 10;
            return {
                gruen,
                zahl:
                    j.tode + " Tode: Alter max " + j.alterMax + " s, " + j.ueber10 + " über 10 s · " + j.korrupt + " korrupt · " +
                    j.halbe + " halbe Welten · " + verfehlt + " Haken verfehlt",
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
        minuten: 10,
        urteil: (j, lauf) => {
            if (!j || !Array.isArray(j.zyklen)) return { gruen: false, zahl: "kein Ergebnis des Tab-Tods (Exit " + lauf.exit + ")" };
            const verfehlt = j.zyklen.filter((z) => z.verfehlt).length;
            const tode = j.zyklen.filter((z) => z.tod).map((z) => z.tod);
            const gang = j.zyklen.filter((z) => z.erwachen && z.erwachen.gangAktiv).length;
            const arten = ["idb", "platz", "erwachen-hart", "erwachen-idb"].filter((a) => tode.includes(a));
            const gruen =
                j.tode >= 20 && j.ueber10 === 0 && j.halbe === 0 && j.korrupt === 0 && verfehlt === 0 && j.alterMax <= 10 && arten.length === 4 && gang >= 2;
            return {
                gruen,
                zahl:
                    j.tode + " Tode: Alter max " + j.alterMax + " s · " + j.korrupt + " korrupt · " + j.halbe + " halbe · " + verfehlt +
                    " verfehlt · Tod-Arten " + arten.join("/") + " · im laufenden Erwachen " + gang,
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
        // Ruf, Σ je rAF-Bild p95 — die Leck-Probe des Flugschreibers (`_imLeerlauf`) liegt außerhalb der Hülle, ein eigener Posten
        befehl: ["bash", "-c", ECHT_K1 + '4 k2; E=$?; cp "$D/echt-k1-k2.json" "$A" 2>/dev/null; exit $E'],
        gpu: true,
        minuten: 4,
        urteil: (j, lauf) => {
            const b = j && j.jeBild;
            if (!b || !(j.bilder > 0)) return { gruen: false, zahl: "keine Bild-Zählung (Exit " + lauf.exit + ")" };
            const gruen = j.bilder >= 1000 && j.saveRufe >= 10 && b.p95 != null && b.p95 <= 0.3;
            return {
                gruen,
                zahl:
                    "je Bild p95 " + b.p95 + " / p99 " + b.p99 + " ms (" + j.bilder + " Bilder, " + j.saveRufe + " Rufe); je Ruf p50 " +
                    j.saveMs.p50 + " / p95 " + j.saveMs.p95 + " / max " + j.saveMs.max + " ms",
            };
        },
        pfad: SPEICHER_PFAD,
        quelle: "1 = ≤ 0,3 ms je Bild (p95) in einer frischen Welt, auf dem Pfad des Spielers",
    },
    {
        kriterium: "speicher.K4",
        staffel: 1,
        geraet: "headless",
        // gate:persistence: (K) das Haus mit Zahlen-id übersteht den Reload mit kaltem Buch, (W) zwei Werke auf der Lichtung,
        // aus (T) die Dichte: nach dem letzten echten Reload steht die Linie der Löcher (> 256 von 300) und kein Stand ist korrupt.
        // Die halbe Welt von (T) urteilt den Tod mitten im Schreiben — das ist Speicher K1 (echt-k1), nicht der Rundlauf; unter
        // Windows meldet (T) sie zudem als Rennen der Linse (taskkill /T erreicht den Baum verzögert, Bericht 2210-messschuld-6cfce).
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_SERVER_PORT: "2{PORT}" },
        gpu: false,
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
        pfad: SPEICHER_PFAD.concat(["stamm/studio-bruecke.js", "stamm/vegetation-baum.js", "scripts/diag-persistence.cjs"]),
        quelle: "1 = der Zahlen-Rundlauf (Dichte, Bauten) über einen echten Reload ist bewiesen",
    },
    {
        kriterium: "speicher.K5",
        staffel: 1,
        geraet: "headless",
        // gate:persistence (U): der Save eines alten Bodens lädt durch `loadState` auf den neuen (Bauten in Fuß-Höhe),
        // Gegenprobe: ein Save desselben Bodens zieht nicht um
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_SERVER_PORT: "2{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [teil(/^\s*(✅|❌) \(U\) Boden-Umzug/), teil(/^\s*(✅|❌) \(U\) Gegenprobe/)];
            if (t.some((x) => !x)) return { gruen: false, zahl: "Teil (U) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            return { gruen: t.every((x) => x.ok), zahl: t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 140)).join(" | ") };
        },
        pfad: ["stamm/dienst.js", "stamm/speicher-*.js", "stamm/gelaende-boden.js", "stamm/siedlung-satz.js", "gelaende-core.js", "scripts/diag-persistence.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = eine Migrations-Klasse bewiesen",
    },
];

// Nicht fassbar: das Werkzeug fehlt. Je Eintrag der Grund beim Namen; diese Staffeln zählen 0, bis eine Linse sie misst.
module.exports.fehlt = [
    {
        kriterium: "klang.K2",
        staffel: 2,
        befehl: null,
        grund: "m15-wind greift nur den Wind-Bus an der Wiese ab; keine Linse korreliert den Ufer-Pegel mit der sichtbaren Strömung oder den Regen-Pegel mit dem Regen-Bild",
    },
    {
        kriterium: "klang.K4",
        staffel: 2,
        befehl: null,
        grund: "m15-schritt misst nur die Schritte je Stoff; kein Abgriff am Motor über die Drehzahl (klang-core FAHRT), an der Landung nach Aufprall und am Doppler einer Vorbeifahrt",
    },
    {
        kriterium: "profiband.K4",
        staffel: 2,
        befehl: null,
        grund: "`werkbank haenger` kennt nur `--wandern bahn` (Gehen); keine Linse fährt Gehen und Fahrt mit Sicht-Wechsel und Einsteigen und zählt den Anteil der Frames > 33 ms (die Fahrt-Bahn fahrt.js der Züge misst Perzentile, keine Hänger beim Namen)",
    },
    {
        kriterium: "speicher.K2",
        staffel: 2,
        befehl: null,
        grund: "kein Werkzeug fährt 2 h Spiel mit 10 000 Edits und ordnet Frames > 16,7 ms dem Speichern zu; echt-k1 misst nur die frische Welt",
    },
    {
        kriterium: "speicher.K3",
        staffel: 1,
        befehl: null,
        grund: "die Station speichern fehlt: keine Linse wandert 30 min und 5 km ohne Edit und misst die Größe des Stands roh gegen die frische Welt (speicher-journal bringt das Journal, nicht die Messung)",
    },
    {
        kriterium: "speicher.K3",
        staffel: 2,
        befehl: null,
        grund: "wie Staffel 1, dazu fehlt die Größe je 1000 Edits roh und auf der Platte",
    },
    {
        kriterium: "speicher.K4",
        staffel: 2,
        befehl: null,
        grund: "m16-k2k4 (bild-diff 6,75 % am 21.10., Radeon) setzt Bau und Edit, bringt aber kein Wasser sicher ins Bild: der Pflicht-Inhalt der Staffel (Bauten, Edits, Wasser) ist im Urteil nicht prüfbar",
    },
    {
        kriterium: "speicher.K5",
        staffel: 2,
        befehl: null,
        grund: "kein Korpus alter Stände unter spec/ und kein Korpus-Lauf; (U) beweist nur den Boden-Umzug",
    },
    {
        kriterium: "streaming.K4",
        staffel: 2,
        befehl: null,
        grund: "die Faden-Linse (`diag-worker-dichte --faden`, Zweig hydro-faden) läuft nur am Null-Renderer; keine Zählung synchroner Bauten im echten Spiel an Radeon und GTX",
    },
];
