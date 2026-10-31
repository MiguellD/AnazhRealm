// Stationen der Gruppe I (src/g1.js): je Kriterium und Staffel EINE Station — Befehl im Spiel-Baum am SHA, Urteil über
// seine Ausgabe, Pfad für R6. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst ist jedes Kriterium der Gruppe mit Punkten (gelaende K1–K5, wetter K1 K2 K3 K5, physik K1 K2, feld K2 K3, stoffe K2 K3;
// physik K2 ist zugleich das Ziel des Zweigs kontakt-tempo). Die Messschuld M30–M43 trägt kein Kriterium der Gruppe I.
// Was kein Werkzeug im Spiel-Baum misst, steht NICHT in der Liste (der Läufer verlangt ein argv), sondern in
// `module.exports.fehlt` mit befehl: null und dem Grund — das Kriterium bleibt dort Hand-Buchung, bis das Werkzeug steht.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");
const PW = require("./proben-welt.cjs"); // die Proben der Welt in der Sitzung (gelaende.K2, gelaende.K5#2, physik.K2#2)

// gelaende.K5: K8 der Linse diag-koerper-stand in BEIDEN Sichten. Die Linse setzt die Sicht nicht selbst; die Mess-Kopie
// (wie koordination bericht/2210-radeon-beweise k8-sicht.diff) setzt sie vor der Wiese und schreibt die gesetzte Sicht
// mit (`__sicht`), je Sicht ein Lauf, das Ergebnis beider in {AUS}. Läuft im Spiel-Baum (cwd), die Kopie wird gelöscht.
// Was hinter {AUS} steht, reicht sie an die Linse durch (Staffel 2: `--bild`, die Welt zeichnet auf der Karte).
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
        const p = cp.spawnSync(process.execPath, [kopie, "--k8", ...process.argv.slice(2)], {
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

// feld.K4 (gate:stand-takt --tat): die Tat, ihr Gedächtnis im worldMeta, Save und Reload, die Uhr, die Nah-Streu und der Wald
const TAT_PFAD = ["stamm/feld-*.js", "stamm/vegetation-*.js", "stamm/werkstatt-bauen.js", "stamm/kampf.js", "stamm/bild-himmel.js",
    "stamm/dienst.js", "stamm/speicher-*.js", "stamm/dirigent-*.js", "stamm/daten.js", "foundry-core.js",
    "scripts/diag-stand-takt.cjs", "scripts/lib/stand-linse.cjs", "scripts/lib/welt-boot.cjs", "scripts/lib/welt-orte.cjs"];

// feld.K1 (gate:fahr-leben W, `--kette`): Sturm → Regen-Feld → Nässe → Grip — der Bremsweg ab 50 km/h liest μ aus der Stoff-Zeile
const KETTE_PFAD = [
    "stamm/koerper-fahrt.js",
    "stamm/koerper-bewegung.js",
    "stamm/stoff-material.js",
    "stamm/bild-himmel.js",
    "stamm/daten.js",
    "stamm/bau-buch.js",
    "stamm/bau-vorlagen.js",
    "stamm/vegetation-wiese.js",
    "stamm/siedlung-satz.js",
    "stamm/gelaende-boden.js",
    "vehicle-core.js",
    "scripts/diag-fahr-leben.cjs",
    "scripts/lib/fahr-proben.cjs",
];

// DIE PROBEN IN DER SITZUNG (29.10., stationen/proben-welt.cjs): gelaende.K2 #1 und #2 teilen EINE Probe (gräbt und schüttet: mutiert)
const K2_PROBE = {
    befehl: PW.torBefehl(PW.wasserGraben, "{KOORD}"),
    sek: 10,
    mutiert: true,
    
};

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
        zeit: false,
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
    {
        kriterium: "gelaende.K1",
        staffel: 2,
        geraet: "headless",
        // die Kern-Probe (gate:worker-dichte `--kern`, Null-Renderer): 10⁵ Punkte (Höhle, Kanal, See-Becken, um 300 Edits über
        // den Spielpfad), dichte, Bezug, Spiegel und Fluss aus Stamm-Leser, jedem Voxel-Faden und einer frischen Instanz des
        // Kerns Wort für Wort; die feste Mutations-Liste (der Server liefert den Kern verändert aus) zieht beide Leser; der
        // Selbsttest nennt einen Leser, der den unveränderten Kern liest, beim Namen (nicht vakuös)
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--kern", "--selftest", "--json", "{AUS}"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const k = j && j.kern;
            if (!k) return { gruen: false, zahl: "kein JSON der Kern-Probe (Exit " + lauf.exit + ")" };
            const liste = ["Edit-Stärke", "Edit-Radius", "Dichte-Versatz", "See-Spiegel"];
            const zieht = liste.filter((n) =>
                (k.mutationen || []).some((z) => z.name === n && z.zugStamm > 0 && z.zugFaden > 0 && z.abweichend === 0)
            );
            const rein = k.rein || {};
            const ort = (k.wirkt || []).slice(0, 4);
            const gruen =
                lauf.exit === 0 &&
                /KERN-PROBE GRÜN/.test(lauf.stdout) &&
                k.punkte >= 1e5 &&
                k.edits >= 20 &&
                k.haelt === k.edits &&
                k.faeden >= 1 &&
                rein.abweichend === 0 &&
                rein.maxDiff === 0 &&
                ort.length === 4 &&
                ort.every((w) => w >= k.punkte / 25) &&
                zieht.length === liste.length &&
                !!(k.selbsttest && k.selbsttest.sieht);
            return {
                gruen,
                zahl:
                    k.punkte + " Punkte, " + k.edits + " Edits, ≠ Kern " + rein.abweichend + " (maxDiff " + rein.maxDiff +
                    "), " + zieht.length + "/4 Mutationen ziehen Stamm-Leser und Worker-Feld, Selbsttest " +
                    (k.selbsttest && k.selbsttest.sieht ? "sieht" : "blind"),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "index.html",
            "scripts/diag-worker-dichte.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/wasser-linse.cjs",
        ],
        quelle: "2 = auch dichte, editForm und Wasser-Spiegel im Kern, jede Mutation der festen Liste zieht Stamm-Leser UND Worker-Feld",
    },

    // ── gelaende.K2 ── M31: das Graben-Bild über die echte Eingabe (CDP-Klick, Verb graben) im Spiel-Loop, Third, am Fluss
    // nächst Genesis, je Graben 1 m und 3 m jenseits der Krone; je präsentiertem Bild die gezeichneten Wasser-Flächen über ±4,5 m.
    // IN DER SITZUNG (29.10.): EINE Probe für Staffel 1 und 2 (`K2_PROBE`, Zwillinge — die Sitzung fährt sie einmal), die Bahn von
    // m2-graben.cjs in der warmen Welt (stationen/proben-welt.cjs `wasserGraben`): Third an zwei Saaten statt fünf, 3 s Spur je Graben
    // statt 4,3 s. Bis 29.10. jede Staffel ihr eigener Boot über die Harness (Radeon b3f9ae95: 2,28 und 3,83 min Arbeit).
    {
        kriterium: "gelaende.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: K2_PROBE,
        gpu: true,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = (j && j.third) || {};
            const alle = Array.isArray(t.graeben) ? t.graeben : [];
            const g = alle.filter((x) => x.verb === "graben");
            if (!g.length) return { gruen: false, zahl: "kein Graben über das Verb graben (Exit " + lauf.exit + (t.fehler ? ", " + t.fehler : "") + ")" };
            // gefüllt zählt, wo neues Wasser entsteht; ein 3-m-Graben, der den 1-m-Graben überlappt, ist nicht getrennt urteilbar
            const neu = g.filter((x) => x.nassEnde > x.nassVor);
            const doppelt = Math.max(...g.map((x) => x.doppeltMax));
            const ueber = Math.max(...g.map((x) => x.ueberMax));
            const leer = g.filter((x) => !(x.bilder > 0)).length;
            const langsam = neu.filter((x) => !(x.gefuelltMs != null && x.gefuelltMs <= 2000));
            const je = (a) => neu.filter((x) => x.abstand === a && x.gefuelltMs != null && x.gefuelltMs <= 2000).length;
            const bilder = g.reduce((s, x) => s + (x.bilder || 0), 0);
            const ms = neu.map((x) => x.gefuelltMs).filter((v) => v != null);
            // je Probe höchstens EIN Klick an einen Busch (das Verb abbau statt graben; bis 29.10. 8 von 10)
            const gruen =
                lauf.exit === 0 && !t.fehler && g.length >= alle.length - 1 && doppelt === 0 && ueber === 0 && leer === 0 && langsam.length === 0 && je(1) >= 1 && je(3) >= 1;
            return {
                gruen,
                zahl:
                    g.length + " von " + alle.length + " Gräben über das Verb, in " + bilder + " Bildern doppelt " + doppelt + " und über dem Spiegel " +
                    ueber + ", gefüllt nach " + (ms.length ? Math.min(...ms) + "–" + Math.max(...ms) + " ms" : "?") + " (1 m " + je(1) + ", 3 m " + je(3) +
                    (langsam.length ? ", " + langsam.length + " nicht ≤ 2 s" : "") + ")" + (t.fehler ? " · " + t.fehler : ""),
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
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = (a) im Ausgabe-Bild an einem Gerät",
    },

    // ── gelaende.K2 Staffel 2 ── (a) der Graben wie Staffel 1, Third und im Ich-Auge (die Kamera des Spiels am Kopf, der Blick auf den
    // Boden vor dem Leib, der Stand 2,2 m vom Graben-Punkt mit freier Abnahme des Blicks; Ego an einer dritten Saat), (b) und (d) über
    // die Wasser-Linse des Spiel-Baums (`__wasserDamm`, wie gate:wasser-leben, Zweig gk2-damm): G6/G7 der Damm aus dem Verb
    // (`voxel_fill`) 60 m stromab des Fluss-Orts der Mess-Wiese — stromauf das gezeichnete Wasser auf der Überlaufhöhe (Minimax über
    // den Boden des Feldes) ±0,1 m über dem Fluss von vorher, stromab der Fluss auf seinem Spiegel —, G8 der Fern-Ring unter den Säulen
    // im Takt des Edits (byte-Diff) und der Fern-Faden an den Säulen-Mitten auf der Krone. (b) und (d) urteilen das Gesetz (Spiegel,
    // Ring, Faden) — kamera-frei, je Gerät gemessen. Dieselbe Probe wie Staffel 1 (`K2_PROBE`).
    {
        kriterium: "gelaende.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: K2_PROBE,
        gpu: true,
        zeit: true,
        minuten: 16,
        urteil: (j, lauf) => {
            if (!j) return { gruen: false, zahl: "keine Ausgabe (Exit " + lauf.exit + ")" };
            // (a) je Sicht dasselbe Urteil wie Staffel 1 (je Sicht höchstens EIN Klick an einen Busch)
            const graben = (m, sicht) => {
                const alle = m && Array.isArray(m.graeben) ? m.graeben : [];
                const g = alle.filter((x) => x.verb === "graben" && (!sicht || x.sicht === sicht));
                const neu = g.filter((x) => x.nassEnde > x.nassVor);
                const je = (a) => neu.filter((x) => x.abstand === a && x.gefuelltMs != null && x.gefuelltMs <= 2000).length;
                const ok =
                    !(m && m.fehler) && g.length >= 2 && g.length >= alle.length - 1 && Math.max(...g.map((x) => x.doppeltMax)) === 0 && Math.max(...g.map((x) => x.ueberMax)) === 0 &&
                    g.every((x) => x.bilder > 0) && neu.every((x) => x.gefuelltMs != null && x.gefuelltMs <= 2000) && je(1) >= 1 && je(3) >= 1 &&
                    (!sicht || [1, 3].every((a) => g.some((x) => x.abstand === a && (x.bild || []).includes("2s"))));
                // Ego: je Abstand ein Bild 2 s nach dem Klick von einem freien Stand (die Abnahme des Blicks)
                const bild = sicht ? ", Bild " + g.filter((x) => (x.bild || []).includes("2s")).map((x) => "s" + x.saat + "/" + x.abstand + " m").join(" ") : "";
                return { ok, zahl: g.length + "/" + alle.length + " Gräben (1 m " + je(1) + ", 3 m " + je(3) + bild + ")" + (m && m.fehler ? " " + m.fehler : "") };
            };
            const [t, e] = [graben(j.third), graben(j.ego, "first")];
            // (b) G6 · G7 — (d) G8, wie die Wand sie urteilt
            const d = j.damm || {};
            const auf = d.stromauf || [];
            const ab = d.stromab || [];
            const b =
                d.saeulen >= 3 && auf.length === 2 && ab.length === 2 &&
                auf.every((u) => Math.abs(u.wasser - u.ueberlauf) <= 0.1 && u.ueberlauf > u.fluss + 0.1) &&
                ab.every((u) => Math.abs(u.wasser - u.fluss) <= 0.1);
            const f = (j.ferne && j.ferne.ring) || {};
            // der Faden je Ring-Punkt wie die Wand (diag-wasser-leben G8: faden === punkte), nicht je Säule (5/21 am 27.10. war die Station)
            const fern = f.punkte >= 3 && f.anders === f.punkte && f.hubM >= 1 && f.faden === f.punkte;
            return {
                gruen: t.ok && e.ok && b && fern,
                zahl:
                    "(a) Third " + t.zahl + " · Ego " + e.zahl + " · (b) stromauf " + auf.map((u) => u.wasser + "/" + u.ueberlauf).join(", ") +
                    " m Wasser/Überlauf über Fluss " + auf.map((u) => u.fluss).join(", ") + ", stromab " + ab.map((u) => u.wasser + "/" + u.fluss).join(", ") +
                    " · (d) Ring " + f.anders + "/" + f.punkte + " Hub " + f.hubM + " m, Faden " + f.faden + "/" + f.punkte + " an " + (j.ferne ? j.ferne.saeulen : "?") + " Säulen" +
                    (d.fehler ? " · Damm " + d.fehler : "") + (j.ferne && j.ferne.fehler ? " · Ferne " + j.ferne.fehler : ""),
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
            "stamm/feld-dsl.js",
            "stamm/daten.js",
            "index.html",
            "save-server.js",
            "scripts/werkbank.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = (a), (b) und (d) an beiden Geräten, Ego und Third",
    },

    // ── gelaende.K3 ── M1: spiegelTreue an der Ego-Pose des Spiels am See (Ufer 1866,6/−6193,9, Gier −1,309, Neigung 0),
    // die Kamera aus dem Spiel (state.camera nach `_loopCamera`), geschossen mit `bild --wahl 0` in 1920×1080 aus dem
    // Ausgabe-Pfad (werkbank start --echt gegen den eigenen save-server auf {PORT}, die Werkbank auf {PORT} + 20000)
    // DAS BUDGET DER SITZUNG (29.10., ≤ 30 min je Gerät): EIN Teleport an den See, EIN Schuss — Ziel 20 s, Deckel 45 s
    {
        kriterium: "gelaende.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { sek: 15, befehl: [
            "bash",
            "-c",
            `set -u; A=$(cygpath -m '{AUS}'); D="\${A%.json}-werk"; rm -rf "$D"; mkdir -p "$D"; SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; W() { node scripts/werkbank.cjs "$@"; }; W fenster 1920 1080 > "$D/fenster.txt" 2>&1; W umstellen 1866.6 -6193.9 > "$D/umstellen.txt" 2>&1; W eval 'const s = r.state; if (s.cameraMode !== "first") r.setCameraMode("first"); s.yaw = -1.309; s.pitch = 0; for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); const c = s.camera, d = new T.Vector3(); c.getWorldDirection(d); return [c.position.x, c.position.y, c.position.z, c.position.x + d.x * 100, c.position.y + d.y * 100, c.position.z + d.z * 100].map((v) => +v.toFixed(3));' > "$D/kamera.txt" 2>&1; KAM=$(node -e 'const t = require("fs").readFileSync(process.argv[1], "utf8"); const o = JSON.parse(t.slice(t.indexOf("{"))); console.log(o.ergebnis.join(" "))' "$D/kamera.txt"); echo "KAMERA $KAM"; W bild $KAM --w 1920 --h 1080 --wahl 0 --klasse '^(wasserSatz|farWater|chunk-water-[a-z]+)$' --datei "$D/wasser.png" > "$D/bild.txt" 2>&1; E=$?; echo "BILD $(tr -d '\\n' < "$D/bild.txt" | cut -c1-600)"; cp "$D/wasser.abnahme.json" "$A" 2>/dev/null; exit $E`,
        ] },
        gpu: true,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            if (!j || !j.klasse) {
                const f = /"fehler": "([^"]*)/.exec(lauf.stdout || "");
                return { gruen: false, zahl: "kein Begleit-JSON mit Klassen (Exit " + lauf.exit + (f ? ": " + f[1].slice(0, 200) : "") + ")" };
            }
            const w = (j.klasse.klassen || {}).wasserSatz || {};
            const b = j.bild || {};
            const kam = /^KAMERA (\S+) (\S+) (\S+) (\S+) (\S+) (\S+)/m.exec(lauf.stdout || "");
            const pk = (j.pose && j.pose.kamera) || [];
            const pb = (j.pose && j.pose.blick) || [];
            // die Pose des Schusses ist die Kamera des Spiels, Ort UND Blick (Schlupfloch: die Blick-Wahl verschiebt sie, B09;
            // 23.10.: ohne `_loopCamera` blieb die Kamera der Werkbank auf Gier 0 stehen, der Schuss sah nach +z ins Laub)
            const gleich =
                !!kam && pk.length === 3 && pb.length === 3 &&
                [1, 2, 3].every((i) => Math.abs(+kam[i] - pk[i - 1]) <= 0.05 && Math.abs((+kam[i + 3] - +kam[i]) / 100 - pb[i - 1]) <= 0.01);
            const gruen = w.spiegelTreue != null && w.spiegelTreue >= 0.6 && b.w === 1920 && b.h === 1080 && gleich && j.ok === true;
            return {
                gruen,
                zahl:
                    "spiegelTreue " + w.spiegelTreue + " (wasserSatz " + w.pixel + " px, spiegelEbene " + w.spiegelEbene + ") in " + b.w + "×" + b.h +
                    ", Pose " + (gleich ? "= Kamera des Spiels" : "WEICHT AB (" + (kam ? kam.slice(1).join("/") : "?") + " gegen " + pk.join("/") + " Blick " + pb.join("/") + ")") +
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
        zeit: false,
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
    {
        kriterium: "gelaende.K4",
        staffel: 2,
        geraet: "headless",
        // überall (Null-Renderer, R3): die Kern-Mutation am See der Mess-Wiese und an 5 Zufalls-Orten der Karte (je 50 Punkte,
        // jeder Leser folgt, keine Pflanze im Wasser); jeder Lauf des Gesetzes endet in See oder Meer, jede Senke ist nass,
        // Sohle und Spiegel steigen stromab nie; an 4 Fluss-Orten treiben Schwimmer, Boot und Tier > 0,5 m in 90 Takten, ohne
        // Strömung nicht (gate:wasser-leben K4 ÜBERALL · LÄUFE · STRÖMUNG)
        befehl: ["node", "scripts/diag-wasser-leben.cjs", "--nur", "mutation,ueberall,laeufe,treibt"],
        env: { WASSER_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const b = jsonBlock(lauf.stdout);
            if (!b || !b.mutation || !b.ueberall || !b.laeufe || !b.treibt)
                return { gruen: false, zahl: "keine Probe ÜBERALL, LÄUFE oder STRÖMUNG in der Ausgabe (Exit " + lauf.exit + ")" };
            const folgt = (m) => {
                const leser = Object.entries(m.leser || {});
                const fn = (m.flora && m.flora.nach) || {};
                return (
                    !m.fehler &&
                    m.punkte >= 50 &&
                    leser.length >= 11 &&
                    leser.every(([k, l]) => l.n >= m.punkte && (k === "kontrolle" ? l.nach === 0 : l.vor === 0 && l.nach === l.n)) &&
                    !(fn.wiese > 0) &&
                    !(fn.streu > 0)
                );
            };
            const orte = [b.mutation, ...b.ueberall];
            const l = b.laeufe;
            const ende = ((l.ende || {}).see || 0) + ((l.ende || {}).meer || 0);
            const koerper = ["schwimmer", "boot", "tier"];
            const treibt = b.treibt.filter(
                (t) => !t.fehler && koerper.every((k) => t[k] && t[k].mit > 0.5 && Math.abs(t[k].ohne) < 0.05)
            );
            const gruen =
                lauf.exit === 0 &&
                /WASSER-LEBEN GRÜN/.test(lauf.stdout) &&
                b.ueberall.length >= 5 &&
                orte.every(folgt) &&
                l.laeufe >= 100 &&
                ende === l.laeufe &&
                l.senken > 0 &&
                l.nass === l.senken &&
                l.steigt === 0 &&
                b.treibt.length >= 4 &&
                treibt.length === b.treibt.length;
            return {
                gruen,
                zahl:
                    orte.filter(folgt).length + " von " + orte.length + " Orten folgt jeder Leser · Läufe " + ende + " von " +
                    l.laeufe + " in See oder Meer, Senken nass " + l.nass + " von " + l.senken + ", steigt " + l.steigt +
                    " · Strömung " + treibt.length + " von " + b.treibt.length + " Fluss-Orten (Schwimmer, Boot, Tier > 0,5 m)",
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/klang.js",
            "stamm/koerper-*.js",
            "stamm/kreatur-*.js",
            "stamm/vegetation-wiese.js",
            "stamm/vegetation-streu.js",
            "stamm/netz-p2p.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "scripts/diag-wasser-leben.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer und die Strömung treibt",
    },

    // ── gelaende.K5 ── der Kontakt gegen die gezeichneten Dreiecke ist Mechanik (Null-Renderer mit Foundry, R3)
    {
        kriterium: "gelaende.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + k8Sichten.toString() + ")()", "{AUS}"],
        env: { KOERPER_STAND_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
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
        // dieselbe K8 auf jedem Gerät (die Linse urteilt am Soll, seit leib-k2-sprung ohne Ratsche; hier dasselbe Soll), die Welt
        // zeichnet auf der Karte — „beide Geräte“ verlangt das Gerät. IN DER SITZUNG (29.10., proben-welt.cjs `bodenRollen`): `rollen`
        // der Linse je Sicht in der warmen Welt (der Fuß des Spielers und der Sprung K9 gehören leib.K2 und fallen per Anker), das
        // Ergebnis in der Form von `k8Sichten`; bis 29.10. je Sicht ein eigener Boot (Radeon b3f9ae95: 9,79 min Arbeit)
        probe: { befehl: PW.torBefehl(PW.bodenRollen), sek: 15, mutiert: false },
        gpu: true,
        zeit: false,
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
        pfad: [...K8_PFAD, "scripts/werkbank.cjs", "scripts/lib/software-gpu.cjs"],
        quelle:
            "2 = alle Rollen an Mess-Wiese und 25°-Hang, in Fahrt, beide Geräte, jede Rolle ruft benannt EINE Funktion (Ratsche)",
    },

    // ── wetter.K1 ── gate:wetter-wache (Z): 20 min Spiel-Zeit in Takten des Zugs, Saat × Ort (3 km windab) × Wanduhr (steht |
    // 120 s je Takt). Staffel 2 (die Front am Ort) hebt das globale Wort auf: die Folge gleicht sich JE ORT über die Wanduhren,
    // die andere Saat zieht eine andere; jeder Wechsel geht über `_setWeather` (überblendet).
    {
        kriterium: "wetter.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-wetter-wache.cjs"],
        env: { WETTER_WACHE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
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
            const wechsel = (f) => f.split(" ").filter((w, i, x) => w !== (i ? x[i - 1] : "sunny")).length;
            const voll = l.every((x) => x.folge.split(" ").length === zuege && x.fade === wechsel(x.folge) && x.fade > 0);
            const je = new Map();
            for (const x of a) je.set(x.ort, (je.get(x.ort) || []).concat(x.folge));
            const uhren = new Set(a.map((x) => x.uhr)).size;
            const gleich = [...je.values()].every((f) => f.every((y) => y === f[0]));
            const anders = b.every((x) => x.folge !== (je.get(x.ort) || [""])[0]);
            const saatRot = /\(Z\) SAAT/.test(lauf.stderr || "");
            const gruen = zuege >= 10 && voll && je.size >= 2 && uhren >= 2 && gleich && anders && !saatRot;
            return {
                gruen,
                zahl:
                    "saat-a je Ort (" + je.size + ") über " + uhren + " Wanduhren " + (gleich ? "gleich" : "VERSCHIEDEN") + " (" + zuege +
                    " Takte: " + a[0].folge + "), saat-b " + (anders ? "anders" : "GLEICH") + (voll ? "" : ", ein Wechsel nicht überblendet"),
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

    // ── wetter.K1 ── gate:wetter-wache (F): die Front am Ort — 20 min Spiel-Zeit in Ereignis-Takten von 5 s an A (der Spieler) und
    // B (3 km windab) über `_wetterAmOrt`, die Worte an 4 096 Orten, der Sturm des Kerns (phyto-core wetterAt) im Zug der Welt und
    // im Wetterspiel des Labors (worlds/terrain, Rechnung ohne Bild)
    {
        kriterium: "wetter.K1",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-wetter-wache.cjs"],
        env: { WETTER_WACHE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const m = /^\s*Front · Regen an A bei trockenem B (\d+) % · Lag (\d+) s \(Soll (\d+) s ±20 %\) · Worte (\d)\/5 \(([^)]*)\) · Mutation des Kerns: Welt (\w+), Labor (\w+)\s*$/m.exec(
                String(lauf.stdout || "")
            );
            if (!m) return { gruen: false, zahl: "keine Front-Zeile (Exit " + lauf.exit + ")" };
            const [nass, lag, soll, worte, welt, labor] = [+m[1], +m[2], +m[3], +m[4], m[6], m[7]];
            const rot = /\(F\) /.test(lauf.stderr || "");
            const gruen = nass >= 20 && Math.abs(lag - soll) <= 0.2 * soll && worte === 5 && welt === "stormy" && labor === "sturm" && !rot;
            return {
                gruen,
                zahl:
                    "Regen an A bei trockenem B " + nass + " % · Lag " + lag + " s (Soll " + soll + " s ±20 %) · Worte " + worte + "/5 (" +
                    m[5] + ") · Mutation des Kerns: Welt " + welt + ", Labor " + labor,
            };
        },
        pfad: [
            "stamm/dirigent-*.js",
            "stamm/bild-himmel.js",
            "stamm/feld-*.js",
            "stamm/daten.js",
            "phyto-core.js",
            "foundry-core.js",
            "worlds/terrain/phytogenesis.js",
            "worlds/terrain/index.html",
            "scripts/diag-wetter-wache.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = die Front am Ort: Regen an A bei trockenem B ≥ 20 % der Zeit, Lag = Abstand ÷ Wind ±20 %, alle 5 Labor-Zeilen erreichbar, die Mutation der Kern-Funktion zieht Labor und Welt",
    },

    // ── wetter.K2 ── gate:naesse:echt: klar gegen 10 min Regen als Spieler-Wort aus dem Ausgabe-Pfad (echter Renderer)
    // IN DER SITZUNG (29.10.): nur der Ort, den das Urteil liest — das Dorf (porös draußen, innen unter dem Dach, Regen innen);
    // die Wiese fuhr bis dahin mit (ein Teleport und fünf Schüsse, die keine Zeile trug). Der Messort dorf fährt den Dorf-Zug: das
    // Dorf wächst, bis ein Haus mit Hülle und Tür steht — die Welt danach trägt ein Dorf mehr (mutiert)
    // DER ORT VOR DEM DECKEL, NUR WAS DAS URTEIL LIEST (proben-schnell 30.10., proben-welt.cjs `naesseDorf`): die Seiten-Funktion der
    // Linse am SHA, das Dorf stellt die Sitzung vor der Probe; der Gang zu den Dach-Bauten (keine Zeile dieses Urteils) fällt
    {
        kriterium: "wetter.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { sek: 33, befehl: PW.torBefehl(PW.naesseDorf), mutiert: true },
        gpu: true,
        zeit: false,
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

    // ── wetter.K3 ── gate:wasser-leben P4 im Block koerper (Null-Renderer, Mess-Wiese): das Wort des Spielers „Sturm", 20 min
    // Welt-Uhr im Takt des Regens (`_tickRain` je 5 s) — der Regen des Wetter-Felds ist ein Term im Abfluss neben der Schmelze
    // (gelaende-core `abfluss`, `regenAbfluss`: ein linearer Speicher des Einzugsgebiets), die Pegel-Tafel folgt ihm je Stufe und
    // reist in den Faden; gemessen der Spiegel des Kerns (`_waterLevelAt`) am Bach der Mess-Wiese über dem trockenen, das Regen-
    // Feld gehalten (der Sturm regnet nicht) hebt er nichts. An main ea07267e ROT (keine Probe: der Abfluss trug nur die Schmelze);
    // am Zweig pegel-regen df64100a +0,2 m (die Krone des Betts, `pegelTafel`), 26 Tafeln an den Faden, gehalten 0.
    {
        kriterium: "wetter.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-wasser-leben.cjs", "--nur", "koerper"],
        env: { WASSER_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const b = jsonBlock(lauf.stdout);
            const p = (b && b.koerper && b.koerper.pegel) || {};
            const rg = p.regen;
            if (!rg) return { gruen: false, zahl: "keine Regen-Probe am Bach (koerper.pegel.regen fehlt, Exit " + lauf.exit + ")" };
            return {
                gruen: rg.hub >= 0.2 && rg.post > 0 && rg.fest <= 0.001 && !/P4 REGEN/.test(lauf.stdout),
                zahl:
                    "Bach +" + rg.hub + " m nach 20 min Sturm (Spieler-Wort, Welt-Uhr im Takt), " + rg.post +
                    " Tafeln an den Faden · Regen-Feld gehalten +" + rg.fest + " m · Exit " + lauf.exit,
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/wasser-*.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            "phyto-core.js",
            "scripts/diag-wasser-leben.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Pegel am Bach +≥ 0,2 m nach 20 min Sturm an einem Ort",
    },

    // ── wetter.K5 ── gate:kopplung F3: die Phase am Verhalten (quer gleich, längs verschieden, die Richtung dreht mit, Saat)
    {
        kriterium: "wetter.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kopplung.cjs"],
        env: { KOPPLUNG_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
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

    // ── wetter.K5 ── gate:kopplung F3 Feld: der EINE Wind am Ort (`_windAt`), vom Gelände geformt (gelaende-core windForm) —
    // Lee und Tal-Düse am Gesetz (Bühnen-Höhe), die Form an 41 × 41 Orten der Welt, und die Mutation „Wind ×0" zieht jeden der
    // fünf Leser (Wasser-Kräusel, Regen-Drift bis zum Boden seines Gesetzes, Tuch, Rauch des Feuers, Wagen-Seitenkraft)
    {
        kriterium: "wetter.K5",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kopplung.cjs"],
        env: { KOPPLUNG_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const m = /^\s*F3 Feld: Lee (-?\d+) % · Tal-Düse \+(-?\d+) % · Welt ([\d.]+)–([\d.]+) · Leser (\d+)\/(\d+) folgen ×0 \((.*)\)\s*$/m.exec(out);
            if (!m) return { gruen: false, zahl: "keine F3-Feld-Zeile (Exit " + lauf.exit + ")" };
            const [lee, duese, min, max, folgen, leser] = [+m[1], +m[2], +m[3], +m[4], +m[5], +m[6]];
            const fuenf = ["wasser", "regen", "tuch", "rauch", "wagen"].filter((n) => new RegExp("(^| )" + n + " ").test(m[7]));
            const f3 = out.split(/\r?\n/).filter((z) => /❌\s*F3/.test(z));
            const gruen =
                Math.abs(lee + 40) <= 2 && Math.abs(duese - 20) <= 2 && min <= 0.7 && max >= 1.1 && folgen === leser && fuenf.length === 5 &&
                !f3.length && !/PAGE-ERROR|FEHLER pageerror/.test(out);
            return {
                gruen,
                zahl:
                    "Lee " + lee + " % · Tal-Düse +" + duese + " % · Welt " + min + "–" + max + " · " + folgen + "/" + leser + " Leser folgen ×0, " +
                    fuenf.length + "/5 benannt (" + m[7] + ")",
            };
        },
        pfad: [
            "stamm/stoff-material.js",
            "stamm/bild-*.js",
            "stamm/koerper-*.js",
            "stamm/siedlung-ort.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            "gelaende-core.js",
            "phyto-core.js",
            "vehicle-core.js",
            "scripts/diag-kopplung.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = Lee −40 %, Tal-Düse +20 %, und jeder Leser außer Pflanze und Ohr (Wasser-Kräusel, Regen-Drift, Tuch, Feuer, Wagen-Seitenkraft) liest dieselbe Funktion (Mutation)",
    },

    // ── physik.K2 ── (Null-Renderer, Mechanik, als solche benannt) ZWEI Linsen in EINEM Lauf: das Durchdringen misst
    // gate:kollision-bild (V) — Fuchs · Wolf · Bär · Riese bei 144/60/30 fps + Takt-Deckel, der Spieler gehend und im Sprint,
    // der gestoßene Bär und der Fall gegen Mauer · Fels · Haus · Baum · Leib (die L7-Probe der Fahr-Linse wanderte mit
    // 4ef668954 dorthin); die Lage nach 200 Sim-Schritten je Bildrate misst diag-fahr-leben L8. Die Zeile gt ist Staffel 2.
    {
        kriterium: "physik.K2",
        staffel: 1,
        geraet: "headless",
        befehl: [
            "bash",
            "-c",
            'FAHR_LEBEN_PORT={PORT} node scripts/diag-fahr-leben.cjs; E1=$?; echo "FAHR-LEBEN EXIT $E1"; KOLLISION_BILD_PORT={PORT} node scripts/diag-kollision-bild.cjs; E2=$?; echo "KOLLISION-BILD EXIT $E2"; exit $(( E1 > E2 ? E1 : E2 ))',
        ],
        gpu: false,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            // L8 (diag-fahr-leben): der Wagen gegen den Bären, 200 Sim-Schritte bei 60 fps und gemischten Frames
            const l8 = z.find((x) => /^\s*(✅|❌) L8 /.test(x));
            const baer = l8 && /Bär (-?[\d.e-]+) m/.exec(l8);
            const wagen = l8 && /Abweichung Wagen (-?[\d.e-]+) m/.exec(l8);
            const l8ok = !!l8 && /✅/.test(l8) && !!baer && Math.abs(+baer[1]) <= 0.01 && !!wagen && Math.abs(+wagen[1]) <= 0.01;
            // (V) (gate:kollision-bild): je Leib die Takte der Matrix, kein Durchtritt, Eindringen ≤ 1 cm, Spalt ≤ 5 cm
            const LEIB_N = { fuchs: 20, wolf: 20, baer: 20, riese: 20, gehen: 10, sprint: 10, gestossen: 2, fall: 2 };
            const kopf = z.find((x) => /^\s*\(V\) Kontakt beim Tempo: \d+\/\d+ Zeilen/.test(x));
            const sm = kopf && /Schmuggel (\{.*\})\s*$/.exec(kopf);
            let schmuggel = null;
            try { schmuggel = sm ? JSON.parse(sm[1]) : null; } catch (_e) { schmuggel = null; }
            const je = {};
            for (const x of z) {
                const m = /^\s+(\S+)\s+(\S+) m\/s · Durchtritt (\d+)\/(\d+) · Eindringen max (\S+) m · Spalt max (\S+) m/.exec(x);
                if (m) je[m[1]] = { v: +m[2], durch: +m[3], n: +m[4], tief: +m[5], spalt: +m[6] };
            }
            const leiber = Object.keys(LEIB_N);
            const verstoss = z.filter((x) => {
                const m = /^\s*\(V\) (ZEILE FEHLT|DURCHTRITT|EINDRINGEN|VAKUÖS): ([a-zäöüß]+)/.exec(x);
                return m && leiber.includes(m[2]);
            });
            const stumpf = z.some((x) => /LINSE STUMPF: \(V\)/.test(x));
            const fehlt = leiber.filter((k) => !je[k] || je[k].n < LEIB_N[k]);
            const L = leiber.filter((k) => je[k]).map((k) => je[k]);
            const durch = L.reduce((s, w) => s + w.durch, 0);
            const takte = L.reduce((s, w) => s + w.n, 0);
            const tief = L.length ? Math.max(...L.map((w) => w.tief)) : NaN;
            const spalt = L.length ? Math.max(...L.map((w) => w.spalt)) : NaN;
            const vok = !!kopf && !!schmuggel && schmuggel.durch === true && !stumpf && !fehlt.length && !verstoss.length &&
                durch === 0 && tief <= 0.01 && spalt <= 0.05;
            if (!kopf && !l8) return { gruen: false, zahl: "weder (V) noch L8 in der Ausgabe (Exit " + lauf.exit + ")" };
            const gt = je.gt;
            return {
                gruen: l8ok && vok,
                zahl:
                    (kopf
                        ? "(V) Leiber " + (takte - durch) + "/" + takte + " Takte ohne Durchtritt, Eindringen max " + tief + " m, Spalt max " + spalt +
                          " m (gestoßener Bär " + (je.gestossen ? je.gestossen.v : "?") + " m/s, Riese " + (je.riese ? je.riese.v : "?") + " m/s)" +
                          (fehlt.length ? ", fehlen " + fehlt.join("/") : "") + (verstoss.length ? ", " + verstoss.length + " Verstöße" : "") +
                          ", Schmuggel " + (schmuggel && schmuggel.durch === true ? "durch" : "STUMPF")
                        : "(V) fehlt in der Ausgabe") +
                    " · " +
                    (l8 ? "L8 nach 200 Schritten Bär " + (baer ? baer[1] : "?") + " m, Wagen " + (wagen ? wagen[1] : "?") + " m" : "L8 fehlt") +
                    (gt ? " · gt (Staffel 2) " + gt.v + " m/s Durchtritt " + gt.durch + "/" + gt.n : ""),
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
            "scripts/diag-kollision-bild.cjs",
            "scripts/lib/fahr-proben.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "1 = die Leiber (Mechanik, als solche benannt)",
    },

    // ── physik.K2 Staffel 2 ── gate:kollision-bild `--bild` auf beiden Karten (die Welt zeichnet, Rezept `linse`): der Wagen der
    // (V)-Spur ist das schnellste Spiel-Rezept bei vmax × 1,2 (die vmax aus `_vehicleProfile`, gemessen das gefahrene Tempo) gegen
    // Mauer · Fels · Haus · Baum · Bär bei 144/60/30 fps und dem Takt-Deckel, nach jedem Sim-Schritt und Bild kein Durchtritt,
    // Eindringen ≤ 1 cm; die Bild-Probe: Wagen und gestoßener Bär an der 0,35-m-Mauer — an jedem Bild, in dem sie anliegen, ihre
    // gezeichneten Ecken (Zeichner-Matrix, Skin) gegen das gezeichnete Mesh der Mauer: Spalt ≤ 5 cm, und Durchdringen 0 gilt im
    // Bild wie im Körper (Eindringen ≤ 1 cm). Die OFFEN-Zeile der Linse (Bild ≠ Kollision) ist hier ROT. Am Kopf pk2-vmax
    // (headless und swiftshader) ROT: 19,63 m/s ohne Durchtritt, im Bild der Wagen bis 7,9 cm, der Bär bis 17,1 cm in der Mauer.
    // IN DER SITZUNG (29.10., proben-welt.cjs `kollisionTempo`): `tempo` der Linse in der warmen Welt, per Anker gekürzt auf Wagen,
    // gestoßenen Bären, Schmuggel und Beweisbild (die Leiber sind Staffel 1); die Zeilen sind die der Linse. Bis 29.10. ein eigener
    // Boot samt Zählung aller Werke (Radeon b3f9ae95: 4,85 min Arbeit). Die Probe räumt Natur von der Bahn: mutiert.
    {
        kriterium: "physik.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { befehl: PW.torBefehl(PW.kollisionTempo), sek: 10, mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const kopf = z.find((x) => /^\s*\(V\) Kontakt beim Tempo: \d+\/\d+ Zeilen/.test(x));
            const je = {};
            for (const x of z) {
                const m = /^\s+(wagen|gestossen)\s+(\S+) m\/s · Durchtritt (\d+)\/(\d+) · Eindringen max (\S+) m · Spalt max \S+ m(?: · im Bild Spalt max (\S+) m, Eindringen max (\S+) m)?(?: · (\S+) vmax (\S+) m\/s × (\S+))?/.exec(x);
                if (m) je[m[1]] = { v: +m[2], durch: +m[3], n: +m[4], tief: +m[5], bs: m[6] == null ? NaN : +m[6], bt: m[7] == null ? NaN : +m[7], rezept: m[8], vmax: +m[9], f: +m[10] };
            }
            // jede Zeile der Linse gegen Wagen oder gestoßenen Bären (ROT wie OFFEN) und jede Stumpfheit der Tempo-Probe
            const verstoss = z.filter((x) => /^\s*(OFFEN )?\(V\) [A-ZÄÖÜ ≠]+: (wagen|gestossen)\b|LINSE STUMPF: \(V\)|LEER: \(V\)/.test(x));
            const [w, g] = [je.wagen, je.gestossen];
            if (!kopf || !w || !g) return { gruen: false, zahl: "(V) Wagen oder gestoßener Bär fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            const tempo = w.f >= 1.2 && w.v / w.vmax >= 1.19;
            const gruen =
                tempo && w.n >= 20 && g.n >= 4 && w.durch + g.durch === 0 && Math.max(w.tief, g.tief) <= 0.01 &&
                [w, g].every((k) => k.bs <= 0.05 && k.bt <= 0.01) && !verstoss.length;
            return {
                gruen,
                zahl:
                    "Wagen " + w.rezept + " " + w.v + " m/s (vmax " + w.vmax + " × " + w.f + "), " + (w.n - w.durch) + "/" + w.n +
                    " Läufe ohne Durchtritt, Eindringen max " + w.tief + " m · gestoßener Bär " + g.v + " m/s · im Bild an der Mauer: Wagen Spalt max " +
                    w.bs + " m, Eindringen max " + w.bt + " m; Bär Spalt max " + g.bs + " m, Eindringen max " + g.bt + " m" +
                    (verstoss.length ? " · " + verstoss.length + " Verstöße (" + verstoss[0].trim().slice(0, 90) + ")" : ""),
            };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/kreatur-*.js",
            "stamm/dirigent-*.js",
            "stamm/siedlung-*.js",
            "stamm/stoff-*.js",
            "stamm/gelaende-*.js",
            "stamm/studio-*.js",
            "stamm/daten.js",
            "vehicle-core.js",
            "koerper-core.js",
            "tetrapoda-core.js",
            "foundry-core.js",
            "scripts/diag-kollision-bild.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = auch der Wagen bei der vmax des Spiels × 1,2 und die Bild-Probe (Spalt Leib–Wand ≤ 5 cm) auf beiden Geräten",
    },

    // ── feld.K3 ── gate:stand-takt (RS): 3 600 echte _gameLoopTick = 60 s Spielzeit nach einer Tat, Sim-Einheiten je Sim
    {
        kriterium: "feld.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs"],
        env: { STAND_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
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

    // ── feld.K3 Staffel 2 ── gate:stand-takt (RS, WS) am Kopf: in 60 s Ruhe arbeitet keine der sieben Sims (der Brand
    // eingeschlossen), ein Akt kostet höchstens zwei Einheiten je geschriebener Zelle (RUHE-TAT), das Feld räumt am Tod (nach
    // vier Wellen 0 Tote: FELD-TOTE, FELD-BESUCH), der Brand arbeitet nur in brennenden Zellen, erlischt, hinterlässt Asche,
    // leuchtet und glüht (BRAND-*) — die Wand grün nur, wenn jede Sim-Probe hält. An main 6f8a2c66 ROT: Taten 46 802
    // Einheiten in 60 s Ruhe (der Blick des Spielers je Bild), das Feld bis 1 110 Zellen bei 573 lebenden, kein Brand im Stamm
    // (feld-k2k3)
    {
        kriterium: "feld.K3",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs"],
        env: { STAND_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = (n) => (new RegExp("^\\s*" + n + ": (.*)$", "m").exec(out) || [])[1];
            const [ruhe, feld, brand] = [z("Sim-Ruhe 60 s"), z("Sim-Wecken feld"), z("Sim-Wecken brand")];
            if (!ruhe || !feld || !brand) return { gruen: false, zahl: "keine Sim-Ruhe-, Feld- oder Brand-Zeile (Exit " + lauf.exit + ")" };
            // das Ende der Linse in beiden Formen: „✅ STAND-TAKT GRÜN“/„❌ STAND-TAKT ROT:“ und seit z63 (mensch-begegnung, das EINE
            // wandEnde) „✅ GRÜN — STAND-TAKT …“/„❌ ROT — n Verletzung(en): …“
            const rot = (out.split("❌ STAND-TAKT ROT:")[1] || out.split(/❌ ROT — \d+ Verletzung\(en\): /)[1] || "").split(/\n| · /).map((x) => x.trim()).filter(Boolean);
            return {
                gruen: lauf.exit === 0 && /✅ (STAND-TAKT GRÜN|GRÜN — STAND-TAKT)/.test(out) && / brand 0 /.test(ruhe + " "),
                zahl: "Ruhe 60 s: " + ruhe + " · Feld: " + feld.split(" — ")[0] + " · Brand: " + brand.split(" — ")[0] +
                    (rot.length ? " · ROT: " + rot.slice(0, 3).join(" | ") : ""),
            };
        },
        pfad: [
            "stamm/wasser-*.js",
            "stamm/bild-himmel.js",
            "stamm/feld-*.js",
            "stamm/gelaende-*.js",
            "stamm/vegetation-*.js",
            "stamm/koerper-fahrt.js",
            "stamm/dienst.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "scripts/diag-stand-takt.cjs",
            "scripts/lib/stand-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = jede langsame Simulation (Wasser, Overlays, Wetter, Brand, Wachstum) hat 0 Einheiten in Ruhe und arbeitet nur in berührten Zellen",
    },

    // ── feld.K2 ── gate:mp-sync (e) (zwei Seiten einer Maschine, ein echter Broker): A gräbt, schüttet und baut im Gespräch,
    // B trägt denselben Abdruck der Schreib-Akte (Edits, Bauten mit Kennung, Boden an jedem Edit), nach dem Reload von B
    // derselbe; das Netz-Log beider Seiten trägt keine Zustands-Nachricht; der Leib rechnet bit-gleich aus seinen Eingaben; je
    // Probe ein Selbsttest. An main 6f8a2c66 fehlt (e); am Schnitt ROT: die Kennung eines Akt-Baus war der Zähler der Seite
    // (A 463, B 471) (feld-k2k3)
    {
        kriterium: "feld.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-mp-sync.cjs"],
        env: { MP_SYNC_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const e = String(lauf.stdout || "").split(/\r?\n/).filter((x) => /^\s*(OK|ROT)\s+\(e\)/.test(x));
            if (e.length < 6) return { gruen: false, zahl: "(e) trägt " + e.length + " von 6 Proben (Exit " + lauf.exit + ")" };
            const rot = e.filter((x) => /^\s*ROT/.test(x));
            return {
                gruen: lauf.exit === 0 && rot.length === 0,
                zahl: (rot.length ? rot.length + " von " + e.length + " (e)-Proben ROT: " : e.length + " (e)-Proben GRÜN: ") +
                    (rot.length ? rot : e.slice(0, 3)).map((x) => x.replace(/^\s*(OK|ROT)\s+/, "").slice(0, 140)).join(" | "),
            };
        },
        pfad: [
            "stamm/netz-*.js",
            "stamm/feld-*.js",
            "stamm/siedlung-*.js",
            "stamm/gelaende-*.js",
            "stamm/speicher-*.js",
            "stamm/werkstatt-*.js",
            "stamm/dienst.js",
            "stamm/dirigent-*.js",
            "signaling-server.js",
            "save-server.js",
            "voxel-worker.js",
            "gelaende-core.js",
            "scripts/diag-mp-sync.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Edits und Bauten aus Schreib-Akten byte-gleich über Peers und Reload, gemessen",
    },

    // ── feld.K2 Staffel 2 ── gate:mp-sync (f) (zwei Seiten einer Maschine, ein echter Broker): A springt 20 min Spielzeit in einen
    // Zug, in dem am Ort ein Sturm aufzieht; B trägt die Welt-Uhr von A (`pos.w`, `_weltUhrNimm`) und denselben Zug im Abdruck
    // von (e), über Peers und den Reload mitten im Sturm. Was Stufe 2 noch verlangt, schreibt die Linse als (f)-Zeile mit Zahl:
    // Wetter (Wort, Übergang) und Leben je Zelle gleich, Brand und Pegel gemessen — OFFEN, bis jede Teil-Simulation gleich ist.
    // GRÜN erst, wenn beide (f)-Zeilen OK sind und (e) den Zug in Peers und Reload gleich trägt. An main ROT (B trägt die Uhr
    // von A nicht, fk2-uhr); am Schnitt fk2-uhr: Zug gleich, Wetter gleich, Leben 0 von 237 Zellen, Brand und Pegel ungemessen.
    {
        kriterium: "feld.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-mp-sync.cjs"],
        env: { MP_SYNC_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const f = z.filter((x) => /^\s*(OK|ROT|OFFEN)\s+\(f\)/.test(x));
            const zug = z.filter((x) => /^\s*OK\s+\(e\) (Peers|Reload):/.test(x) && /zug gleich/.test(x)).length;
            return {
                gruen: lauf.exit === 0 && zug === 2 && f.length >= 2 && f.every((x) => /^\s*OK/.test(x)),
                zahl:
                    "Zug der Welt-Uhr gleich in " + zug + " von 2 (e)-Zeilen (Exit " + lauf.exit + ") · " +
                    (f.length ? f.map((x) => x.replace(/^\s*/, "").slice(0, 160)).join(" | ") : "keine (f)-Zeile"),
            };
        },
        pfad: [
            "stamm/netz-*.js",
            "stamm/feld-*.js",
            "stamm/bild-himmel.js",
            "stamm/kreatur-*.js",
            "stamm/speicher-*.js",
            "stamm/dirigent-*.js",
            "phyto-core.js",
            "signaling-server.js",
            "save-server.js",
            "scripts/diag-mp-sync.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = alle Teil-Simulationen (Wetter am Ort, Pegel, Overlays, Brand) ohne Zustands-Nachricht; ein Reload mitten im Sturm setzt denselben Zustand fort",
    },

    // ── feld.K1 ── gate:fahr-leben W (Zweig wetter-kette-k1): Sturm → Regen-Feld → Nässe → Grip, je Glied die Festhalte-Probe
    // (`ketteVerdict`: ein Glied zählt, wenn es mit dem Sturm zieht UND steht, solange sein Vorgänger gehalten wird); das
    // Urteil liest die Zeile `KETTE {"tiefe":N,…}` — an main fehlt `--kette` (ROT „keine KETTE-Zeile"). Seit fahrzeug-k1-reifen
    // (25.10.) misst das Grip-Glied den Bremsweg `s` ab 50 km/h (die Verzögerung fiel mit ihm), μ liest der Reifen aus der Stoff-Zeile.
    {
        kriterium: "feld.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kette"],
        env: { FAHR_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const k = jsonZeile(lauf.stdout, /^KETTE \{/);
            if (!k) return { gruen: false, zahl: "keine KETTE-Zeile (Exit " + lauf.exit + ")" };
            const r = k.roh || {};
            const v = (l) => (r[l] && r[l].s != null ? r[l].s.toFixed(1) : "?");
            return {
                gruen: k.tiefe >= 2,
                zahl:
                    "Tiefe " + k.tiefe + " mit Festhalte-Probe · Bremsweg trocken " + v("trocken") + " → Sturm " + v("sturm") +
                    " m (Regen gehalten " + v("festRegen") + ", Nässe gehalten " + v("festNaesse") + ") · Exit " + lauf.exit,
            };
        },
        pfad: KETTE_PFAD,
        quelle: "1 = Tiefe 2–3 mit Festhalte-Probe",
    },
    // Staffel 2: dieselbe Kette, dieselbe Festhalte-Probe (`ketteVerdict` zählt nur Glieder, die mit dem Sturz ziehen UND stehen,
    // solange ihr Vorgänger gehalten wird) — die Tiefe ≥ 4. An main d43cb61c ROT: Tiefe 3 (Regen-Feld, Nässe, Grip); ein viertes
    // Glied (Pegel aus dem Regen, Unterstand und Tränke der Tiere aus Nässe und Pegel) misst die Linse, sobald es steht, im selben
    // Commit wie das Glied — die Station liest nur `tiefe`
    {
        kriterium: "feld.K1",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kette"],
        env: { FAHR_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const k = jsonZeile(lauf.stdout, /^KETTE \{/);
            if (!k) return { gruen: false, zahl: "keine KETTE-Zeile (Exit " + lauf.exit + ")" };
            const glieder = Object.keys((k.roh && k.roh.sturm) || {}).filter((g) => g !== "s");
            return { gruen: k.tiefe >= 4, zahl: "Tiefe " + k.tiefe + " mit Festhalte-Probe (Glieder " + glieder.join(" → ") + "), Soll ≥ 4 · Exit " + lauf.exit };
        },
        pfad: KETTE_PFAD,
        quelle: "2 = Tiefe ≥ 4",
    },

    // ── feld.K4 ── gate:stand-takt --tat (Null-Renderer, Mess-Wiese): 10 Bäume fällen, 30 Pflanzen pflücken mit tryMouseBreak;
    // gezählt, was die Welt zeichnet, nach 1 h, nach Save → Reload, nach Reload + 1 h und nach 36 h mehr. Die Linse urteilt die
    // Stunde vor dem Reload (`✅ TAT GRÜN`), Station 2 liest Reload, Reload + Stunde und Heilung aus `TAT {…}` —
    // an main 833bbc24 ROT: 0 Stümpfe für 10, Feld 0, nach dem Reload 30 von 30 Pflanzen zurück (feld-k4-tat 08b943ca)
    {
        kriterium: "feld.K4", staffel: 1, geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs", "--tat"], env: { STAND_TAKT_PORT: "{PORT}" }, gpu: false, zeit: false, minuten: 4,
        urteil: (j, lauf) => {
            const T = jsonZeile(lauf.stdout, /^TAT {/);
            const h = T && T.stunde;
            if (!h) return { gruen: false, zahl: "keine TAT-Zeile (Exit " + lauf.exit + ")" };
            const gruen = /✅ TAT GRÜN/.test(lauf.stdout) && T.gefaellt >= 8 && T.gepflueckt >= 25 &&
                h.baeume <= 0.3 * T.baeumeVorher && h.pflanzen === 0 && h.stuempfe >= T.gefaellt && h.narbe <= -0.05;
            return { gruen, zahl: "nach der Stunde vor dem Reload: " + h.baeume + " von " + T.baeumeVorher + " Bäumen, " + h.pflanzen +
                " von " + T.gepflueckt + " Pflanzen zurück, " + h.stuempfe + " Stümpfe für " + T.gefaellt + ", Feld " + h.narbe + " unter frozen" };
        },
        pfad: TAT_PFAD,
        quelle: "1 = die Spur hält bis zum Reload",
    },
    {
        kriterium: "feld.K4", staffel: 2, geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs", "--tat"], env: { STAND_TAKT_PORT: "{PORT}" }, gpu: false, zeit: false, minuten: 4,
        urteil: (j, lauf) => {
            const T = jsonZeile(lauf.stdout, /^TAT {/);
            const [a, r, g] = T ? [T.reload, T.reloadStunde, T.heilung] : [];
            if (!a || !r || !g) return { gruen: false, zahl: "keine TAT-Zeile mit Reload und Heilung (Exit " + lauf.exit + ")" };
            const haelt = (h) => h.baeume <= 0.3 * T.baeumeVorher && h.pflanzen === 0 && h.stuempfe >= T.gefaellt && h.narbe <= -0.05;
            const gruen = T.gefaellt >= 8 && T.gepflueckt >= 25 && haelt(a) && haelt(r) &&
                g.pflanzen >= 0.9 * T.gepflueckt && g.narbe >= r.narbe / 2 && g.taten < r.taten;
            const z = (h) => h.baeume + "/" + T.baeumeVorher + " Bäume, " + h.pflanzen + " Pflanzen, " + h.stuempfe + " Stümpfe, Feld " + h.narbe;
            return { gruen, zahl: "nach dem Reload " + z(a) + " · nach Reload und Stunde " + z(r) + " · nach 36 Stunden " + g.pflanzen +
                " von " + T.gepflueckt + " Pflanzen zurück, Feld " + r.narbe + " → " + g.narbe + ", Taten " + r.taten + " → " + g.taten };
        },
        pfad: TAT_PFAD,
        quelle: "2 = sie hält nach Reload UND nach 1 Spielstunde und wächst über das Feld nach",
    },

    // ── physik.K1 ── gate:fahr-leben --koerper (Null-Renderer): die EINE Stoff-Zeile (state.materials) trägt ρ in kg/m³, Teile wiegen
    // ihr Mesh-Volumen, der Mensch die Vereinigung seiner Glieder unter der Haut; Mutation ρ ×2 → Masse ×2 und Eintauchtiefe in der
    // Welt; Bänder der Messung: Mensch 60–90 kg, Wagen 1,1–1,6 t, Δv ±5 %, Holz ρ/ρw ±10 %, Stein sinkt, Labor = Welt ≤ 1 %
    // (physik-k1-kg 0530894e; an main ROT: Massen ×1,000 unter ρ ×2, Spieler 117 kg)
    {
        kriterium: "physik.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["bash", "-c", 'FAHR_LEBEN_PORT={PORT} node scripts/diag-fahr-leben.cjs --koerper; echo "KOERPER EXIT $?"'],
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/).find((x) => /^\s*(✅|❌) K1#1 /.test(x));
            if (!l) return { gruen: false, zahl: "K1#1 fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            return { gruen: /^\s*✅/.test(l), zahl: l.replace(/^\s*(✅|❌) K1#1 \(physik\.K1\) /, "") };
        },
        pfad: ["stamm/bau-*.js", "stamm/kreatur-*.js", "stamm/koerper-*.js", "stamm/kampf.js", "stamm/wasser-*.js", "stamm/dirigent-*.js",
            "stamm/daten.js", "foundry-core.js", "tetrapoda-core.js", "koerper-core.js", "vehicle-core.js", "schmiede-core.js",
            "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/lib/wasser-linse.cjs"],
        quelle: "1 = die Leiber (Spieler, Tier, Wagen) gemessen",
    },
    {
        kriterium: "physik.K1",
        staffel: 2,
        geraet: "headless",
        befehl: ["bash", "-c", 'FAHR_LEBEN_PORT={PORT} node scripts/diag-fahr-leben.cjs --koerper; echo "KOERPER EXIT $?"'],
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const l1 = z.find((x) => /^\s*(✅|❌) K1#1 /.test(x));
            const l2 = z.find((x) => /^\s*(✅|❌) K1#2 /.test(x));
            if (!l1 || !l2) return { gruen: false, zahl: "K1#1/K1#2 fehlen in der Ausgabe (Exit " + lauf.exit + ")" };
            return {
                gruen: /^\s*✅/.test(l1) && /^\s*✅/.test(l2) && /KOERPER EXIT 0\b/.test(lauf.stdout),
                zahl: l2.replace(/^\s*(✅|❌) K1#2 \(physik\.K1\) /, "") + (/^\s*✅/.test(l1) ? "" : " · K1#1 ROT"),
            };
        },
        pfad: ["stamm/bau-*.js", "stamm/kreatur-*.js", "stamm/koerper-*.js", "stamm/kampf.js", "stamm/werkstatt-*.js", "stamm/wasser-*.js",
            "stamm/dirigent-*.js", "stamm/daten.js", "foundry-core.js", "tetrapoda-core.js", "koerper-core.js", "vehicle-core.js",
            "schmiede-core.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/lib/wasser-linse.cjs"],
        quelle: "2 = jedes Ding (gebaut, geschmiedet, lose); die Mutation von ρ in der EINEN Stoff-Zeile zieht Masse und Eintauchtiefe in der Welt",
    },

    // ── stoffe.K1 ── gate:gegenstand-stoff --tafel (Null-Renderer, am Ufer des Sees der Welt): die EINE Stoff-Tafel in SI
    // (`state.materials`, ihr EINER Leser `_stoff`) und je Stoff (holz, stein, eisen, gras, erde, laub, wasser) EINE Mutation je
    // Wirkung mit Folge in der Welt — ρ ×½: Masse und Eintauchtiefe eines Quaders im See (Wasser: ein Holz-Quader liegt
    // tiefer); μ ×½: der Bremsweg des gestoßenen Wolfs auf dem Stoff (Platte, Wiese, Waldboden) ×2; Klang-Spalte ×2: der
    // Spektral-Schwerpunkt des Schritts (die Stimme im OfflineAudioContext, klang-core `schwerpunkt`); T_zünd −100 K: die
    // Zündzeit im Brennpunkt einer Linse; T_schmelz −100 K: der See gefriert im Winter nicht; c ×½: die Erwärmung im
    // Brennpunkt nach 2 s (Wasser: sein Tagesgang). Die Sabotage im selben Lauf (der Leser liefert die alte Zeile) macht jede
    // Wirkung ROT (`vorbei` leer). Albedo → Luma braucht das Ausgabe-Bild (GPU) und zählt headless nie. An main 206b395a ROT:
    // holz, stein, eisen, erde, laub 1/7 (nur ρ), gras und wasser 0/7; am Zweig stoffe-k1-tafel 4–5 von 7 je Stoff.
    {
        kriterium: "stoffe.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-gegenstand-stoff.cjs", "--tafel"],
        env: { GEGENSTAND_STOFF_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const T = jsonZeile(lauf.stdout, /^TAFEL \{/);
            if (!T || !T.je || !Array.isArray(T.vorbei)) return { gruen: false, zahl: "keine TAFEL-Zeile (Exit " + lauf.exit + ")" };
            const je = Object.entries(T.je);
            const gruen =
                lauf.exit === 0 &&
                /✅ TAFEL GRÜN/.test(lauf.stdout) &&
                je.length === 7 &&
                je.every(([, w]) => w.length >= 3) &&
                T.vorbei.length === 0;
            return {
                gruen,
                zahl:
                    je.map(([s, w]) => s + " " + w.length + "/7").join(" · ") +
                    (T.vorbei.length ? " · an der Tafel vorbei: " + T.vorbei.join(", ") : " · Sabotage ROT an jeder Wirkung"),
            };
        },
        pfad: [
            "stamm/bau-*.js",
            "stamm/gelaende-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/klang.js",
            "stamm/wasser-*.js",
            "stamm/bild-himmel.js",
            "stamm/siedlung-satz.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "klang-core.js",
            "gelaende-core.js",
            "vehicle-core.js",
            "schmiede-core.js",
            "scripts/diag-gegenstand-stoff.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ≥ 3 von 7 Wirkungen je Stoff bestehen ihre Mutation",
    },

    // ── stoffe.K2 ── gate:stand-takt, der Brand-Block der Sim-Wecken (Null-Renderer, Mess-Wiese, Spielzeit-Takte): das Wort bewölkt
    // (Wind 0,3; die Bühne hält die Nässe trocken wie die W-Kette ihren Vorgänger), gezündet über den Weg des Brennglases
    // (`_brandEntfachen`), je Bild genau EIN Schritt des Brands. Die Front ist die kürzeste Lauf-Zeit vom Eintrittspunkt jeder
    // 16-m-Zelle, ihr Tempo Rothermel 1972 aus der Spalte `brenn` der Stoff-Tafel, dem EINEN Wind (`_windAt` in seiner
    // Beaufort-Stärke, ohne die wandernde Böe) und dem Hang (stamm/feld-leben.js `_brandTempo`). Gemessen am Zustand der Zellen
    // (je Sprung der Front die Zelle, von der sie kam → der Punkt, an dem sie ankam): mit dem Wind der Median der Köpfe (je
    // Gras-Quelle ihr schnellster Sprung, ±20° um den Kopf), gegen den Wind (±30°) der schnellste Sprung; die Mutante im selben
    // Lauf (derselbe Herd, `_windAt` ohne m/s) läuft nirgends ≥ 0,5 m/s. An main 557d4aad ROT (die Brand-Zeile trägt kein Tempo: Übergriff nach Würfeln ohne Wind),
    // am Zweig w3s-feuer GRÜN in vier Läufen: mit dem Wind 0,882–0,919 m/s (21–24 Köpfe), gegen 0,028, ohne Wind höchstens 0,041,
    // bis 18,3 Einheiten je Zelle.
    {
        kriterium: "stoffe.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs"],
        env: { STAND_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const m = /^\s*Sim-Wecken brand: (\{.*\}) — /m.exec(String(lauf.stdout || ""));
            let b = null;
            try {
                b = m && JSON.parse(m[1]);
            } catch (_e) {}
            if (!b || !Number.isFinite(b.mit)) return { gruen: false, zahl: "keine Front im Brand-Block (Exit " + lauf.exit + ")" };
            const gruen = b.start === true && b.koepfe >= 3 && b.mit >= 0.5 && b.mit <= 2 && b.gegen <= 0.2 && b.ohneWind < 0.5;
            return {
                gruen,
                zahl:
                    "mit dem Wind " + b.mit + " m/s (" + b.koepfe + " Köpfe) · gegen " + b.gegen + " m/s · Mutante ohne Wind bis " +
                    b.ohneWind + " m/s · bis " + b.einheiten + " Einheiten je Zelle",
            };
        },
        pfad: [
            "stamm/feld-*.js",
            "stamm/bau-vorlagen.js",
            "stamm/stoff-material.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/vegetation-*.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "phyto-core.js",
            "gelaende-core.js",
            "scripts/diag-stand-takt.cjs",
            "scripts/lib/stand-linse.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "spec/profiband/haushalt.json",
        ],
        quelle: "1 = die Front läuft im Rothermel-Band (mit dem Wind 0,5–2 m/s, gegen ≤ 0,2 m/s) an einer Pose",
    },

    // ── stoffe.K2#2 ── gate:stand-takt --brand (Null-Renderer, Mess-Wiese, Spielzeit-Schritte des Takts `_tickBrand`; headless, die ms
    // je Bild an der CPU des Läufers — das Bild von Asche, Rauch und Glut an Radeon und GTX misst diese Station nicht): die Feuchte des Betts ist EINE Funktion des Orts (stamm/feld-leben.js `_brandFeuchte`: die Luft-Trockene,
    // der Boden der Zelle aus der Hydrosphäre `_feuchteAt` bis zur Faser-Sättigung, der Regen als freies Wasser bis 250 %), die
    // Asche liegt im Boden-Stoff (Kanal G der Kronen-Karte, `_ascheMalen`, die Palette `asche` Y 0,052) als weiche Grenze aus dem Feld
    // (`_brandNarbe`: der Anteil verbrannter Zell-Mitten, vom EINEN Rauschen verschoben — nie das 16-m-Raster) und grünt mit der
    // Sukzession nach; das Bild (`_brandBild`: die Flammen der Front aus derselben Zelle, die das Licht liest, Länge nach Byram, und
    // die Fahne als Linien-Plume mit Körper) und Knistern (`_glutAmOhr`) lesen `brandFeld` wie das Licht. Gemessen: HALT windauf des Flusses
    // nächst der Mess-Wiese (je Zelle, die die Front erreichte und nicht fing, ihr Grund; die Mutante ohne die Feuchte des Orts
    // brennt ins nasse Ufer), FELS die Stein-Zellen, die dieselbe Front erreichte und nicht fing, REGEN (30 s Brand, dann das Wort Regen; die Mutante ohne freies
    // Wasser), LESER im Brand (Licht, Flammen, Fahne, Ohr; DECKUNG der Fahne 8 m über den Flammen, die Mutante Fäden ohne Körper),
    // KANTE der Narbe (am Saum der Asche der Anteil der Gefälle in den Achsen und der Abstand zum 16-m-Raster, die Mutante malt das
    // Quadrat der Zelle), ASCHE an der Zelle des Herds (Asche, Halme; nach der Stufe Gras), ZEIT 2 km fern bei ≥ 2 000 brennenden
    // Zellen (je Bild p95 von Takt und Lesern, der Verzug des Schritts) und SCHIRM (das Bild des Brands je Bild, im Deckel seiner
    // Flammen und Zellen). Die Uhr ist Spieler-Wort: HALT brennt mittags (bis w3v-brand-bild lief die Uhr, so weit das Booten
    // brauchte — derselbe Herd trug 0 bis 95 Aschen). Vorher (main b3f9ae95 + w3s-feuer): das Laub fiel im
    // Landregen erst nach 196 s, das nasse Ufer brannte wie die Kuppe, die Asche trug keine Albedo, Rauch und Knistern lasen den Brand
    // nicht, 2 000 Zellen kosteten je Schritt 7,4 ms und die Leser 2,5 ms je Bild. Am Zweig w3u-nachfolge (Null-Renderer, Radeon-Laptop):
    // GRÜN — Regen 20 s (Mutante 300), Halt 2× am nassen Gras (Mutante: 7 nasse brennen, 4× Halt am Wasser), Fels hält, Asche Y 0,052
    // → nach der Stufe Gras 0,148, je Bild p95 0,3 ms bei 2 000 Zellen (451 der Welt), Verzug 1 s. In der Nacht (Radeon) brannte EINE
    // Zelle als Fleck ohne Flamme, die Fahne ein Faden, die Asche eine Platte mit geraden Kanten im Raster. Am Zweig w3v-brand-bild
    // (Null-Renderer, Cloud): GRÜN — Halt 95 Zellen, 3× am nassen Gras, 11× am Stein (Mutante 7 nasse), Regen 7 s (Mutante 300), Flammen 21 bis
    // 2,23 m, Deckung 0,989 (Mutante 0,163), Kante Achse 0,31 · Linie 1,25 m (Mutante 0,963 · 0), Asche voll 0,81 → Gras 0, je Bild
    // p95 0,2 ms, Schirm 0,7 ms bei 2 000 Zellen. Der Schritt des Brands fällt mit einem Hauch (bis dahin hing ein Lauf, der die Uhr
    // auf `_brandUhr + schrittS` stellte, an ~0,1 % der Uhren: derselbe Herd trug 0 bis 95 Aschen). GPU: an der Station.
    {
        kriterium: "stoffe.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs", "--brand"],
        env: { STAND_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const B = jsonZeile(lauf.stdout, /^BRAND \{/);
            if (!B || !B.halt || !B.regen || !B.zeit || !B.asche || !B.asche.asche)
                return { gruen: false, zahl: "keine BRAND-Zeile (Exit " + lauf.exit + ")" };
            const [h, m, rg, rm, l, a, z, k, km] = [B.halt, B.haltM, B.regen, B.regenM, B.leser, B.asche, B.zeit, B.kante || {}, B.kanteM || {}];
            const gruen =
                /✅ BRAND GRÜN/.test(lauf.stdout) &&
                h.nass >= 1 &&
                h.wasser + m.wasser >= 1 &&
                h.wasserGebrannt === 0 &&
                h.nassGebrannt === 0 &&
                m.nassGebrannt >= 1 &&
                h.fels >= 1 &&
                rg.s <= 60 &&
                rm.s > 60 &&
                l.licht >= 1 &&
                l.rauch >= 1 &&
                l.flammen >= 1 &&
                l.deckung >= 0.9 &&
                l.glutF >= 64 &&
                k.achse <= 0.4 &&
                k.linie >= 0.8 &&
                km.linie < 0.5 &&
                a.asche.a >= 0.99 &&
                a.gras.a === 0 &&
                z.brennend >= 2000 &&
                z.bildMs <= 0.5 &&
                z.schirmMs <= 1 &&
                z.verzugS <= 2;
            return {
                gruen,
                zahl:
                    "Halt: " + h.brannte + " Zellen brannten, die Front hielt " + h.nass + "× am nassen Gras (ohne die Feuchte des Orts brannten " +
                    m.nassGebrannt + " nasse, sie hielt " + m.wasser + "× am Wasser) · Fels " + h.fels + "× gehalten" +
                    " · Regen löscht nach " + rg.s + " s (Mutante " + rm.s + " s) · Asche " + a.asche.a + " (voll " + a.asche.voll +
                    ") → nach der Stufe Gras " + a.gras.a + " · Kante Achse " + k.achse + ", Linie " + k.linie + " m (Mutante " + km.achse +
                    ", " + km.linie + ") · Licht " + l.licht + ", Flammen " + l.flammen + " bis " + l.lang + " m, Fahne " + l.rauch +
                    " Ballen, Deckung " + l.deckung + ", Glut am Ohr " + l.glutF + " m² · " + z.brennend + " brennende Zellen (" + z.echt +
                    " der Welt): je Bild p95 " + z.bildMs + " ms (Leser " + z.leserMs + "), Schirm " + z.schirmMs + " ms, der Schritt bis " + z.verzugS + " s hinter der Uhr",
            };
        },
        pfad: [
            "stamm/feld-*.js",
            "stamm/bau-vorlagen.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/vegetation-*.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-ort.js",
            "stamm/stoff-material.js",
            "stamm/klang.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "foundry-core.js",
            "fachwerk-core.js",
            "phyto-core.js",
            "gelaende-core.js",
            "scripts/diag-stand-takt.cjs",
            "scripts/lib/stand-linse.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle:
            "2 = Halt an Fluss, Fels und nassem Gras, Regen löscht ≤ 60 s, Asche ≤ 0,08 grünt nach, Licht/Rauch/Knistern aus demselben Zustand, 2 000 brennende Zellen ≤ 0,5 ms CPU an der GTX-CPU, beide Geräte",
    },

    // ── stoffe.K3 ── das Eis, die feste Phase der EINEN Wasser-Wahrheit (gate:wasser-leben E im Block koerper, Null-Renderer:
    // Mechanik am Spieler-Weg, R3): im Winter (Saison 0,875, das Temperatur-Feld des Gelände-Kerns am Spiegel unter 0 °C)
    // geht der Spieler mit W über den See der Mess-Wiese und steht auf dem Eis, Wolf, Fuchs und Bär stehen auf ihm; das Feld
    // +10 °C an seiner EINEN Naht (`_temperaturAt`) bricht ihn ein — er schwimmt wie im Sommer. Am main 6f8a2c66 ROT (keine
    // Eis-Probe; im Winter schwamm der Spieler, die Füße bis 1,227 m unter dem Spiegel), am Zweig stoffe-k3-phasen GRÜN.
    {
        kriterium: "stoffe.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-wasser-leben.cjs", "--nur", "koerper"],
        env: { WASSER_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const b = jsonBlock(lauf.stdout);
            const e = b && b.koerper && b.koerper.eis;
            if (!e || !e.winter || !e.mutation)
                return { gruen: false, zahl: "keine Eis-Probe in der Ausgabe (Exit " + lauf.exit + ")" };
            const w = e.winter;
            const m = e.mutation;
            const tier = Array.isArray(e.tier) ? e.tier : [];
            const tierTraegt = tier.filter((t) => !t.schwimmt && Math.abs(t.sohleUnterSpiegel) <= 0.05).length;
            const gruen =
                lauf.exit === 0 &&
                /WASSER-LEBEN GRÜN/.test(lauf.stdout) &&
                w.temperatur < 0 &&
                w.seeFrames >= 120 &&
                w.schwimmFrames === 0 &&
                w.luft === 0 &&
                w.maxM <= 0.05 &&
                tier.length === 3 &&
                tierTraegt === 3 &&
                m.temperatur >= 0 &&
                m.schwimmFrames > 0;
            return {
                gruen,
                zahl:
                    "Winter " + w.temperatur + " °C am Spiegel: " + w.seeFrames + " Schritte auf dem See, die Füße bis " +
                    w.maxM + " m vom Spiegel, " + w.schwimmFrames + " schwimmend · " + tierTraegt + " von " + tier.length +
                    " Tieren am Spiegel · Feld +10 °C (" + m.temperatur + " °C): " + m.schwimmFrames + " Schritte schwimmend",
            };
        },
        pfad: [
            "gelaende-core.js",
            "stamm/wasser-*.js",
            "stamm/koerper-*.js",
            "stamm/kreatur-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-himmel.js",
            "stamm/daten.js",
            "scripts/diag-wasser-leben.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = eine Phase mit Körper-Folge (das Eis trägt den Spieler, y am Spiegel ±5 cm)",
    },

    // ── stoffe.K3#2 ── alle vier Phasen am Temperatur-Feld, je Glied beim Namen (dieselbe Wand wie Staffel 1, Block koerper):
    // GEFRIEREN das Eis trägt im Winter, +10 °C bricht es ein (wie #1) · SCHMELZEN das Jahr im Takt der Saison (`_tickSeason`):
    // der Schnee-Pegel (gelaende-core `schneePegel`) fällt nur über 0 °C, das Feld ohne Jahres-Welle hält ihn, die Schneegrenze
    // liest ihn (Versatz übers Jahr, das Weiß des Boden-Lesers, die Chunks im Band neu gebaut) · PEGEL die Schmelze speist den
    // Pegel des Wassers (gelaende-core `pegelTafel`: der Hub je Höhe aus dem Abfluss der Schmelze, Manning bis zur Krone des Betts,
    // Spiegel jedes Sees und Flusses; dieselbe Stelle trägt den Regen): im Jahr hebt sich der See an den Wochen seiner Schmelze und
    // nur an ihnen (`gegen` ≤ 1), der Fluss mit, der Takt trägt die Tafel in den Faden und baut die Chunks mit Wasser neu, der
    // Körper liest das gezeichnete Wasser gehoben und das Ufer steht nasser, das Feld ohne Jahres-Welle hebt nichts · ERSTARREN
    // die DSL gießt Lava an Land und in den See, die Uhr läuft im Takt des Tags: die glut-Achse glüht und erkaltet, unter dem Fuß
    // Glut → Stein, am Wasser schneller und unter Dampf · GLÜHEN der Stahl der Esse (`_tickEsse`): die Klinge der Schmiede in der
    // Hand am Glutbett glüht ab dem Draper-Punkt (Kern `glutAus`, `waermeGang`) und leuchtet in der Farbe ihrer Temperatur, 4,5 m
    // davor erlischt sie und erkaltet gegen die Luft des Temperatur-Felds (das Feld +10 °C endet ≥ 5 K wärmer). Am main b2c6c627
    // ROT 1 von 5 (nur das Eis: die Grenze war Höhe allein, die glut-Achse eingefroren); am Zweig sk3-schmelze ROT 3 von 5 (Eis,
    // Schnee, Lava); am main e7a28b06 ROT 3 von 5 (der Spiegel eine Funktion ohne Zeit, die Esse las keine Temperatur).
    {
        kriterium: "stoffe.K3",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-wasser-leben.cjs", "--nur", "koerper"],
        env: { WASSER_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const b = jsonBlock(lauf.stdout);
            const k = (b && b.koerper) || {};
            const e = k.eis || {};
            const sm = k.schmelze;
            const [la, ls] = Array.isArray(k.erstarrung) ? k.erstarrung : [];
            const [pg, gl] = [k.pegel || {}, k.gluehen || {}];
            const [gf, gk] = [gl.feuer || {}, gl.kalt || {}];
            const kopf = (o) => (o && o.reihe && o.reihe[0]) || {};
            const ende = (o) => (o && o.reihe && o.reihe[o.reihe.length - 1]) || {};
            const glieder = {
                gefrieren:
                    !!e.winter && e.winter.temperatur < 0 && e.winter.schwimmFrames === 0 && e.winter.maxM <= 0.05 &&
                    !!e.mutation && e.mutation.schwimmFrames > 0,
                schmelzen:
                    !!sm && sm.pegel > 0.01 && sm.schmilzt > 0 && sm.gegen === 0 && sm.halt <= 0.001 && sm.versatz >= 20 &&
                    sm.weiss >= 0.3 && sm.neuBau > 0,
                pegel:
                    pg.hub >= 0.1 && pg.wochen > 0 && pg.fluss > 0 && pg.gegen <= 1 && pg.post > 0 && pg.neuBau > 0 &&
                    pg.halt <= 0.001 && !!pg.flut && pg.flut[0] >= pg.hub - 0.03 && pg.flut[1] > pg.ruhe[1] && pg.ruhe[0] <= 0.03,
                erstarren:
                    !!la && !!ls && la.ab > 0 && kopf(la).glut >= 0.95 && kopf(la).stoff === "glut" && kopf(la).licht === true &&
                    ende(la).stoff === "stein" && !ende(la).licht && ende(la).glut <= la.frei + 0.01 && kopf(ls).dampf === true &&
                    ls.ab >= 0 && ls.ab < la.ab,
                gluehen:
                    gf.wechsel > 0 && gf.glut >= 0.5 && gf.kelvin > 798 && !!gf.esse && !gk.glut && !gk.kelvin && gk.wechsel > 0 &&
                    gk.T - gk.luft < 50 && gl.feld >= 5,
            };
            const n = Object.values(glieder).filter(Boolean).length;
            const ja = (x) => (x ? "✓" : "✗");
            return {
                gruen: lauf.exit === 0 && /WASSER-LEBEN GRÜN/.test(lauf.stdout) && n === 5,
                zahl:
                    n + " von 5 Gliedern · Eis " + ja(glieder.gefrieren) + " (" + (e.winter && e.winter.temperatur) + " °C) · Schnee " +
                    ja(glieder.schmelzen) + " (Pegel " + (sm && sm.pegel) + " m, Grenze " + (sm && sm.versatz) + " m übers Jahr, " +
                    (sm && sm.neuBau) + " Chunks neu) · Wasser-Pegel " + ja(glieder.pegel) + (k.pegel ? " (See +" + pg.hub + " m in " + pg.wochen + " Wochen, Fluss +" +
                    pg.fluss + " m, Körper +" + (pg.flut && pg.flut[0]) + " m, " + pg.neuBau + " Chunks neu)" : " (keine Probe)") + " · Lava " + ja(glieder.erstarren) +
                    " (erstarrt Land Takt " + (la && la.ab) + ", See Takt " + (ls && ls.ab) + " unter Dampf) · Stahl " + ja(glieder.gluehen) +
                    (k.gluehen ? " (" + gl.stoff + " glüht ab " + gf.wechsel + " s, " + gf.kelvin + " K, erlischt nach " + gk.wechsel + " s, Feld +10 °C → +" +
                    gl.feld + " K)" : " (keine Probe)"),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/wasser-*.js",
            "stamm/koerper-*.js",
            "stamm/kreatur-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-*.js",
            "stamm/feld-*.js",
            "stamm/dirigent-kern.js",
            "stamm/bau-vorlagen.js",
            "stamm/bau-teile.js",
            "stamm/klang.js",
            "stamm/kampf.js",
            "stamm/daten.js",
            "schmiede-core.js",
            "scripts/diag-wasser-leben.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle:
            "2 = alle vier: Schnee schmilzt über 0 °C und speist den Pegel, Lava (glut-Achse) erstarrt am Wasser unter Dampf zu Basalt, Stahl glüht in der Esse ab seiner Temperatur (Schmiede = Welt)",
    },

    // ── stoffe.K5 ── gate:stand-takt --nachwuchs (Null-Renderer, die Seite der Tat): das Wuchs-Gesetz `_wuchsAt` = Wasser
    // (`_feuchteAt`, aus der Hydrosphäre; ohne Fluss und See der Regen `WUCHS.wasserBasis`) × Licht am Boden unter den stehenden
    // Kronen (`_bodenLichtFeld`); jede Tat misst es beim Schreiben (`w`) und heilt in TAT_NARBE.stunden / w Spielstunden
    // (`_tatDauer`, gelesen von `_tatIndex`). Die Linse sucht das offene Ufer nächst der Mess-Wiese in der Welt (heute
    // −348/−662), pflückt mit dem Verb der Ernte jede Pflanze der Nah-Streu im Ring, springt die Uhr als Spieler-Wort ein
    // Spieljahr und zählt je Pflanze die Stunde der Rückkehr (`_geerntetIn`), am Ende die gezeichneten; danach die Mutante
    // (Feuchte gleich ½ an `_feuchteAt`). Je 4-m-Kachel Tempo = 1/Stunde. An main 675a3889 ROT (das Rauschen `lebendig`:
    // r 0,028, im Offenen 0,152, nass 0,836 × trocken), am Zweig w3s-sukzession GRÜN: r 0,834 über alle Kacheln, im Offenen
    // 0,999, nass 1,298 × trocken; die Mutante offen r 0, 1,000 ×.
    {
        kriterium: "stoffe.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs", "--nachwuchs"],
        env: { STAND_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const N = jsonZeile(lauf.stdout, /^NACHWUCHS \{/);
            const [e, m] = N ? [N.echt, N.mutante] : [];
            if (!e || !m || !N.ufer) return { gruen: false, zahl: "keine NACHWUCHS-Zeile (Exit " + lauf.exit + ")" };
            const gruen =
                lauf.exit === 0 &&
                /✅ NACHWUCHS GRÜN/.test(lauf.stdout) &&
                e.jahr >= 8760 &&
                e.n >= 30 &&
                e.da === e.n &&
                e.r >= 0.5 &&
                e.offen >= 6 &&
                e.rOffen >= 0.5 &&
                e.quote >= 1.15 &&
                m.rOffen < 0.2 &&
                m.quote < 1.05;
            return {
                gruen,
                zahl:
                    "Ufer " + Math.round(N.ufer.x) + "/" + Math.round(N.ufer.z) + ": nach " + e.jahr + " h " + e.da + " von " + e.n +
                    " Pflanzen wieder gezeichnet · r(Tempo, Feuchte × Licht) " + e.r + ", im Offenen (" + e.offen + " Kacheln) " +
                    e.rOffen + ", nass " + e.quote + " × trocken · Mutante Feuchte gleich: offen r " + m.rOffen + ", nass " +
                    m.quote + " × trocken",
            };
        },
        pfad: [
            "stamm/vegetation-*.js",
            "stamm/feld-*.js",
            "stamm/gelaende-boden.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-ort.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-*.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "gelaende-core.js",
            "phyto-core.js",
            "voxel-worker.js",
            "scripts/diag-stand-takt.cjs",
            "scripts/lib/stand-linse.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "1 = der Nachwuchs korreliert nach 1 Spieljahr mit Feuchte × Licht (r ≥ 0,5)",
    },
    // ── stoffe.K5#2 ── gate:stand-takt --brand, die Zeile SUKZESSION (Null-Renderer, Mess-Wiese, Spielzeit-Sprung als Spieler-Wort):
    // die Asche des Brands geht ihre Sukzession als FUNKTION ihres Rests (stamm/vegetation-wiese.js `_sukzession`: die Asche liegt bis
    // 0,08 und ist bei 0,3 nachgegrünt — Kanal G der Boden-Decke, den Boden-Stoff und Nah-Wiese lesen —, die Kräuter der Nah-Streu
    // wachsen von 0,3 bis 0,6, `_streuNachBrand`); der Nährstoff ist EINE Funktion der Taten der Zelle (`_naehrstoffAt`: Ernte −0,02,
    // Fällen −0,3, Asche +0,4, Leichnam +0,2, abklingend mit der Narbe), der Wuchs liest ihn nach Monod (`_wuchsAt`). Gemessen an der
    // Zelle des Herds: Halme und Kräuter vor dem Brand, auf der Asche, nach der Stufe Gras und nach der Stufe Busch; an ihrer
    // Nachbarin die Ernte jeder Pflanze (Nährstoff und Wuchs, die Mutante bei festem Nährstoff), die Asche frisch, der Leichnam eines
    // Risses von Spieler-Hand. DER SÄMLING: der nächste Baum fällt, am Stubben steht bis zum Austrieb kein Baum, dann sein Jungwuchs
    // in den Stufen `SUKZESSION.jugend` (die Jugend-Gestalt `treeParams(…, alter)` im Pfad der Foundry, `studioOv.alter`, Größe =
    // Alter), nach der Heilung der gewachsene; seine Gestalt (das Skelett der Prägung) trägt weniger Ordnungen und Glieder, die
    // Mutante (treeParams ohne `alter`) dieselben. DER WALD: der Brand nimmt jeden Baum seiner Narbe (≥ ½), mit dem Wald der
    // Sukzession kehrt ihr Jungwuchs zurück, nach der letzten Heilung der gewachsene. Die Asche zählt auf ihrer vollen Fläche (die
    // Narbe ist eine weiche Grenze, kein Quadrat). Am Zweig w3v-brand-bild (Null-Renderer, Cloud): GRÜN — auf voller Asche (0,81 der
    // Zelle) kein Halm und kein Kraut, Gras 464/477, Busch 20/23 Kräuter, Sämling 0 → 0,06 → 0,18 → 0,7 → 1 (Skala = Alter),
    // Gestalt [5 Ordnungen, 1 461 Glieder] gegen [9, 2 933] (Mutante gleich), Wald 79 Bäume: der Brand nimmt 79, Jungwuchs 79, heil 79.
    {
        kriterium: "stoffe.K5",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-stand-takt.cjs", "--brand"],
        env: { STAND_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const S = jsonZeile(lauf.stdout, /^SUKZESSION \{/);
            const [a, n] = S ? [S.asche, S.naehr] : [];
            const [J, G, W] = [(S && S.saemling && S.saemling.stufen) || [], S && S.saemling && S.saemling.gestalt, S && S.wald];
            if (!a || !a.asche || !a.gras || !a.busch || !n || !n.ernte)
                return { gruen: false, zahl: "keine SUKZESSION-Zeile (Exit " + lauf.exit + ")" };
            const gruen =
                /✅ SUKZESSION GRÜN/.test(lauf.stdout) &&
                a.vor.halme >= 20 &&
                a.vor.kraut >= 3 &&
                a.asche.voll >= 0.4 &&
                a.asche.halmeVoll <= 0.05 * a.vor.halme * a.asche.voll &&
                a.asche.krautVoll === 0 &&
                a.gras.halme >= 0.8 * a.vor.halme &&
                a.gras.kraut <= 0.3 * a.vor.kraut &&
                a.busch.kraut >= 0.8 * a.vor.kraut &&
                n.ernte.N < n.ernte.N0 - 0.04 &&
                n.ernte.W < n.ernte.W0 &&
                n.asche >= 1.2 &&
                n.leichnam >= 1.1 &&
                n.mutante.W === n.mutante.W0 &&
                !!(J.length === 5 && J[0].alter === 0 && J[2].alter > 0 && J[2].alter < 1 && J[4].alter === 1 && J[4].skala === 1) &&
                !!(G && G[0][1] < G[1][1]) &&
                !!(W && W.vor >= 3 && W.brand === 0 && W.jung >= 0.6 * W.vor && W.heil >= 0.9 * W.vor);
            return {
                gruen,
                zahl:
                    "Halme " + a.vor.halme + " → Asche " + a.asche.halme + " → Gras " + a.gras.halme + " · Kräuter " + a.vor.kraut +
                    " → Asche " + a.asche.kraut + " → Gras " + a.gras.kraut + " → Busch " + a.busch.kraut + " · Ernte (" + n.ernte.n +
                    "): Nährstoff " + n.ernte.N0 + " → " + n.ernte.N + ", Wuchs " + n.ernte.W0 + " → " + n.ernte.W + " · Asche " + n.asche +
                    ", Leichnam " + n.leichnam + " · Sämling " + (J.length ? J.map((q) => q.alter).join(" → ") : "fehlt") +
                    (G ? ", Gestalt " + JSON.stringify(G) : "") + (W ? " · Wald " + W.vor + ": Brand nimmt " + (W.vor - W.brand) + ", Jungwuchs " + W.jung + ", heil " + W.heil : ""),
            };
        },
        pfad: [
            "stamm/vegetation-*.js",
            "stamm/feld-*.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-satz.js",
            "stamm/kreatur-leben.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-*.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "foundry-core.js",
            "phyto-core.js",
            "gelaende-core.js",
            "scripts/diag-stand-takt.cjs",
            "scripts/lib/stand-linse.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "2 = Stubben → Sämling, Brand → Gras → Busch → Wald, Ernte entnimmt Nährstoff, Asche und Leichnam geben ihn zurück",
    },
    // ── physik.K3 ── gate:fahr-leben (Null-Renderer, im Spiel-Takt `_gameLoopTick`), Zwilling des Befehls von physik.K2#1 (EIN Lauf):
    // DER FREIE KÖRPER — der EINE Löser `_freiSchritt` (stamm/koerper-bewegung.js: Starrkörper mit Quaternion, Sequential Impulses,
    // Schlaf) auf dem Boden des Gesetzes und den Blocker-Boxen, mit der Stoff-Tafel; der Wagen stößt über seine EINE Hülle und das
    // EINE Impuls-Gesetz (`_freiStoss`). In der freien Gasse der Stoß-Proben fallen 5 Kisten (Bauplan kiste, 42 kg) gestapelt (10 cm
    // Spalt): bis alle schlafen, ihr Weg 3 s danach, wach (ohne Schlaf) ihr Weg, die untere am Boden und jede auf der darunter
    // (±2 cm); das Fass (45 kg) ist ein Hindernis der Stoß-Probe L3–L5: der GT fährt mit W hinein, der größte Winkel seiner Achse.
    // Mutanten im selben Lauf: Schwere 0 (die Kisten ruhen nicht am Boden), der Stoß am freien Körper aus (das Fass steht). Gemessen
    // wird der Zustand des Lösers, nie ein Bild. An main 675a3889 ROT (keine K3-Zeile: kein Bauplan kiste, kein `_freiSchritt`); am
    // Zweig w3t-koerper 0ca91cdb (gemergt mit main b3f9ae95) GRÜN: Ruhe 0,87 s, Zittern 0 cm, wach 0 cm, Boden +2 mm, Fugen ≤ 1 mm, GT 8,77 → 8,56 m/s, Fass 161°;
    // Schwere 0: Boden 0,107 m, ohne Stoß 3,0°.
    {
        kriterium: "physik.K3",
        staffel: 1,
        geraet: "headless",
        befehl: [
            "bash",
            "-c",
            'FAHR_LEBEN_PORT={PORT} node scripts/diag-fahr-leben.cjs; E1=$?; echo "FAHR-LEBEN EXIT $E1"; KOLLISION_BILD_PORT={PORT} node scripts/diag-kollision-bild.cjs; E2=$?; echo "KOLLISION-BILD EXIT $E2"; exit $(( E1 > E2 ? E1 : E2 ))',
        ],
        gpu: false,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/).find((x) => /^\s*(✅|❌) K3#1 \(physik\.K3\)/.test(x));
            const F = l ? jsonZeile(l, /K3#1/) : null;
            const [k, f, s, o] = F ? [F.kisten || {}, F.fass || {}, F.schwerelos || {}, F.fassOhneStoss || {}] : [];
            if (!F || !k.fugen || !s.fugen) return { gruen: false, zahl: "keine K3-Zeile (Exit " + lauf.exit + ")" };
            const amBoden = (x) => x.ruheS !== null && x.ruheS <= 2 && [x.boden, ...x.fugen].every((d) => Math.abs(d) <= 0.02);
            const gruen =
                /^\s*✅/.test(l) &&
                amBoden(k) &&
                k.zittern <= 0.01 &&
                F.wachZittern <= 0.01 &&
                f.kipp > 45 &&
                !amBoden(s) &&
                o.kipp < 45;
            const z = (x, n) => (Number.isFinite(x) ? x.toFixed(n) : String(x));
            return {
                gruen,
                zahl:
                    "5 Kisten ruhen nach " + z(k.ruheS, 2) + " s, Zittern " + z(k.zittern * 100, 2) + " cm (wach " +
                    z(F.wachZittern * 100, 2) + "), Boden " + z(k.boden, 3) + " m, Fugen " + k.fugen.map((d) => z(d, 3)).join("/") +
                    " m · GT " + z(f.vVor, 2) + " → " + z(f.vNach, 2) + " m/s, Fass " + z(f.kipp, 1) + "° · Mutanten: Schwere 0 Boden " +
                    z(s.boden, 3) + " m, ohne Stoß " + z(o.kipp, 1) + "°",
            };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/kreatur-*.js",
            "stamm/bau-*.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-*.js",
            "stamm/werkstatt-bauen.js",
            "stamm/vegetation-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "vehicle-core.js",
            "gelaende-core.js",
            "scripts/diag-fahr-leben.cjs",
            "scripts/lib/fahr-proben.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/wasser-linse.cjs",
        ],
        quelle: "1 = Körper fallen und ruhen (5 Kisten ≤ 2 s, Zittern ≤ 1 cm), ein Wagen wirft ein Fass um",
    },
];

// ── NICHT FASSBAR (befehl: null): kein Werkzeug im Spiel-Baum misst das Soll dieser Staffel als EIN Befehl am SHA ──
module.exports.fehlt = [
    { kriterium: "gelaende.K3", staffel: 2, befehl: null, grund: "Werkzeug und Gesetz fehlen für die Fließ-Anisotropie: keine Linse misst die Normalen-Anisotropie längs/quer zum Lauf im Ausgabe-Bild, und die Strömung der Welt ist `WASSER_GESETZ.wellen.adv × centerness` (`_waterFlowAt`, stamm/wasser-hydro.js) — kein Gefälle, kein Einzugsgebiet, aus dem sie wüchse (25.10. gelesen an d43cb61c). Die 12 Posen allein (Ego/Third × Mittag/Nacht/Regen über `bild --uhr --wetter` wie Staffel 1) wären eine halbe Station" },
    { kriterium: "wetter.K2", staffel: 2, befehl: null, grund: "Werkzeug und Welt fehlen: werkbank licht --naesse misst nur Ego an Wiese und Dorf — keine Trocken-Kurve, kein Third; die Welt trägt keine Pfütze (stamm/ kennt kein Pfützen-Gesetz, 25.10. an d43cb61c), die Mulden-Korrelation r ≥ 0,5 hätte nichts zu messen" },
    { kriterium: "stoffe.K1", staffel: 2, befehl: null, grund: "nicht gebaut: 7/7 verlangt je Stoff auch Albedo → Luma (das Ausgabe-Bild der echten GPU; headless zählt sie nie), T_zünd für Stein, Eisen, Erde und Wasser (sie brennen nicht), T_schmelz für jeden Stoff außer Wasser (kein Leser einer Phase: Esse, Lava) und μ des Wassers (eine Flüssigkeit trägt keinen Gleitenden); am Zweig stoffe-k1-tafel 4–5 von 7 je Stoff" },
    { kriterium: "physik.K3", staffel: 2, befehl: null, grund: "nicht gebaut (w3t-koerper baute Staffel 1, den EINEN Löser `_freiSchritt`): der Lastpfad bleibt ein Urteil (`stamm/bau-buch.js` `_loadPath`, das Werk stürzt als Pendel um eine Kante, `_werkSturzSchritt`) — kein Teil eines Werks wird ein freier Körper, also kein Einsturz; Trümmer leben nicht über den Reload (der Stand trägt Lage und Gier, nie die Drehung des Körpers); 100 freie Körper wach kosten 9 ms je Sim-Schritt (Node, flacher Boden; Soll 1 ms an der GTX-CPU)" },
];
