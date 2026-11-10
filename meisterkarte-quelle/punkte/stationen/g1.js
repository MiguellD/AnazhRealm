// Stationen der Gruppe I (src/g1.js): je Kriterium und Staffel EINE Station — Befehl im Spiel-Baum am SHA, Urteil über
// seine Ausgabe, Pfad für R6. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst ist jedes Kriterium der Gruppe mit Punkten (gelaende K1–K5, wetter K1 K2 K3 K5, physik K1 K2, feld K2 K3, stoffe K2 K3;
// physik K2 ist zugleich das Ziel des Zweigs kontakt-tempo); dazu (p3-stationen-g12) physik K4 K5, stoffe K4, wetter K4 und feld K5
// über die EINE Welt-Probe (weltProbeLauf). Die Messschuld M30–M43 trägt kein Kriterium der Gruppe I.
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
// DIE AUSNAHME (w12-proben-frist): zwei Orte in EINER Probe — (b)(d) der Damm 60 m stromab des Fluss-Orts der Mess-Wiese, (a) der
// Graben an den Ufer-Punkten des Flusses nächst Genesis (1 718 m weiter, der Ring kalt im Deckel), je Sicht und Abstand — GTX p90 71,1 s
// aus 10 (eichtafel), Radeon 8ef49bef riss 45 s nach (b)(d) in 9,7 s
const K2_PROBE = {
    befehl: PW.torBefehl(PW.wasserGraben, "{KOORD}"),
    sek: 10,
    mutiert: true,
};

// ───────── DIE WELT-PROBE (p3-stationen-g12, 01.11.): sieben Kriterien ohne Station in EINER Welt am Null-Renderer ─────────
// physik.K4 · physik.K5 · stoffe.K4 · wetter.K4 · feld.K5 (hier) und luftwasser.K3 · luftwasser.K4 (stationen/g2.js) messen, was
// die Welt dem Spieler hält, zeichnet oder an den Leib gibt — gelesen an den Lesern des Spiels (die Hand `heldMesh`, die Gelenke
// des Leibs, die Strömung `_waterFlowAt`, die Täter-Klasse `_taeterKlasse`, die gezeichnete Nah-Streu, der Boden-Leser
// `_bodenSichtAt` mit dem Schnee-Gesetz des Kerns, die Vertex-Farben, aus denen die Welt ihre Albedo liest — Lehre 19). Der Lauf
// bootet die Welt EINMAL (Produktions-Seite, statikServer auf {PORT}), dann je Probe ihre Seiten-Funktion; die Zeile
// „WELTPROBE <name> {…}“ und {AUS} tragen das Maß. Die Stationen beider Dateien tragen DENSELBEN Befehl: Zwillinge, EIN Lauf.
// Die Reihe ist die Abhängigkeit: Saison, Uhr und Feld setzt jede Probe selbst; die mit Spielzeit-Sprung (alter, schnee) zuletzt.
// DER GRUND jeder Probe (in der Seite): der Takt des Spiels (`_gameLoopTick`, 60 Hz), Stehen an einem Ort (die Welt schwingt ein,
// `__weltStehtNach`), der Spielzeit-Sprung in Tagen über das Wort der Uhr (`setTimeOfDay`, je 6 h drei Takte — der Tag zählt
// `_uhrSetzen`), das Wetter trocken in Ruhe (sonnig, der Halt, die Nässe am Fixpunkt).
function weltGrund(r, T) {
    const s = r.state;
    const A = r.constructor;
    let t = performance.now();
    s.perfRegulator = false;
    const takt = (n = 1) => {
        for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
    };
    const y = (x, z) => r._voxelSurfaceY(x, z);
    const stehen = async (x, z) => {
        s.playerMesh.position.set(x, y(x, z) + A.PLAYER_FOOT_OFFSET, z);
        s.playerVel.setValue(0, 0, 0);
        await window.__weltStehtNach(() => takt());
        takt(30);
    };
    const tage = (n) => {
        for (let k = 0; k < n * 4; k++) {
            r.setTimeOfDay((s.timeOfDay + 0.25) % 1, "regler");
            takt(3);
        }
    };
    // DAS WETTER EINER PROBE über den EINEN Weg (`__wetterSetzen`, scripts/lib/ausgabe-aufnahme.cjs; der Lauf baut ihn in jede
    // Welt): er taut den Mess-Halt für DIESES Wort und hält danach wieder — ein Wort, das nicht gilt, wirft beim Namen. Bis 03.11.
    // setzte `trocken` selbst und fror den Halt dahinter (−1e9): jedes spätere Wort fiel still (der Regen der Alter-Spur)
    const wetter = (wort, zug) => {
        if (window.__wetterSetzen(wort, zug) !== wort) throw new Error("das Wetter der Probe gilt nicht: " + wort + " (es gilt " + s.weather + ")");
    };
    const trocken = () => {
        wetter("sunny");
        r._naesseTakt(1e6);
        r.setTimeOfDay(0.5, "regler");
        takt(2);
    };
    const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
    // DIE GEZEICHNETE NAH-STREU (feld.K5, luftwasser.K4): je Senke ihre gezeichneten Glieder (`bloecke[].ids` über den Kacheln
    // `kacheln.items` — dieselbe Zählung wie feld.K4, diag-stand-takt) am Ort `drin(x, z)`; Blumen = Senken der Art `blume*` (die
    // Streu wählt sie auf lebendigem Boden, stamm/vegetation-streu.js)
    const streu = (drin) => {
        const ns = s.nahStreu;
        const n = { alle: 0, blumen: 0 };
        if (!ns) return n;
        for (const a of ns.senken.values())
            for (const [key, b] of a.bloecke) {
                const k = ns.kacheln.get(key);
                if (!k) continue;
                const ids = new Set(b.ids);
                for (const it of k.items)
                    if (ids.has(it.id) && drin(it.x, it.z)) {
                        n.alle++;
                        if (/^blume/.test(a.preset || "")) n.blumen++;
                    }
            }
        return n;
    };
    return { s, A, takt, y, stehen, tage, wetter, trocken, r3, streu };
}
// DER LAUF (im Spiel-Baum, cwd; Node): argv {AUS} {PORT} und die Proben als JSON [[name, Seiten-Funktion, Optionen]]; die Optionen
// tragen die Messorte des Haushalts (scripts/lib/welt-orte.cjs, `messort`). Ein Wurf einer Probe ist ihr Fehler beim Namen, nie
// der Abbruch der übrigen. Jede Welt (der Boot und jeder Reload) trägt das EINE Orts-Gesetz der Seite (`WELT_ORTE_INSTALL`:
// `__weltOrt` — Höhle, Hang, Ufer … am Gesetz der Welt, w5-s2-g1). DER RELOAD (w5-s2-g1, stoffe.K4#2 „über den Reload“): eine Probe
// mit der Option `neuladen` läuft in einer frisch geladenen Seite — der Lauf lädt sie neu (dieselbe Seite, derselbe Speicher:
// IndexedDB des Browsers), bootet die Welt aus ihrem Stand und ruft erst dann die Probe; was die Probe davor sicherte
// (`saveState`, `_speicherStill`), ist das einzige, was hinüber reist.
async function weltProbeLauf() {
    const fs = require("fs");
    const path = require("path");
    const { statikServer, nullSeite, warteAufWelt } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { messort, WELT_ORTE_INSTALL } = require(path.resolve("scripts/lib/welt-orte.cjs"));
    const { AUSGABE_INSTALL } = require(path.resolve("scripts/lib/ausgabe-aufnahme.cjs"));
    const [aus, port, grund, probenText] = process.argv.slice(1);
    const orte = Object.fromEntries(["wiese", "dorf"].map((id) => [id, messort(id)]));
    const erg = { proben: {}, fehler: [] };
    const server = statikServer();
    let browser = null;
    try {
        await server.lausche(Number(port));
        const ns = await nullSeite({ frist: 1800000 });
        browser = ns.browser;
        const seite = ns.page;
        seite.setDefaultTimeout(1200000);
        seite.on("pageerror", (e) => erg.fehler.length < 8 && erg.fehler.push(String(e.message || e).split("\n")[0].slice(0, 200)));
        const erwacht = async () => {
            await warteAufWelt(seite, 300000);
            await seite.evaluate(async () => {
                while (!(window.anazhRealm && window.anazhRealm.erwacht)) await new Promise((ok) => setTimeout(ok, 50));
                await window.anazhRealm.erwacht;
                window.anazhRealm.state.renderer.setAnimationLoop(null);
            });
            await seite.evaluate(WELT_ORTE_INSTALL + ";" + AUSGABE_INSTALL); // das Orts-Gesetz und der EINE Wetter-Weg (`__wetterSetzen`)
        };
        await server.zeige(seite, 240000, "index.html", "networkidle0");
        await erwacht();
        for (const [name, fn, o] of JSON.parse(probenText)) {
            const t0 = Date.now();
            let e;
            try {
                if (o && o.neuladen) {
                    await seite.reload({ waitUntil: "networkidle0", timeout: 240000 });
                    await erwacht();
                }
                // DER ORT STELLT SEINEN DORF-ZUG (w12-dorf-probe): je Probe der Zustand ihres Messorts (`o.ort`, sonst die Wiese) aus dem
                // Haushalt (`dorfZug`, derselbe Haken wie `werkbank umstellen`), vor ihrem ersten Takt — am Dorf läuft der Zug, an der
                // Wiese ruht er. Bis dahin stellte die Probe ihn nie: headless ruhte er überall (der Null-Renderer hielt ihn an), am Dorf
                // urteilte jede Probe eine leere Welt (0 Häuser nach 9000 Takten), mit Renderer wüchse an der Wiese ein Dorf (−1,−5).
                await seite.evaluate((z) => (window.__anazhAutoSettlement = z), orte[(o && o.ort) || "wiese"].dorfZug);
                e = await seite.evaluate("(" + fn + ")(window.anazhRealm, THREE, " + JSON.stringify(Object.assign({ orte }, o)) + ", (" + grund + ")(window.anazhRealm, THREE))");
            } catch (x) {
                e = { fehler: String((x && x.message) || x).split("\n")[0].slice(0, 300) };
            }
            e = Object.assign({}, e || { fehler: "die Probe gab nichts zurück" }, { sek: Math.round((Date.now() - t0) / 100) / 10 });
            erg.proben[name] = e;
            console.log("WELTPROBE " + name + " " + JSON.stringify(e));
        }
    } catch (x) {
        erg.fehler.push(String((x && x.message) || x).split("\n")[0].slice(0, 300));
    } finally {
        if (browser) await browser.close().catch(() => {});
        server.close();
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
    console.log("WELTPROBE-ENDE " + JSON.stringify({ proben: Object.keys(erg.proben), fehler: erg.fehler }));
}

// physik.K4 — DAS SEIL AM LEIB: die Schmiede der Welt (ihre Gattungen als Baupläne `klinge_<id>` im Buch) und das Seil darin
// (Flegel, Kette, Morgenstern: ein Glied hängt am Griff; oder die Gattung trägt ihr Seil als Gesetz im Buch, `fx.seil`). Gibt es
// eines, hält der Spieler es (`equipHeld`, die Studio-Gestalt in der Hand), geht 1,5 s und bleibt stehen; 3 s lang je Takt die Lage
// jedes Teils im Rahmen der Hand: der Schwung (die größte Abweichung eines Teils von seiner Lage beim Halt), die Länge des Seils
// (sein Anker → fernstes Teil, ihr Band über die Takte) und die Energie des fernsten Teils (mittleres v² in der ersten gegen die
// letzte Sekunde). DIE SEIL-LÄNGE (w5-physik-k4-pm, 03.11.) der Messung (± 2 %) ist die Länge LÄNGS des Seils VOM ANKER, den das
// Gesetz der Gattung im Buch nennt (`fx.seil.anker`, im Rahmen der Vorlage): der Weg Anker → Glied 0 → … → Kopf-Mitte über die
// Enden jedes Teils (die Ruhe-Punkte des Gesetzes, `seilRuhe`, durch die Lage des Teils; die Teile tragen ihre Nummer
// `userData.__seil`) — sie wächst um jede Lücke zwischen Gliedern (ein Seil, das sich dehnt oder reißt), nie, wenn das Seil
// durchhängt. Vorher maß die Probe die Sehne vom Ursprung der Vorlage (dem Schaft-Ende): beim Flegel Stiel + Kette, ein Hebel, der
// mit jedem Schwung atmet (gemessen am Kopf w5-physik-k4: 0,393–0,826 m bei 0,49 m Schwung); auch die Sehne vom Anker ist keine
// Länge — fällt die Hand beim Halt schneller als die Schwere (0,11 m in 0,13 s an der Mess-Wiese), hängt jede echte Kette durch
// (0,239–0,328 m bei 0,328 m Seil). Ohne Nummern an den Teilen gilt die Sehne vom Anker. Ein Seil ohne Gesetz im Buch (ein
// Zwilling der Welt) trägt keinen Anker und ist ROT beim Namen.
async function seilProbe(r, T, o, G) {
    const { s, takt, stehen, r3 } = G;
    const pm = s.playerMesh;
    for (let i = 0; i < 600 && !Object.keys(s.blueprints || {}).some((k) => /^klinge_/.test(k)); i++) takt(), await new Promise((ok) => setTimeout(ok, 10));
    const klingen = Object.keys(s.blueprints || {}).filter((k) => /^klinge_/.test(k));
    const f = r._foundry;
    const gesetz = (k) => {
        const rez = f && f.recipes && f.recipes[r._foundryPresetForEntry({ type: k })];
        return (rez && rez.fx && rez.fx.seil) || null;
    };
    const seile = klingen.filter((k) => /flegel|seil|kette|morgenstern|flail/i.test(k) || gesetz(k));
    const aus = { klingen: klingen.length, seile, je: {} };
    if (!seile.length) return Object.assign(aus, { namen: klingen.map((k) => k.slice(7)) });
    await stehen(o.orte.wiese.x, o.orte.wiese.z);
    for (const name of seile) {
        r.equipHeld(name);
        let h = null;
        for (let i = 0; i < 400 && !((h = pm.userData && pm.userData.heldMesh) && h.userData && h.userData.foundryHeld); i++) takt(), await new Promise((ok) => setTimeout(ok, 10));
        if (!h) {
            aus.je[name] = { fehler: "keine Gestalt in der Hand" };
            continue;
        }
        const teile = [];
        h.traverse((m) => m.isMesh && m !== h && teile.push(m));
        const inv = new T.Matrix4();
        const lage = () => {
            h.updateMatrixWorld(true);
            inv.copy(h.matrixWorld).invert();
            return teile.map((m) => new T.Box3().setFromObject(m).getCenter(new T.Vector3()).applyMatrix4(inv));
        };
        s.verbTafel.gehalten.vor = true;
        takt(90);
        s.verbTafel.gehalten.vor = false;
        const L0 = lage();
        const sg = gesetz(name);
        const anker = sg && Array.isArray(sg.anker) && sg.anker.length === 3 ? new T.Vector3().fromArray(sg.anker) : null;
        const C = window.__schmiedeCore;
        const R = anker && C && typeof C.seilRuhe === "function" ? C.seilRuhe(sg, sg.anker, sg.unten, 1) : null;
        const st = [];
        h.traverse((m) => m.isMesh && m.userData && Number.isInteger(m.userData.__seil) && (st[m.userData.__seil] = m));
        const bogen = !!R && st.length === sg.glieder + 1 && st.every(Boolean);
        const P = (i) => new T.Vector3(R[3 * i], R[3 * i + 1], R[3 * i + 2]);
        const M = new T.Matrix4();
        // längs des Seils IN DER WELT (nach `lage()`, das die Matrizen frisch rechnet; der Rahmen der Hand ist nicht maßtreu —
        // der Rig-Knochen skaliert ungleich, gemessen 0,979–1,038 mit Scherung bis 0,043): je Teil seine zwei Ruhe-Enden
        const laengs = () => {
            let l = 0,
                vor = anker.clone().applyMatrix4(h.matrixWorld);
            st.forEach((m, i) => {
                M.copy(m.matrixWorld);
                const a = P(i).applyMatrix4(M),
                    b = P(i + 1).applyMatrix4(M);
                l += vor.distanceTo(a) + a.distanceTo(b);
                vor = b;
            });
            return l;
        };
        const fern = L0.reduce((b, p, i) => (p.length() > L0[b].length() ? i : b), 0);
        let schwung = 0;
        const laengen = [];
        const v2 = [];
        let vor = L0;
        for (let k = 0; k < 180; k++) {
            takt();
            const L = lage();
            L.forEach((p, i) => (schwung = Math.max(schwung, p.distanceTo(L0[i]))));
            laengen.push(bogen ? laengs() : anker ? L[fern].distanceTo(anker) : L[fern].length());
            v2.push(L[fern].distanceToSquared(vor[fern]) * 3600);
            vor = L;
        }
        const mittel = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
        aus.je[name] = {
            teile: teile.length,
            anker: anker ? anker.toArray().map(r3) : null,
            laengeArt: bogen ? "längs" : anker ? "sehne vom Anker" : "sehne vom Griff",
            schwungM: r3(schwung),
            laengeM: [r3(Math.min(...laengen)), r3(Math.max(...laengen))],
            energie: [r3(mittel(v2.slice(0, 60))), r3(mittel(v2.slice(120)))],
        };
        r.equipHeld(null);
    }
    return aus;
}
// das Urteil (physik.K4#1): ein Seil der Schmiede am Leib — sein Gesetz steht im Buch (der Anker, `fx.seil`), es schwingt (≥ 5 cm im
// Rahmen der Hand), die Länge längs des Seils vom Anker hält ±2 %, die Energie fällt (letzte Sekunde ≤ ½ der ersten, die erste > 0)
function seilUrteil(e) {
    if (!e) return { gruen: false, zahl: "keine Zeile WELTPROBE seil" };
    if (e.fehler) return { gruen: false, zahl: "Probe: " + e.fehler };
    if (!e.seile || !e.seile.length)
        return { gruen: false, zahl: "kein Seil am Leib: 0 von " + e.klingen + " Gattungen der Schmiede tragen ein Seil (" + (e.namen || []).join(", ") + ")" };
    const ok = Object.entries(e.je).filter(([, x]) => !x.fehler && Array.isArray(x.anker) && x.schwungM >= 0.05 && x.laengeM[1] <= 1.02 * x.laengeM[0] && x.energie[0] > 0 && x.energie[1] <= 0.5 * x.energie[0]);
    return {
        gruen: ok.length > 0,
        zahl: Object.entries(e.je).map(([n, x]) => n + (x.fehler ? " " + x.fehler : (Array.isArray(x.anker) ? "" : " ohne Gesetz im Buch (kein Anker, fx.seil)") + " Schwung " + x.schwungM + " m, Länge " + (x.laengeArt ? "(" + x.laengeArt + ") " : "") + x.laengeM.join("–") + " m, v² " + x.energie.join(" → "))).join(" · ") +
            " (Soll: das Gesetz im Buch, Schwung ≥ 0,05 m, Länge längs des Seils vom Anker ±2 %, v² letzte ≤ ½ erste Sekunde)",
    };
}

// physik.K5 — DER STOSS IM GANG: an der Mess-Wiese geht der Spieler (die Taste w, der Takt des Spiels) 1,5 s, dann wirkt eine
// Kraft von 200 N für 0,2 s quer zur Gier auf seinen Leib — Δv = F·dt / m je Takt in die Geschwindigkeit, die die Bewegung
// integriert (`playerVel`), m die Masse des EINEN Impuls-Gesetzes (`_leibMasse`) —, und er geht 2,5 s weiter. Derselbe Gang ohne
// Stoß ist die Bahn B. Gemessen je Takt die Wurzel und die Knöchel (`ankle1`, `ankle-1`, koerper-core) quer zur Gier gegen B: der
// Ausfall (die größte Abweichung eines Knöchels in Stoß-Richtung), die Erholung (ab wann die Wurzel quer wieder mit B geht, ≤ 5 cm/s)
// und der Sturz (die Wurzel ≥ 0,3 m unter B oder der Leib tot). Die Mutanten: die Gegen-Richtung (der Ausfall folgt ihr) und die
// Masse ×2 (der Ausfall wird kleiner).
async function stossProbe(r, T, o, G) {
    const { s, A, takt, stehen, r3 } = G;
    const pm = s.playerMesh;
    let x0 = o.orte.wiese.x;
    const z0 = o.orte.wiese.z;
    for (let i = 0; i < 20 && !r._landAt(x0, z0, 2); i++) x0 += 12;
    const masse0 = r._leibMasse.bind(r);
    const knoechel = [];
    pm.traverse((n) => /^ankle-?1$/.test(n.name) && knoechel.push(n));
    if (!knoechel.length) return { fehler: "kein Knöchel (ankle1/ankle-1) am Leib des Spielers" };
    const gang = async (kraft, richtung, massenFaktor) => {
        r._leibMasse = (k) => masse0(k) * (k === pm ? massenFaktor : 1);
        try {
            await stehen(x0, z0);
            s.yaw = 0;
            const quer = new T.Vector3(Math.cos(s.yaw), 0, -Math.sin(s.yaw));
            const m = r._leibMasse(pm);
            s.verbTafel.gehalten.vor = true;
            takt(90);
            const bahn = [];
            const w = new T.Vector3();
            for (let k = 0; k < 162; k++) {
                if (kraft && k < 12) {
                    const dv = (kraft * richtung * (1 / 60)) / m;
                    const v = s.playerVel;
                    v.setValue(v.x() + quer.x * dv, v.y(), v.z() + quer.z * dv);
                }
                takt();
                pm.updateMatrixWorld(true);
                bahn.push([pm.position.dot(quer), pm.position.y, ...knoechel.map((n) => n.getWorldPosition(w).dot(quer))]);
            }
            s.verbTafel.gehalten.vor = false;
            return { m, bahn, tot: !!(s.player && s.player.dead) };
        } finally {
            r._leibMasse = masse0;
        }
    };
    const B = await gang(0, 1, 1);
    const lesen = (P, richtung) => {
        let ausfall = 0;
        let quer = 0;
        let erholt = null;
        let sturz = P.tot;
        for (let k = 0; k < P.bahn.length; k++) {
            const [q, h, ...f] = P.bahn[k];
            const [qb, hb, ...fb] = B.bahn[k];
            quer = Math.max(quer, richtung * (q - qb));
            f.forEach((x, i) => (ausfall = Math.max(ausfall, richtung * (x - fb[i]))));
            if (h < hb - 0.3) sturz = true;
            const v = k > 0 ? Math.abs(q - qb - (P.bahn[k - 1][0] - B.bahn[k - 1][0])) * 60 : 1;
            if (k >= 12 && v <= 0.05 && erholt === null) erholt = k / 60;
            if (v > 0.05) erholt = null;
        }
        return { masse: r3(P.m), ausfallM: r3(ausfall), querM: r3(quer), erholtS: erholt === null ? null : r3(erholt), sturz };
    };
    const echt = lesen(await gang(200, 1, 1), 1);
    const gegen = lesen(await gang(200, -1, 1), -1);
    const schwer = lesen(await gang(200, 1, 2), 1);
    return { ort: [r3(x0), r3(z0)], knoechel: knoechel.length, echt, gegen, schwer };
}
// das Urteil (physik.K5#1): Ausfallschritt ≥ 10 cm in Stoß-Richtung, Erholung ≤ 1,5 s, kein Sturz; die Gegen-Richtung zieht den
// Ausfall mit (≥ 10 cm auf der anderen Seite), die doppelte Masse macht ihn kleiner (≤ 0,8 ×) — eine abgespielte Stolper-Animation
// (Schlupfloch der Staffel) folgte weder Richtung noch Masse
function stossUrteil(e) {
    if (!e) return { gruen: false, zahl: "keine Zeile WELTPROBE stoss" };
    if (e.fehler) return { gruen: false, zahl: "Probe: " + e.fehler };
    const [a, g, m] = [e.echt || {}, e.gegen || {}, e.schwer || {}];
    const rot = [];
    if (!(a.ausfallM >= 0.1)) rot.push("kein Ausfallschritt");
    if (!(a.erholtS !== null && a.erholtS <= 1.5)) rot.push("keine Erholung ≤ 1,5 s");
    if (a.sturz) rot.push("Sturz");
    if (!(g.ausfallM >= 0.1)) rot.push("die Gegen-Richtung zieht nicht");
    if (!(a.ausfallM > 0 && m.ausfallM <= 0.8 * a.ausfallM)) rot.push("die Masse ×2 zieht nicht");
    const z = (x) => "Ausfall " + x.ausfallM + " m, Wurzel quer " + x.querM + " m, erholt " + (x.erholtS === null ? "nie" : x.erholtS + " s") + (x.sturz ? ", STURZ" : "");
    return {
        gruen: !rot.length,
        zahl: "200 N × 0,2 s quer im Gang (" + a.masse + " kg): " + z(a) + " · Gegen-Richtung " + z(g) + " · Masse ×2 " + z(m) +
            (rot.length ? " · ROT " + rot.join(", ") : "") + " (Soll Ausfall ≥ 0,1 m, ≤ 1,5 s, kein Sturz)",
    };
}

// feld.K5 — DER PFLEGE-AKT AM ORT: die Zelle des Lebens-Felds (LIFE_FIELD.cell) unter der Mess-Wiese, der Spieler am Rand des
// Blocks; gezählt die gezeichnete Nah-Streu (alle, Blumen) in der Mitte des 3×3-Blocks und in der Nachbarzelle daneben (zwei Zellen
// weiter, außerhalb des Blocks) — vorher, nach 60 s Ruhe (das Rauschen) und 60 s nach dem Akt (die DSL-Op `deposit_life` am Ort der
// Mitte, Menge LIFE_FIELD.max, über den EINEN Weg `dslRun`). Dazu das Feld, das der Akt schreibt (`auraAt.lebendig`): ohne Hub
// wäre die Probe blind.
async function feldProbe(r, T, o, G) {
    const { s, A, takt, stehen, r3 } = G;
    const C = A.LIFE_FIELD.cell;
    const cx = Math.floor(o.orte.wiese.x / C);
    const cz = Math.floor(o.orte.wiese.z / C);
    const zelle = (i) => [(cx + i) * C, (cz) * C];
    const drin = (i) => (x, z) => x >= zelle(i)[0] && x < zelle(i)[0] + C && z >= zelle(i)[1] && z < zelle(i)[1] + C;
    const mitte = [(cx + 0.5) * C, (cz + 0.5) * C];
    const nachbar = [(cx + 2.5) * C, (cz + 0.5) * C];
    const lies = () => ({
        mitte: G.streu(drin(0)),
        nachbar: G.streu(drin(2)),
        feld: [r3(r.auraAt(mitte[0], mitte[1]).lebendig), r3(r.auraAt(nachbar[0], nachbar[1]).lebendig)],
    });
    const stand = [(cx + 1.5) * C, (cz + 0.5) * C];
    await stehen(stand[0], stand[1]);
    const vor = lies();
    takt(3600);
    const ruhe = lies();
    s.playerMesh.position.set(mitte[0], G.y(mitte[0], mitte[1]) + A.PLAYER_FOOT_OFFSET, mitte[1]);
    const akt = r.dslRun(["deposit_life", null, A.LIFE_FIELD.max], { source: "spieler" });
    await stehen(stand[0], stand[1]);
    takt(3600);
    const nach = lies();
    return { zelleM: C, mitte, nachbar, vor, ruhe, nach, akt: !!akt };
}
// das Urteil (feld.K5#1): der Akt hebt das Feld der Mitte (≥ 0,1), die gezeichnete Streu am Ort wächst — Blumen +≥ 3 oder alle
// +≥ 10 % (je über dem Doppelten des Rauschens) —, die Nachbarzelle bleibt im Rauschen (|Δ| ≤ Rauschen + 1); ohne Streu am Ort blind
function feldUrteil(e) {
    if (!e) return { gruen: false, zahl: "keine Zeile WELTPROBE feld" };
    if (e.fehler) return { gruen: false, zahl: "Probe: " + e.fehler };
    const { vor, ruhe, nach } = e;
    const d = (a, b, k, w) => b[w][k] - a[w][k];
    const rausch = Math.max(...["alle", "blumen"].flatMap((k) => ["mitte", "nachbar"].map((w) => Math.abs(d(vor, ruhe, k, w)))));
    const hub = nach.feld[0] - ruhe.feld[0];
    const blumen = d(ruhe, nach, "blumen", "mitte");
    const alle = d(ruhe, nach, "alle", "mitte");
    const gesehen = blumen >= Math.max(3, 2 * rausch + 1) || alle >= Math.max(0.1 * ruhe.mitte.alle, 2 * rausch + 1, 5);
    const ruhig = ["alle", "blumen"].every((k) => Math.abs(d(ruhe, nach, k, "nachbar")) <= rausch + 1);
    const blind = !(ruhe.mitte.alle + ruhe.nachbar.alle > 0);
    const rot = [hub >= 0.1 ? null : "der Akt hebt das Feld nicht", gesehen ? null : "am Ort nichts gesehen", ruhig ? null : "die Nachbarzelle bewegt sich",
        blind ? "keine gezeichnete Streu am Ort" : null].filter(Boolean);
    return {
        gruen: !rot.length,
        zahl: "Feld der Mitte " + ruhe.feld[0] + " → " + nach.feld[0] + " · Streu der Mitte " + ruhe.mitte.alle + " → " + nach.mitte.alle + " (Blumen " + ruhe.mitte.blumen +
            " → " + nach.mitte.blumen + "), Nachbarzelle " + ruhe.nachbar.alle + " → " + nach.nachbar.alle + " (Blumen " + ruhe.nachbar.blumen + " → " + nach.nachbar.blumen +
            "), Rauschen ±" + rausch + (rot.length ? " · ROT " + rot.join(", ") : "") + " (Soll: Blumen +≥ 3 oder alle +≥ 10 % am Ort, Nachbar im Rauschen)",
    };
}

// stoffe.K4 — DIE VERWITTERUNG NACH 30 TAGEN: am Dorf des Haushalts die Albedo, aus der die Welt ihr Bild zeichnet (Lehre 19:
// die Welt liest Vertex-Farben — je Glied im Umkreis von 60 m die Vertex-Farbe × die Stoff-Farbe × die Farbe der Instanz; die Sätze
// der Welt (`bodenSatz`, `bauSatz`, `streuSatz`: Geometrie in Welt-Lage) je Vertex am Ort, eine Instanz an ihrem Ursprung), je Klasse
// (`_taeterKlasse`, ohne Himmel, Wasser und Leiber) und LAGE der Fläche (die Welt-Normale: nord −z, süd +z, oben +y) gemittelt; vorher
// (zweimal: das Rauschen) und nach einem Spielzeit-Sprung von 30 Tagen (das Wetter läuft frei), jedes Mal trocken in Ruhe zu Mittag
// (die Nässe des Regens zählt wetter.K2, nie das Alter). Die Δ je Klasse und Lage (größter Kanal, linear).
// DAS DORF DES MESSORTS (w12-dorf-probe): am Messort läuft der Dorf-Zug (die Probe trägt `ort: "dorf"`); der Zug rückt den Plan vor
// den Spieler, seine Häuser stehen 104–190 m vom Messpunkt (−841/−861) — die Probe tritt darum nach dem Wachsen in die Mitte des
// nächsten Orts (`settlementCells`) und zählt die Häuser im Umkreis. Bis dahin las sie 60 m um den Messpunkt: kein Haus, auch mit Zug.
async function alterProbe(r, T, o, G) {
    const { s, takt, stehen, tage, trocken, r3 } = G;
    const D = o.orte.dorf;
    s.autoSeason = false;
    r.setSeason("sommer");
    await stehen(D.x, D.z);
    const fern = (c) => Math.hypot(c.x - D.x, c.z - D.z);
    const O = Object.values((s.worldMeta && s.worldMeta.settlementCells) || {}).filter((c) => c && Number.isFinite(c.x)).sort((a, b) => fern(a) - fern(b))[0] || D;
    await stehen(O.x, O.z);
    const lies = () => {
        const aus = {};
        const c = new T.Color();
        const n = new T.Vector3();
        const p = new T.Vector3();
        const nm = new T.Matrix3();
        const im = new T.Matrix4();
        const wm = new T.Matrix4();
        const P = s.playerMesh.position;
        const sammle = (kl, lage, rgb) => {
            const e = (aus[kl] ||= {});
            const q = (e[lage] ||= [0, 0, 0, 0]);
            q[0] += rgb[0], q[1] += rgb[1], q[2] += rgb[2], q[3]++;
        };
        s.scene.traverse((m) => {
            if (!m.isMesh || !m.visible || !m.geometry || !m.geometry.attributes.normal) return;
            const kl = r._taeterKlasse(m);
            if (/^UNBENANNT|^leer:|himmel|sky|wasser|water|^spieler|^bewohner|^tier:|^vogel/i.test(kl)) return;
            const g = m.geometry;
            const pos = g.attributes.position;
            const nor = g.attributes.normal;
            const col = g.attributes.color;
            const mc = m.material && !Array.isArray(m.material) && m.material.color ? m.material.color : c.setRGB(1, 1, 1);
            const inst = m.isInstancedMesh ? Math.min(m.count, 64) : 1;
            for (let i = 0; i < inst; i++) {
                if (m.isInstancedMesh) m.getMatrixAt(i, im), wm.multiplyMatrices(m.matrixWorld, im);
                else wm.copy(m.matrixWorld);
                const ox = wm.elements[12], oz = wm.elements[14];
                if (m.isInstancedMesh && Math.hypot(ox - P.x, oz - P.z) > 60) continue;
                nm.getNormalMatrix(wm);
                const ic = m.isInstancedMesh && m.instanceColor ? [m.instanceColor.getX(i), m.instanceColor.getY(i), m.instanceColor.getZ(i)] : [1, 1, 1];
                const schritt = m.isInstancedMesh ? Math.max(1, Math.floor(pos.count / 400)) : Math.max(1, Math.floor(pos.count / 300000));
                for (let v = 0; v < pos.count; v += schritt) {
                    if (!m.isInstancedMesh && (p.fromBufferAttribute(pos, v).applyMatrix4(wm), Math.hypot(p.x - P.x, p.z - P.z) > 60)) continue;
                    n.fromBufferAttribute(nor, v).applyMatrix3(nm).normalize();
                    const lage = n.y > 0.7 ? "oben" : n.z < -0.5 ? "nord" : n.z > 0.5 ? "sued" : null;
                    if (!lage) continue;
                    const vc = col ? [col.getX(v), col.getY(v), col.getZ(v)] : [1, 1, 1];
                    sammle(kl, lage, [vc[0] * mc.r * ic[0], vc[1] * mc.g * ic[1], vc[2] * mc.b * ic[2]]);
                }
            }
        });
        for (const e of Object.values(aus)) for (const [l, q] of Object.entries(e)) e[l] = q[3] ? [q[0] / q[3], q[1] / q[3], q[2] / q[3], q[3]] : null;
        return aus;
    };
    trocken();
    const vor = lies();
    trocken();
    const zwei = lies();
    tage(30);
    trocken();
    await stehen(O.x, O.z);
    const nach = lies();
    const tag = (s.worldMeta && s.worldMeta.tag) || 0;
    const delta = (a, b) => (a && b ? Math.max(...[0, 1, 2].map((k) => Math.abs(b[k] - a[k]))) : null);
    const je = {};
    for (const kl of Object.keys(vor)) {
        if (!nach[kl]) continue;
        const d = {};
        for (const l of ["nord", "sued", "oben"]) if (vor[kl][l] && nach[kl][l] && vor[kl][l][3] >= 20) d[l] = r3(delta(vor[kl][l], nach[kl][l]));
        const rausch = Math.max(0, ...Object.keys(d).map((l) => delta(vor[kl][l], zwei[kl] && zwei[kl][l]) || 0));
        if (Object.keys(d).length) je[kl] = Object.assign(d, { rausch: r3(rausch) });
    }
    const haeuser = (s.architectures || []).filter((e) => e && /^haus_/.test(e.type) && Math.hypot(e.position.x - O.x, e.position.z - O.z) <= 60).length;
    return { dorf: [D.x, D.z], ort: [r3(O.x), r3(O.z)], haeuser, tag, klassen: Object.keys(je).length, je };
}
// das Urteil (stoffe.K4#1): im Kreis steht ≥ 1 Haus des Dorfs (sonst urteilt die Probe eine leere Welt, w12-dorf-probe), und
// ≥ 1 Klasse ändert ihre Albedo nach 30 Tagen messbar (größter Kanal ≥ 0,02 über ihrem Rauschen) und
// abhängig von der Lage (die Lagen der Klasse weichen um ≥ die Hälfte der größten ab) — ein Regler, der alles gleich altern ließe
// (Schlupfloch der Staffel), ist ROT
function alterUrteil(e) {
    if (!e) return { gruen: false, zahl: "keine Zeile WELTPROBE alter" };
    if (e.fehler) return { gruen: false, zahl: "Probe: " + e.fehler };
    const liste = Object.entries(e.je || {}).map(([kl, d]) => {
        const w = ["nord", "sued", "oben"].filter((l) => d[l] != null).map((l) => d[l]);
        const max = Math.max(...w);
        return { kl, d, max, spanne: max - Math.min(...w), lagen: w.length };
    }).sort((a, b) => b.max - a.max);
    const altert = liste.filter((x) => x.max >= 0.02 + x.d.rausch);
    const lage = altert.filter((x) => x.lagen >= 2 && x.spanne >= 0.5 * x.max);
    const z = (x) => x.kl + " " + ["nord", "sued", "oben"].filter((l) => x.d[l] != null).map((l) => l + " " + x.d[l]).join("/");
    return {
        gruen: lage.length > 0 && e.tag >= 30 && e.haeuser > 0,
        zahl: "Tag " + e.tag + ", " + (e.haeuser || 0) + " Häuser und " + liste.length + " Klassen im Umkreis 60 m des Dorfs" + (e.ort ? " (Ort " + e.ort.join("/") + ")" : "") + (e.haeuser > 0 ? "" : " · ROT kein Haus im Kreis") + " · größte Δ der Albedo nach 30 Tagen: " +
            (liste.slice(0, 3).map(z).join(" · ") || "keine") + " · " + altert.length + " altern (≥ 0,02), " + lage.length + " nach Lage (Soll ≥ 1)",
    };
}

// stoffe.K4 Staffel 2 — DIE VERWITTERUNG AM STOFF UND DER TRAMPELPFAD, ÜBER DEN RELOAD (w5-s2-g1). Zwei Proben derselben Welt:
// `alterspur` baut auf ebenem Grund nahe der Mess-Wiese EIN Prüf-Werk (Bauplan `alterspur_werk` über `createBlueprint`, gesetzt mit
// `spawnArchitecture` wie jeder Bau):
// offen je ein Würfel Holz, Eisen, Stein (1 m; der Stein 1,5 m). Gelesen wird die Albedo, aus der die Welt ihr
// Bild zeichnet (wie Staffel 1, Lehre 19: je Vertex die Vertex-Farbe × Stoff-Farbe × Farbe der Instanz) an den Flächen jedes
// Würfels (die Vertices der Bau-Klasse `bau…` binnen ±6 cm seiner Hülle), je Lage (oben, nord −z, süd +z, west, ost) — zweimal vorher (das Rauschen),
// dann 30 Tage mit dem Wort des Spielers „sunny“, dann 30 mit „rainy“ (der Gegenlauf der Nässe in der Zeit), je gemessen trocken zu
// Mittag (die Nässe zählt wetter.K2, nie das Alter). Dann DER WEG: auf der Mess-Wiese geht der Spieler 100 × dieselbe Strecke von 8 m (die Taste w, der Takt des Spiels; die
// Richtung, in die w ihn trägt); gezählt die Büschel der Nah-Wiese (`_nahWieseKachelBueschel`, die Liste, die die Wiese zeichnet)
// im Streifen ±0,5 m um die Strecke und im Streifen 4 m daneben (nie gegangen), vorher und nachher. Am Ende `saveState` und der
// Speicher still; das Notizbuch der Probe (Orte, Vorher-Werte) im localStorage. `alterspur-reload` (Option `neuladen`: der Lauf
// lädt die Seite neu, die Welt bootet aus ihrem Stand) misst dasselbe noch einmal am Werk, das wiederkehren muss.
function alterSpurMessen(r, T, G, plan) {
    const { s, r3 } = G;
    const n = new T.Vector3();
    const p = new T.Vector3();
    const nm = new T.Matrix3();
    const im = new T.Matrix4();
    const wm = new T.Matrix4();
    const bb = new T.Box3();
    const hell = (v) => Math.max(...v);
    const aus = {};
    const boxen = Object.entries(plan.bloecke);
    const um = new T.Box3(
        new T.Vector3(Math.min(...boxen.map(([, b]) => b[0])) - 0.1, Math.min(...boxen.map(([, b]) => b[2])) - 0.1, Math.min(...boxen.map(([, b]) => b[4])) - 0.1),
        new T.Vector3(Math.max(...boxen.map(([, b]) => b[1])) + 0.1, Math.max(...boxen.map(([, b]) => b[3])) + 0.1, Math.max(...boxen.map(([, b]) => b[5])) + 0.1)
    );
    const E = 0.06;
    s.scene.updateMatrixWorld(true);
    s.scene.traverse((m) => {
        if (!m.isMesh || !m.visible || !m.geometry || !m.geometry.attributes.normal) return;
        if (!/^bau/.test(r._taeterKlasse(m))) return; // die Klasse der Bauten (bau:<Typ>, bauSatz, bauWurf), nie Boden, Fels, Streu
        const g = m.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        const pos = g.attributes.position;
        const nor = g.attributes.normal;
        const col = g.attributes.color;
        const mc = m.material && !Array.isArray(m.material) && m.material.color ? m.material.color : { r: 1, g: 1, b: 1 };
        const inst = m.isInstancedMesh ? m.count : 1;
        for (let i = 0; i < inst; i++) {
            if (m.isInstancedMesh) m.getMatrixAt(i, im), wm.multiplyMatrices(m.matrixWorld, im);
            else wm.copy(m.matrixWorld);
            if (!bb.copy(g.boundingBox).applyMatrix4(wm).intersectsBox(um)) continue;
            nm.getNormalMatrix(wm);
            const ic = m.isInstancedMesh && m.instanceColor ? [m.instanceColor.getX(i), m.instanceColor.getY(i), m.instanceColor.getZ(i)] : [1, 1, 1];
            for (let v = 0; v < pos.count; v++) {
                p.fromBufferAttribute(pos, v).applyMatrix4(wm);
                if (!um.containsPoint(p)) continue;
                for (const [name, b] of boxen) {
                    const drin = p.x >= b[0] - E && p.x <= b[1] + E && p.y >= b[2] - E && p.y <= b[3] + E && p.z >= b[4] - E && p.z <= b[5] + E;
                    const kern = p.x > b[0] + E && p.x < b[1] - E && p.y > b[2] + E && p.y < b[3] - E && p.z > b[4] + E && p.z < b[5] - E;
                    if (!drin || kern) continue;
                    n.fromBufferAttribute(nor, v).applyMatrix3(nm).normalize();
                    const lage = n.y > 0.7 ? "oben" : n.z < -0.7 ? "nord" : n.z > 0.7 ? "sued" : n.x < -0.7 ? "west" : n.x > 0.7 ? "ost" : null;
                    if (!lage) continue;
                    const vc = col ? [col.getX(v), col.getY(v), col.getZ(v)] : [1, 1, 1];
                    const q = ((aus[name] ||= {})[lage] ||= [0, 0, 0, 0]);
                    q[0] += vc[0] * mc.r * ic[0];
                    q[1] += vc[1] * mc.g * ic[1];
                    q[2] += vc[2] * mc.b * ic[2];
                    q[3]++;
                    break;
                }
            }
        }
    });
    for (const e of Object.values(aus)) for (const [l, q] of Object.entries(e)) e[l] = [r3(q[0] / q[3]), r3(q[1] / q[3]), r3(q[2] / q[3]), q[3]];
    // die Büschel der Nah-Wiese im Streifen ±0,5 m um die Strecke a → b, versetzt um `quer` m (die Liste, die die Wiese zeichnet)
    const NW = r.constructor.NAH_WIESE.kachel;
    const streifen = (quer) => {
        const [a, b] = [plan.weg.a, plan.weg.b];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const [ux, uz] = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        const [qx, qz] = [-uz * quer, ux * quer];
        const [x0, x1] = [Math.min(a[0], b[0]) + qx - 1, Math.max(a[0], b[0]) + qx + 1];
        const [z0, z1] = [Math.min(a[1], b[1]) + qz - 1, Math.max(a[1], b[1]) + qz + 1];
        let zahl = 0;
        for (let tx = Math.floor(x0 / NW); tx <= Math.floor(x1 / NW); tx++)
            for (let tz = Math.floor(z0 / NW); tz <= Math.floor(z1 / NW); tz++) {
                const bu = r._nahWieseKachelBueschel(tx, tz);
                if (!bu) return null;
                for (const q of bu) {
                    const [dx, dz] = [q.x - a[0] - qx, q.z - a[1] - qz];
                    const t = dx * ux + dz * uz;
                    if (t >= 0 && t <= L && Math.abs(dx * -uz + dz * ux) <= 0.5) zahl++;
                }
            }
        return zahl;
    };
    return { albedo: aus, gras: plan.weg ? { weg: streifen(0), neben: streifen(4) } : null, hell: Object.fromEntries(Object.entries(aus).map(([k, e]) => [k, r3(Math.max(...Object.values(e).map(hell)))])) };
}
async function alterSpurProbe(r, T, o, G) {
    const { s, A, takt, stehen, tage, wetter, trocken, r3 } = G;
    const W = o.orte.wiese;
    const H = (x, z) => r._voxelSurfaceY(x, z);
    s.autoSeason = false;
    r.setSeason("sommer");
    const ebene = window.__weltOrt("eben", { mitte: [W.x - 60, W.z], r: 10, spanne: 1, rMax: 600 });
    if (!ebene) return { fehler: "kein ebener Grund (10 m, Spanne ≤ 1 m) binnen 600 m an der Mess-Wiese" };
    await stehen(ebene.x, ebene.z);
    // DAS PRÜF-WERK: Teile [Stoff, Breite, Höhe, Tiefe, x, Mitte y, z] relativ zum Grund (ein Dach auf Pfosten kippt in der
    // Welt binnen 2 s und verschwindet, w5-s2-g1 FUNDE — der Gegenlauf der Nässe läuft darum in der Zeit: 30 Tage trocken, dann 30 nass)
    const teile = {
        holzOffen: ["holz", 1, 1, 1, -3, 0.5, 0],
        eisenOffen: ["eisen", 1, 1, 1, -1, 0.5, 0],
        steinOffen: ["stein", 1.5, 1.5, 1.5, 1.5, 0.75, 0],
    };
    const dach = [];
    const y0 = H(ebene.x, ebene.z);
    // der Bauplan über den Weg des Spielers (`createBlueprint`: ein benannter, eigener Bauplan — der Stand trägt ihn)
    const TYP = "alterspur_werk";
    if (!s.blueprints[TYP]) r.createBlueprint(TYP, "Prüf-Werk der Verwitterung");
    s.blueprints[TYP].parts = [...Object.values(teile), ...dach].map(([m, sx, sy, sz, px, py, pz]) => ({ shape: "box", material: m, size: { x: sx, y: sy, z: sz }, position: { x: px, y: py, z: pz } }));
    const werk = r.spawnArchitecture(TYP, { x: ebene.x, y: y0, z: ebene.z }, { precise: true });
    if (!werk) return { fehler: "das Prüf-Werk steht nicht (spawnArchitecture)" };
    for (let i = 0; i < 30; i++) takt();
    // die Würfel an ihren Hüllen (die Hülle je Teil, in der Reihe der Teile)
    const hs = werk.blockerAABBs || [];
    if (hs.length < Object.keys(teile).length) return { fehler: "das Werk trägt " + hs.length + " Hüllen für " + Object.keys(teile).length + " Würfel" };
    const bloecke = Object.fromEntries(Object.keys(teile).map((k, i) => [k, [hs[i].minX, hs[i].maxX, hs[i].botY, hs[i].topY, hs[i].minZ, hs[i].maxZ].map(r3)]));
    const [bx, bz] = [werk.position.x, werk.position.z];
    const plan = { bloecke, werk: { typ: TYP, x: r3(bx), z: r3(bz) } };
    const steht = () => (s.architectures || []).includes(werk) && Math.hypot(werk.position.x - bx, werk.position.z - bz) < 0.01;
    trocken();
    const vor = alterSpurMessen(r, T, G, plan);
    trocken();
    const zwei = alterSpurMessen(r, T, G, plan);
    // 30 Tage trocken (das Wort des Spielers „sunny“), dann 30 Tage im Regen („rainy“), gemessen je trocken zu Mittag
    wetter("sunny");
    tage(30);
    trocken();
    await stehen(ebene.x, ebene.z);
    const mitte = alterSpurMessen(r, T, G, plan);
    const tagMitte = (s.worldMeta && s.worldMeta.tag) || 0;
    wetter("rainy");
    tage(30);
    trocken();
    await stehen(ebene.x, ebene.z);
    const nach = alterSpurMessen(r, T, G, plan);
    const tag = (s.worldMeta && s.worldMeta.tag) || 0;
    if (!steht()) return { fehler: "das Prüf-Werk steht nach 60 Tagen nicht mehr an seinem Ort", tag, vor, zwei, mitte, nach, plan };
    // DER WEG: die Richtung, in die w den Spieler trägt, an der Mess-Wiese
    await stehen(W.x, W.z);
    const pm = s.playerMesh;
    const p0 = pm.position.clone();
    s.yaw = 0;
    s.verbTafel.gehalten.vor = true;
    takt(60);
    s.verbTafel.gehalten.vor = false;
    const dw = [pm.position.x - p0.x, pm.position.z - p0.z];
    const lw = Math.hypot(dw[0], dw[1]);
    if (!(lw > 0.5)) return { fehler: "w trägt den Spieler nicht (" + r3(lw) + " m in 1 s)", tag, vor, zwei, mitte, nach, plan };
    const a = [r3(W.x), r3(W.z)];
    const b = [r3(W.x + (dw[0] / lw) * 8), r3(W.z + (dw[1] / lw) * 8)];
    plan.weg = { a, b };
    await stehen(a[0], a[1]);
    for (let i = 0; i < 20 && alterSpurMessen(r, T, G, plan).gras.weg === null; i++) takt(30);
    const grasVor = alterSpurMessen(r, T, G, plan).gras;
    let gaenge = 0;
    for (let k = 0; k < 100; k++) {
        pm.position.set(a[0], H(a[0], a[1]) + A.PLAYER_FOOT_OFFSET, a[1]);
        s.playerVel.setValue(0, 0, 0);
        s.yaw = 0;
        takt(2);
        s.verbTafel.gehalten.vor = true;
        for (let i = 0; i < 1200 && Math.hypot(pm.position.x - a[0], pm.position.z - a[1]) < 8; i++) takt();
        s.verbTafel.gehalten.vor = false;
        if (Math.hypot(pm.position.x - a[0], pm.position.z - a[1]) >= 7.9) gaenge++;
    }
    s.playerVel.setValue(0, 0, 0);
    takt(30);
    const grasNach = alterSpurMessen(r, T, G, plan).gras;
    // DER STAND: gesichert, der Speicher still; das Notizbuch der Probe (nur Orte und Vorher-Werte) reist im localStorage
    r.saveState();
    await r._speicherStill();
    const aus = { tag, tagMitte, gaenge, plan, vor, zwei, mitte, nach, gras: { vor: grasVor, nach: grasNach } };
    localStorage.setItem("__alterSpur", JSON.stringify(aus));
    return aus;
}
async function alterSpurReload(r, T, o, G) {
    const { s, trocken, stehen } = G;
    let alt = null;
    try {
        alt = JSON.parse(localStorage.getItem("__alterSpur"));
    } catch (_e) {}
    if (!alt || !alt.plan) return { fehler: "kein Notizbuch der Probe alterspur (sie lief nicht bis zum Stand)" };
    const w = alt.plan.werk;
    const da = (s.architectures || []).some((e) => e && e.type === w.typ && Math.hypot(e.position.x - w.x, e.position.z - w.z) < 0.05);
    await stehen(w.x, w.z);
    trocken();
    const werk = alterSpurMessen(r, T, G, alt.plan);
    let gras = null;
    if (alt.plan.weg) {
        await stehen(alt.plan.weg.a[0], alt.plan.weg.a[1]);
        for (let i = 0; i < 20 && (gras = alterSpurMessen(r, T, G, alt.plan).gras).weg === null; i++) G.takt(30);
    }
    return { werkDa: da, tag: (s.worldMeta && s.worldMeta.tag) || 0, nach: werk, gras };
}
// DAS URTEIL (stoffe.K4#2) — je Teil die Zahl des Texts, nach 60 Tagen (30 trocken, 30 im Regen) UND nach dem Reload:
//   Holz: die Sättigung (HSV im sRGB, Mittel der Lagen des Würfels) ≤ 0,7 × vorher (−30 %), vorher ≥ 0,05 (messbar)
//   Eisen im Regen: Farbton 20–30° bei Sättigung ≥ 0,1 (ein Grau hat keinen Farbton); der Gegenlauf in der Zeit: in den 30
//     trockenen Tagen ändert es sich höchstens halb so stark wie in den 30 nassen (größter Kanal) — ein Rost ohne Regen wäre ein
//     Regler nach Spielzeit
//   Moos: die Nordfläche des Steins ändert sich in den nassen Tagen ≥ 0,02 über dem Rauschen und GRÜNT (ΔG − (ΔR + ΔB)/2 ≥ 0,01); die
//     Südfläche dort und die Nordfläche in den trockenen Tagen höchstens halb so stark (nass UND Nord)
//   Weg: nach 100 Gängen die Büschel im Streifen ≤ 0,4 × vorher (−60 %), vorher ≥ 10; der Streifen daneben bleibt (0,85–1,15 ×)
//   Reload: das Werk kehrt an seinen Ort wieder, Tag ≥ 60, und jedes Teil-Urteil hält an der Messung nach dem Reload
function alterSpurUrteil(e, rl) {
    if (!e) return { gruen: false, zahl: "keine Zeile WELTPROBE alterspur" };
    if (e.fehler) return { gruen: false, zahl: "Probe: " + e.fehler };
    const lin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
    const hsv = (v) => {
        const [r, g, b] = v.slice(0, 3).map((c) => lin(Math.max(0, Math.min(1, c))));
        const mx = Math.max(r, g, b);
        const d = mx - Math.min(r, g, b);
        const h = d === 0 ? 0 : mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return { h: h * 60, s: mx ? d / mx : 0 };
    };
    const mittel = (b) => {
        const w = Object.values(b || {});
        const n = w.reduce((a, q) => a + q[3], 0);
        return n ? [0, 1, 2].map((k) => w.reduce((a, q) => a + q[k] * q[3], 0) / n) : null;
    };
    const delta = (a, b) => (a && b ? Math.max(...[0, 1, 2].map((k) => Math.abs(b[k] - a[k]))) : null);
    const f = (x, n = 2) => (x == null || !Number.isFinite(x) ? "—" : x.toFixed(n));
    const teil = (nach, gras, wo) => {
        const rot = [];
        const z = [];
        const V = e.vor.albedo;
        const Z = e.zwei.albedo;
        const M = (e.mitte && e.mitte.albedo) || {};
        const N = nach.albedo;
        // Holz
        const hv = mittel(V.holzOffen);
        const hn = mittel(N.holzOffen);
        if (!hv || !hn) rot.push(wo + "kein Holz gelesen");
        else {
            const [sv, sn] = [hsv(hv).s, hsv(hn).s];
            z.push("Holz S " + f(sv) + " → " + f(sn));
            if (!(sv >= 0.05 && sn <= 0.7 * sv)) rot.push(wo + "Holz −" + f(100 * (1 - sn / sv), 0) + " % Sättigung < 30");
        }
        // Eisen
        const ev = mittel(V.eisenOffen);
        const em = mittel(M.eisenOffen);
        const en = mittel(N.eisenOffen);
        if (!ev || !em || !en) rot.push(wo + "kein Eisen gelesen");
        else {
            const he = hsv(en);
            const [dTrocken, dNass] = [delta(ev, em), delta(em, en)];
            z.push("Eisen im Regen " + f(he.h, 0) + "° S " + f(he.s) + " (Δ nass " + f(dNass, 3) + ", trocken " + f(dTrocken, 3) + ")");
            if (!(he.s >= 0.1 && he.h >= 20 && he.h <= 30)) rot.push(wo + "kein Rost (Farbton " + f(he.h, 0) + "°, S " + f(he.s) + ")");
            else if (!(dTrocken <= 0.5 * dNass)) rot.push(wo + "das Eisen rostet ohne Regen");
        }
        // Moos
        const nv = V.steinOffen && V.steinOffen.nord;
        const nm = M.steinOffen && M.steinOffen.nord;
        const nn = N.steinOffen && N.steinOffen.nord;
        if (!nv || !nm || !nn) rot.push(wo + "keine Nordfläche des Steins gelesen");
        else {
            const rausch = delta(nv, Z.steinOffen && Z.steinOffen.nord) || 0;
            const d = delta(nm, nn);
            const gruen = nn[1] - nm[1] - (nn[0] - nm[0] + nn[2] - nm[2]) / 2;
            const sued = delta(M.steinOffen.sued, N.steinOffen.sued);
            const trockenD = delta(nv, nm);
            z.push("Stein nord Δ nass " + f(d, 3) + " (grünt " + f(gruen, 3) + "), süd Δ nass " + f(sued, 3) + ", nord Δ trocken " + f(trockenD, 3));
            if (!(d >= 0.02 + rausch && gruen >= 0.01)) rot.push(wo + "kein Moos auf der nassen Nordfläche");
            else if (!(sued != null && trockenD != null && sued <= 0.5 * d && trockenD <= 0.5 * d)) rot.push(wo + "das Moos folgt nicht Nord und Nässe");
        }
        // Weg
        const gv = e.gras && e.gras.vor;
        if (!gv || gv.weg == null || !gras || gras.weg == null) rot.push(wo + "kein Gras am Weg gezählt");
        else {
            z.push("Weg " + gv.weg + " → " + gras.weg + " Büschel, daneben " + gv.neben + " → " + gras.neben);
            if (!(gv.weg >= 10 && gras.weg <= 0.4 * gv.weg)) rot.push(wo + "kein Pfad (" + gv.weg + " → " + gras.weg + ", Soll ≤ 40 %)");
            if (!(gras.neben >= 0.85 * gv.neben && gras.neben <= 1.15 * gv.neben)) rot.push(wo + "der Streifen daneben ändert sich");
        }
        return { rot, z };
    };
    const a = teil(e.nach, e.gras && e.gras.nach, "");
    const rot = [...a.rot];
    if (!(e.tag >= 60)) rot.push("Tag " + e.tag + " < 60");
    if (!(e.gaenge >= 100)) rot.push("nur " + e.gaenge + " von 100 Gängen");
    let zr = "kein Reload gemessen";
    if (!rl || rl.fehler) rot.push("Reload: " + ((rl && rl.fehler) || "keine Zeile WELTPROBE alterspur-reload"));
    else {
        if (!rl.werkDa) rot.push("Reload: das Werk kehrt nicht wieder");
        const b = teil(rl.nach, rl.gras, "Reload: ");
        rot.push(...b.rot);
        zr = b.z.join(" · ");
    }
    return {
        gruen: !rot.length,
        zahl: "Tag " + e.tag + ", " + e.gaenge + " Gänge · " + a.z.join(" · ") + " · nach dem Reload: " + zr + (rot.length ? " · ROT " + rot.join(", ") : "") +
            " (Soll Holz S −30 %, Rost 20–30°, Moos nass+nord, Weg −60 %, über den Reload)",
    };
}

// DIE ROH-ZEILEN am main 5fba36ea (03.11., Cloud, headless, 173 s): das Werk steht und kehrt über den Reload wieder, aber nichts
// verwittert (Holz S 0,72, Eisen 240°, Stein-Nordfläche Δ 0), und 100 Gänge lassen 13 von 13 Büscheln stehen
const ALTER_SPUR_MAIN = {"tag":60,"tagMitte":30,"gaenge":100,"plan":{"bloecke":{"holzOffen":[-378.65,-377.65,34.217,35.217,-1022.511,-1021.511],"eisenOffen":[-376.65,-375.65,34.217,35.217,-1022.511,-1021.511],"steinOffen":[-374.4,-372.9,34.217,35.717,-1022.761,-1021.261]},"werk":{"typ":"alterspur_werk","x":-375.15,"z":-1022.011},"weg":{"a":[-280.4,-1045.6],"b":[-280.4,-1037.6]}},"vor":{"albedo":{"holzOffen":{"ost":[0.063,0.025,0.007,4],"west":[0.063,0.025,0.007,4],"oben":[0.063,0.025,0.007,4],"sued":[0.063,0.025,0.007,4],"nord":[0.063,0.025,0.007,4]},"eisenOffen":{"ost":[0.038,0.038,0.047,4],"west":[0.038,0.038,0.047,4],"oben":[0.038,0.038,0.047,4],"sued":[0.038,0.038,0.047,4],"nord":[0.038,0.038,0.047,4]},"steinOffen":{"ost":[0.109,0.109,0.109,4],"west":[0.109,0.109,0.109,4],"oben":[0.109,0.109,0.109,4],"sued":[0.109,0.109,0.109,4],"nord":[0.109,0.109,0.109,4]}},"gras":null},"zwei":{"albedo":{"holzOffen":{"ost":[0.063,0.025,0.007,4],"west":[0.063,0.025,0.007,4],"oben":[0.063,0.025,0.007,4],"sued":[0.063,0.025,0.007,4],"nord":[0.063,0.025,0.007,4]},"eisenOffen":{"ost":[0.038,0.038,0.047,4],"west":[0.038,0.038,0.047,4],"oben":[0.038,0.038,0.047,4],"sued":[0.038,0.038,0.047,4],"nord":[0.038,0.038,0.047,4]},"steinOffen":{"ost":[0.109,0.109,0.109,4],"west":[0.109,0.109,0.109,4],"oben":[0.109,0.109,0.109,4],"sued":[0.109,0.109,0.109,4],"nord":[0.109,0.109,0.109,4]}},"gras":null},"mitte":{"albedo":{"holzOffen":{"ost":[0.063,0.025,0.007,4],"west":[0.063,0.025,0.007,4],"oben":[0.063,0.025,0.007,4],"sued":[0.063,0.025,0.007,4],"nord":[0.063,0.025,0.007,4]},"eisenOffen":{"ost":[0.038,0.038,0.047,4],"west":[0.038,0.038,0.047,4],"oben":[0.038,0.038,0.047,4],"sued":[0.038,0.038,0.047,4],"nord":[0.038,0.038,0.047,4]},"steinOffen":{"ost":[0.109,0.109,0.109,4],"west":[0.109,0.109,0.109,4],"oben":[0.109,0.109,0.109,4],"sued":[0.109,0.109,0.109,4],"nord":[0.109,0.109,0.109,4]}},"gras":null},"nach":{"albedo":{"holzOffen":{"ost":[0.063,0.025,0.007,4],"west":[0.063,0.025,0.007,4],"oben":[0.063,0.025,0.007,4],"sued":[0.063,0.025,0.007,4],"nord":[0.063,0.025,0.007,4]},"eisenOffen":{"ost":[0.038,0.038,0.047,4],"west":[0.038,0.038,0.047,4],"oben":[0.038,0.038,0.047,4],"sued":[0.038,0.038,0.047,4],"nord":[0.038,0.038,0.047,4]},"steinOffen":{"ost":[0.109,0.109,0.109,4],"west":[0.109,0.109,0.109,4],"oben":[0.109,0.109,0.109,4],"sued":[0.109,0.109,0.109,4],"nord":[0.109,0.109,0.109,4]}},"gras":null},"gras":{"vor":{"weg":13,"neben":17},"nach":{"weg":13,"neben":17}}};
const ALTER_SPUR_RELOAD_MAIN = {"werkDa":true,"tag":60,"nach":{"albedo":{"holzOffen":{"ost":[0.063,0.025,0.007,4],"west":[0.063,0.025,0.007,4],"oben":[0.063,0.025,0.007,4],"sued":[0.063,0.025,0.007,4],"nord":[0.063,0.025,0.007,4]},"eisenOffen":{"ost":[0.038,0.038,0.047,4],"west":[0.038,0.038,0.047,4],"oben":[0.038,0.038,0.047,4],"sued":[0.038,0.038,0.047,4],"nord":[0.038,0.038,0.047,4]},"steinOffen":{"ost":[0.109,0.109,0.109,4],"west":[0.109,0.109,0.109,4],"oben":[0.109,0.109,0.109,4],"sued":[0.109,0.109,0.109,4],"nord":[0.109,0.109,0.109,4]}},"gras":{"weg":13,"neben":17}},"gras":{"weg":13,"neben":17}};
// die Roh-Ausgabe beider Zeilen nach der Mutation f(a, b)
const alterSpurRoh = (f) => {
    const [a, b] = [JSON.parse(JSON.stringify(ALTER_SPUR_MAIN)), JSON.parse(JSON.stringify(ALTER_SPUR_RELOAD_MAIN))];
    f(a, b);
    return "WELTPROBE alterspur " + JSON.stringify(a) + "\nWELTPROBE alterspur-reload " + JSON.stringify(b) + "\n";
};
// der GRÜNE Mutant: Holz vergraut (linear 0,06/0,045/0,035), Eisen rostet im Regen (sRGB 0,5/0,3/0,18: 22,5°), die nasse Nordfläche
// des Steins grünt, der Weg trägt 4 von 13 Büscheln — nach 60 Tagen und nach dem Reload; die trockenen Tage ändern nichts
const alterSpurGruen = (a, b) => {
    for (const n of [a.nach.albedo, b.nach.albedo]) {
        for (const l of Object.keys(n.holzOffen)) n.holzOffen[l] = [0.06, 0.045, 0.035, n.holzOffen[l][3]];
        for (const l of Object.keys(n.eisenOffen)) n.eisenOffen[l] = [0.214, 0.073, 0.027, n.eisenOffen[l][3]];
        n.steinOffen.nord = [0.085, 0.115, 0.07, n.steinOffen.nord[3]];
    }
    a.gras.nach.weg = 4;
    b.gras.weg = 4;
};
// wetter.K4 — DIE SCHNEE-DECKE MIT TIEFE: die Saison als Wort des Spielers (winter), ein Spielzeit-Sprung von 10 Tagen, dann der
// nächste Ort über der Schneegrenze der Saison (Ringe um die Mess-Wiese bis 3 km: das Schnee-Gesetz des Kerns an der Makro-Höhe
// ≥ 0,95, Land); dort die Deckung (je 2 m im Kreis von 20 m der gezeichnete Boden `_bodenSichtAt` und sein Schnee — dasselbe
// Gesetz mit dem Versatz, den die Welt trägt, `_schneeGilt`, wie der Boden-Leser `_bodenFarbeAt`) und die Tiefe am Fuß (der
// gezeichnete Boden über der Sohle des stehenden Leibs nach 1 s). Die Gegenprobe: dieselbe Tiefe an der Mess-Wiese im Sommer nach
// 10 weiteren Tagen (die Schneegrenze zieht mit der Saison hinauf, `_schneeTakt`; ohne Schnee sinkt kein Fuß).
async function schneeProbe(r, T, o, G) {
    const { s, A, takt, stehen, tage, r3 } = G;
    const K = globalThis.__gelaendeCore;
    const L = r._gelaende();
    s.autoSeason = false;
    if (!r.setSeason("winter")) return { fehler: "das Wort winter gilt nicht" };
    tage(10);
    const schnee = (x, yy, z) => K.schnee(L, yy, x, z, r._schneeGilt());
    const W = o.orte.wiese;
    let ort = null;
    for (let d = 0; d <= 3000 && !ort; d += 100)
        for (let k = 0; k < (d ? 32 : 1) && !ort; k++) {
            const x = W.x + d * Math.cos((k / 32) * 2 * Math.PI);
            const z = W.z + d * Math.sin((k / 32) * 2 * Math.PI);
            if (r._landAt(x, z, 1) && schnee(x, r._terrainMacroSurfaceY(x, z), z) >= 0.95) ort = [x, z];
        }
    if (!ort) return { fehler: "kein Ort über der Schneegrenze binnen 3 km (Versatz " + r3(r._schneeGilt()) + ")" };
    const tiefe = async (x, z) => {
        await stehen(x, z);
        takt(60);
        const p = s.playerMesh.position;
        const b = r._bodenSichtAt(p.x, p.z);
        return { tiefeM: b == null ? null : r3(b - (p.y - A.PLAYER_FOOT_OFFSET)), schnee: b == null ? null : r3(schnee(p.x, b, p.z)) };
    };
    const fuss = await tiefe(ort[0], ort[1]);
    const versatz = r3(r._schneeGilt());
    const tag = (s.worldMeta && s.worldMeta.tag) || 0;
    let n = 0;
    let weiss = 0;
    for (let dx = -20; dx <= 20; dx += 2)
        for (let dz = -20; dz <= 20; dz += 2) {
            if (dx * dx + dz * dz > 400) continue;
            const b = r._bodenSichtAt(ort[0] + dx, ort[1] + dz);
            if (b == null) continue;
            n++;
            if (schnee(ort[0] + dx, b, ort[1] + dz) >= 0.5) weiss++;
        }
    r.setSeason("sommer");
    tage(10);
    const gegen = await tiefe(W.x, W.z);
    gegen.versatz = r3(r._schneeGilt());
    r.setSeason("winter");
    return { ort: ort.map(r3), hoeheM: r3(r._terrainMacroSurfaceY(ort[0], ort[1])), versatz, tag, proben: n, deckung: n ? r3(weiss / n) : null, fuss, gegen };
}
// das Urteil (wetter.K4#1): Deckung ≥ 60 % (≥ 100 Proben des gezeichneten Bodens) UND der Fuß ≥ 5 cm unter der Schnee-Fläche; an
// der Wiese ohne Schnee (< 0,5) sinkt er ≤ 1 cm — ein weißer Multiplikator allein (Schlupfloch der Staffel) trüge keine Tiefe
function schneeUrteil(e) {
    if (!e) return { gruen: false, zahl: "keine Zeile WELTPROBE schnee" };
    if (e.fehler) return { gruen: false, zahl: "Probe: " + e.fehler };
    const [f, g] = [e.fuss || {}, e.gegen || {}];
    const rot = [];
    if (!(e.proben >= 100 && e.deckung >= 0.6)) rot.push("Deckung");
    if (!(f.tiefeM >= 0.05)) rot.push("der Fuß sinkt nicht");
    if (!(g.schnee < 0.5 && g.tiefeM != null && g.tiefeM <= 0.01)) rot.push("die Gegenprobe ohne Schnee");
    return {
        gruen: !rot.length,
        zahl: "Winter Tag " + e.tag + " an " + (e.ort || []).join("/") + " (" + e.hoeheM + " m, Versatz " + e.versatz + "): Deckung " + e.deckung + " aus " + e.proben +
            " Proben, der Fuß " + f.tiefeM + " m unter dem Boden (Schnee " + f.schnee + ") · Sommer an der Wiese " + g.tiefeM + " m (Schnee " + g.schnee + ", Versatz " + g.versatz + ")" +
            (rot.length ? " · ROT " + rot.join(", ") : "") + " (Soll Deckung ≥ 0,6, Fuß ≥ 0,05 m, ohne Schnee ≤ 0,01 m)",
    };
}

// wetter.K2#2 — DIE PFÜTZE UND DIE TROCKEN-KURVE (w15-pfuetze), headless: die Welt mit Null-Renderer an der Mess-Wiese, 10 min Regen
// als Wort des Spielers (ohne Cross-Fade), dann je Sicht (Ego, Third) die Ecken des Boden-Satzes im Blick bis 40 m — ihre Mulde aus den
// Bytes, die die GPU liest (die vierte Komponente der Normale im Satz), ihre Deckung über das Pfützen-Gesetz des Stamms
// (`_pfuetzeGesetz`) unter dem Film der Welt und der Himmels-Sicht (das Normal-Ziel). Gegen sie die Senke des Kerns, FRISCH an der
// Ecke gerechnet (das Kasten-Mittel `MULDE.kasten` × `MULDE.gitterM` um die Ecke minus die Höhe — ohne Gitter, Kappe und Gefälle): r
// nach Pearson. Die MUTANTE im selben Lauf: die Mulden-Bytes im Satz um 97 Ecken verrutscht (ein Pack-Fehler: die Pfütze am falschen
// Ort), danach zurück — r muss fallen. Danach
// klar: die Kurve der Nässe und der Pfützen-Fläche je 30 s (`_naesseTakt`), bis beide 0 sind; `fall` die Fall-Geschwindigkeit des
// Regens, die die Welt zeichnet (`terrain:REGEN_GESETZ`).
async function wetterK2Lauf() {
    const fs = require("fs");
    const path = require("path");
    const [aus, port] = process.argv.slice(1);
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { WASSER_INSTALL } = require(path.resolve("scripts/lib/wasser-linse.cjs"));
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const browser = await WB.starteBrowser({ art: "null", headless: true, frist: 600000 });
    const page = await browser.newPage();
    await WB.nullRenderer(page);
    const out = {};
    let code = 2;
    const probe = async () => {
        const R = (x) => (Number.isFinite(x) ? +x.toFixed(3) : null);
        const [G, L] = [globalThis.__gelaendeCore, r._gelaende()];
        const M = G.MULDE;
        if (!M || !AnazhRealm._pfuetzeGesetz) return { fehler: "keine Pfütze: der Kern trägt keine Mulde (MULDE), der Stamm kein Pfützen-Gesetz" };
        await window.__wasserStrom([-280.4, -1045.6], 1);
        const A = { k: (x) => x, mul: (a, b) => a * b, sub: (a, b) => a - b, max: Math.max, klemm: (x) => Math.min(1, Math.max(0, x)), ecke: (x) => x };
        const S = st.chunkSaetze.get("boden");
        const [P, N, Z] = ["position", "normal", "aNormalZiel"].map((n) => S.geom.attributes[n].array);
        const senke = (x, z) => {
            let s = -G.hoehe(L, x, z, true);
            for (let b = -M.kasten; b <= M.kasten; b++) for (let a = -M.kasten; a <= M.kasten; a++) s += G.hoehe(L, x + a * M.gitterM, z + b * M.gitterM, true);
            return s / ((2 * M.kasten + 1) ** 2 - 1) - G.hoehe(L, x, z, true);
        };
        const deckung = (i) => AnazhRealm._pfuetzeGesetz(A, Math.max(0, N[i * 4 + 3] / 127), st.naesse).deckung * Math.max(0, Z[i * 4 + 3] / 127);
        const blick = new THREE.Frustum();
        const ecken = () => {
            st.camera.updateMatrixWorld(true);
            blick.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(st.camera.projectionMatrix, st.camera.matrixWorldInverse));
            const v = new THREE.Vector3();
            const l = [];
            for (const b of S.bloecke.values())
                for (let i = b.vStart; i < b.vStart + b.vAnzahl; i += 2)
                    if (v.fromArray(P, i * 3).distanceTo(st.camera.position) < 40 && blick.containsPoint(v) && N[i * 4 + 1] > 90) l.push(i);
            return l;
        };
        const mass = (l) => {
            const [d, m] = [l.map(deckung), l.map((i) => senke(P[i * 3], P[i * 3 + 2]))];
            const mw = (x) => x.reduce((a, b) => a + b, 0) / x.length;
            const [md, mm] = [mw(d), mw(m)];
            let [sdm, sdd, smm] = [0, 0, 0];
            for (let j = 0; j < l.length; j++) [sdm, sdd, smm] = [sdm + (d[j] - md) * (m[j] - mm), sdd + (d[j] - md) ** 2, smm + (m[j] - mm) ** 2];
            return { ecken: l.length, pfuetze: d.filter((x) => x > 0.5).length, r: R(sdm / Math.sqrt(sdd * smm)) };
        };
        const wort = (w) => (r._setWeather(w, "human"), (st.weatherTransition = null));
        wort("rainy");
        r._naesseTakt(600);
        const erg = {};
        for (const s of ["first", "third"]) {
            r.setCameraMode(s);
            for (let k = 0; k < 4; k++) window.__handTakt();
            erg[s === "first" ? "ego" : "third"] = mass(ecken());
        }
        r.setCameraMode("first");
        for (let k = 0; k < 4; k++) window.__handTakt();
        const l = ecken();
        const w = l.map((i) => N[i * 4 + 3]);
        l.forEach((i, j) => (N[i * 4 + 3] = w[(j + 97) % w.length]));
        try {
            erg.mutante = mass(l);
        } finally {
            l.forEach((i, j) => (N[i * 4 + 3] = w[j]));
        }
        const flaeche = () => l.filter((i) => deckung(i) > 0.5).length;
        const kurve = [[R(st.naesse), flaeche()]];
        wort("sunny");
        while (kurve.length < 80 && (st.naesse > 0 || kurve[kurve.length - 1][1] > 0)) kurve.push([R(r._naesseTakt(30)), flaeche()]);
        erg.kurve = { kurve, fall: AnazhRealm.Gesetz("terrain:REGEN_GESETZ", null).fall };
        return erg;
    };
    try {
        await server.zeige(page, 120000, "index.html");
        await page.waitForFunction(() => window.r && typeof r._gameLoopTick === "function" && r.state.hydrosphere && r.state.hydrosphere.ready, { timeout: 300000, polling: 250 });
        await page.evaluate(WASSER_INSTALL);
        await page.evaluate(() => (r._setWeather("sunny", "human"), r._naesseTakt(1e6)));
        const erg = await page.evaluate(probe);
        if (erg.fehler) throw new Error(erg.fehler);
        for (const n of ["ego", "third", "mutante", "kurve"]) {
            out[n] = erg[n];
            console.log("PFUETZE " + n + " " + JSON.stringify(erg[n]));
        }
        code = 0;
    } catch (e) {
        out.fehler = String((e && e.message) || e).split("\n")[0];
        console.log("PFUETZE FEHLER " + out.fehler);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out, null, 1));
        await browser.close().catch(() => {});
        server.close();
    }
    process.exit(code);
}
// DAS URTEIL der headless-Hälfte: je Sicht ≥ 20 Ecken Pfütze in den Senken des Kerns (r ≥ 0,5), die Mutante erkannt (r < 0,5),
// benetzt (Nässe ≥ 0,85, Pfützen > 0), trocken nach 5–15 min ohne Sprung (je 30 s fällt die Fläche höchstens um ein Viertel ihres
// Anfangs, Nässe und Fläche steigen nie), der Regen fällt ≤ 9,2 m/s
function wetterK2Urteil(lauf) {
    const t = String(lauf.stdout || "");
    const fehler = (/^PFUETZE FEHLER (.*)$/m.exec(t) || [])[1];
    const L = Object.fromEntries(["ego", "third", "mutante", "kurve"].map((n) => [n, jsonZeile(t, new RegExp("^PFUETZE " + n + " \\{"))]));
    const fehlt = Object.keys(L).filter((n) => !L[n]);
    if (fehlt.length) return { gruen: false, zahl: "keine PFUETZE-Zeile für " + fehlt.join(", ") + (fehler ? " — " + fehler : "") + " (Exit " + lauf.exit + ")" };
    const rot = [];
    for (const n of ["ego", "third"]) {
        if (!(L[n].pfuetze >= 20)) rot.push(n + " nur " + L[n].pfuetze + " Ecken Pfütze");
        if (!(L[n].r >= 0.5)) rot.push(n + " r " + L[n].r + " < 0,5 (die Pfütze steht nicht in den Senken des Kerns)");
    }
    const erkannt = !(L.mutante.r >= 0.5);
    if (!erkannt) rot.push("die Mutante (die Mulde verrutscht im Satz) hält r " + L.mutante.r + " — die Probe ist blind");
    const K = L.kurve.kurve || [[0, 0]];
    const [n0, f0] = K[0];
    const i0 = K.findIndex(([n, f]) => !n && !f);
    const tS = i0 < 0 ? null : i0 * 30;
    if (!(n0 >= 0.85 && f0 > 0)) rot.push("nicht benetzt (Nässe " + n0 + ", Pfützen " + f0 + ")");
    else if (!(tS >= 300 && tS <= 900)) rot.push("trocken nach " + tS + " s (Soll 300–900)");
    const sprung = K.findIndex(([n, f], i) => i && (n > K[i - 1][0] || f > K[i - 1][1] || K[i - 1][1] - f > f0 / 4));
    if (sprung > 0) rot.push("Sprung bei " + sprung * 30 + " s: " + JSON.stringify(K.slice(sprung - 1, sprung + 1)));
    if (!(L.kurve.fall <= 9.2)) rot.push("der Regen fällt " + L.kurve.fall + " m/s (Soll ≤ 9,2)");
    const z = ["ego", "third"].map((n) => n + " r " + L[n].r + " (" + L[n].pfuetze + "/" + L[n].ecken + " Ecken Pfütze)");
    return {
        gruen: !rot.length && lauf.exit === 0,
        zahl: z.join(" · ") + " · Mutante r " + L.mutante.r + " " + (erkannt ? "erkannt" : "UNERKANNT") + " · benetzt " + n0 + " → trocken nach " + tS + " s · Fall " + L.kurve.fall + " m/s" +
            (rot.length ? " · ROT: " + rot.join(", ") : "") + " · Exit " + lauf.exit,
    };
}
// die Roh-Ausgaben der Probe mit ihrem Urteil (der Selbsttest urteilt jede): grün an w15-pfuetze, die Mutanten beim Namen
const WETTER_K2_PROBEN = (() => {
    const sicht = (o = {}) => Object.assign({ ecken: 223, pfuetze: 116, r: 0.785 }, o);
    const kurve = (o = {}) => Object.assign({ kurve: [...[116, 88, 69, 48, 33, 11, 6, 2].map((f, i) => [+(0.909 - i * 0.048).toFixed(3), f]), ...Array.from({ length: 11 }, (_, i) => [+(0.525 - i * 0.048).toFixed(3), 0]), [0, 0]], fall: 9 }, o);
    const z = (ego, third, mutante, k) => ["PFUETZE ego " + JSON.stringify(ego), "PFUETZE third " + JSON.stringify(third), "PFUETZE mutante " + JSON.stringify(mutante), "PFUETZE kurve " + JSON.stringify(k)].join("\n");
    const mut = sicht({ r: 0.04 });
    return [
        { name: "Pfützen in den Senken, Ego und Third, trocken nach 9,5 min, Fall 9 m/s, die Mutante erkannt", stdout: z(sicht(), sicht({ ecken: 237, pfuetze: 111, r: 0.736 }), mut, kurve()), gruen: true },
        { name: "main db431cf0: die Welt kennt keine Pfütze", stdout: "PFUETZE FEHLER keine Pfütze: der Kern trägt keine Mulde (MULDE), der Stamm kein Pfützen-Gesetz", gruen: false },
        { name: "die Mutante (die Mulde verrutscht im Satz) bleibt über der Wand — die Probe ist blind", stdout: z(sicht(), sicht(), sicht(), kurve()), gruen: false },
        { name: "die Pfütze liegt überall (die Deckung folgt nur dem Film)", stdout: z(sicht({ r: 0.08 }), sicht(), mut, kurve()), gruen: false },
        { name: "Third sieht keine Pfütze", stdout: z(sicht(), sicht({ pfuetze: 0, r: 0.6 }), mut, kurve()), gruen: false },
        { name: "der Film trocknet mit τ 25 min (main: nach 40 min nicht trocken)", stdout: z(sicht(), sicht(), mut, kurve({ kurve: kurve().kurve.slice(0, -1) })), gruen: false },
        { name: "die Pfütze springt weg (ein Schritt nimmt die Hälfte)", stdout: z(sicht(), sicht(), mut, kurve({ kurve: [[0.909, 116], [0.861, 20], ...kurve().kurve.slice(2)] })), gruen: false },
        { name: "der Regen fällt 42 m/s", stdout: z(sicht(), sicht(), mut, kurve({ fall: 42 })), gruen: false },
        { name: "Third fehlt in der Ausgabe", stdout: z(sicht(), sicht(), mut, kurve()).split("\n").filter((l) => !/third/.test(l)).join("\n"), gruen: false },
    ];
})();
// DAS URTEIL der Karten-Hälfte (`naesseWiese`, die Linse `naesseSicht` in der Welt der Sitzung): je Sicht porös draußen 0,5–0,8 aus
// ≥ 100 Rasterpunkten, Glanz nass/trocken ≥ 2 (das Gesetz der Linse), Regenbild ≤ Sonne, die Zählung sieht den Regen draußen
function naesseWieseUrteil(j) {
    const w = (j && j.wiese) || {};
    const rot = [];
    const z = ["ego", "third"].map((s) => {
        const m = w[s];
        if (!m || m.fehler) return rot.push(s + ": " + (m ? m.fehler : "keine Messung")), s + " —";
        const a = m.aussen || {};
        if (!(a.n >= 100 && a.verhaeltnis >= 0.5 && a.verhaeltnis <= 0.8)) rot.push(s + " porös " + a.verhaeltnis + " (n " + a.n + ")");
        if (!(m.glanz >= 2)) rot.push(s + " Glanz " + m.glanz);
        if (!(m.regenbild <= 1)) rot.push(s + " Regenbild " + m.regenbild);
        if (!(m.regen && m.regen.aussen >= 1)) rot.push(s + " keine Schliere draußen");
        return s + " porös " + a.verhaeltnis + " (n " + a.n + ") · Glanz " + m.glanz + " · Regenbild " + m.regenbild + " · Regen " + (m.regen || {}).aussen;
    });
    return { gruen: !rot.length, zahl: "Wiese " + z.join(" | ") + (rot.length ? " · ROT: " + rot.join(", ") : "") };
}

// DER BEFEHL der Welt-Probe: der Lauf, der Grund und die Proben [name, Seiten-Funktion] als Text (eine Hilfe der Seite, `helfer`,
// steht vor der Probe in ihrem Rumpf); `weltZeile` liest das Maß einer Probe aus {AUS} oder der Zeile des Laufs
const weltBefehl = (proben, helfer = []) => [
    "node",
    "-e",
    "(" + weltProbeLauf + ")()",
    "{AUS}",
    "{PORT}",
    String(weltGrund),
    JSON.stringify(proben.map(([n, f, o]) => [n, "async (r, T, o, G) => {\n" + helfer.map(String).join("\n") + "\nreturn await (" + f + ")(r, T, o, G);\n}", o || {}])),
];
const weltZeile = (j, lauf, name) => (j && j.proben && j.proben[name]) || jsonZeile(lauf.stdout, new RegExp("^WELTPROBE " + name + " "));
const WELT_G1 = weltBefehl([["seil", seilProbe], ["stoss", stossProbe], ["feld", feldProbe], ["alter", alterProbe, { ort: "dorf" }], ["schnee", schneeProbe]]);
const ALTER_SPUR = weltBefehl([["alterspur", alterSpurProbe], ["alterspur-reload", alterSpurReload, { neuladen: true }]], [alterSpurMessen]);

// physik.K3#2 — DER EINSTURZ NACH LASTPFAD (w15-einsturz): ein Werk aus Teilen — ein Sockel (Stein 4 × 0,2 × 3 m: die Standfläche
// trägt jeden Rest, nichts kippt), vier Pfosten (Holz 0,3 × 2,4 × 0,3 m), je ein Kopf (0,5 × 0,25 × 0,5 m) und ein Dach (Stein
// 0,6 × 0,2 × 2,6 m) über den Köpfen 2 und 3 —, gesetzt gedreht mit zufällig fehlenden Pfosten (die Mutation des Bauplans, 1–4 von
// 4, der Same im Maß; der ersten fehlt sicher Pfosten 0 oder 1), drei Mutationen an drei Orten der Mess-Wiese. Die Erwartung aus dem
// Bau, nie aus dem Lastpfad des Spiels: Kopf i hängt an Pfosten i, Kopf 2 und 3 am Dach; was nicht über eine Kette den Sockel
// erreicht, fällt. Gemessen am Zustand der Welt: der Rest steht (sein Bauplan trägt genau die erwarteten Teile, Ort und Gier wie
// gesetzt, er stürzt nicht), je fallendes Teil ein freier Körper, der fiel, auf Sockel oder Boden liegt (nie in ihm) und schläft —
// die Zeit bis zum Schlaf aller; dann zehn Minuten Spielzeit (36 000 Takte), wie weit ein Trümmer wanderte. Dann DIE KOSTEN: 100
// Kisten, je Sim-Schritt die Zeit des EINEN Lösers (`_freiSchritt`, um ihn gemessen), solange alle 100 wach sind und wenn alle
// schlafen — das Trümmerfeld (gerichtet: 10 × 10 Kisten aus 2–4 m, gedreht, fallen, stoßen, ruhen) und der Haufen (gemeldet: 25
// Säulen zu 4, die dichteste Berührung), je ein Lauf zum Warmwerden und zwei gemessen. Zuletzt der Stand gesichert, das Notizbuch
// (Kennung, Lage, Drehung jedes Trümmers) im localStorage.
async function einsturzProbe(r, T, o, G) {
    const { s, takt, stehen, r3, y } = G;
    let same = (o.same >>> 0) || ((Date.now() % 1e9) >>> 0);
    const same0 = same;
    const zufall = () => ((same = (Math.imul(same, 1664525) + 1013904223) >>> 0) / 4294967296);
    // der Platz: Land, flach (± 0,3 m über 5 × 5 m), längs x von der Wiese, je 10 m
    const flach = (x, z) => r._landAt(x, z, 4) && [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].every(([a, b]) => Math.abs(y(x + a, z + b) - y(x, z)) <= 0.3);
    const plaetze = [];
    for (let k = 0, x = o.orte.wiese.x + 10; k < 60 && plaetze.length < 4; k++, x += 10) if (flach(x, o.orte.wiese.z)) plaetze.push([x, o.orte.wiese.z]);
    if (plaetze.length < 4) return { fehler: "kein flacher Platz an der Wiese (" + plaetze.length + " von 4)", same: same0 };
    await stehen(plaetze[0][0] - 14, plaetze[0][1]);
    G.trocken();
    const teil = (shape, material, sx, sy, sz, px, py, pz) => ({ shape, material, size: { x: sx, y: sy, z: sz }, position: { x: px, y: py, z: pz } });
    const ecken = [[-1.5, -1], [-1.5, 1], [1.5, -1], [1.5, 1]];
    const mutationen = [];
    for (let m = 0; m < 3; m++) {
        // die Mutation: 1–4 Pfosten fehlen
        const fehlt = new Set(m ? [] : [Math.floor(zufall() * 2)]); // die erste trennt sicher (Pfosten 0 oder 1: sein Kopf fällt)
        const k = 1 + Math.floor(zufall() * 4);
        while (fehlt.size < k) fehlt.add(Math.floor(zufall() * 4));
        const glieder = [["sockel", teil("box", "stein", 4, 0.2, 3, 0, 0.1, 0)]];
        ecken.forEach(([x, z], i) => fehlt.has(i) || glieder.push(["pfosten" + i, teil("box", "holz", 0.3, 2.4, 0.3, x, 1.4, z)]));
        ecken.forEach(([x, z], i) => glieder.push(["kopf" + i, teil("box", "holz", 0.5, 0.25, 0.5, x, 2.725, z)]));
        glieder.push(["dach", teil("box", "stein", 0.6, 0.2, 2.6, 1.5, 2.95, 0)]);
        // die Erwartung aus dem Bau: Sockel → Pfosten i → Kopf i; Kopf 2 ↔ Dach ↔ Kopf 3
        const kanten = [["kopf2", "dach"], ["kopf3", "dach"], ...[0, 1, 2, 3].flatMap((i) => [["sockel", "pfosten" + i], ["pfosten" + i, "kopf" + i]])];
        const da = new Set(glieder.map((g) => g[0]));
        const getragen = new Set(["sockel"]);
        for (let wuchs = true; wuchs; ) {
            wuchs = false;
            for (const [a, b] of kanten)
                if (da.has(a) && da.has(b) && getragen.has(a) !== getragen.has(b)) (getragen.add(a), getragen.add(b), (wuchs = true));
        }
        const fallend = glieder.filter((g) => !getragen.has(g[0])).map((g) => g[0]);
        const typ = "probe_k3_laube_" + m;
        s.blueprints[typ] = { name: typ, label: typ, builtIn: false, parts: glieder.map((g) => g[1]), connections: [] };
        const [px, pz] = plaetze[m];
        const vorher = new Set(s.architectures);
        const gier = 0.4 + 0.5 * m; // das Werk steht gedreht: jeder Trümmer trägt die Gier in seiner Drehung
        const e = r.spawnArchitecture(typ, { x: px, y: y(px, pz) + 0.5, z: pz }, { werk: true, precise: true, seed: 7 + m, rotationY: gier });
        mutationen.push({ m, fehlt: [...fehlt].sort(), fallend, stehend: [...getragen].sort(), typ, ort: [px, pz], gier, id: e && e.id, vorher, boden: y(px, pz) });
    }
    // der Einsturz: bis jeder Trümmer schläft (höchstens 20 s)
    const neu = (M) => s.architectures.filter((a) => !M.vorher.has(a));
    let ruheS = null;
    for (let i = 1; i <= 1200 && ruheS === null; i++) {
        takt();
        if (i >= 2 && mutationen.every((M) => neu(M).filter((a) => a._frei).every((a) => a._frei.schlaf))) ruheS = i / 60;
    }
    const truemmer = [];
    for (const M of mutationen) {
        const alle = neu(M).filter((a) => Math.hypot(a.position.x - M.ort[0], a.position.z - M.ort[1]) < 8);
        const rest = alle.filter((a) => !a._frei);
        const frei = alle.filter((a) => a._frei);
        const bp = rest.length === 1 ? s.blueprints[rest[0].type] : null;
        const ecke = (p) => ecken.findIndex(([a, b]) => a === p.position.x && b === p.position.z);
        const name = (p) => (p.size.x === 4 ? "sockel" : p.size.y === 2.4 ? "pfosten" + ecke(p) : p.size.z === 2.6 ? "dach" : "kopf" + ecke(p));
        M.restTeile = (bp ? bp.parts : []).map(name).sort();
        M.restTyp = rest.map((a) => a.type);
        M.restSteht = rest.length === 1 && !(rest[0]._gesetz && (rest[0]._gesetz.sturz || rest[0]._gesetz.bruch)) && Math.hypot(rest[0].position.x - M.ort[0], rest[0].position.z - M.ort[1]) < 1e-6 && Math.abs(rest[0].rotationY - M.gier) < 1e-9;
        // je Trümmer: seine Mitte über dem Boden (er fiel: ≤ 1,2 m, er saß ≥ 2,7 m hoch), sein tiefster Punkt über dem Boden und —
        // liegt er über dem Sockel — über dessen Oberseite (nie durch ihn), sein Schlaf
        M.koerper = frei.map((a) => {
            const K = a._frei;
            r._freiLage(K);
            let unten = Infinity;
            for (let i = 1; i < K.pw.length; i += 3) unten = Math.min(unten, K.pw[i]);
            const [dx, dz] = [K.p[0] - M.ort[0], K.p[2] - M.ort[1]];
            const [lx, lz] = [dx * Math.cos(M.gier) - dz * Math.sin(M.gier), dx * Math.sin(M.gier) + dz * Math.cos(M.gier)];
            const ueberSockel = Math.abs(lx) < 2 && Math.abs(lz) < 1.5;
            return { mitteM: r3(K.p[1] - M.boden), untenM: r3(unten - M.boden - (ueberSockel ? 0.2 : 0)), ueberSockel, schlaf: K.schlaf };
        });
        for (const a of frei) truemmer.push({ id: a.id, typ: a.type, p: [a._frei.p[0], a._frei.p[1], a._frei.p[2]], q: Array.from(a._frei.q) });
        delete M.vorher;
    }
    // ZEHN MINUTEN weiter (36 000 Takte): die Trümmer bleiben, wo sie ruhen
    const t10 = performance.now();
    takt(36000);
    const zehnMinSek = (performance.now() - t10) / 1000;
    let wander = 0;
    for (const t of truemmer) {
        const a = s.architectures.find((e) => e.id === t.id);
        wander = Math.max(wander, a && a._frei ? Math.hypot(a._frei.p[0] - t.p[0], a._frei.p[1] - t.p[1], a._frei.p[2] - t.p[2]) : Infinity);
    }
    // DIE KOSTEN: 100 Kisten, je Sim-Schritt die Zeit des Lösers (`_freiSchritt`, um ihn gemessen), solange alle 100 wach sind,
    // und wenn alle schlafen — das TRÜMMERFELD (gerichtet: 10 × 10 Kisten aus 1,5–3,5 m, gedreht, fallen, stoßen, ruhen, wie die
    // Trümmer eines Einsturzes) und der HAUFEN (gemeldet: 25 Säulen zu 4, 10 cm Spalt — jede Kiste trägt oder liegt, die dichteste
    // Berührung). Je Art ein Lauf zum Warmwerden, dann zwei gemessen; die Kisten fallen nach jedem Lauf.
    const [kx, kz] = plaetze[3];
    const lauf = (feld) => {
        const kisten = [];
        for (let i = 0; i < 100; i++) {
            let x, z, h, opt;
            if (feld) {
                const a = Math.sin(i * 12.9898) * 43758.5453;
                const f = a - Math.floor(a);
                [x, z, h] = [kx - 5 + (i % 10) + 0.3 * f, kz - 5 + ((i / 10) | 0), 2 + 2 * f];
                opt = { drehung: [Math.cos(i), Math.sin(i) * 0.6, Math.sin(i * 1.7) * 0.6, Math.sin(i * 2.3) * 0.5] };
            } else {
                const c = i % 25;
                [x, z, h] = [kx - 1.6 + (c % 5) * 0.8 + 0.05 * Math.sin(i), kz - 1.6 + ((c / 5) | 0) * 0.8, 0.6 + 0.75 * ((i / 25) | 0)];
                opt = { rotationY: i * 0.7 };
            }
            kisten.push(r.spawnArchitecture("kiste", { x, y: y(x, z) + h, z }, Object.assign({ silent: true, precise: true }, opt)));
        }
        const schritt0 = r._freiSchritt;
        const z = { wach: [], ruhend: [] };
        r._freiSchritt = function (dt) {
            const wach = kisten.filter((k) => !k._frei.schlaf).length;
            const t0 = performance.now();
            schritt0.call(this, dt);
            if (wach === 100 || wach === 0) z[wach ? "wach" : "ruhend"].push(performance.now() - t0);
        };
        try {
            takt(feld ? 360 : 240);
        } finally {
            r._freiSchritt = schritt0;
        }
        const schlafen = kisten.filter((k) => k._frei.schlaf).length;
        for (const k of kisten) r.removeArchitecture(k, { still: true });
        takt(5);
        return Object.assign(z, { schlafen });
    };
    const q = (L, p) => (L.length ? L.slice().sort((a, b) => a - b)[Math.min(L.length - 1, Math.floor(p * L.length))] : null);
    const kosten = {};
    for (const [art, feld] of [["feld", true], ["haufen", false]]) {
        lauf(feld);
        const [a, b] = [lauf(feld), lauf(feld)];
        const wach = a.wach.concat(b.wach);
        const ruhend = a.ruhend.concat(b.ruhend);
        kosten[art] = { wachSchritte: wach.length, wachMedianMs: r3(q(wach, 0.5)), wachP75Ms: r3(q(wach, 0.75)), ruhendSchritte: ruhend.length, ruhendMedianMs: r3(q(ruhend, 0.5)), schlafen: Math.min(a.schlafen, b.schlafen) };
    }
    // DER STAND: gesichert, der Speicher still; das Notizbuch reist im localStorage
    r.saveState();
    await r._speicherStill();
    localStorage.setItem("__einsturz", JSON.stringify(truemmer));
    return { same: same0, ruheS: ruheS === null ? null : r3(ruheS), wanderM: r3(wander), zehnMinSek: r3(zehnMinSek), mutationen, kosten };
}
// … NACH DEM RELOAD: jeder Trümmer des Notizbuchs steht wieder, wo er lag, mit seiner Drehung, schlafend; nach 10 s noch dort
async function einsturzReload(r, T, o, G) {
    const { s, takt, stehen, r3 } = G;
    let alt = null;
    try {
        alt = JSON.parse(localStorage.getItem("__einsturz"));
    } catch (_e) {}
    if (!Array.isArray(alt) || !alt.length) return { fehler: "kein Notizbuch der Probe einsturz (sie lief nicht bis zum Stand)" };
    await stehen(alt[0].p[0] - 14, alt[0].p[2]);
    const lese = () =>
        alt.map((t) => {
            const a = s.architectures.find((e) => String(e.id) === String(t.id));
            if (!a || !a._frei) return { da: false };
            const K = a._frei;
            const dot = Math.abs(K.q[0] * t.q[0] + K.q[1] * t.q[1] + K.q[2] * t.q[2] + K.q[3] * t.q[3]);
            return { da: true, lageM: Math.hypot(K.p[0] - t.p[0], K.p[1] - t.p[1], K.p[2] - t.p[2]), drehGrad: (2 * Math.acos(Math.min(1, dot)) * 180) / Math.PI, schlaf: K.schlaf };
        });
    const gleich = lese();
    takt(600);
    const danach = lese();
    const max = (L, k) => r3(Math.max(...L.map((x) => (x.da ? x[k] : Infinity))));
    // die Gegenprobe der Drehung: so weit (der kleinste Winkel) stünde jeder Trümmer falsch, trüge der Stand seine Drehung nicht
    // (bis w15-einsturz: Lage und Gier, die Gier des freien Körpers 0 — er stand nach dem Reload in der Grundstellung)
    const ohneDrehung = r3(Math.min(...alt.map((t) => (2 * Math.acos(Math.min(1, Math.abs(t.q[0]))) * 180) / Math.PI)));
    return {
        truemmer: alt.length,
        da: gleich.filter((x) => x.da).length,
        schlafen: gleich.filter((x) => x.schlaf).length,
        lageM: max(gleich, "lageM"),
        drehGrad: max(gleich, "drehGrad"),
        nach10sLageM: max(danach, "lageM"),
        nach10sDrehGrad: max(danach, "drehGrad"),
        ohneDrehungGrad: ohneDrehung,
    };
}
// DAS URTEIL (physik.K3#2): je Mutation trägt der Rest genau die erwarteten Teile und steht (Ort und Gier wie gesetzt), je fallendes
// Teil EIN freier Körper, der fiel (Mitte ≤ 1,2 m über dem Boden, er saß ≥ 2,7 m hoch), in nichts steckt (≥ −3 cm) und schläft; mindestens
// ein Teil fiel; alle Trümmer ruhen binnen 3 s und wandern in 10 min ≤ 1 cm. Nach dem Reload: jeder Trümmer da und schlafend, Lage
// ≤ 1 mm und Drehung ≤ 0,1° wie vorher, nach 10 s ebenso; die Drehung trägt (ohne sie stünde jeder Trümmer ≥ 1° falsch). Die Kosten
// (das Vorzeichen, die Zeit an der GTX-CPU misst der Koordinator): das Trümmerfeld ≤ 1 ms je Takt im Median der Schritte mit 100
// wachen Körpern (≥ 20 solche Schritte), schlafend ≤ 0,05 ms, alle 100 schlafen am Ende; der Haufen steht in der Zahl.
function einsturzUrteil(e, rl) {
    if (!e) return { gruen: false, zahl: "keine Zeile WELTPROBE einsturz" };
    if (e.fehler) return { gruen: false, zahl: "Probe: " + e.fehler };
    const rot = [];
    const M = e.mutationen || [];
    let fiel = 0;
    for (const m of M) {
        const name = "Mutation " + m.m + " (ohne Pfosten " + m.fehlt.join(",") + ")";
        if (JSON.stringify(m.restTeile) !== JSON.stringify(m.stehend)) rot.push(name + ": der Rest trägt [" + m.restTeile.join(",") + "] statt [" + m.stehend.join(",") + "]");
        if (!m.restSteht) rot.push(name + ": der Rest steht nicht, wo er stand");
        const K = m.koerper || [];
        if (K.length !== m.fallend.length) rot.push(name + ": " + K.length + " freie Körper statt " + m.fallend.length + " (" + m.fallend.join(",") + ")");
        if (K.some((k) => !k.schlaf)) rot.push(name + ": ein Trümmer ruht nicht");
        if (K.some((k) => !(k.mitteM <= 1.2))) rot.push(name + ": ein Trümmer fiel nicht");
        if (K.some((k) => !(k.untenM >= -0.03))) rot.push(name + ": ein Trümmer steckt in Sockel oder Boden");
        fiel += m.fallend.length;
    }
    if (M.length < 3 || !fiel) rot.push("keine Mutation mit fallendem Teil");
    if (!(e.ruheS !== null && e.ruheS <= 3)) rot.push("die Trümmer ruhen nicht binnen 3 s");
    if (!(e.wanderM <= 0.01)) rot.push("die Trümmer wandern in 10 min " + e.wanderM + " m");
    if (!rl) rot.push("keine Zeile WELTPROBE einsturz-reload");
    else if (rl.fehler) rot.push("Reload: " + rl.fehler);
    else {
        if (!(rl.truemmer > 0 && rl.da === rl.truemmer && rl.schlafen === rl.truemmer)) rot.push("Reload: " + rl.da + " von " + rl.truemmer + " Trümmern da, " + rl.schlafen + " schlafen");
        if (!(rl.lageM <= 0.001 && rl.nach10sLageM <= 0.001)) rot.push("Reload: die Lage weicht " + rl.lageM + " m ab (nach 10 s " + rl.nach10sLageM + ")");
        if (!(rl.drehGrad <= 0.1 && rl.nach10sDrehGrad <= 0.1)) rot.push("Reload: die Drehung weicht " + rl.drehGrad + "° ab (nach 10 s " + rl.nach10sDrehGrad + ")");
        if (!(rl.ohneDrehungGrad >= 1)) rot.push("Reload vakuös: ohne Drehung stünde jeder Trümmer richtig");
    }
    const f = (e.kosten && e.kosten.feld) || {};
    const h = (e.kosten && e.kosten.haufen) || {};
    if (!(f.wachSchritte >= 20 && f.wachMedianMs <= 1)) rot.push("100 wache Körper " + f.wachMedianMs + " ms je Takt (" + f.wachSchritte + " Schritte)");
    if (!(f.ruhendMedianMs <= 0.05 && f.schlafen === 100)) rot.push("der Schlaf kostet " + f.ruhendMedianMs + " ms (" + f.schlafen + " von 100 schlafen)");
    const z = (x) => (x === null || x === undefined ? "–" : String(x).replace(".", ","));
    return {
        gruen: !rot.length,
        zahl: "Same " + e.same + ": " + M.map((m) => "ohne " + m.fehlt.join("+") + " → " + (m.koerper || []).length + "/" + m.fallend.length + " Trümmer").join(", ") +
            ", Ruhe " + z(e.ruheS) + " s, 10 min " + z(e.wanderM) + " m · Reload " + (rl && !rl.fehler ? rl.da + "/" + rl.truemmer + ", Lage " + z(rl.lageM) + " m, Drehung " + z(rl.drehGrad) + "° (ohne sie ≥ " + z(rl.ohneDrehungGrad) + "°)" : "–") +
            " · 100 Körper wach: Trümmerfeld " + z(f.wachMedianMs) + " ms (p75 " + z(f.wachP75Ms) + "), Haufen 4 hoch " + z(h.wachMedianMs) + " ms (p75 " + z(h.wachP75Ms) + "), schlafend " + z(f.ruhendMedianMs) + " ms" +
            (rot.length ? " · ROT " + rot.join("; ") : ""),
    };
}
// DIE ROH-AUSGABE der Station physik.K3#2 (06.11., Cloud, headless): am Zweig w15-einsturz (GRÜN) und am main db431cf0 (ROT) — die
// Proben der Station urteilen sie und ihre Mutanten (`einsturzRoh`: die zwei Zeilen, die Änderung an einer Kopie)
const EINSTURZ_ROH = { zweig: {"einsturz": {"same": 973114193, "ruheS": 1.75, "wanderM": 0, "zehnMinSek": 60.237, "mutationen": [{"m": 0, "fehlt": [0, 2, 3], "fallend": ["kopf0", "kopf2", "kopf3", "dach"], "stehend": ["kopf1", "pfosten1", "sockel"], "typ": "probe_k3_laube_0", "ort": [-270.4, -1045.6], "gier": 0.4, "id": "w-probe_k3_laube_0-7", "boden": 27.31638911763696, "restTeile": ["kopf1", "pfosten1", "sockel"], "restTyp": ["probe_k3_laube_0_rest_fb6c8917"], "restSteht": true, "koerper": [{"mitteM": 0.325, "untenM": 0, "ueberSockel": true, "schlaf": true}, {"mitteM": 0.324, "untenM": -0.001, "ueberSockel": true, "schlaf": true}, {"mitteM": 0.324, "untenM": -0.001, "ueberSockel": true, "schlaf": true}, {"mitteM": 0.545, "untenM": 0.245, "ueberSockel": true, "schlaf": true}]}, {"m": 1, "fehlt": [0, 2, 3], "fallend": ["kopf0", "kopf2", "kopf3", "dach"], "stehend": ["kopf1", "pfosten1", "sockel"], "typ": "probe_k3_laube_1", "ort": [-260.4, -1045.6], "gier": 0.9, "id": "w-probe_k3_laube_1-8", "boden": 27.070667164250303, "restTeile": ["kopf1", "pfosten1", "sockel"], "restTyp": ["probe_k3_laube_1_rest_7f58dfbe"], "restSteht": true, "koerper": [{"mitteM": 0.325, "untenM": 0, "ueberSockel": true, "schlaf": true}, {"mitteM": 0.324, "untenM": -0.001, "ueberSockel": true, "schlaf": true}, {"mitteM": 0.324, "untenM": -0.001, "ueberSockel": true, "schlaf": true}, {"mitteM": 0.546, "untenM": 0.245, "ueberSockel": true, "schlaf": true}]}, {"m": 2, "fehlt": [0, 1, 2], "fallend": ["kopf0", "kopf1"], "stehend": ["dach", "kopf2", "kopf3", "pfosten3", "sockel"], "typ": "probe_k3_laube_2", "ort": [-250.39999999999998, -1045.6], "gier": 1.4, "id": "w-probe_k3_laube_2-9", "boden": 26.811163578295893, "restTeile": ["dach", "kopf2", "kopf3", "pfosten3", "sockel"], "restTyp": ["probe_k3_laube_2_rest_bc58d2e4"], "restSteht": true, "koerper": [{"mitteM": 0.325, "untenM": 0, "ueberSockel": true, "schlaf": true}, {"mitteM": 0.325, "untenM": 0, "ueberSockel": true, "schlaf": true}]}], "kosten": {"feld": {"wachSchritte": 144, "wachMedianMs": 0.7, "wachP75Ms": 0.9, "ruhendSchritte": 375, "ruhendMedianMs": 0, "schlafen": 100}, "haufen": {"wachSchritte": 82, "wachMedianMs": 1.2, "wachP75Ms": 1.5, "ruhendSchritte": 346, "ruhendMedianMs": 0, "schlafen": 100}}, "sek": 76.8}, "einsturz-reload": {"truemmer": 10, "da": 10, "schlafen": 10, "lageM": 0, "drehGrad": 0, "nach10sLageM": 0, "nach10sDrehGrad": 0, "ohneDrehungGrad": 21.763, "sek": 15.7}}, main: {"einsturz": {"same": 973114095, "ruheS": 0.033, "wanderM": 0, "zehnMinSek": 56.897, "mutationen": [{"m": 0, "fehlt": [0, 1, 2], "fallend": ["kopf0", "kopf1"], "stehend": ["dach", "kopf2", "kopf3", "pfosten3", "sockel"], "typ": "probe_k3_laube_0", "ort": [-270.4, -1045.6], "gier": 0.4, "id": "w-probe_k3_laube_0-7", "boden": 27.31638911763696, "restTeile": ["dach", "kopf0", "kopf1", "kopf2", "kopf3", "pfosten3", "sockel"], "restTyp": ["probe_k3_laube_0"], "restSteht": false, "koerper": []}, {"m": 1, "fehlt": [0, 1, 3], "fallend": ["kopf0", "kopf1"], "stehend": ["dach", "kopf2", "kopf3", "pfosten2", "sockel"], "typ": "probe_k3_laube_1", "ort": [-260.4, -1045.6], "gier": 0.9, "id": "w-probe_k3_laube_1-8", "boden": 27.070667164250303, "restTeile": ["dach", "kopf0", "kopf1", "kopf2", "kopf3", "pfosten2", "sockel"], "restTyp": ["probe_k3_laube_1"], "restSteht": false, "koerper": []}, {"m": 2, "fehlt": [1, 2], "fallend": ["kopf1"], "stehend": ["dach", "kopf0", "kopf2", "kopf3", "pfosten0", "pfosten3", "sockel"], "typ": "probe_k3_laube_2", "ort": [-250.39999999999998, -1045.6], "gier": 1.4, "id": "w-probe_k3_laube_2-9", "boden": 26.811163578295893, "restTeile": ["dach", "kopf0", "kopf1", "kopf2", "kopf3", "pfosten0", "pfosten3", "sockel"], "restTyp": ["probe_k3_laube_2"], "restSteht": false, "koerper": []}], "kosten": {"feld": {"wachSchritte": 120, "wachMedianMs": 4.8, "wachP75Ms": 10.7, "ruhendSchritte": 423, "ruhendMedianMs": 0, "schlafen": 100}, "haufen": {"wachSchritte": 76, "wachMedianMs": 8.8, "wachP75Ms": 9.7, "ruhendSchritte": 292, "ruhendMedianMs": 0.1, "schlafen": 100}}, "sek": 77.6}, "einsturz-reload": {"fehler": "kein Notizbuch der Probe einsturz (sie lief nicht bis zum Stand)", "sek": 8.7}} };
const einsturzRoh = (wo, aendern = (e, rl) => [e, rl]) => {
    const k = JSON.parse(JSON.stringify(EINSTURZ_ROH[wo]));
    const [e, rl] = aendern(k.einsturz, k["einsturz-reload"]);
    return "WELTPROBE einsturz " + JSON.stringify(e) + "\nWELTPROBE einsturz-reload " + JSON.stringify(rl) + "\n";
};
const EINSTURZ = weltBefehl([["einsturz", einsturzProbe], ["einsturz-reload", einsturzReload, { neuladen: true }]]);
// wetter.K3#2 — DIE GANGLINIE JE LAUF: eine Mess-Kopie der Wasser-Linse (scripts/lib/wasser-linse.cjs) trägt die Probe hinter
// `sturm()` (die Anker „pg.regen = sturm();“ und „pg.regen.fest = sturm().hub;“, je genau einmal im Text), eine Mess-Kopie von
// scripts/diag-wasser-leben.cjs liest sie statt der Linse; der Block koerper läuft (Null-Renderer, Mess-Wiese), sein JSON trägt das
// Maß in koerper.pegel.lauf. Beide Kopien fallen nach dem Lauf. Läuft im Spiel-Baum (cwd) — am main wie am Zweig: die Probe liest nur
// Glieder, die beide tragen (die Welt-Uhr `spielZeit`, das Wort `_setWeather`, `_pegelTakt`, den Kern-Spiegel `_hydroRiverAt` /
// `_waterLevelAt`, `flussLaeufe`, `flussAm`, `PEGEL`), nie ein Glied des Schnitts.
function k3Ganglinie() {
    const fs = require("fs");
    const cp = require("child_process");
    // DIE PROBE (im Leib von wasserSchmelze: r, st, K, P, R): zwei Bäche um P.fluss mit A-Verhältnis ≥ 4 (das Einzugsgebiet aus dem
    // Netz des Gesetzes, `flussLaeufe`; je Glied die Mitte seiner Bahn, centerness > 0,9 am Kern-Spiegel), ein Spieltag Sonne (der
    // Bach läuft ab), dann 10 s Niesel (`cloudy`) als Wort des Spielers und 12 Spielstunden in 2-s-Schritten der Welt-Uhr: der Hub
    // (`_hydroRiverAt` über dem Spiegel ohne Pegel) als Abfluss nach der Pegel-Abfluss-Beziehung des Gesetzes (Manning auf der
    // Spende `PEGEL.spende` im Bett der Hydrosphäre) gegen denselben Lauf ohne Niesel (der Grund fällt in beiden gleich). LAG der
    // Schwerpunkt der Ganglinie hinter dem des Regens (Spielstunden) · BILANZ das Volumen durch den Pegel gegen den Abfluss des
    // Regens über derselben Fläche (der Niesel × `PEGEL.regen`, Beiwert der Wiese) · DÜRRE der Spiegel an Bach, Fluss und See P.see
    // (`_waterLevelAt`) 14 Spieltage Sonne später. Welt-Uhr und Stempel kehren danach zurück.
    const probe = () => {
        const wort = (w, s) => (r._setWeather(w, "human"), (st.weatherTransition = null), r._naesseTakt(s));
        const uhr = () => [st.spielZeit, st.regenStempel && st.regenStempel.slice()];
        const zu = ([t, S]) => ((st.spielZeit = t), (st.regenStempel = S && S.slice()), r._pegelTakt());
        const [L, tagS, u] = [r._gelaende(), r.constructor.DAY_LENGTH_DEFAULT_MINUTES * 60, uhr()];
        const ruhe = Object.create(L, { pegel: { value: null } });
        const gl = K.flussLaeufe(L, P.fluss[0] - 800, P.fluss[1] - 800, P.fluss[0] + 800, P.fluss[1] + 800, 8)
            .flatMap((lf) => lf.glieder.map(({ A, bahn }) => ({ A, ...bahn[bahn.length >> 1] })))
            .filter((g) => (r._hydroRiverAt(g.x, g.z) || {}).centerness > 0.9)
            .sort((a, b) => a.A - b.A);
        const orte = [gl[0], gl.find((g) => g.A >= 4 * gl[0].A)];
        if (!orte[1]) return { fehler: "keine zwei Bäche mit A-Verhältnis ≥ 4 um P.fluss", glieder: gl.length };
        const hub = () => [...orte.map((o) => r._hydroRiverAt(o.x, o.z).surfaceY - K.flussAm(ruhe, o.x, o.z).surfaceY), r._waterLevelAt(...P.see)];
        const H = L.hydroGesetz;
        const tf = (1 - H.spiegelFreibord) * H.kanalTiefe;
        const Q = (h) => K.PEGEL.spende * (Math.pow(Math.max(0, 1 + h / tf), 1 / 0.6) - 1);
        wort("sunny", 1e6);
        zu([st.spielZeit + tagS, st.regenStempel]);
        const eins = uhr();
        const reihe = (puls) => {
            zu(eins);
            const y = [];
            for (let k = 0; 2 * k <= tagS / 2; k++) {
                st.spielZeit = eins[0] + 2 * k;
                if (puls && (k === 5 || k === 10)) wort(k === 5 ? "cloudy" : "sunny", 0);
                r._pegelTakt();
                y.push(hub());
            }
            return y;
        };
        const [mit, ohne] = [reihe(true), reihe(false)];
        const summe = (i, f) => mit.reduce((s, y, k) => s + (Q(y[i]) - Q(ohne[k][i])) * f(k), 0);
        const V = [0, 1].map((i) => (summe(i, () => 1) * 2) / tagS);
        const D = (K.PEGEL.regen * r.constructor.WEATHER_FIELD.cloudy.rain * 10) / tagS;
        const lag = V.map((v, i) => (v > 0 ? (((summe(i, (k) => 2 * k) * 2) / tagS / v - 15) * 24) / tagS : 0));
        zu(eins);
        const vor = hub();
        zu([eins[0] + 14 * tagS, eins[1]]);
        const duerre = hub().map((y, i) => R(y - vor[i]));
        zu(u);
        return {
            A: orte.map((o) => R(o.A / 1e6)),
            lag: lag.map(R),
            verhaeltnis: lag[0] > 0 ? R(lag[1] / lag[0]) : 0,
            bilanz: V.map((v) => R(v / D)),
            volumen: V.map((v, i) => [Math.round(D * orte[i].A * 10) / 10, Math.round(v * orte[i].A * 10) / 10]),
            duerre,
        };
    };
    const LI = "scripts/lib/wasser-linse.cjs";
    const DI = "scripts/diag-wasser-leben.cjs";
    const anker = ["        pg.regen = sturm();\n", "        pg.regen.fest = sturm().hub;\n"];
    const req = 'require("./lib/wasser-linse.cjs")';
    const [linse, diag] = [LI, DI].map((f) => fs.readFileSync(f, "utf8"));
    if (anker.some((a) => linse.split(a).length !== 2) || diag.split(req).length !== 2) {
        console.log("K3-LAUF: ein Anker fehlt oder steht doppelt (" + LI + " / " + DI + ")");
        process.exit(3);
    }
    const [kl, kd] = ["scripts/lib/.k3-lauf-linse.cjs", "scripts/.k3-lauf.cjs"];
    fs.writeFileSync(kl, linse.replace(anker[0], anker[0] + "        const __lauf = " + probe.toString() + ";\n        pg.lauf = __lauf();\n")
        .replace(anker[1], anker[1] + "        pg.lauf.fest = __lauf().bilanz;\n"));
    fs.writeFileSync(kd, diag.replace(req, 'require("./lib/.k3-lauf-linse.cjs")'));
    const p = cp.spawnSync(process.execPath, [kd, "--nur", "koerper"], { encoding: "utf8", maxBuffer: 1 << 26 });
    for (const f of [kl, kd]) fs.rmSync(f, { force: true });
    process.stdout.write(p.stdout || "");
    process.stderr.write(p.stderr || "");
    process.exit(p.status === null ? 1 : p.status);
}

// die Roh-Ausgabe der Ganglinie (wetter.K3#2) für die Proben: der JSON-Block des Blocks koerper, die Ganglinie am Zweig mit `aus`
// überschrieben
const K3_LAUF = (aus) =>
    JSON.stringify({ koerper: { pegel: { lauf: { A: [0.16, 0.8], lag: [1, 1.9], verhaeltnis: 1.644, bilanz: [1.006, 0.978], volumen: [[3.8, 3.9], [19.2, 18.8]], duerre: [-0.2, -0.2, -0.2], fest: [0, 0], ...aus } } } }, null, 1);
// die Werkbank-Rümpfe der Karten-Hälfte von wetter.K3#2 (eine Zeile je Befehl, `W eval '…'`: ohne einfaches Anführungszeichen)
const VOR_EVAL = `const s = r.state, P = [-258.4, -1132.8], f = r._hydroRiverAt(P[0], P[1]); if (!f) return { fehler: "kein Bach an " + P.join("/") }; window.__wetterSetzen("sunny"); r._naesseTakt(1e6); window.__k3Grund = s.regenStempel && s.regenStempel.slice(); const [ex, ez] = [P[0] - f.flowZ * 7, P[1] + f.flowX * 7], ey = r._voxelSurfaceY(ex, ez) + 1.7; return { vor: r._hydroRiverAt(P[0], P[1]).surfaceY, kamera: [ex, ey, ez, P[0], f.surfaceY, P[1]].map((v) => +v.toFixed(3)) };`;
const STURM_EVAL = `const s = r.state, P = [-258.4, -1132.8]; window.__wetterSetzen("stormy"); r._naesseTakt(0); for (let k = 0; k < 240; k++) (s.spielZeit += 5), r._tickRain(); window.__wetterSetzen("sunny"); r._naesseTakt(0); r._pegelTakt(); r._drainDirtyVoxelChunks(); return { nach: r._hydroRiverAt(P[0], P[1]).surfaceY };`;
const ZURUECK_EVAL = `const s = r.state; window.__wetterSetzen("sunny"); s.regenStempel = window.__k3Grund; r._pegelTakt(); r._drainDirtyVoxelChunks(); return { zurueck: true };`;
// DAS ZIEL AUF DEM WASSER (gelaende.K3#1, w24-linse-wasserziel; `W eval '…'`: ohne einfaches Anführungszeichen): die Ego-Pose am Ufer
// (Gier −1,309, Neigung 0) und EIN Bild ihrer Tiefe (`__spiegelDaten`); je Gier-Versatz (0, ±5° … ±50°, die Breite des Bilds) jede
// nasse Stelle 3–120 m voraus (`_nassAt`, je 2 m) als Punkt auf ihrem Spiegel (`_koerperWasser`), gefragt an DIESEM Bild über die EINE
// Abnahme des Ziels (`__abnahmeMessen` nurZiel): frei heißt, das Bild zeigt an seinem Pixel nichts davor — nie die Nachsicht für die
// Boden-Schicht der fernen Hälfte (`__zielMessen`: ein Strauch in 25 m vor dem Wasser in 40 m hieß dort frei, das Bild zeigte den
// Strauch). Der erste sichtbare Punkt ist das Ziel; das Auge des Spiels dreht dorthin (zweimal: die Kamera sitzt am Kopf), das Ziel
// auf seinem Strahl im Abstand des Wassers — vom selben Auge sieht es dasselbe, in jeder Richtung
// die Roh-Ausgaben der Proben (knapp: was das Urteil liest): am main 53b2fc7a das Ziel auf dem Wasser (Radeon 08.11., dieser Zweig),
// am main e475c6b4 der alte Weg — das Ziel 100 m voraus in Augenhöhe, ohne Zeile WASSER (Radeon 08.11., damals GRÜN)
const K3_ROH = { neu: {"j":{"klasse":{"klassen":{"wasserSatz":{"spiegelTreue":0.7231,"pixel":20554,"spiegelEbene":1.091}}},"bild":{"w":1920,"h":1080},"pose":{"kamera":[1866.6,3.928,-6193.9],"blick":[-0.96499,-0.044,0.25857]},"ok":true,"zeile":"ABNAHME GRÜN · beweis · Sicht 0.0 % · Ziel Wasser im Bild frei 49.05 m · Luma 94.1 σ 35.3 schwarz 0.1 % weiß 0.0 % · Stand 18.546.226 · Bühne summer sunny 0.50 · Gerät WebGPU amd rdna-3"},"stdout":"KAMERA 1866.6 3.928 -6193.9 1819.27 1.77 -6181.218\nWASSER {\"y\":1.77,\"nass\":true,\"versatz\":0,\"gefragt\":8}"}, alt: {"j":{"klasse":{"klassen":{"wasserSatz":{"spiegelTreue":0.7181,"pixel":25551,"spiegelEbene":0.877}}},"bild":{"w":1920,"h":1080},"pose":{"kamera":[1866.6,3.928,-6193.9],"blick":[-0.96593,0,0.25882]},"ok":true,"zeile":"ABNAHME GRÜN · beweis · Sicht 0.0 % · Ziel Blickziel im Bild frei 100 m · Luma 94.7 σ 36.9 schwarz 0.1 % weiß 0.0 % · Stand 18.546.217 · Bühne summer sunny 0.50 · Gerät WebGPU amd rdna-3"},"stdout":"KAMERA 1866.6 3.928 -6193.9 1770.007 3.928 -6168.018"} };
const k3Wasser = (o) => K3_ROH.neu.stdout.replace(/^WASSER .*$/m, "WASSER " + JSON.stringify(Object.assign(JSON.parse(/^WASSER (.*)$/m.exec(K3_ROH.neu.stdout)[1]), o)));
const WASSER_ZIEL = `const s = r.state, G = -1.309;
if (s.cameraMode !== "first") r.setCameraMode("first");
const stell = (g, n) => { s.yaw = g; s.pitch = n; for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); return s.camera; };
const E0 = stell(G, 0).position.clone();
const nass = (x, z) => r._nassAt(x, z);
const spiegel = (x, z) => r._koerperWasser(x, z, r._voxelSurfaceY(x, z));
window.__loopBild();
const S = await window.__spiegelDaten();
const sieht = (p) => { const z = window.__abnahmeMessen({ ziel: { x: p.x, y: p.y, z: p.z, name: "Wasser", fuss: false }, nurZiel: true, tiefe: S }).ziel || {}; return z.imBild === true && z.frei === true; };
let gefragt = 0, wahl = null;
for (const w of [0, 5, -5, 10, -10, 15, -15, 20, -20, 25, -25, 30, -30, 35, -35, 40, -40, 45, -45, 50, -50]) {
    const g = G + (w * Math.PI) / 180, dx = Math.sin(g), dz = Math.cos(g);
    for (let d = 3; d <= 120 && !wahl; d += 2) {
        const x = E0.x + dx * d, z = E0.z + dz * d;
        if (!nass(x, z)) continue;
        gefragt++;
        const p = new T.Vector3(x, spiegel(x, z), z);
        if (sieht(p)) wahl = { w, p };
    }
    if (wahl) break;
}
if (!wahl) return { kamera: null, wasser: { fehler: gefragt ? "kein Wasser im Bild der Ego-Pose (" + gefragt + " nasse Stellen verdeckt)" : "kein Gewässer 3–120 m im Blick", gefragt } };
let c = s.camera;
for (let i = 0; i < 2; i++) { const v = wahl.p.clone().sub(c.position); c = stell(Math.atan2(v.x, v.z), Math.asin(v.y / v.length())); }
const L = wahl.p.distanceTo(c.position), t = c.position.clone().addScaledVector(c.getWorldDirection(new T.Vector3()), L);
return { kamera: [c.position.x, c.position.y, c.position.z, t.x, t.y, t.z].map((q) => +q.toFixed(3)), wasser: { y: +spiegel(t.x, t.z).toFixed(3), nass: nass(t.x, t.z), versatz: wahl.w, gefragt } };`;
const WELT_PFAD = ["stamm/dirigent-*.js", "stamm/daten.js", "scripts/lib/welt-boot.cjs", "scripts/lib/welt-orte.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "spec/profiband/haushalt.json"];

// DIE ROH-AUSGABE der Welt-Probe am main 25ac4c0c (01.11., Cloud, headless): die Proben jeder Station urteilen sie und ihre Mutanten
const WELT_ROH = {"seil": {"klingen": 22, "seile": [], "je": {}, "namen": ["langschwert", "saebel", "degen", "grossschwert", "dolch", "messer", "langbogen", "kriegsbogen", "reiterbogen", "recurvebogen", "streitkolben", "kriegsaxt", "kriegshammer", "keule", "faellaxt", "spaltmaul", "vorschlaghammer", "beil", "spitzhacke", "spaten", "schaufel", "sichel"]}, "stoss": {"ort": [-280.4, -1045.6], "knoechel": 4, "echt": {"masse": 89.022, "ausfallM": 0.008, "querM": 0.008, "erholtS": 0.2, "sturz": false}, "gegen": {"masse": 89.022, "ausfallM": 0.008, "querM": 0.008, "erholtS": 0.2, "sturz": false}, "schwer": {"masse": 178.043, "ausfallM": 0.004, "querM": 0.004, "erholtS": 0.2, "sturz": false}}, "feld": {"zelleM": 16, "mitte": [-280, -1048], "nachbar": [-248, -1048], "vor": {"mitte": {"alle": 29, "blumen": 26}, "nachbar": {"alle": 30, "blumen": 24}, "feld": [0.855, 0.658]}, "ruhe": {"mitte": {"alle": 29, "blumen": 26}, "nachbar": {"alle": 30, "blumen": 24}, "feld": [0.855, 0.658]}, "nach": {"mitte": {"alle": 29, "blumen": 26}, "nachbar": {"alle": 30, "blumen": 24}, "feld": [1, 0.658]}, "akt": true}, "alter": {"dorf": [-841, -861], "tag": 30, "klassen": 14, "je": {"bodenSatz": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "formationenSatz": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "streuSatz": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "bauSatz": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:birke:L0": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:eiche:L0": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:fichte:L0": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:tanne:L0": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:birke:L1": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:eiche:L1": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:fichte:L1": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:weide:L1": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:strauch:L1": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}, "f:tanne:L1": {"nord": 0, "sued": 0, "oben": 0, "rausch": 0}}}, "schnee": {"ort": [-280.4, -1045.6], "hoeheM": 27.612, "versatz": -160, "tag": 40, "proben": 317, "deckung": 1, "fuss": {"tiefeM": -0.01, "schnee": 1}, "gegen": {"tiefeM": -0.01, "schnee": 0, "versatz": 0}}};
const weltRoh = (name, aendern) => "WELTPROBE " + name + " " + JSON.stringify(aendern(JSON.parse(JSON.stringify(WELT_ROH[name]))));

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
    // DAS ZIEL LIEGT AUF DEM WASSER, DAS DIE STATION MISST (w24-linse-wasserziel, `--fuss false`, `--ziel Wasser`): bis dahin lag der
    // Blick-Punkt 100 m voraus in Augenhöhe, ein Punkt ohne Bezug — er stand hinter dem Ufer in 90,78 m (Radeon 1b1fe4d4, d16b407a), dann
    // im Wald, und seit die Eichen-Krone der Karte breiter ist (w23-karte-l2, `_karteSaumVon`) verdeckte sie ihn in 33,98 m (Radeon
    // 77265b04), während das Wasser links im Bild lag. Jetzt ist das Ziel die erste nasse Stelle (`_nassAt`, die EINE Wahrheit „ist hier
    // Wasser"), die das Bild der Ego-Pose an ihrem Pixel zeigt (`WASSER_ZIEL`: je Gier-Versatz 0, ±5° … ±50°, 3–120 m voraus, auf ihrem
    // Spiegel); das Auge des Spiels dreht Gier und Neigung dorthin (`_loopCamera`), das Ziel liegt auf seinem Strahl im Abstand des
    // Wassers. Die Zeile WASSER nennt Spiegel, Nässe, Gier-Versatz und die Zahl der gefragten nassen Stellen; das Urteil verlangt das
    // Ziel ≤ 0,1 m am Spiegel einer nassen Stelle.
    {
        kriterium: "gelaende.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { sek: 26, befehl: [
            "bash",
            "-c",
            `set -u; A=$(cygpath -m '{AUS}'); D="\${A%.json}-werk"; rm -rf "$D"; mkdir -p "$D"; SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; W() { node scripts/werkbank.cjs "$@"; }; W fenster 1920 1080 > "$D/fenster.txt" 2>&1; W umstellen 1866.6 -6193.9 > "$D/umstellen.txt" 2>&1; W eval '${WASSER_ZIEL}' > "$D/kamera.txt" 2>&1; node -e 'const t = require("fs").readFileSync(process.argv[1], "utf8"); let o = {}; try { o = JSON.parse(t.slice(t.indexOf("{"))).ergebnis || {}; } catch (_e) { o = {}; } console.log((o.kamera || []).join(" ")); console.log("WASSER " + JSON.stringify(o.wasser || { fehler: t.slice(0, 300) }))' "$D/kamera.txt" > "$D/ziel.txt" 2>&1; KAM=$(head -1 "$D/ziel.txt"); echo "KAMERA $KAM"; tail -1 "$D/ziel.txt"; [ -n "$KAM" ] || exit 1; W bild $KAM --w 1920 --h 1080 --wahl 0 --fuss false --ziel Wasser --klasse '^(wasserSatz|farWater|chunk-water-[a-z]+)$' --datei "$D/wasser.png" > "$D/bild.txt" 2>&1; E=$?; echo "BILD $(tr -d '\\n' < "$D/bild.txt" | cut -c1-600)"; cp "$D/wasser.abnahme.json" "$A" 2>/dev/null; exit $E`,
        ] },
        gpu: true,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            if (!j || !j.klasse) {
                // der erste Fehler der Ausgabe: die Zeile WASSER (kein Wasser im Bild) vor dem Schuss, sonst der Schuss selbst
                const f = /"fehler": ?"([^"]*)/.exec(lauf.stdout || "");
                return { gruen: false, zahl: "kein Begleit-JSON mit Klassen (Exit " + lauf.exit + (f ? ": " + f[1].slice(0, 200) : "") + ")" };
            }
            const w = (j.klasse.klassen || {}).wasserSatz || {};
            const b = j.bild || {};
            const kam = /^KAMERA (\S+) (\S+) (\S+) (\S+) (\S+) (\S+)/m.exec(lauf.stdout || "");
            const pk = (j.pose && j.pose.kamera) || [];
            const pb = (j.pose && j.pose.blick) || [];
            // die Pose des Schusses ist die Kamera des Spiels, Ort UND Blick (Schlupfloch: die Blick-Wahl verschiebt sie, B09;
            // 23.10.: ohne `_loopCamera` blieb die Kamera der Werkbank auf Gier 0 stehen, der Schuss sah nach +z ins Laub) — der Blick
            // ist die Richtung zum Ziel, über seinen Abstand
            const L = kam ? Math.hypot(+kam[4] - +kam[1], +kam[5] - +kam[2], +kam[6] - +kam[3]) : 0;
            const gleich =
                !!kam && L > 0 && pk.length === 3 && pb.length === 3 &&
                [1, 2, 3].every((i) => Math.abs(+kam[i] - pk[i - 1]) <= 0.05 && Math.abs((+kam[i + 3] - +kam[i]) / L - pb[i - 1]) <= 0.01);
            // DAS ZIEL AUF DEM WASSER: der Blick-Punkt liegt ≤ 0,1 m am Spiegel einer nassen Stelle (die Zeile WASSER des Spiels)
            const wm = /^WASSER (\{.*\})\s*$/m.exec(lauf.stdout || "");
            let wz = null;
            try {
                wz = wm ? JSON.parse(wm[1]) : null;
            } catch (_e) {
                wz = null;
            }
            const aufWasser = !!kam && !!wz && wz.nass === true && Number.isFinite(wz.y) && Math.abs(+kam[5] - wz.y) <= 0.1;
            const gruen = w.spiegelTreue != null && w.spiegelTreue >= 0.6 && b.w === 1920 && b.h === 1080 && gleich && aufWasser && j.ok === true;
            return {
                gruen,
                zahl:
                    "spiegelTreue " + w.spiegelTreue + " (wasserSatz " + w.pixel + " px, spiegelEbene " + w.spiegelEbene + ") in " + b.w + "×" + b.h +
                    ", Pose " + (gleich ? "= Kamera des Spiels" : "WEICHT AB (" + (kam ? kam.slice(1).join("/") : "?") + " gegen " + pk.join("/") + " Blick " + pb.join("/") + ")") +
                    ", Ziel " + (aufWasser ? "auf dem Wasser in " + L.toFixed(1) + " m (Gier-Versatz " + wz.versatz + "°)" : "OHNE Bezug zum Wasser" + (wz && wz.fehler ? " (" + wz.fehler + ")" : wz ? " (Spiegel " + wz.y + ", nass " + wz.nass + ")" : "")) +
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
        proben: [
            { name: "die Messung am main 53b2fc7a (das Ziel auf dem Wasser in 49,0 m, spiegelTreue 0,7231)", stdout: K3_ROH.neu.stdout, j: K3_ROH.neu.j, gruen: true },
            { name: "der alte Weg am main e475c6b4 (das Ziel 100 m voraus in Augenhöhe, ohne Wasser)", stdout: K3_ROH.alt.stdout, j: K3_ROH.alt.j, gruen: false, zahl: /Ziel OHNE Bezug zum Wasser/ },
            { name: "MUTANTE das Ziel 2 m über dem Spiegel", stdout: k3Wasser({ y: -0.23 }), j: K3_ROH.neu.j, gruen: false, zahl: /Ziel OHNE Bezug zum Wasser/ },
            { name: "MUTANTE das Ziel auf trockenem Grund", stdout: k3Wasser({ nass: false }), j: K3_ROH.neu.j, gruen: false, zahl: /Ziel OHNE Bezug zum Wasser/ },
            { name: "MUTANTE kein Wasser im Bild der Ego-Pose", stdout: ["KAMERA ", "WASSER " + JSON.stringify({ fehler: "kein Wasser im Bild der Ego-Pose (8 nasse Stellen verdeckt)", gefragt: 8 })].join("\n"), j: null, gruen: false, zahl: /kein Wasser im Bild der Ego-Pose/ },
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
        probe: { befehl: PW.torBefehl(PW.bodenRollen), sek: 10, mutiert: false },
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
        probe: { sek: 25, befehl: PW.torBefehl(PW.naesseDorf), mutiert: true },
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
    // wetter.K2 Staffel 2 (w15-pfuetze) — ZWEI Hälften unter EINEM Schlüssel: headless die Pfütze in den Senken des Kerns (Ego und Third),
    // die Trocken-Kurve und der Fall (`wetterK2Lauf`, die Mutante im selben Lauf); auf beiden Karten die Nässe der Mess-Wiese im Bild in
    // Ego und Third (`naesseWiese`, die Linse `werkbank licht --naesse wiese,wiese:third`). Die Dorfgasse trägt die Staffel 1 auf beiden
    // Karten (die Linse stellt dort die Kamera selbst an die Schwelle). An main db431cf0 ROT: die Welt kennt keine Pfütze.
    {
        kriterium: "wetter.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "-e", "(" + wetterK2Lauf + ")()", "{AUS}", "{PORT}"],
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => wetterK2Urteil(lauf),
        proben: WETTER_K2_PROBEN,
        pfad: [
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-bauten.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "gelaende-core.js",
            "foundry-core.js",
            "voxel-worker.js",
            "index.html",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/wasser-linse.cjs",
        ],
        quelle: "2 = Mess-Wiese und Dorfgasse, Ego/Third, beide Geräte, mit Pfützen und Trocken-Kurve",
    },
    {
        kriterium: "wetter.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { sek: 30, befehl: PW.torBefehl(PW.naesseWiese), mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 3,
        urteil: (j) => naesseWieseUrteil(j),
        pfad: [
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-bauten.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "gelaende-core.js",
            "foundry-core.js",
            "voxel-worker.js",
            "index.html",
            "scripts/werkbank.cjs",
            "scripts/lib/licht-linsen.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = Mess-Wiese und Dorfgasse, Ego/Third, beide Geräte, mit Pfützen und Trocken-Kurve",
    },

    // ── wetter.K3 ── gate:wasser-leben P4 im Block koerper (Null-Renderer, Mess-Wiese): das Wort des Spielers „Sturm", 20 min
    // Welt-Uhr im Takt des Regens (`_tickRain` je 5 s) — der Regen des Wetter-Felds fällt als Stempel auf die Welt-Uhr, gefaltet
    // je Lag-Klasse des Laufs (gelaende-core `pegelLauf`, seit w12-pegel-lauf; davor ein Term des Felds ohne Speicher), die
    // Pegel-Tafel folgt ihm je Stufe und reist in den Faden; gemessen der Spiegel des Kerns (`_waterLevelAt`) am Bach der Mess-Wiese über dem trockenen, das Regen-
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

    // ── wetter.K3 Staffel 2, die headless-Hälfte ── die Ganglinie je Lauf (`k3Ganglinie`: die Probe hinter `sturm()` in einer
    // Mess-Kopie der Wasser-Linse, Null-Renderer, Mess-Wiese) am Kern-Spiegel per Sprung der Welt-Uhr: zwei Bäche mit A-Verhältnis
    // ≥ 4, 10 s Niesel als Wort des Spielers, je die Ganglinie gegen denselben Lauf ohne Niesel — der Lag (Schwerpunkt hinter
    // dem des Regens) wächst mit A, das Volumen durch den Pegel ist der Abfluss des Regens über A ±30 %, 14 Spieltage Sonne senken
    // Bach, Fluss und See; das Regen-Feld gehalten (der Niesel regnet nicht) trägt kein Volumen. An main b62542c9 ROT (der Regen ein
    // Term des Felds ohne Speicher: Lag −0,007 ↔ −0,007 h, Bilanz 0,064, Dürre 0); am Zweig w12-pegel-lauf GRÜN (die Faltung des
    // Regens über die Welt-Uhr je Lag-Klasse, gelaende-core `pegelLauf`). Die Karten-Hälfte (das Bild am Bach) misst die Sitzung.
    {
        kriterium: "wetter.K3",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "-e", "(" + k3Ganglinie.toString() + ")()"],
        env: { WASSER_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const b = jsonBlock(lauf.stdout);
            const g = b && b.koerper && b.koerper.pegel && b.koerper.pegel.lauf;
            if (!g || g.fehler || !Array.isArray(g.A))
                return { gruen: false, zahl: "keine Ganglinie am Bach (" + ((g && g.fehler) || "koerper.pegel.lauf fehlt") + ", Exit " + lauf.exit + ")" };
            const im = (a, n, lo, hi) => Array.isArray(a) && a.length === n && a.every((v) => v >= lo && v <= hi);
            const aV = g.A[0] > 0 ? g.A[1] / g.A[0] : 0;
            const v = (g.volumen || []).map((x) => x.join(" ↔ ")).join(" / ");
            return {
                gruen: aV >= 4 && g.verhaeltnis > 1 && im(g.bilanz, 2, 0.7, 1.3) && im(g.duerre, 3, -Infinity, -0.005) && im(g.fest, 2, -0.1, 0.1),
                zahl:
                    "A " + g.A.join(" ↔ ") + " km² (×" + aV.toFixed(1) + ") · Lag " + (g.lag || []).join(" ↔ ") + " Spielstunden (Verhältnis " + g.verhaeltnis +
                    ") · Bilanz " + (g.bilanz || []).join(" / ") + " (Regen × Fläche ↔ ΔVolumen " + v + " m³) · Dürre-Δ 14 Spieltage Bach/Fluss/See " +
                    (g.duerre || []).join(" / ") + " m · Regen-Feld gehalten Bilanz " + (g.fest || []).join(" / ") + " · Exit " + lauf.exit,
            };
        },
        proben: [
            { name: "die Messung am main b62542c9 (kein Lag, keine Dürre)", stdout: K3_LAUF({ A: [0.16, 0.8], lag: [-0.007, -0.007], verhaeltnis: 0, bilanz: [0.064, 0.064], duerre: [0, 0, 0], fest: [0, 0] }), gruen: false },
            { name: "die Ganglinie am Zweig w12-pegel-lauf", stdout: K3_LAUF({}), gruen: true },
            { name: "das Regen-Feld gehalten trägt ein Volumen (der Pegel liest das Wort, nie das Feld)", stdout: K3_LAUF({ fest: [1, 1] }), gruen: false },
            { name: "ein Sinus auf dem Pegel (der Lag gleich, unabhängig von A)", stdout: K3_LAUF({ lag: [1, 1], verhaeltnis: 1 }), gruen: false },
            { name: "zwei Bäche gleicher Fläche (A-Verhältnis 2)", stdout: K3_LAUF({ A: [0.4, 0.8] }), gruen: false },
            { name: "das Volumen verdoppelt (ein Speicher, der den Regen zweimal abgibt)", stdout: K3_LAUF({ bilanz: [2, 2] }), gruen: false },
            { name: "die Dürre hält den See", stdout: K3_LAUF({ duerre: [-0.2, -0.2, 0] }), gruen: false },
            { name: "kein zweiter Bach um P.fluss", stdout: K3_LAUF({ fehler: "keine zwei Bäche mit A-Verhältnis ≥ 4 um P.fluss" }), gruen: false },
        ],
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
        quelle: "2 = der Lag wächst mit dem Einzugsgebiet A, Volumen-Bilanz Regen × Fläche ≈ ΔVolumen ±30 %, 14 Spieltage Dürre senken",
    },

    // ── wetter.K3 Staffel 2, die Karten-Hälfte ── DAS BILD AM BACH (nach `wasserBach`, scripts/lib/wasser-linse.cjs): der Bach der
    // Mess-Wiese (der Bach P.fluss von wetter.K3#1, −258,4/−1132,8) aus 7 m quer zu seinem Lauf, Augenhöhe 1,7 m, in 1920×1080 aus dem
    // Ausgabe-Pfad (`bild --wahl 0`: der Schuss wartet, bis die Welt an der Pose steht) — trocken (das Wort „sonnig") und nach 20 min
    // Sturm der Welt-Uhr im Takt des Regens, das Wetter danach klar (der Bach steht noch hoch: der Lag seines Laufs). GRÜN: der
    // Kern-Spiegel am Bach +≥ 0,15 m, das gezeichnete Wasser (die Klassen chunk-water-* und wasserSatz) im zweiten Bild ≥ 5 % mehr
    // Pixel, beide Bilder in Ausgabe-Größe und von ihrem Urteil getragen. Die Stempel des Regens kehren zurück, die Sitzung stellt
    // die Welt in den Grund (mutiert). Gemessen vom Koordinator auf Radeon und GTX; die headless-Hälfte misst Lag, Bilanz und Dürre.
    {
        kriterium: "wetter.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { sek: 45, mutiert: true, befehl: [
            "bash",
            "-c",
            `set -u; A=$(cygpath -m '{AUS}'); D="\${A%.json}-werk"; rm -rf "$D"; mkdir -p "$D"; SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; W() { node scripts/werkbank.cjs "$@"; }; W fenster 1920 1080 > "$D/fenster.txt" 2>&1; W umstellen -258.4 -1132.8 > "$D/umstellen.txt" 2>&1; W eval 'VOR' > "$D/vor.txt" 2>&1; KAM=$(node -e 'const t = require("fs").readFileSync(process.argv[1], "utf8"); const o = JSON.parse(t.slice(t.indexOf("{"))); console.log(o.ergebnis.kamera.join(" "))' "$D/vor.txt"); echo "KAMERA $KAM"; K='^(wasserSatz|chunk-water-[a-z]+)$'; W bild $KAM --w 1920 --h 1080 --wahl 0 --klasse "$K" --datei "$D/trocken.png" > "$D/bild-trocken.txt" 2>&1; W eval 'STURM' > "$D/sturm.txt" 2>&1; W bild $KAM --w 1920 --h 1080 --wahl 0 --klasse "$K" --datei "$D/sturm.png" > "$D/bild-sturm.txt" 2>&1; E=$?; W eval 'ZURUECK' > "$D/zurueck.txt" 2>&1; echo "BILD $(tr -d '\\n' < "$D/bild-sturm.txt" | cut -c1-400)"; node -e 'const fs = require("fs"), d = process.argv[1], j = (f) => { try { const t = fs.readFileSync(d + "/" + f, "utf8"); return JSON.parse(t.slice(t.indexOf("{"))); } catch (_e) { return null; } }; fs.writeFileSync(process.argv[2], JSON.stringify({ trocken: j("trocken.abnahme.json"), sturm: j("sturm.abnahme.json"), vor: (j("vor.txt") || {}).ergebnis || null, nach: (j("sturm.txt") || {}).ergebnis || null }))' "$D" "$A"; exit $E`.replace("VOR", VOR_EVAL).replace("STURM", STURM_EVAL).replace("ZURUECK", ZURUECK_EVAL),
        ] },
        gpu: true,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            if (!j || !j.trocken || !j.sturm || !j.vor || !j.nach || j.vor.fehler)
                return { gruen: false, zahl: "kein Begleit-JSON beider Bilder am Bach (" + ((j && j.vor && j.vor.fehler) || "Exit " + lauf.exit) + ")" };
            const px = (a) => Object.entries((a.klasse && a.klasse.klassen) || {}).reduce((n, [k, v]) => n + (/^(wasserSatz|chunk-water-)/.test(k) ? v.pixel || 0 : 0), 0);
            const [p0, p1] = [px(j.trocken), px(j.sturm)];
            const hub = Math.round((j.nach.nach - j.vor.vor) * 1000) / 1000;
            const gross = [j.trocken, j.sturm].every((a) => a.bild && a.bild.w === 1920 && a.bild.h === 1080 && a.ok === true);
            return {
                gruen: hub >= 0.15 && p0 > 0 && p1 >= 1.05 * p0 && gross,
                zahl: "Bach am Kern-Spiegel +" + hub + " m nach 20 min Sturm · gezeichnetes Wasser " + p0 + " → " + p1 + " px (×" + (p0 ? (p1 / p0).toFixed(2) : "—") +
                    ") in " + [j.trocken, j.sturm].map((a) => (a.bild ? a.bild.w + "×" + a.bild.h : "?") + (a.ok === true ? "" : " ohne Urteil")).join(" / "),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "index.html",
            "save-server.js",
            "scripts/werkbank.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = der Lag wächst mit dem Einzugsgebiet A, Volumen-Bilanz Regen × Fläche ≈ ΔVolumen ±30 %, 14 Spieltage Dürre senken, Bild am Bach auf beiden Geräten",
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
        probe: {
            befehl: PW.torBefehl(PW.kollisionTempo),
            sek: 90,
            mutiert: true,
        },
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
            // DER GRUND BEIM NAMEN (w4-linsen-b): die Probe druckt, warum sie nichts fuhr (`❌ LAUF-FEHLER`, `LEER: (V)`, `PROBE-FEHLER`) — an
            // 3ed95dcf GTX hieß die Zahl nur „fehlt in der Ausgabe", wo die Probe „DER BAU STEHT NICHT: haus_alemannisch#552 nach 306 Takten" sagte
            const warum = z.map((x) => x.trim()).find((x) => /^(❌ LAUF-FEHLER|PROBE-FEHLER|LEER: \(V\))/.test(x));
            if (!kopf || !w || !g)
                return { gruen: false, zahl: "(V) Wagen oder gestoßener Bär fehlt in der Ausgabe (Exit " + lauf.exit + ")" + (warum ? " — " + warum.slice(0, 300) : "") };
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

    // ── breite.stoffe ── gate:gegenstand-stoff --gesetz (Null-Renderer; w28-stoff-gesetz, der Breite-Richter der Staffel Breite §5:
    // „Licht (Brechzahl, Dispersion), Bruch (Festigkeit, E-Modul) und Klang lesen dieselbe Stoff-Zeile“): je eingebautem Stoff
    // verstellt die Probe EINE Spalte seiner Zeile (`state.materials`, seit w28 ein Zugriff auf schmiede-core `STOFF_GESETZ`) und
    // misst jeden Leser am Chokepoint des Wirts — licht: Rauheit und Metall des gebauten Stoffs, die Brennweite der Linse
    // (`_brennpunkte`), der Fresnel je Kanal des Wassers und des Eises; bruch: die Platte, die eine Säule trägt
    // (`_failsUnderLoad`, schlank und gedrungen); klang: der Ton des Treffers (`_trefferPaar` im OfflineAudioContext) und der
    // Schritt. Ein geltender Leser, der keiner Spalte folgt, trägt eine eigene Zahl (der Täter beim Namen); die Mutante im
    // selben Lauf (`_stoff` liefert die Zeilen von vor der Mutation) macht jeden Leser ROT. An main 4e2df19b ROT: 42/81 Leser
    // auf der Zeile, 39 Täter (jede Bruchlast und jeder Ton lasen Tag-Achsen, die Brennweite 1,5 r, der Spiegel das f0 des
    // Terrain-Gesetzes), 0 Stoffe mit allen drei Bereichen; am Zweig w28-stoff-gesetz 82/82 und 17 Stoffe.
    {
        kriterium: "breite.stoffe",
        breite: true,
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-gegenstand-stoff.cjs", "--gesetz"],
        env: { GEGENSTAND_STOFF_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const G = jsonZeile(lauf.stdout, /^GESETZ \{/);
            if (!G || !Array.isArray(G.taeter) || !Array.isArray(G.vorbei) || !G.je) return { gruen: false, zahl: "keine GESETZ-Zeile (Exit " + lauf.exit + ")" };
            // jeder feste Stoff trägt alle drei Bereiche (Flüssigkeit und lebendes Gewebe tragen keine Säule): 17 der 21 Zeilen
            const gruen = lauf.exit === 0 && /✅ GESETZ GRÜN/.test(lauf.stdout) && !G.taeter.length && !G.vorbei.length && G.dreifach >= 17;
            return {
                gruen,
                zahl:
                    G.leser + " Leser auf der Zeile · " + G.dreifach + "/" + Object.keys(G.je).length + " Stoffe mit Licht, Bruch und Klang" +
                    (G.taeter.length ? " · eigene Zahl: " + G.taeter.slice(0, 6).join(", ") + (G.taeter.length > 6 ? " … (" + G.taeter.length + ")" : "") : "") +
                    (G.vorbei.length ? " · an der Zeile vorbei: " + G.vorbei.join(", ") : " · Mutante ROT an jedem Leser"),
            };
        },
        proben: [
            { name: "der Kopf w28-stoff-gesetz", gruen: true, stdout: 'GESETZ {"je":{"stein":"bruch+klang+licht","wasser":"klang+licht"},"dreifach":17,"leser":"82/82","taeter":[],"vorbei":[]}\n✅ GESETZ GRÜN — 82/82 Leser auf der Zeile, 17 Stoffe mit Licht, Bruch und Klang\n' },
            { name: "main 4e2df19b: Bruchlast und Ton lesen Tag-Achsen", gruen: false, stdout: 'GESETZ {"je":{"stein":"klang+licht"},"dreifach":0,"leser":"42/81","taeter":["stein.bruchlast","stein.ton","quarz.brennweite","wasser.spiegel"],"vorbei":[]}\n❌ GESETZ ROT — Leser mit eigener Zahl: stein.bruchlast\n' },
            { name: "die Mutante: ein Leser folgt trotz alter Zeile", gruen: false, stdout: 'GESETZ {"je":{"stein":"bruch+klang+licht"},"dreifach":17,"leser":"82/82","taeter":[],"vorbei":["eisen.bruchlast"]}\n❌ GESETZ ROT — an der Zeile vorbei: eisen.bruchlast\n' },
            { name: "ein Stoff verliert einen Bereich (16 von 17)", gruen: false, stdout: 'GESETZ {"je":{"stein":"klang+licht"},"dreifach":16,"leser":"81/81","taeter":[],"vorbei":[]}\n✅ GESETZ GRÜN — 81/81\n' },
        ],
        pfad: [
            "schmiede-core.js",
            "klang-core.js",
            "vehicle-core.js",
            "stamm/bau-*.js",
            "stamm/klang.js",
            "stamm/kampf.js",
            "stamm/koerper-fahrt.js",
            "stamm/wasser-*.js",
            "stamm/bild-sicht.js",
            "stamm/gelaende-fern.js",
            "stamm/stoff-material.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "scripts/diag-gegenstand-stoff.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "BREITE stoffe = Licht (Brechzahl, Dispersion), Bruch (Festigkeit, E-Modul) und Klang lesen dieselbe Stoff-Zeile",
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
    // auf `_brandUhr + schrittS` stellte, an ~0,1 % der Uhren: derselbe Herd trug 0 bis 95 Aschen). Am main 9c545df2 ROT in sechs
    // Farm-Läufen: w12-brand-bild fiel in z232 am Konflikt (scripts/diag-stand-takt.cjs:2277) und kam nie auf main — Halt 0 (der Schritt
    // hing 3 600 Takte an der Uhr), Kante, Flammen, Deckung undefined. Am Zweig w12-brand-halt (Null-Renderer, Radeon-Laptop, drei Läufe
    // byte-gleich bis auf die ms): der Herd wartet ab der Welt-Uhr 600 s auf seinen Wind (bis dahin las der Strahl den Wind zur Boot-Uhr:
    // an der festen Uhr 1 800 / 2 400 / 3 600 / 7 200 s kein Herd), die Bild-Uhr der Leser läuft ab der Welt-Uhr — GRÜN: Halt 99 Zellen,
    // 3× nass, 10× Fels (Mutante 7 nasse), Regen 7 s (Mutante 300), Flammen 22 bis 2,93 m, Deckung 0,91 (Mutante 0,161), Kante 0,263 ·
    // 1,543 m (Mutante 0,944 · 0), Asche voll 0,809 → Gras 0, je Bild p95 0,2–0,3 ms, Schirm 0,3–0,8 ms bei 2 000 Zellen. GPU: an der Station.
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
    // Am Zweig w12-brand-halt (Null-Renderer, Radeon-Laptop, drei Läufe byte-gleich): voll 0,809, Halme 477 → 70 (auf voller Asche 0) →
    // 491, Kräuter 23 → 3 → 3 → 21, Sämling 0 → 0,06 → 0,18 → 0,7 → 1, Gestalt [5, 1 461] gegen [9, 2 933], Wald 71: Brand 71, jung 71, heil 71.
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
    // physik.K3 Staffel 2 — DER EINSTURZ NACH LASTPFAD (w15-einsturz), die Welt-Probe `einsturz` + `einsturz-reload` (Null-Renderer,
    // die Mess-Wiese; oben bei einsturzProbe): ein Werk mit fehlenden Pfosten bricht — was der Lastpfad nicht trägt, wird je Teil
    // ein freier Körper des EINEN Lösers (`_werkBricht` → `_freiSchritt`), der Rest steht; die Trümmer ruhen, bleiben 10 min und
    // kehren über den Reload mit Lage und Drehung wieder; 100 wache Körper kosten ≤ 1 ms je Takt (das Vorzeichen headless, die Zeit
    // an der GTX-CPU misst der Koordinator). Die Zeit fällt an der Wanduhr: die Station fährt allein. Gefahren 06.11. in der Cloud:
    // am main 8efb6318 / db431cf0 ROT (das Werk fällt als Ganzes, kein Trümmer, kein Reload; 100 Körper Trümmerfeld 4,8 ms, Haufen
    // 8,8 ms), am Zweig w15-einsturz f9f3d0db GRÜN (3 Mutationen, Ruhe 2,2 s, 10 min 0 m, Reload 8/8 Lage 0 m Drehung 0° — ohne sie
    // ≥ 24°; Trümmerfeld 0,7 ms, Haufen 4 hoch 1,2 ms gemeldet, schlafend 0 ms).
    {
        kriterium: "physik.K3",
        staffel: 2,
        geraet: "headless",
        befehl: EINSTURZ,
        gpu: false,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => einsturzUrteil(weltZeile(j, lauf, "einsturz"), weltZeile(j, lauf, "einsturz-reload")),
        proben: [
            { name: "die Messung am Zweig w15-einsturz", stdout: einsturzRoh("zweig"), gruen: true },
            { name: "die Messung am main db431cf0 (das Werk fällt als Ganzes, kein Trümmer)", stdout: einsturzRoh("main"), gruen: false },
            {
                name: "MUTANTE der Bruch aus: das Werk fällt als Ganzes, kein Teil wird ein freier Körper",
                stdout: einsturzRoh("zweig", (e, rl) => [(e.mutationen.forEach((m) => ((m.koerper = []), (m.restTeile = [...m.stehend, ...m.fallend].sort()))), e), rl]),
                gruen: false,
            },
            { name: "MUTANTE die Drehung reist nicht (der Stand trägt Lage und Gier)", stdout: einsturzRoh("zweig", (e, rl) => [e, ((rl.drehGrad = rl.ohneDrehungGrad), rl)]), gruen: false },
            { name: "MUTANTE die Trümmer ruhen nicht", stdout: einsturzRoh("zweig", (e, rl) => [(e.mutationen[0].koerper[0].schlaf = false, (e.ruheS = null), e), rl]), gruen: false },
            { name: "MUTANTE ein Trümmer fällt durch den Sockel", stdout: einsturzRoh("zweig", (e, rl) => [((e.mutationen[0].koerper[0].untenM = -0.2), e), rl]), gruen: false },
            { name: "MUTANTE die Kosten von main (100 wache Körper 4,8 ms)", stdout: einsturzRoh("zweig", (e, rl) => [((e.kosten.feld = EINSTURZ_ROH.main.einsturz.kosten.feld), e), rl]), gruen: false },
            { name: "MUTANTE der Reload vakuös (jeder Trümmer stünde auch ohne Drehung richtig)", stdout: einsturzRoh("zweig", (e, rl) => [e, ((rl.ohneDrehungGrad = 0), rl)]), gruen: false },
        ],
        pfad: [
            "stamm/koerper-*.js",
            "stamm/bau-*.js",
            "stamm/siedlung-satz.js",
            "stamm/speicher-*.js",
            "stamm/werkstatt-bauen.js",
            "stamm/gelaende-*.js",
            "stamm/kreatur-leben.js",
            ...WELT_PFAD,
        ],
        quelle: "2 = auch Einsturz nach Lastpfad, Trümmer ≥ 10 min und über den Reload, 100 freie Körper ≤ 1 ms CPU an der GTX-CPU",
    },

    // ───────── DIE WELT-PROBE (p3-stationen-g12): physik.K4 · physik.K5 · feld.K5 · stoffe.K4 · wetter.K4 — EIN Lauf (Zwillinge),
    // die Seiten-Proben und Urteile oben (weltProbeLauf). Gefahren 01.11. in der Cloud am main 25ac4c0c (headless, Null-Renderer):
    // der Boot 15 s, die Proben 0–20 s — jede ROT beim Namen dessen, was der Welt fehlt.
    // physik.K4 — an main 25ac4c0c ROT: 0 von 22 Gattungen der Schmiede tragen ein Seil (langschwert … sichel), kein Löser am Leib.
    // Am Kopf w5-physik-k4 (03.11.) GRÜN: der Flegel (das Seil-Gesetz im Schmiede-Kern), Schwung 0,476 m, Länge längs 0,328–0,328 m,
    // v² 3,183 → 0,257; die Länge misst seitdem längs des Seils vom Anker des Gesetzes (w5-physik-k4-pm, oben bei seilProbe).
    {
        kriterium: "physik.K4",
        staffel: 1,
        geraet: "headless",
        befehl: WELT_G1,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => seilUrteil(weltZeile(j, lauf, "seil")),
        proben: [
            { name: "die Messung am main 25ac4c0c", stdout: weltRoh("seil", (x) => x), gruen: false },
            { name: "ein Flegel schwingt, die Länge hält, die Energie fällt", stdout: weltRoh("seil", (x) => Object.assign(x, { seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 9, anker: [0.545, 0, 0], schwungM: 0.31, laengeM: [1.18, 1.2], energie: [0.84, 0.12] } } })), gruen: true },
            { name: "die Messung am Kopf w5-physik-k4 (03.11., Cloud, headless: der Flegel, 7 Glieder + Kopf)", stdout: weltRoh("seil", (x) => Object.assign(x, { klingen: 23, seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 16, anker: [0.545, 0, 0], laengeArt: "längs", schwungM: 0.476, laengeM: [0.328, 0.328], energie: [3.183, 0.257] } } })), gruen: true },
            { name: "ein Seil der Welt ohne Gesetz im Buch (kein Anker: ein Zwilling)", stdout: weltRoh("seil", (x) => Object.assign(x, { seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 9, anker: null, schwungM: 0.31, laengeM: [1.18, 1.2], energie: [0.84, 0.12] } } })), gruen: false },
            { name: "die Sehne vom Anker: die Kette hängt beim Halt durch (keine Länge)", stdout: weltRoh("seil", (x) => Object.assign(x, { seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 16, anker: [0.545, 0, 0], laengeArt: "sehne vom Anker", schwungM: 0.487, laengeM: [0.245, 0.32], energie: [3.182, 0.25] } } })), gruen: false },
            { name: "der Hebel Griff → Kopf statt der Seil-Länge (Stiel + Kette atmen)", stdout: weltRoh("seil", (x) => Object.assign(x, { seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 16, anker: [0.545, 0, 0], schwungM: 0.487, laengeM: [0.393, 0.826], energie: [3.184, 0.251] } } })), gruen: false },
            { name: "das Seil starr am Griff (kein Löser)", stdout: weltRoh("seil", (x) => Object.assign(x, { seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 9, anker: [0.545, 0, 0], schwungM: 0.004, laengeM: [1.2, 1.2], energie: [0, 0] } } })), gruen: false },
            { name: "das Seil dehnt sich (ein Sinus ohne Länge)", stdout: weltRoh("seil", (x) => Object.assign(x, { seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 9, anker: [0.545, 0, 0], schwungM: 0.3, laengeM: [1.0, 1.3], energie: [0.8, 0.1] } } })), gruen: false },
            { name: "der Schwung bleibt (ohne Dämpfung)", stdout: weltRoh("seil", (x) => Object.assign(x, { seile: ["klinge_flegel"], je: { klinge_flegel: { teile: 9, anker: [0.545, 0, 0], schwungM: 0.3, laengeM: [1.19, 1.2], energie: [0.8, 0.79] } } })), gruen: false },
        ],
        pfad: ["stamm/koerper-*.js", "stamm/bau-*.js", "stamm/studio-bruecke.js", "schmiede-core.js", "koerper-core.js", "foundry-core.js", ...WELT_PFAD],
        quelle: "1 = ein Leser (das Schmiede-Seil schwingt in der Welt am Leib)",
    },
    // physik.K5 — an main 25ac4c0c ROT: der Leib (89,0 kg) weicht 200 N × 0,2 s quer im Gang um 0,008 m (Knöchel 0,008 m), erholt nach 0,2 s;
    // die Gegen-Richtung 0,008 m, die Masse ×2 0,004 m — die Kapsel trägt keinen Schritt, die Bewegung schluckt den Stoß.
    {
        kriterium: "physik.K5",
        staffel: 1,
        geraet: "headless",
        befehl: WELT_G1,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => stossUrteil(weltZeile(j, lauf, "stoss")),
        proben: [
            { name: "die Messung am main 25ac4c0c", stdout: weltRoh("stoss", (x) => x), gruen: false },
            { name: "Ausfallschritt, Erholung, Richtung und Masse folgen", stdout: weltRoh("stoss", (x) => Object.assign(x, { echt: { masse: 89, ausfallM: 0.24, querM: 0.18, erholtS: 0.9, sturz: false }, gegen: { masse: 89, ausfallM: 0.23, querM: 0.17, erholtS: 0.9, sturz: false }, schwer: { masse: 178, ausfallM: 0.12, querM: 0.09, erholtS: 0.7, sturz: false } })), gruen: true },
            { name: "eine abgespielte Stolper-Animation (die Masse zieht nicht)", stdout: weltRoh("stoss", (x) => Object.assign(x, { echt: { masse: 89, ausfallM: 0.24, querM: 0.18, erholtS: 0.9, sturz: false }, gegen: { masse: 89, ausfallM: 0.23, querM: 0.17, erholtS: 0.9, sturz: false }, schwer: { masse: 178, ausfallM: 0.24, querM: 0.18, erholtS: 0.9, sturz: false } })), gruen: false },
            { name: "er stürzt", stdout: weltRoh("stoss", (x) => Object.assign(x, { echt: { masse: 89, ausfallM: 0.4, querM: 0.5, erholtS: null, sturz: true }, gegen: x.gegen, schwer: x.schwer })), gruen: false },
        ],
        pfad: ["stamm/koerper-*.js", "stamm/kreatur-verhalten.js", "koerper-core.js", "tetrapoda-core.js", ...WELT_PFAD],
        quelle: "1 = ein Stoß von 200 N für 0,2 s beim Gehen führt zu Ausfallschritt und Erholung ≤ 1,5 s ohne Sturz, an einem Gerät",
    },
    // feld.K5 — an main 25ac4c0c ROT: der Akt hebt das Feld der Mitte 0,855 → 1, die gezeichnete Streu dort bleibt 29 (26 Blumen), die
    // Nachbarzelle 30 (24) — die Streu liest das frozen worldFieldAt, nie den Akt.
    {
        kriterium: "feld.K5",
        staffel: 1,
        geraet: "headless",
        befehl: WELT_G1,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => feldUrteil(weltZeile(j, lauf, "feld")),
        proben: [
            { name: "die Messung am main 25ac4c0c", stdout: weltRoh("feld", (x) => x), gruen: false },
            { name: "die Blumen wachsen am Ort, der Nachbar ruht", stdout: weltRoh("feld", (x) => Object.assign(x, { nach: { mitte: { alle: 36, blumen: 33 }, nachbar: { alle: 30, blumen: 24 }, feld: [1, 0.658] } })), gruen: true },
            { name: "ein globaler Tint: der Nachbar wächst mit", stdout: weltRoh("feld", (x) => Object.assign(x, { nach: { mitte: { alle: 36, blumen: 33 }, nachbar: { alle: 37, blumen: 31 }, feld: [1, 0.658] } })), gruen: false },
            { name: "der Akt wirkt nicht aufs Feld (die Probe wäre blind)", stdout: weltRoh("feld", (x) => Object.assign(x, { nach: { mitte: { alle: 36, blumen: 33 }, nachbar: { alle: 30, blumen: 24 }, feld: [0.855, 0.658] } })), gruen: false },
        ],
        pfad: ["stamm/feld-*.js", "stamm/vegetation-*.js", "phyto-core.js", "foundry-core.js", ...WELT_PFAD],
        quelle: "1 = ein Leser sichtbar am Ort an einem Gerät",
    },
    // stoffe.K4 — an main 25ac4c0c ROT: nach 30 Tagen (Tag 30) in 14 Klassen um das Dorf (bodenSatz, bauSatz, streuSatz, formationenSatz,
    // die Bäume) keine Albedo gealtert — größte Δ bauSatz süd 0,001; der Regler `verwitterung` kennt keine Zeit.
    {
        kriterium: "stoffe.K4",
        staffel: 1,
        geraet: "headless",
        befehl: WELT_G1,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => alterUrteil(weltZeile(j, lauf, "alter")),
        proben: [
            { name: "die Messung am main 25ac4c0c", stdout: weltRoh("alter", (x) => x), gruen: false },
            { name: "Moos auf den Nordflächen des Baus", stdout: weltRoh("alter", (x) => ((x.je.bauSatz = { nord: 0.06, sued: 0.01, oben: 0.02, rausch: 0 }), (x.haeuser = 12), x)), gruen: true },
            { name: "Moos am Messpunkt ohne ein Haus im Kreis (die leere Welt vor w12-dorf-probe)", stdout: weltRoh("alter", (x) => ((x.je.bauSatz = { nord: 0.06, sued: 0.01, oben: 0.02, rausch: 0 }), (x.haeuser = 0), x)), gruen: false },
            { name: "ein Regler nach Spielzeit (alles altert gleich)", stdout: weltRoh("alter", (x) => ((x.je.bauSatz = { nord: 0.05, sued: 0.05, oben: 0.05, rausch: 0 }), (x.haeuser = 12), x)), gruen: false },
            { name: "kein Sprung (Tag 0)", stdout: weltRoh("alter", (x) => ((x.je.bauSatz = { nord: 0.06, sued: 0.01, oben: 0.02, rausch: 0 }), (x.haeuser = 12), (x.tag = 0), x)), gruen: false },
        ],
        pfad: ["stamm/stoff-*.js", "stamm/bau-*.js", "stamm/gelaende-*.js", "stamm/siedlung-*.js", "stamm/bild-himmel.js", "fachwerk-core.js", "gelaende-core.js", ...WELT_PFAD],
        quelle: "1 = nach einem Spielzeit-Sprung von 30 Tagen ändert sich ≥ 1 Stoff messbar im Bild, abhängig von Nässe oder Lage",
    },
    // stoffe.K4#2 — die Verwitterung am Stoff (Holz, Rost, Moos) und der Trampelpfad, über den Reload (w5-s2-g1): die Proben
    // `alterspur` und `alterspur-reload` (oben, alterSpurProbe) — EIN Lauf, die Seite dazwischen neu geladen
    {
        kriterium: "stoffe.K4",
        staffel: 2,
        geraet: "headless",
        befehl: ALTER_SPUR,
        gpu: false,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => alterSpurUrteil(weltZeile(j, lauf, "alterspur"), weltZeile(j, lauf, "alterspur-reload")),
        proben: [
            { name: "die Messung am main 5fba36ea", stdout: alterSpurRoh(() => {}), gruen: false },
            { name: "Holz vergraut, Eisen rostet im Regen, die nasse Nordfläche bemoost, der Weg wird Pfad — über den Reload", stdout: alterSpurRoh(alterSpurGruen), gruen: true },
            { name: "ein Regler nach Spielzeit (die trockenen Tage altern wie die nassen)", stdout: alterSpurRoh((a, b) => (alterSpurGruen(a, b), (a.mitte = JSON.parse(JSON.stringify(a.nach))))), gruen: false },
            { name: "Moos auf allen Seiten (die Südfläche grünt mit)", stdout: alterSpurRoh((a, b) => (alterSpurGruen(a, b), (a.nach.albedo.steinOffen.sued = a.nach.albedo.steinOffen.nord.slice()))), gruen: false },
            { name: "Rost als Grau (kein Farbton)", stdout: alterSpurRoh((a, b) => (alterSpurGruen(a, b), [a, b].forEach((x) => Object.keys(x.nach.albedo.eisenOffen).forEach((l) => (x.nach.albedo.eisenOffen[l] = [0.02, 0.02, 0.02, 4]))))), gruen: false },
            { name: "der Pfad wächst über den Reload zu", stdout: alterSpurRoh((a, b) => (alterSpurGruen(a, b), (b.gras.weg = 13))), gruen: false },
            { name: "das Werk kehrt nicht wieder", stdout: alterSpurRoh((a, b) => (alterSpurGruen(a, b), (b.werkDa = false))), gruen: false },
        ],
        pfad: ["stamm/stoff-*.js", "stamm/bau-*.js", "stamm/gelaende-*.js", "stamm/siedlung-*.js", "stamm/vegetation-*.js", "stamm/koerper-*.js", "stamm/speicher-*.js", "stamm/dienst.js", "stamm/bild-himmel.js", "fachwerk-core.js", "gelaende-core.js", "phyto-core.js", ...WELT_PFAD],
        quelle: "2 = Holz-Sättigung −30 %, Eisen im Regen Farbton 20–30° (Rost), Moos auf nassen Nordflächen, ein 100× gegangener Weg wird Pfad (Gras-Dichte −60 %), über den Reload",
    },
    // wetter.K4 — an main 25ac4c0c ROT: der Winter (Tag 40, die Schneegrenze −160 m) deckt die Mess-Wiese ganz (Deckung 1 aus 317 Proben),
    // der Fuß steht 0,01 m ÜBER dem Boden — der Leib steht auf dem Gesetz, die Decke trägt keine Tiefe; im Sommer dort kein Schnee.
    {
        kriterium: "wetter.K4",
        staffel: 1,
        geraet: "headless",
        befehl: WELT_G1,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => schneeUrteil(weltZeile(j, lauf, "schnee")),
        proben: [
            { name: "die Messung am main 25ac4c0c", stdout: weltRoh("schnee", (x) => x), gruen: false },
            { name: "der Fuß sinkt 12 cm in den Schnee", stdout: weltRoh("schnee", (x) => ((x.fuss = { tiefeM: 0.12, schnee: 1 }), x)), gruen: true },
            { name: "der Fuß sinkt auch ohne Schnee (ein Versatz des Leibs)", stdout: weltRoh("schnee", (x) => ((x.fuss = { tiefeM: 0.12, schnee: 1 }), (x.gegen = { tiefeM: 0.12, schnee: 0, versatz: 0 }), x)), gruen: false },
            { name: "ein weißer Multiplikator ohne Tiefe", stdout: weltRoh("schnee", (x) => ((x.deckung = 1), x)), gruen: false },
            { name: "die Decke dünn (Deckung 0,4)", stdout: weltRoh("schnee", (x) => ((x.fuss = { tiefeM: 0.12, schnee: 1 }), (x.deckung = 0.4), x)), gruen: false },
        ],
        pfad: ["stamm/bild-himmel.js", "stamm/gelaende-*.js", "stamm/koerper-*.js", "gelaende-core.js", ...WELT_PFAD],
        quelle: "1 = Schnee-Deckung ≥ 60 % über der Schneegrenze der Saison UND der Fuß sinkt ≥ 5 cm ein, an einer Pose",
    },
];

// ── NICHT FASSBAR (befehl: null): kein Werkzeug im Spiel-Baum misst das Soll dieser Staffel als EIN Befehl am SHA ──
module.exports.fehlt = [
    { kriterium: "gelaende.K3", staffel: 2, befehl: null, grund: "Werkzeug und Gesetz fehlen für die Fließ-Anisotropie: keine Linse misst die Normalen-Anisotropie längs/quer zum Lauf im Ausgabe-Bild, und die Strömung der Welt ist `WASSER_GESETZ.wellen.adv × centerness` (`_waterFlowAt`, stamm/wasser-hydro.js) — kein Gefälle, kein Einzugsgebiet, aus dem sie wüchse (25.10. gelesen an d43cb61c). Die 12 Posen allein (Ego/Third × Mittag/Nacht/Regen über `bild --uhr --wetter` wie Staffel 1) wären eine halbe Station" },
    { kriterium: "stoffe.K1", staffel: 2, befehl: null, grund: "GPU-Station wartet auf die Prüfbühne: 7/7 verlangt je Stoff Albedo → Luma im Ausgabe-Bild (die Karte; headless zählt sie nie), die Fahrt der Karten steht bei Radeon 1 783 s, GTX 1 784 s von 1 800 s (03.11., w5-s2-g1) — 16 s frei, keine Probe dieser Staffel passt. Dazu nicht gebaut: 7/7 verlangt je Stoff auch Albedo → Luma (das Ausgabe-Bild der echten GPU; headless zählt sie nie), T_zünd für Stein, Eisen, Erde und Wasser (sie brennen nicht), T_schmelz für jeden Stoff außer Wasser (kein Leser einer Phase: Esse, Lava) und μ des Wassers (eine Flüssigkeit trägt keinen Gleitenden); am Zweig stoffe-k1-tafel 4–5 von 7 je Stoff" },
    { kriterium: "wetter.K4", staffel: 2, befehl: null, grund: "GPU-Station wartet auf die Prüfbühne: „Ego/Third, beide Geräte“ verlangt das Ausgabe-Bild beider Karten in beiden Sichten, die Fahrt der Karten steht bei Radeon 1 783 s, GTX 1 784 s von 1 800 s (03.11., w5-s2-g1) — 16 s frei, keine Probe dieser Staffel passt. Die Welt dazu (03.11. an 5fba36ea, Staffel 1 ROT): der Fuß steht 0,01 m ÜBER der Decke — keine Tiefe, also keine Spur, die bleiben könnte" },
];
// DIE WELT-PROBE für die Gruppe II (stationen/g2.js: luftwasser.K3, luftwasser.K4): der Lauf, der Grund, der Befehl und der Leser der Zeile
module.exports.weltProbe = { lauf: weltProbeLauf, grund: weltGrund, befehl: weltBefehl, zeile: weltZeile };

// ─────────── DAS MASS DER ZEIT-STATIONEN (das Gesetz der Fremd-Last, punkte.cjs fremdUrteil; stationen/mass.cjs) ───────────
// je Zeit-Station ein Feld NEBEN ihrem Urteil, nie im Abdruck: aus derselben Ausgabe die Zahlen, an denen ihr Urteil fällt, gegen ihr Soll
// der langsamste Graben bis gefüllt (≤ 2 s), je Sicht wie das Urteil
const grabenMs = (m, sicht) => (m && Array.isArray(m.graeben) ? m.graeben : [])
    .filter((x) => x.verb === "graben" && (!sicht || x.sicht === sicht) && x.nassEnde > x.nassVor).map((x) => x.gefuelltMs).filter((v) => v != null);
require("./mass.cjs").massAn(module.exports, {
    "gelaende.K2#1": (j) => {
        const ms = grabenMs((j && j.third) || {});
        return ms.length ? [{ wort: "gefüllt nach ms (der langsamste Graben)", wert: Math.max(...ms), soll: 2000 }] : [];
    },
    "gelaende.K2#2": (j) => {
        if (!j) return [];
        const ms = [...grabenMs(j.third), ...grabenMs(j.ego, "first")];
        return ms.length ? [{ wort: "gefüllt nach ms (der langsamste Graben, Third und Ego)", wert: Math.max(...ms), soll: 2000 }] : [];
    },
    "stoffe.K2#2": (j, lauf) => {
        const B = jsonZeile(lauf.stdout, /^BRAND \{/);
        if (!B || !B.halt || !B.regen || !B.zeit || !B.asche || !B.asche.asche) return [];
        const z = B.zeit;
        return [{ wort: "Brand je Bild p95 ms", wert: z.bildMs, soll: 0.5 }, { wort: "Brand am Schirm ms", wert: z.schirmMs, soll: 1 }, { wort: "der Schritt hinter der Uhr s", wert: z.verzugS, soll: 2 }];
    },
    "physik.K3#2": (j, lauf) => {
        const e = weltZeile(j, lauf, "einsturz");
        if (!e || e.fehler) return [];
        const f = (e.kosten && e.kosten.feld) || {};
        return [{ wort: "100 wache Körper ms je Takt (Median)", wert: f.wachMedianMs, soll: 1 }, { wort: "der Schlaf ms je Takt (Median)", wert: f.ruhendMedianMs, soll: 0.05 }];
    },
});
