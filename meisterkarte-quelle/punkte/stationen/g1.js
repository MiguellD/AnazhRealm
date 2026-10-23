// Stationen der Gruppe I (src/g1.js): je Kriterium und Staffel EINE Station — Befehl im Spiel-Baum am SHA, Urteil über
// seine Ausgabe, Pfad für R6. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst ist jedes Kriterium der Gruppe mit Punkten (gelaende K1–K5, wetter K1 K2 K5, physik K1 K2, feld K2 K3; physik K2
// ist zugleich das Ziel des Zweigs kontakt-tempo). Die Messschuld M30–M43 trägt kein Kriterium der Gruppe I.
// Was kein Werkzeug im Spiel-Baum misst, steht NICHT in der Liste (der Läufer verlangt ein argv), sondern in
// `module.exports.fehlt` mit befehl: null und dem Grund — das Kriterium bleibt dort Hand-Buchung, bis das Werkzeug steht.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");

// gelaende.K5: K8 der Linse diag-koerper-stand in BEIDEN Sichten. Die Linse setzt die Sicht nicht selbst; die Mess-Kopie
// (wie koordination bericht/2210-radeon-beweise k8-sicht.diff) setzt sie vor der Wiese und schreibt die gesetzte Sicht
// mit (`__sicht`), je Sicht ein Lauf, das Ergebnis beider in {AUS}. Läuft im Spiel-Baum (cwd), die Kopie wird gelöscht.
function k8Sichten() {
    const fs = require("fs");
    const cp = require("child_process");
    const aus = process.argv[1];
    const quelle = fs.readFileSync("scripts/diag-koerper-stand.cjs", "utf8");
    const anker = "const W = window.__messWiese;";
    if (quelle.split(anker).length !== 2) {
        console.log("K8-SICHT: Anker fehlt in scripts/diag-koerper-stand.cjs");
        process.exit(3);
    }
    const erg = {};
    for (const sicht of ["first", "third"]) {
        const kopie = "scripts/.k8-" + sicht + ".cjs";
        fs.writeFileSync(kopie, quelle.replace(anker, 'r.setCameraMode("' + sicht + '"); o.__sicht = s.cameraMode; ' + anker));
        const jd = aus + "." + sicht + ".json";
        const p = cp.spawnSync(process.execPath, [kopie, "--k8"], {
            env: Object.assign({}, process.env, { KOERPER_STAND_JSON: jd }),
            encoding: "utf8",
            maxBuffer: 1 << 26,
        });
        fs.rmSync(kopie, { force: true });
        process.stdout.write("== SICHT " + sicht + " EXIT " + p.status + "\n" + (p.stdout || ""));
        process.stderr.write(p.stderr || "");
        let k8 = null;
        try {
            k8 = JSON.parse(fs.readFileSync(jd, "utf8")).k8;
        } catch (_e) {}
        erg[sicht] = { exit: p.status, k8 };
    }
    fs.writeFileSync(aus, JSON.stringify(erg));
}
const K8_PFAD = [
    "stamm/koerper-*.js",
    "stamm/kreatur-*.js",
    "stamm/gelaende-*.js",
    "stamm/wasser-*.js",
    "stamm/vegetation-*.js",
    "stamm/stoff-*.js",
    "stamm/studio-*.js",
    "stamm/dirigent-*.js",
    "stamm/daten.js",
    "gelaende-core.js",
    "koerper-core.js",
    "vehicle-core.js",
    "tetrapoda-core.js",
    "phyto-core.js",
    "foundry-core.js",
    "foundry-bruecke.js",
    "voxel-worker.js",
    "spec/profiband/haushalt.json",
    "scripts/diag-koerper-stand.cjs",
    "scripts/lib/welt-boot.cjs",
    "scripts/lib/welt-orte.cjs",
];
// das Urteil über beide Sichten: je Ort × Rolle das schlechtere p95 der Sichten
const K8_KONTAKT = ["streu", "huf", "rad"]; // der Fuß des Spielers zählt Leib K2, die Feinform ist keine Rolle
function k8Lesen(j) {
    if (!j || !j.first || !j.third) return { fehler: "kein Ergebnis beider Sichten" };
    for (const s of ["first", "third"]) {
        const k = j[s].k8;
        if (!k || !k.wiese || !k.hang) return { fehler: "Sicht " + s + ": K8 ohne Wiese oder Hang (Exit " + j[s].exit + ")" };
        if (k.__sicht !== s) return { fehler: "Sicht " + s + " nicht gesetzt (die Welt trug " + k.__sicht + ")" };
    }
    const p = (ort, rolle) => {
        const a = j.first.k8[ort][rolle];
        const b = j.third.k8[ort][rolle];
        if (!a || !b || !(a.n >= (rolle === "streu" ? 100 : 200)) || !(b.n >= (rolle === "streu" ? 100 : 200))) return null;
        return Math.max(a.p95, b.p95);
    };
    return { p };
}
const k8Zahl = (p) =>
    ["wiese", "hang"]
        .map((o) => o + " " + ["fein", ...K8_KONTAKT].map((r) => r + " " + (p(o, r) == null ? "?" : p(o, r))).join(" · "))
        .join(" | ") + " cm (p95, schlechtere Sicht)";

module.exports = [
    // ── gelaende.K1 ──
    {
        kriterium: "gelaende.K1",
        staffel: 1,
        geraet: "headless",
        // die Studio-Probe (gate:gelaende-studio): jeder Regler über das Panel, Export, Welt-Tür, Reload — der Makro-Abdruck
        // 64×64 und die Statistik des Kerns Studio = Welt; der Selbsttest sieht einen verstellten Schritt (nicht vakuös)
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--studio", "--selftest", "--json", "{AUS}"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            if (!j) return { gruen: false, zahl: "kein JSON der Studio-Probe (Exit " + lauf.exit + ")" };
            const w = j.welt || {};
            const s = j.studio || {};
            const sha = !!w.makroSha && w.makroSha === s.makroSha;
            const stat = w.statistik != null && JSON.stringify(w.statistik) === JSON.stringify(s.statistik);
            const st = j.selbsttest || {};
            const regler = Array.isArray(j.regler) ? j.regler : [];
            const tot = regler.filter((r) => !r.wirkt).length;
            const gruen =
                lauf.exit === 0 &&
                /STUDIO-PROBE GRÜN/.test(lauf.stdout) &&
                sha &&
                stat &&
                st.sieht === true &&
                regler.length > 0 &&
                tot === 0 &&
                !(j.befunde || []).length;
            return {
                gruen,
                zahl:
                    "Welt = Studio " + (sha ? "byte-gleich" : "NEIN") + " (Makro " + String(w.makroSha || "?").slice(0, 16) +
                    "), Statistik " + (stat ? "gleich" : "NEIN") + ", " + regler.length + " Regler, tot " + tot +
                    ", Selbsttest " + (st.sieht === true ? "sieht" : "blind"),
            };
        },
        pfad: [
            "gelaende-core.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/studio-*.js",
            "stamm/speicher-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "worlds/gelaende/**",
            "worlds/huelle/**",
            "index.html",
            "voxel-worker.js",
            "scripts/diag-worker-dichte.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = die 2D-Form (hoehe, flussLaeufe) ist EINE Quelle, Studio-Plan = Welt byte-gleich",
    },

    // ── gelaende.K2 ── M31: das Graben-Bild über die echte Eingabe (CDP-Klick, Verb graben) im Spiel-Loop, Third, am Fluss
    // nächst Genesis, 5 Saaten × Graben 1 m und 3 m jenseits der Krone; je präsentiertem Bild die gezeichneten Wasser-Flächen
    // über ±4,5 m. HARNESS-STATION: das Mess-Bahn-Skript m2-graben.cjs (koordination bericht/2210-messschuld-6cfce/skripte,
    // eingefroren) zeigt per sed auf den Spiel-Baum am SHA, der save-server läuft auf {PORT} (wie g6 klang.K2).
    {
        kriterium: "gelaende.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            `set -u; B=$(cygpath -m '{BAUM}'); K=$(cygpath -m '{KOORD}'); A=$(cygpath -m '{AUS}'); D="\${A%.json}-werk"; rm -rf "$D"; mkdir -p "$D/roh"; cp -r "$K/bericht/2210-messschuld-6cfce/skripte/." "$D/"; sed -i -e "s#C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-6cfce#$B#g" -e "s#C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination#$K#g" "$D"/*.cjs; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; (PORT={PORT} node save-server.js > "$D/save.log" 2>&1 < /dev/null &); for t in $(seq 1 60); do curl -s -o /dev/null http://localhost:{PORT}/ && break; sleep 1; done; export SPIEL_URL=http://localhost:{PORT}; node "$D/m2-graben.cjs"; E=$?; cp "$D/roh/m2-graben.json" "$A" 2>/dev/null; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; exit $E`,
        ],
        gpu: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const g = (j && Array.isArray(j.graeben) ? j.graeben : []).filter((x) => x.verb === "graben");
            if (!g.length) return { gruen: false, zahl: "kein Graben über das Verb graben (Exit " + lauf.exit + ")" };
            // gefüllt zählt, wo neues Wasser entsteht; ein 3-m-Graben, der den 1-m-Graben überlappt, ist nicht getrennt urteilbar
            const neu = g.filter((x) => x.nassEnde > x.nassVor);
            const doppelt = Math.max(...g.map((x) => x.doppeltMax));
            const ueber = Math.max(...g.map((x) => x.ueberMax));
            const leer = g.filter((x) => !(x.bilder > 0)).length;
            const langsam = neu.filter((x) => !(x.gefuelltMs != null && x.gefuelltMs <= 2000));
            const je = (a) => neu.filter((x) => x.abstand === a && x.gefuelltMs != null && x.gefuelltMs <= 2000).length;
            const bilder = g.reduce((s, x) => s + (x.bilder || 0), 0);
            const ms = neu.map((x) => x.gefuelltMs).filter((v) => v != null);
            const gruen =
                lauf.exit === 0 && g.length >= 8 && doppelt === 0 && ueber === 0 && leer === 0 && langsam.length === 0 && je(1) >= 1 && je(3) >= 1;
            return {
                gruen,
                zahl:
                    g.length + " von " + j.graeben.length + " Gräben über das Verb, in " + bilder + " Bildern doppelt " + doppelt + " und über dem Spiegel " +
                    ueber + ", gefüllt nach " + (ms.length ? Math.min(...ms) + "–" + Math.max(...ms) + " ms" : "?") + " (1 m " + je(1) + ", 3 m " + je(3) +
                    (langsam.length ? ", " + langsam.length + " nicht ≤ 2 s" : "") + ")",
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/werkstatt-*.js",
            "stamm/koerper-*.js",
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "index.html",
            "save-server.js",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = (a) im Ausgabe-Bild an einem Gerät",
    },

    // ── gelaende.K3 ── M1: spiegelTreue an der Ego-Pose des Spiels am See (Ufer 1866,6/−6193,9, Gier −1,309, Neigung 0),
    // die Kamera aus dem Spiel (state.camera nach `_loopCamera`), geschossen mit `bild --wahl 0` in 1920×1080 aus dem
    // Ausgabe-Pfad (werkbank start --echt gegen den eigenen save-server auf {PORT}, die Werkbank auf {PORT} + 20000)
    {
        kriterium: "gelaende.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            `set -u; A=$(cygpath -m '{AUS}'); D="\${A%.json}-werk"; rm -rf "$D"; mkdir -p "$D"; SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; W() { node scripts/werkbank.cjs "$@"; }; raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; (PORT=$SP node save-server.js > "$D/save.log" 2>&1 < /dev/null &); for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; (node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP > "$D/werkbank.log" 2>&1 < /dev/null &); for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/werkbank.log" 2>/dev/null && break; sleep 5; done; W fenster 1920 1080 > "$D/fenster.txt" 2>&1; W umstellen 1866.6 -6193.9 > "$D/umstellen.txt" 2>&1; W eval 'const s = r.state; if (s.cameraMode !== "first") r.setCameraMode("first"); s.yaw = -1.309; s.pitch = 0; await new Promise((f) => setTimeout(f, 3000)); const c = s.camera, d = new T.Vector3(); c.getWorldDirection(d); return [c.position.x, c.position.y, c.position.z, c.position.x + d.x * 100, c.position.y + d.y * 100, c.position.z + d.z * 100].map((v) => +v.toFixed(3));' > "$D/kamera.txt" 2>&1; KAM=$(node -e 'const t = require("fs").readFileSync(process.argv[1], "utf8"); const o = JSON.parse(t.slice(t.indexOf("{"))); console.log(o.ergebnis.join(" "))' "$D/kamera.txt"); echo "KAMERA $KAM"; W bild $KAM --w 1920 --h 1080 --wahl 0 --klasse '^(wasserSatz|farWater|chunk-water-[a-z]+)$' --datei "$D/wasser.png" > "$D/bild.txt" 2>&1; E=$?; tail -3 "$D/bild.txt"; cp "$D/wasser.abnahme.json" "$A" 2>/dev/null; W stop > /dev/null 2>&1; sleep 3; raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; exit $E`,
        ],
        gpu: true,
        minuten: 6,
        urteil: (j, lauf) => {
            if (!j || !j.klasse) return { gruen: false, zahl: "kein Begleit-JSON mit Klassen (Exit " + lauf.exit + ")" };
            const w = (j.klasse.klassen || {}).wasserSatz || {};
            const b = j.bild || {};
            const kam = /^KAMERA (\S+) (\S+) (\S+)/m.exec(lauf.stdout || "");
            const pk = (j.pose && j.pose.kamera) || [];
            // die Pose des Schusses ist die Kamera des Spiels (Schlupfloch: die Blick-Wahl verschiebt sie, B09)
            const gleich = !!kam && pk.length === 3 && [1, 2, 3].every((i) => Math.abs(+kam[i] - pk[i - 1]) <= 0.05);
            const gruen = w.spiegelTreue != null && w.spiegelTreue >= 0.6 && b.w === 1920 && b.h === 1080 && gleich && j.ok === true;
            return {
                gruen,
                zahl:
                    "spiegelTreue " + w.spiegelTreue + " (wasserSatz " + w.pixel + " px, spiegelEbene " + w.spiegelEbene + ") in " + b.w + "×" + b.h +
                    ", Pose " + (gleich ? "= Kamera des Spiels" : "WEICHT AB (" + (kam ? kam.slice(1).join("/") : "?") + " gegen " + pk.join("/") + ")") +
                    ", " + (j.zeile || "ohne Abnahme-Zeile"),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/vegetation-*.js",
            "stamm/koerper-bewegung.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "index.html",
            "save-server.js",
            "scripts/werkbank.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = spiegelTreue ≥ 0,6 an einer Pose in Ausgabe-Größe mit der Kamera des Spiels an einem Gerät",
    },

    // ── gelaende.K4 ──
    {
        kriterium: "gelaende.K4",
        staffel: 1,
        geraet: "headless",
        // die Kern-Mutation an 50 Zufalls-Punkten trockenen Lands am See der Mess-Wiese (K12 M, Null-Renderer: Mechanik am Leser, R3)
        befehl: ["node", "scripts/diag-wasser-leben.cjs", "--nur", "mutation"],
        env: { WASSER_LEBEN_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const b = jsonBlock(lauf.stdout);
            const m = b && b.mutation;
            if (!m) return { gruen: false, zahl: "keine Mutations-Probe in der Ausgabe (Exit " + lauf.exit + ")" };
            if (m.fehler) return { gruen: false, zahl: "Probe-Fehler: " + m.fehler };
            const leser = Object.entries(m.leser || {}).filter(([k]) => k !== "kontrolle");
            const folgt = leser.filter(([, l]) => l.n >= m.punkte && l.vor === 0 && l.nach === l.n);
            const k = (m.leser || {}).kontrolle || {};
            const fn = (m.flora && m.flora.nach) || {};
            const gruen =
                lauf.exit === 0 &&
                /WASSER-LEBEN GRÜN/.test(lauf.stdout) &&
                m.punkte >= 50 &&
                leser.length >= 10 &&
                folgt.length === leser.length &&
                k.n >= m.punkte &&
                k.nach === 0 &&
                !(fn.wiese > 0) &&
                !(fn.streu > 0);
            return {
                gruen,
                zahl:
                    folgt.length + " von " + leser.length + " Lesern folgen an " + m.punkte + " Punkten, Kontrolle " +
                    k.nach + ", Pflanzen im Wasser " + (fn.wiese || 0) + " + " + (fn.streu || 0),
            };
        },
        pfad: [
            "gelaende-core.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/klang.js",
            "stamm/koerper-*.js",
            "stamm/kreatur-*.js",
            "stamm/vegetation-wiese.js",
            "stamm/vegetation-streu.js",
            "stamm/netz-p2p.js",
            "stamm/bild-himmel.js",
            "stamm/daten.js",
            "scripts/diag-wasser-leben.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort",
    },

    // ── gelaende.K5 ── der Kontakt gegen die gezeichneten Dreiecke ist Mechanik (Null-Renderer mit Foundry, R3)
    {
        kriterium: "gelaende.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + k8Sichten.toString() + ")()", "{AUS}"],
        env: { KOERPER_STAND_PORT: "{PORT}" },
        gpu: false,
        minuten: 10,
        urteil: (j) => {
            const l = k8Lesen(j);
            if (l.fehler) return { gruen: false, zahl: l.fehler };
            // eine Rolle an einem Ort, beide Sichten: p95 ≤ 3 cm
            const im = [];
            for (const o of ["wiese", "hang"]) for (const r of K8_KONTAKT) if (l.p(o, r) != null && l.p(o, r) <= 3) im.push(r + "@" + o);
            return { gruen: im.length > 0, zahl: "im Soll beider Sichten: " + (im.join(", ") || "keine Rolle") + " — " + k8Zahl(l.p) };
        },
        pfad: K8_PFAD,
        quelle: "1 = Kontakt p95 ≤ 3 cm für eine Rolle an einem Ort, beide Sichten",
    },
    {
        kriterium: "gelaende.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe K8 auf jedem Gerät (die Ratsche spec/profiband/ratsche-boden-rolle.json urteilt die Linse; hier das Soll ohne Ratsche)
        befehl: ["node", "-e", "(" + k8Sichten.toString() + ")()", "{AUS}"],
        env: { KOERPER_STAND_PORT: "{PORT}" },
        gpu: true,
        minuten: 10,
        urteil: (j) => {
            const l = k8Lesen(j);
            if (l.fehler) return { gruen: false, zahl: l.fehler };
            const raus = [];
            for (const o of ["wiese", "hang"]) {
                const f = l.p(o, "fein");
                if (!(f != null && f <= 5)) raus.push("fein@" + o + " " + f);
                for (const r of K8_KONTAKT) if (!(l.p(o, r) != null && l.p(o, r) <= 3)) raus.push(r + "@" + o + " " + l.p(o, r));
            }
            return { gruen: raus.length === 0, zahl: (raus.length ? "über dem Soll: " + raus.join(", ") : "alle Rollen im Soll") + " — " + k8Zahl(l.p) };
        },
        pfad: [...K8_PFAD, "spec/profiband/ratsche-boden-rolle.json"],
        quelle:
            "2 = alle Rollen an Mess-Wiese und 25°-Hang, in Fahrt, beide Geräte, jede Rolle ruft benannt EINE Funktion (Ratsche)",
    },

    // ── wetter.K1 ── gate:wetter-wache (Z): 20 min Spiel-Zeit, Saat × Ort (3 km) × Wanduhr (steht | 120 s je Takt)
    {
        kriterium: "wetter.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-wetter-wache.cjs"],
        env: { WETTER_WACHE_PORT: "{PORT}" },
        gpu: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const re = /^\s*Saat (saat-[ab]) · (-?\d+) · (\d+)\s+(.*) \((\d+) überblendet\)\s*$/;
            const l = String(lauf.stdout || "")
                .split(/\r?\n/)
                .map((z) => re.exec(z))
                .filter(Boolean)
                .map((m) => ({ saat: m[1], ort: m[2], uhr: m[3], folge: m[4].trim(), fade: +m[5] }));
            const a = l.filter((x) => x.saat === "saat-a");
            const b = l.filter((x) => x.saat === "saat-b");
            if (a.length < 4 || !b.length) return { gruen: false, zahl: "Saat-Zeilen fehlen: " + a.length + " × a, " + b.length + " × b (Exit " + lauf.exit + ")" };
            const zuege = a[0].folge.split(" ").length;
            const voll = l.every((x) => x.folge.split(" ").length === zuege && x.fade === zuege);
            const orte = new Set(a.map((x) => x.ort)).size;
            const uhren = new Set(a.map((x) => x.uhr)).size;
            const gleich = a.every((x) => x.folge === a[0].folge);
            const anders = b.every((x) => x.folge !== a[0].folge);
            const saatRot = /\(Z\) SAAT/.test(lauf.stderr || "");
            const gruen = zuege >= 10 && voll && orte >= 2 && uhren >= 2 && gleich && anders && !saatRot;
            return {
                gruen,
                zahl:
                    "saat-a an " + orte + " Orten × " + uhren + " Wanduhren " + (gleich ? "gleich" : "VERSCHIEDEN") + " (" + zuege +
                    " Züge: " + a[0].folge + "), saat-b " + (anders ? "anders" : "GLEICH") + (voll ? "" : ", ein Zug nicht überblendet"),
            };
        },
        pfad: [
            "stamm/dirigent-*.js",
            "stamm/bild-himmel.js",
            "stamm/feld-*.js",
            "stamm/daten.js",
            "phyto-core.js",
            "scripts/diag-wetter-wache.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = das Wetter-Wort entsteht aus Saat + Spielzeit + Schreib-Akten statt aus der Wanduhr (global, gemessen)",
    },

    // ── wetter.K2 ── gate:naesse:echt: klar gegen 10 min Regen als Spieler-Wort aus dem Ausgabe-Pfad (echter Renderer)
    {
        kriterium: "wetter.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: ["node", "scripts/werkbank.cjs", "licht", "--naesse", "--eigen", "--port", "{PORT}", "--datei", "{AUS}"],
        gpu: true,
        minuten: 4,
        urteil: (j) => {
            const d = j && j.dorf;
            if (!d) return { gruen: false, zahl: "keine Dorf-Messung (Innenraum unter dem Dach)" };
            if (d.fehler) return { gruen: false, zahl: "Dorf: " + d.fehler };
            const im = (v, lo, hi) => v != null && v >= lo && v <= hi;
            const a = d.aussen || {};
            const i = d.innen || {};
            const rg = d.regen || {};
            const gruen =
                a.n >= 100 &&
                i.n >= 100 &&
                im(a.verhaeltnis, 0.5, 0.8) &&
                im(i.verhaeltnis, 0.95, 1.05) &&
                im(d.dicht, 0.95, 1.05) &&
                rg.innen === 0 &&
                rg.aussen >= 1;
            const w = j.wiese && !j.wiese.fehler ? ", Wiese draußen " + (j.wiese.aussen || {}).verhaeltnis : "";
            return {
                gruen,
                zahl:
                    "Dorf porös draußen " + a.verhaeltnis + " · innen unter dem Dach " + i.verhaeltnis + " · dicht " + d.dicht +
                    " · Regen innen " + rg.innen + " / draußen " + rg.aussen + " (n " + a.n + "/" + i.n + ")" + w,
            };
        },
        pfad: [
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/siedlung-*.js",
            "stamm/bau-*.js",
            "stamm/vegetation-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "foundry-core.js",
            "fachwerk-core.js",
            "index.html",
            "scripts/werkbank.cjs",
            "scripts/lib/licht-linsen.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = Boden-Luma nass/trocken 0,5–0,8 nur auf porösem Stoff, im SELBEN Schuss mit trockenem Innenraum unter dem Dach, an einer Pose",
    },

    // ── wetter.K5 ── gate:kopplung F3: die Phase am Verhalten (quer gleich, längs verschieden, die Richtung dreht mit, Saat)
    {
        kriterium: "wetter.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kopplung.cjs"],
        env: { KOPPLUNG_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const zeile = /^\s*F3 Wind: (.*)$/m.exec(out);
            const f3 = out.split(/\r?\n/).filter((z) => /❌\s*F3/.test(z));
            const seite = /PAGE-ERROR/.test(out);
            if (!zeile) return { gruen: false, zahl: "keine F3-Zeile (Exit " + lauf.exit + ")" };
            const gruen = f3.length === 0 && !seite && /seeded\/langsam/.test(zeile[1]);
            return { gruen, zahl: "F3 " + zeile[1].trim() + (f3.length ? " — " + f3.join(" | ").trim() : "") + (seite ? " — Page-Error" : "") };
        },
        pfad: [
            "stamm/stoff-material.js",
            "stamm/bild-*.js",
            "stamm/vegetation-*.js",
            "stamm/koerper-bewegung.js",
            "stamm/wasser-*.js",
            "stamm/daten.js",
            "scripts/diag-kopplung.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = EIN Term, global, die Richtung aus der Saat am Verhalten gemessen",
    },

    // ── physik.K2 ── diag-fahr-leben L7/L8 (Null-Renderer, Mechanik, als solche benannt): der gestoßene Bär (13,7 m/s) vor der
    // 0,35-m-Wand bei 60 fps, 30 fps und gemischten Frames, und die Lage nach 200 Sim-Schritten je Bildrate
    {
        kriterium: "physik.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs"],
        env: { FAHR_LEBEN_PORT: "{PORT}" },
        gpu: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const l7 = z.find((x) => /^\s*(✅|❌) L7 /.test(x));
            const l8 = z.find((x) => /^\s*(✅|❌) L8 /.test(x));
            if (!l7 || !l8) return { gruen: false, zahl: "L7/L8 fehlen in der Ausgabe (Exit " + lauf.exit + ")" };
            const wand = [...l7.matchAll(/(60|30|gemischt): (\d+)\/(\d+) durch/g)].map((m) => ({ k: m[1], durch: +m[2], n: +m[3] }));
            const baer = /Bär (-?[\d.e-]+) m/.exec(l8);
            const wagen = /Abweichung Wagen (-?[\d.e-]+) m/.exec(l8);
            const gruen =
                /✅/.test(l7) &&
                /✅/.test(l8) &&
                wand.length === 3 &&
                wand.every((w) => w.durch === 0 && w.n >= 8) &&
                !!baer &&
                Math.abs(+baer[1]) <= 0.01 &&
                !!wagen &&
                Math.abs(+wagen[1]) <= 0.01;
            return {
                gruen,
                zahl:
                    "Durchdringen " + (wand.map((w) => w.k + " " + w.durch + "/" + w.n).join(" · ") || "?") + ", Lage nach 200 Schritten Bär " +
                    (baer ? baer[1] : "?") + " m, Wagen " + (wagen ? wagen[1] : "?") + " m",
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "vehicle-core.js",
            "koerper-core.js",
            "scripts/diag-fahr-leben.cjs",
            "scripts/lib/fahr-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = die Leiber (Mechanik, als solche benannt)",
    },

    // ── feld.K3 ── gate:stand-takt (RS): 3 600 echte _gameLoopTick = 60 s Spielzeit nach einer Tat, Sim-Einheiten je Sim
    {
        kriterium: "feld.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs"],
        env: { STAND_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const m = /^\s*Sim-Ruhe (\d+(?:\.\d+)?) s: (.*)$/m.exec(out);
            if (!m) return { gruen: false, zahl: "keine Sim-Ruhe-Zeile (Exit " + lauf.exit + ")" };
            const sims = {};
            for (const t of m[2].split(" · ")) {
                const x = /^(\S+) (\d+)/.exec(t.trim());
                if (x && x[1] !== "Taten") sims[x[1]] = +x[2];
            }
            const taten = /Taten (\S+)/.exec(m[2]);
            const leer = /LEER: (die Sim-Ruhe ging|vor der Sim-Ruhe fehlt|keine Sim-Ruhe)/.test(out);
            const gruen = +m[1] >= 60 && sims.wasser === 0 && !leer;
            return {
                gruen,
                zahl:
                    "Wasser-Automat " + (sims.wasser ?? "?") + " Einheiten in " + m[1] + " s Ruhe (Akte " + (taten ? taten[1] : "?") +
                    "); alle Sims: " + Object.entries(sims).map(([k, v]) => k + " " + v).join(" · "),
            };
        },
        pfad: [
            "stamm/wasser-*.js",
            "stamm/bild-himmel.js",
            "stamm/feld-*.js",
            "stamm/gelaende-*.js",
            "stamm/vegetation-*.js",
            "stamm/dienst.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "scripts/diag-stand-takt.cjs",
            "scripts/lib/stand-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = der Wasser-Automat hat 0 Takte in 60 s Ruhe",
    },
];

// ── NICHT FASSBAR (befehl: null): kein Werkzeug im Spiel-Baum misst das Soll dieser Staffel als EIN Befehl am SHA ──
module.exports.fehlt = [
    { kriterium: "gelaende.K1", staffel: 2, befehl: null, grund: "nicht gebaut: dichte, editForm und Spiegel sind Abschrift (48er-Edit-Kegel ×4, 166 Spiegel-Marken im Worker); gate:worker-dichte vergleicht Abschrift mit Abschrift, die Mutations-Liste (Edit-Stärke, Edit-Radius, Dichte-Versatz, See-Spiegel) misst keine Linse" },
    { kriterium: "gelaende.K2", staffel: 2, befehl: null, grund: "Werkzeug fehlt: Damm (b) und Ferne (d, byte-Diff am Ring) misst keine Linse; Ego und GTX ungemessen" },
    { kriterium: "gelaende.K3", staffel: 2, befehl: null, grund: "Werkzeug fehlt: 12 Posen (Ego/Third × Mittag/Nacht/Regen × beide Geräte) und die Fließ-Anisotropie (ohne Soll im Code)" },
    { kriterium: "gelaende.K4", staffel: 2, befehl: null, grund: "Werkzeug fehlt: die Mutation läuft nur am See der Mess-Wiese (nicht überall); „jeder Lauf endet in See oder Meer“ und „die Strömung treibt“ (gate:kopplung F1) sind getrennte Linsen ohne gemeinsames Urteil" },
    { kriterium: "wetter.K1", staffel: 2, befehl: null, grund: "nicht gebaut: das Wetter bleibt EIN globales Wort (`_setWeather`), keine Front am Ort; die Welt kennt 3 der 5 Zeilen von WX_GESETZ" },
    { kriterium: "wetter.K2", staffel: 2, befehl: null, grund: "Werkzeug fehlt: werkbank licht --naesse misst nur Ego an Wiese und Dorf — keine Pfützen in den Mulden, keine Trocken-Kurve, kein Third" },
    { kriterium: "wetter.K5", staffel: 2, befehl: null, grund: "nicht gebaut: kein Gelände formt den Wind (Lee, Tal-Düse); die Leser-Mutation von `_windAt` misst keine Linse" },
    { kriterium: "physik.K1", staffel: 1, befehl: null, grund: "Werkzeug fehlt: keine Stoß-Matrix (Δv-Verhältnis = Massen-Verhältnis ±5 %, Masse aus Volumen × ρ) im Baum; der Beleg zitiert Code (`_stossPaar`, `_leibMasse`), die Kreatur-Probe temperament prüft nur, dass Temperament und Beute die EINE Masse lesen (R3)" },
    { kriterium: "physik.K1", staffel: 2, befehl: null, grund: "nicht gebaut: Gebautes wiegt nichts (bau-buch dichte [0,1]-normiert), die Schmiede trägt ρ für 4 Stoffe — zwei Skalen" },
    { kriterium: "physik.K2", staffel: 2, befehl: null, grund: "Werkzeug fehlt: der Wagen bei vmax × 1,2 gegen die 0,35-m-Mauer und die Bild-Probe (Spalt Leib–Wand ≤ 5 cm) auf beiden Geräten — gate:kollision-bild läuft auf dem Null-Renderer" },
    { kriterium: "feld.K2", staffel: 1, befehl: null, grund: "Werkzeug fehlt für das ganze Soll: gate:mp-sync (c) trägt nur zwei Chat-Edits über Peers, keine Bauten; kein Werkzeug misst Edits und Bauten byte-gleich über einen Reload (gate:reload-treue prüft den Guss-Pin der Kreatur)" },
    { kriterium: "feld.K2", staffel: 2, befehl: null, grund: "nicht gebaut: Wetter am Ort, Pegel, Overlays, Brand ohne Zustands-Nachricht über Peers ungemessen; Reload mitten im Sturm ohne Linse" },
    { kriterium: "feld.K3", staffel: 2, befehl: null, grund: "Werkzeug fehlt: `werkbank stand --sim` misst die Ruhe, nicht „nur in berührten Zellen“ (unter Taten 32 805 Einheiten); der Brand hat keinen Takt im Stamm" },
];
