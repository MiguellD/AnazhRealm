// Stationen der Gruppe V (src/g5.js) — Welten und Wege. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst: jedes Kriterium mit Punkten > 0 und jede Staffel, die ein Zweig kippen soll — den Zweig nennt der Kommentar-Kopf
// des Eintrags (die Aufzählung hier war bei jedem Stations-Merge ein Konflikt). Was sich nicht als Station fassen lässt, steht in
// `module.exports.fehlt` (befehl null, grund) — außerhalb der Liste, damit `run` der anderen Gruppen nicht an ihr bricht.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");
const PW = require("./proben-welt.cjs"); // die Proben der Welt in der Sitzung (fahrzeug.K5#1, fahrzeug.K2#1)
const { seiteProbe } = require("./seite.cjs");

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
// (DER EIGENE BOOT von siedlung.K5 fiel am 29.10.: auch dort misst die Kälte der EINE Start der Sitzung — `dorfErwachen` unten.)
const K = { K: "{KOORD}" }; // die Mess-Skripte der Berichte liegen im Koordinations-Baum (bericht/…)

// ───────── DIE PROBEN AN DER SEITE (Zweig proben-leib, stationen/seite.cjs): leib.K2 · leib.K4 · halten.K1#2 · halten.K5 · tore.K3 ─────────
// Bis 29.10. bootete jede dieser Stationen ihre Linse mit eigener Welt (Takt 19 an b3f9ae95: 4–10 Soll-Minuten je Lauf); jetzt
// ruft die Probe in der Welt der Sitzung die Seiten-Funktionen der Linse selbst (aus ihrer Datei am SHA, `H.quelle`) und nur
// die Teile, die das Kriterium urteilt. Wo die Messung Takte zählt und kein Pixel des Fensters, misst sie im Fenster 640×360
// (die Karte zeichnet jeden Takt, das Fenster kostet nur GPU-Zeit; die Grundstellung der nächsten Probe stellt 1920×1080).

// leib.K2 #1 + #2 (Zwillinge, EIN Lauf): K8 und K9 von gate:koerper-stand (`rollen`, die Seiten-Funktion der Linse) an Mess-Wiese
// und 25°-Hang — der Fuß auf drei Bahnen je Ort und der Sprung je Sicht und Leib. Der Huf (je Größen-Band ein Reh) und das Rad
// (der GT in Fahrt) urteilt gelaende.K5, nie diese Station: die Probe reicht ihnen keinen Leib (spawnCreatureAt des Bands und
// spawnArchitecture des GT geben null — `rollen` überspringt beide beim Namen). Der Dorf-Zug ruht wie im Haushalt der Wiese
// (`__anazhAutoSettlement` false, die Linse setzte ihn vor dem Boot). Das Urteil liest {AUS} { k8 } wie bisher.
async function leibK2Seite(H) {
    const D = H.quelle("scripts/diag-koerper-stand.cjs", ["K8_UMFANG", "eignerKarte", "gezeichnet", "rollen"]);
    await H.ruf("/fenster", { w: 640, h: 360 });
    await H.frist();
    const o = await H.seite(
        "window.__anazhAutoSettlement = false; window.__eignerKarte = " + D.eignerKarte + "; window.__gezeichnet = " + D.gezeichnet + "; " +
            "await window.__weltStehtNach(() => { try { r._gameLoopTick(performance.now()); } catch (e) {} }); " +
            "const sc = r.spawnCreatureAt, sa = r.spawnArchitecture; " +
            "r.spawnCreatureAt = function (...a) { return a[4] === \"wesen\" && a[5] && a[5].bodySize ? null : sc.apply(this, a); }; " +
            "r.spawnArchitecture = function (t, ...a) { return t === \"fahrzeug_gt\" ? null : sa.call(this, t, ...a); }; " +
            "try { return await (" + D.rollen + ")(" + D.K8_UMFANG + "); } finally { r.spawnCreatureAt = sc; r.spawnArchitecture = sa; }"
    );
    H.schritt("rollen");
    fs.writeFileSync(H.aus, JSON.stringify({ k8: o }, null, 1));
    const m = (t) => (t ? t.p95 + " cm (n " + t.n + ", stecken " + t.stecken + ")" : "—");
    for (const ort of ["wiese", "hang"])
        if (o && o[ort]) console.log("K8 " + ort + " " + o[ort].x + "/" + o[ort].z + " " + o[ort].neig + "° · fuss " + m(o[ort].fuss) + " · falllinie " + m(o[ort].falllinie) + " · stufe " + m(o[ort].stufe));
    if (o && o.sprung) console.log("K9 " + JSON.stringify(o.sprung));
    return 0;
}

// leib.K4 #1 + #2 (Zwillinge, EIN Lauf): K4 von gate:kamera-leib — `leibInstall`, die Anker der Mess-Wiese aus `leibWiese` (die
// Quote der Posen 0: die 40 Posen und der Ritt sind K2, nie diese Station) und `leibGang` mit der Vorgabe GANG der Linse und dem
// Teil gang2 (im Haus, am Steilhang, im Sprint). Die Zeilen und Urteile wie die Linse (`urteilGang`, `pruefer`).
async function leibK4Seite(H) {
    const D = H.quelle("scripts/diag-kamera-laub.cjs", ["ORTE", "LEIB_R", "pct", "quantil", "GANG", "GANG_ARTEN", "urteilGang", "leibInstall", "leibWiese", "leibGang"]);
    const M = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const zusatz = require(path.resolve("scripts/lib/kamera-nah.cjs")).KAMERA_NAH_INSTALL + "\n" + require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL;
    await H.ruf("/fenster", { w: 640, h: 360 });
    await H.frist();
    const x = await H.seite(
        "window.__anazhAutoSettlement = false;\n" + zusatz + "\nwindow.__buehne(); await (" + D.leibInstall + ")(" + JSON.stringify({ R: D.LEIB_R }) + "); " +
            "const w = await (" + D.leibWiese + ")(" + JSON.stringify({ x: M.x, z: M.z, quote: { haus: 0, fels: 0, baum: 0 } }) + "); " +
            "const g = await (" + D.leibGang + ")(" + JSON.stringify(Object.assign({}, D.GANG, { zwei: true })) + "); " +
            "return { anker: w.anker, fehlt: w.fehlt, err: w.err, g };"
    );
    H.schritt("gang");
    const gang = x.g;
    console.log("=== K4 DER GANG DER KAMERA (Third zu Fuß im echten Takt, Kugel " + D.GANG.R + " m): Mess-Wiese " + M.x + "/" + M.z + " · Anker " + JSON.stringify(x.anker) + (x.err ? " · " + String(x.err).split("\n")[0] : ""));
    const n = (a) => JSON.stringify(a.reduce((h, k) => ((h[k] = (h[k] || 0) + 1), h), {}));
    for (const g of (gang && gang.gaenge) || [])
        console.log("  " + g.art.padEnd(5) + " " + g.typ + ": " + g.bilder + " Bilder · heran " + g.heran.d0 + " → " + g.heran.d1 + " m" + (g.drinnen == null ? "" : " · im Haus " + g.drinnen) +
            " · Kugel " + n(g.taeter.flatMap((t) => t.taeter.map((y) => t.phase + ": " + y))) + " · Nah-Pixel " + n(g.nah.flatMap((t) => Object.keys(t.jeKlasse).map((y) => t.phase + ": " + y))) +
            " · Ruck p95 " + (g.ruck.length ? D.quantil(g.ruck, 0.95).toFixed(4) : "—") + " höchstens " + (g.ruck.length ? Math.max(...g.ruck).toFixed(3) : "—") + " m");
    console.log("  der Arm ohne Flügel-Leib: " + (gang && gang.schmuggel) + " Proben mit Bau");
    if (gang && gang.hang) console.log("  Steilhang " + JSON.stringify(gang.hang) + " (Weltbild fehlt " + gang.fehlt + ") · die Kamera im Hang: " + gang.senk + " von 10 Bildern mit Täter");
    const { errs, check } = H.WB.pruefer();
    for (const [stufe, name] of [
        [1, "K4 der Gang in Third: die Kugel der Linse nie in Fels oder Bau, 0 Nah-Pixel von Fels, Gelände, Rinde und Bau, Ruck p95 ≤ 0,02 m, die Linse nennt den Arm ohne Flügel-Leib"],
        [2, "K4 Staffel 2: der Gang auch im Haus, am Steilhang, beim Sprint"],
    ]) {
        const v = D.urteilGang(gang, stufe);
        check(name, v.length === 0, v.length ? "Täter: " + v.join(" · ") : "");
    }
    return errs.length ? 1 : 0;
}

// halten.K5 #1 + #2 (Zwillinge, EIN Lauf): Q13/Q14 von gate:kampf-gefuehl --k5 — K5_VOR (der Takt von Hand: fünf Stürze, zwei
// Tod-Lagen, der Tod durch den Wolf, die Werte je Werk und Nahrung, saveState), der Reload der Seite (die Werkbank lädt neu, der
// Spielstand bleibt: die Grundstellung kommt erst vor der nächsten Probe), der Abdruck danach; Urteil und Zeilen aus der Linse
// (`k5Bericht` mit S17 · S18 · S20). Mutiert: Tod, Inventar, Speichern.
async function haltenK5Seite(H) {
    const KP = require(path.resolve("scripts/lib/kampf-proben.cjs"));
    const D = H.quelle("scripts/diag-kampf-gefuehl.cjs", ["hash", "json", "zeig", "k5Verdict", "q14Verdict", "k5Bericht"]);
    await H.frist();
    await H.seite("await window.__weltStehtNach(); return 1;");
    H.schritt("welt");
    const K = await H.seite("return (" + KP.K5_VOR + ")(" + KP.K5_ABDRUCK + ");");
    H.schritt("k5");
    await new Promise((ok) => setTimeout(ok, 1500)); // der IDB-Put landet (wie die Linse)
    await H.ruf("/reload");
    K.nachReload = await H.seite("return window.__seitenTakt().then(" + KP.K5_ABDRUCK + ");");
    H.schritt("reload");
    let ok = true;
    D.k5Bericht(K, (c, msg) => {
        console.log("  " + (c ? "✅" : "❌") + " " + msg);
        if (!c) ok = false;
    });
    return ok ? 0 : 1;
}

// halten.K1 #2: Q15 von gate:kampf-gefuehl --k1 — je Lauf (vor · masse · schneide) K1_BILD im ewigen Loop der Seite (die Probe
// schaltet ihn ein, `__loop`), das Bild des Treffers als PNG {AUS}-<lauf>.png, K1_LABOR im Labor worlds/schmiede (ein Rahmen der
// Seite, verborgen wie der Hintergrund-Tab der Linse). Das Urteil `k1Verdict` der Linse, S21 wie die Linse.
async function haltenK1Seite(H) {
    const KP = require(path.resolve("scripts/lib/kampf-proben.cjs"));
    const D = H.quelle("scripts/diag-kampf-gefuehl.cjs", ["json", "zeig", "K1_SOLL", "k1Verdict"]);
    await H.frist();
    await H.seite(
        "await window.__weltStehtNach(); const f = document.createElement(\"iframe\"); f.id = \"k1-labor\"; f.style.display = \"none\"; " +
            "const da = new Promise((ok) => (f.onload = ok)); f.src = \"/worlds/schmiede/index.html\"; document.body.appendChild(f); " +
            "await Promise.race([da, sleep(60000).then(() => { throw new Error(\"das Labor worlds/schmiede lädt nicht in 60 s\"); })]); window.__loop(1); return 1;"
    );
    H.schritt("welt und labor");
    const page = await H.cdp().catch((e) => (console.log("@@PUNKTE@@ BILD ohne Seite: " + e.message), null));
    const K = { welt: {}, labor: {} };
    for (const l of ["vor", "masse", "schneide"]) {
        K.welt[l] = await H.seite("return (" + KP.K1_BILD + ")(" + JSON.stringify(l) + ");").catch((e) => ({ abbruch: String(e.message).split("\n")[0] }));
        if (K.welt[l].traf && page) await page.screenshot({ path: H.aus + "-" + l + ".png" });
        K.labor[l] = await H.seite("return document.getElementById(\"k1-labor\").contentWindow.eval(" + JSON.stringify("(" + KP.K1_LABOR + ")(" + JSON.stringify(l) + ")") + ");");
        H.schritt(l);
    }
    await H.seite("window.__loop(); return 1;");
    const { errs, check } = H.WB.pruefer();
    D.zeig("Q15", K);
    const v = D.k1Verdict(K);
    check("Q15 halten.K1 Staffel 2: Masse × Schneide × Tempo im Bild und am Labor-Werk " + v, !v.length);
    const [W, L] = [K.welt, K.labor];
    check(
        "SELBST-TEST (S21): die Breitseite im Bild, ein Bild ohne Frame, ein Labor ohne Mutation",
        !!W.vor.traf &&
            D.k1Verdict({ ...K, welt: { ...W, vor: { ...W.vor, schneideBild: 0.18 } } }).includes("vor-bahn") &&
            D.k1Verdict({ ...K, welt: { ...W, vor: { abbruch: "x" } } }).includes("vor-abbruch: x") &&
            D.k1Verdict({ ...K, labor: { ...L, masse: L.vor } }).includes("masse-labor")
    );
    return errs.length ? 1 : 0;
}

// tore.K3 #1 + #2 (Zwillinge, EIN Lauf): K8 von gate:portal-konformanz — der Spieler trägt, was die Linse ihm gibt (Kiesel,
// Laterne, Brustpanzer, Inventar, Hotbar, die Gestalt des Leibs, das Pferd), holt sein Werk aus der Garage (`werkHolen`) und geht
// durch jedes Tor des Genesis-Rings (`betreten`: W durch die Apertur, sonst E), der Handshake klingt durch die Schleuse aus, der
// Abdruck drüben aus der Hülle, Esc bringt heim (`schleuse` esc), der Abdruck daheim — die Tafel `K8 [[welt, weg, vor, drüben,
// nach, esc], …]` wie die Linse; K1–K7 und die Ratschen der übrigen Welten urteilt gate:portal-konformanz, nie diese Station.
// Die Seite der Sitzung als puppeteer-Page (die Linse liest den Rahmen der Welt und hält Tasten). Mutiert: Pferd, Hand, Inventar.
async function toreK3Seite(H) {
    const D = H.quelle(
        "scripts/diag-portal-konformanz.cjs",
        ["WELTEN", "probefahrt", "stromZeichnet", "MITGEBRACHT", "TEILE", "abdruck", "UEBERSETZT", "betreten", "bereitBis", "werkHolen", "zaehler", "zaehlerAus", "schleuseNr", "schleusenZeit", "hinFrame", "seitenHelfer", "rueckHoerer", "schleuse"],
        { halteBis: H.WB.halteBis, waitFor: H.WB.waitFor, sleep: H.WB.sleep },
        "rahmen: () => hinFrame"
    );
    await H.ruf("/fenster", { w: 1280, h: 720 });
    const page = await H.cdp();
    await page.evaluate(() => window.__weltDa((r) => !!r.state.vibePass?.ready));
    // DIE AUSSTATTUNG des Reisenden wie die Linse (`lauf` von diag-portal-konformanz: Ring, Pferd, Hand, Rüstung, Inventar, Hotbar, Leib)
    await page.evaluate((M) => {
        st.materials[M.material] = { builtIn: false, color: M.farbe, label: M.material, tags: {} };
        st.tools.konformanz_feile = { builtIn: false, label: M.werkzeug, opName: "konformanz_op", opClass: "subtractive" };
        r._genesisPortalRing(r._genesisMitte());
        r.mountArchitecture(r.spawnArchitecture("reittier_holzross", st.playerMesh.position));
        r.equipHeld("kiesel");
        r.equipArmor("ruestung_brustpanzer");
        st.player.equipped.offhand = "laterne_dorf";
        for (const n of ["stein_block", "stein_block", "trank_lebenssaft"]) r.addToInventory(n);
        st.hotbar[2] = "stein_block";
        r._ensureWorkshopState().studioOv[r.constructor.KOERPER_HOST_RECIPE] = { height: 1.12, hairColor: "kupfer" };
    }, D.MITGEBRACHT);
    await page.evaluate(D.seitenHelfer);
    await D.werkHolen(page);
    H.schritt("werk");
    const ids = await page.evaluate(
        (ws) => ws.filter((id) => r.state.architectures.some((e) => /^welt_/.test(e.type) && r.state.blueprints[e.type].portalMeta.world === "worlds/" + id + "/index.html")),
        D.WELTEN.map((w) => w.id)
    );
    const ring = [];
    for (const w of D.WELTEN.filter((x) => ids.includes(x.id))) {
        const vor = await page.evaluate(D.abdruck, true);
        const b = await D.betreten(page, w);
        if (!b || !b.weg) {
            console.log("  " + w.id + ": " + ((b && b.fehler) || "kein Tor"));
            ring.push([w.id, null, vor, {}, {}, false]);
            continue;
        }
        await D.bereitBis(page, w.id);
        let s = await D.schleuse(page, "heimat", w);
        while (s.enterImFenster && s.zaehler.enters <= 3) s = await D.schleuse(page, "heimat", w);
        const fr = D.rahmen();
        const drueben = fr ? await fr.evaluate(D.abdruck, false) : {};
        await D.zaehlerAus(page);
        const esc = fr ? !(await D.schleuse(page, "esc", null)).offen : false;
        if (!esc) await page.evaluate(() => r._portalOverlay && r.exitPortal());
        ring.push([w.id, b.weg, vor, drueben, await page.evaluate(D.abdruck, true), esc]);
        H.schritt(w.id);
    }
    console.log("K8 " + JSON.stringify(ring));
    return ring.length >= 10 ? 0 : 1;
}
// die Proben (Zwillinge tragen DIESELBE Probe: punkte.cjs gruppiere fährt sie einmal)
// DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 52,2 s GRÜN am Deckel 60): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL)
const LEIB_K2 = seiteProbe(33, leibK2Seite, {
    mutiert: true,
    
});
const LEIB_K4 = seiteProbe(33, leibK4Seite, {
    mutiert: true,
    
});
const HALTEN_K5 = seiteProbe(19, haltenK5Seite, { mutiert: true });
const HALTEN_K1 = seiteProbe(10, haltenK1Seite, { mutiert: true });
const TORE_K3 = seiteProbe(10, toreK3Seite, {
    mutiert: true,
    
});

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
        LIES("process.exit(e.mauer > 0 && !e.zug && !e.pending ? 0 : 1)") + " \"$L/stand.json\" 2> /dev/null && break; sleep 1; done",
    "echo '@@PUNKTE@@ STAND'; cat \"$L/stand.json\"; echo",
    "timeout 60 $W eval '" + STADT_KAMERA + "' > \"$L/kamera.json\" 2>&1; echo '@@PUNKTE@@ KAMERA'; cat \"$L/kamera.json\"; echo",
    "K=$(" + LIES("console.log(e.pose ? e.pose.join(\" \") : \"\")") + " \"$L/kamera.json\" 2> /dev/null)",
    "[ -n \"$K\" ] || { echo '@@PUNKTE@@ KEINE KAMERA'; exit 5; }",
];
// DIE STADT IN EINEM LAUF (siedlung.K2#1 und #2, Zwillinge, 29.10.): Teil Z mit dem Zipf-Fit (`diag-settlement --nur-z --zipf`, Node,
// 8 Saaten) läuft NEBEN der Stadt der Sitzung (seine Zeilen danach, Z), der Weg zum Hügel, bis die Mauer steht (STADT_HUEGEL), das
// Bild mittags und in der Dämmerung; {AUS} = { mittag, daemmerung }. Bis dahin fuhr jede Staffel Teil Z und die Stadt für sich,
// der Stand fragte alle 5 s. Die Stadt wächst am Hügel (mutiert).
const SIEDLUNG_SITZUNG = sitzung(33,
    "A=$(cygpath -m '{AUS}')",
    '( node scripts/diag-settlement.cjs --nur-z --zipf; echo "@@PUNKTE@@ EXIT $?" ) > "$L/zipf.out" 2>&1 &',
    ...STADT_HUEGEL,
    "rm -f \"$L/stadt-mittag.abnahme.json\" \"$L/stadt-daemmerung.abnahme.json\"",
    "teil MITTAG $W bild $K --uhr 0.5 --datei \"$L/stadt-mittag.png\" --w 1600 --h 900",
    "teil DAEMMERUNG $W bild $K --uhr 0.25 --datei \"$L/stadt-daemmerung.png\" --w 1600 --h 900",
    "node -e 'const f = require(\"fs\"), l = (n) => { try { return JSON.parse(f.readFileSync(process.argv[2] + \"/stadt-\" + n + \".abnahme.json\", \"utf8\")); } catch (e) { return null; } }; " +
        "f.writeFileSync(process.argv[1], JSON.stringify({ mittag: l(\"mittag\"), daemmerung: l(\"daemmerung\") }))' \"$A\" \"$L\"",
    "wait",
    'echo "@@PUNKTE@@ Z"; cat "$L/zipf.out"'
);
// DER RING VOM HÜGEL (siedlung.K4 Staffel 2, w3w-jahrhunderte): ein Ort von 1320 (der Akt `spawnSettlement` mit Jahr, Same 7) auf
// dem ebensten Land 500–800 m vor dem Genesis-Ort; der Hügel ist der höchste Land-Punkt 140–240 m vor ihm. Am Ort: ein gesetztes
// Haus 6 m vor seinem Rand zum Hügel hin (Werk, `haus_alemannisch`), die Welt-Uhr 1500 s vor — jedes `umstellen` tickt die Welt,
// bis sie steht (der Ort im Wachstum zählt in `_dorfOffen`). Der Code trägt kein einfaches Hochkomma (bash '…').
const K4_ORT =
    "const g = r._genesisMitte(), land = (x, z) => r._landAt(x, z, 0.2), hoch = (x, z) => r.getTerrainHeightAt(x, z); let S = null; " +
    "for (const R of [500, 650, 800]) for (let k = 0; k < 24; k++) { const a = (k / 24) * 2 * Math.PI, x = g.x + Math.cos(a) * R, z = g.z + Math.sin(a) * R; " +
    "const ys = [0, 1, 2, 3, 4, 5, 6, 7].map((j) => [x + Math.cos(j * 0.785) * 80, z + Math.sin(j * 0.785) * 80]); " +
    "if (!land(x, z) || !ys.every(([u, v]) => land(u, v))) continue; const h = ys.map(([u, v]) => hoch(u, v)), hang = Math.max(...h) - Math.min(...h); " +
    "if (!S || hang < S.hang) S = { x, z, hang }; } if (!S) return { fehler: \"kein ebenes Land 500–800 m vor dem Genesis-Ort\" }; " +
    "const huegel = (c) => { let b = null; for (const R of [140, 190, 240]) for (let k = 0; k < 32; k++) { const a = (k / 32) * 2 * Math.PI, x = c.x + Math.cos(a) * R, z = c.z + Math.sin(a) * R, y = hoch(x, z); " +
    "if (Number.isFinite(y) && land(x, z) && (!b || y > b.y)) b = { x, y, z }; } return b; }; " +
    "window.__k4 = { S, huegel, land, hoch, hill: huegel(S) }; r.spawnSettlement({ seed: 7, jahr: 1320, position: { x: S.x, y: 0, z: S.z } }); " +
    "return { S, hill: window.__k4.hill };";
const K4_VOR =
    "const K = window.__k4, Z = r.state.worldMeta.settlementCells; " +
    "const k = Object.keys(Z).find((q) => q.startsWith(\"d:7@\") && Math.hypot(Z[q].x - K.S.x, Z[q].z - K.S.z) < 250); if (!k) return { fehler: \"der Ort von 1320 steht nicht\" }; " +
    "const c = Z[k], S = r._bewohnerSiedlungen.get(k), P = S && S.plan; if (!P) return { fehler: \"der Ort trägt keinen Plan\" }; " +
    "K.haeuser = () => S.plan.slots.map((s) => r._dorfHaus(S.ox + s.x, S.oz + s.z, s.seed >>> 0)).filter(Boolean); " +
    "Object.assign(K, { k, c, E0: K.haeuser(), hill: K.huegel(c) }); const R = 6 + Math.max(...P.slots.map((s) => Math.hypot(s.obb.cx, s.obb.cz) + Math.hypot(s.obb.ex, s.obb.ez))); " +
    "const a0 = Math.atan2(K.hill.z - c.z, K.hill.x - c.x); for (let i = 0; i < 16 && !K.haus; i++) { const a = a0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.39, x = c.x + Math.cos(a) * R, z = c.z + Math.sin(a) * R; " +
    "if (K.land(x, z) && r.spawnArchitecture(\"haus_alemannisch\", { x, y: K.hoch(x, z) + 0.5, z }, { seed: 4711, werk: true })) K.haus = [x, z]; } " +
    "return { k, groesse: P.groesse, jahr: P.jahr + P.spanne, slots: P.slots.length, haeuser: K.E0.length, haus: K.haus || null, hill: K.haus ? K.hill : null };";
const K4_UHR =
    "const K = window.__k4; K.E1 = K.haeuser(); K.j0 = K.c.wachs && K.c.wachs.jahr; r.state.spielZeit += 1500; " +
    "return { kern: !!K.c.kern, jahr: K.j0, haeuser: K.E1.length, uhr: r.state.spielZeit };";
const K4_STAND =
    "const K = window.__k4, c = K.c, E = K.haeuser(), ring = E.filter((e) => !K.E1.includes(e)).map((e) => [e.position.x, e.position.z]); " +
    "const med = (q) => (ring.length ? Math.round(ring.map(([x, z]) => Math.hypot(x - q[0], z - q[1])).sort((a, b) => a - b)[ring.length >> 1]) : null); " +
    "return { jahr: [K.j0, c.wachs && c.wachs.jahr], haeuser: [K.E1.length, E.length], slots: r._bewohnerSiedlungen.get(K.k).plan.slots.length, " +
    "bleiben: +(K.E1.filter((e) => E.includes(e)).length / K.E1.length).toFixed(3), ring: { neu: ring.length, zumHaus: med(K.haus), zumOrt: med([c.x, c.z]) }, offen: r._dorfOffen() };";
const K4_KAMERA =
    "const K = window.__k4, h = K.hill, mx = (K.c.x + K.haus[0]) / 2, mz = (K.c.z + K.haus[1]) / 2, my = K.hoch(mx, mz); " +
    "return { pose: [h.x, h.y + 1.7, h.z, mx, my + 4, mz].map((v) => +v.toFixed(2)), d: Math.round(Math.hypot(h.x - mx, h.z - mz)), hoeher: Math.round((h.y - my) * 10) / 10 };";
const K4_SCHRITT = (name, code, sek) =>
    "timeout " + sek + " $W eval '" + code + "' > \"$L/k4-" + name + ".json\" 2>&1; echo '@@PUNKTE@@ " + name.toUpperCase() + "'; cat \"$L/k4-" + name + ".json\"; echo";
const K4_HUEGEL = (datei) => "HILL=$(" + LIES("console.log(e.hill ? e.hill.x.toFixed(1) + \" \" + e.hill.z.toFixed(1) : \"\")") + " \"$L/k4-" + datei + ".json\" 2> /dev/null)";

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
// IN DER SITZUNG (29.10., ≤ 30 min je Gerät): EIN Lauf in der Welt der Sitzung, kein zweiter Boot (bis dahin 3 Boots × 50 Proben je
// Reihe, 6–15 min je Station); LATENZ_PROBEN je Sicht × Verb, p95 ≤ 50 ms und fehlt 0 wie vorher — die Bildzeit des Laufs steht in
// der Zahl, ein Lauf bei hoher Bildzeit bleibt ROT beim Namen
const LAEUFE = 1;
const LATENZ_PROBEN = 15;
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
// DIE LATENZ DER VERBEN UND DER HIT-STOP IN EINEM LAUF (leib.K1#2 und halten.K2#1, Zwillinge, 29.10.): die Haken des Spiels, die
// Linse über gehen, springen, einsteigen, hieb in Ego und Third, das Lesen der Haken — bis dahin fuhr jede Station ihre drei Boots
// (halten.K2#1 hieb allein, 30 Proben je Reihe); einsteigen und hieb lassen Wagen und Treffer in der Welt (mutiert)
const LATENZ_HALT_SITZUNG = sitzung(33,
    ...latenzLaeufe(
        "boot",
        "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
        "teil HAKEN{N} $W eval '" + HIT_HAKEN + "'",
        "teil LATENZ{N} $W latenz --proben " + LATENZ_PROBEN + ' --sicht ego,third --verb gehen,springen,einsteigen,hieb --json "{AUS}.lauf{N}.json"',
        "teil SPIEL{N} $W eval '" + HIT_LESEN + "'"
    )
);
// DIE FAHRT IN EINEM LAUF (fahrzeug.K3#2, fahrzeug.K4#1, fahrzeug.K4#2, Zwillinge, 29.10.): gate:fahr-leben (T4, T5; eigene Null-Welt auf
// {PORT}+20001) läuft NEBEN der Welt der Sitzung; darin der Ritt (tempo4.js auf dem Weg der Probe, WELT — w4-heil-fahrzeug 30.10.),
// die Grundstellung, der Blick am Steilhang (blick.js, BLICK); die Zeilen der Linse danach (FAHR). Bis dahin fuhr jede der drei
// Stationen die Linse und ihren Boot für sich.
const FAHR_SITZUNG = sitzung(33,
    '( env FAHR_LEBEN_PORT=$LP node scripts/diag-fahr-leben.cjs; echo "@@PUNKTE@@ EXIT $?" ) > "$L/fahr.out" 2>&1 &',
    "boot",
    'teil WELT $W eval "$(cat "$K/bericht/3010-heil-fahrzeug/tempo4.js")"',
    "boot",
    'teil BLICK $W eval "$(cat "$K/bericht/2010-buendel-abab/blick.js")"',
    "wait",
    'echo "@@PUNKTE@@ FAHR"; cat "$L/fahr.out"'
);
// ───────────────────────── DIE PROBEN DER STADT IN DER SITZUNG (29.10., stationen/sitzung-seite.js) ─────────────────────────
// Das Gesetz des Schöpfers: eine Fahrt durch jedes System ≤ 30 min samt Dauerlast — keine dieser Stationen bootet mehr eine Welt.
const { probeBefehl } = require("./sitzung-seite.js");

// ───────── fahrzeug.K3#1 IN DER SITZUNG: Garage UND Welt in der warmen Welt (proben-schnell, 30.10.) ─────────
// DIE GARAGE ist die Labor-Linse des Spiels (scripts/diag-garage-labor.cjs als Bibliothek, `H.linse`) mit dem Mess-Patch MK2110
// (Ruhe und Spitze aus v/vmax, koordination bericht/2110-mk-kopf/garage-mk.diff) als ANKER an der Linse — nie mehr ein Patch im
// Spiel-Baum. Ihr Browser ist der der Sitzung (ein Fenster neben der Welt, die Seite vom save-server der Sitzung). Bis 30.10. startete
// sie ihren eigenen Chrome samt Server (`LINSE_GPU=hardware`, Port {PORT}+20001) nach `git apply` im Spiel-Baum: an der Radeon
// (379e5f56, die Probe allein in ihrer Sitzung) 55,5 s — die Garage 27,6 s, der Ritt 33,4 s, dazu git und die Kommandozeile der
// Werkbank. DIE WELT fährt tempo4.js über die Werkbank bis zum Plateau (`__tempoNur = "vmax"`); Orbit, Drift und die Schüsse misst
// fahrzeug.K3#2 (FAHR_SITZUNG). Beide nebeneinander, ihre Zeilen danach in der Reihe, die das Urteil liest (WELT, dann GARAGE).
const MK_ANKER = [
    [
        '    m.schilderNamen = sf.slice(0, 4).join(", ");\n',
        '    m.schilderNamen = sf.slice(0, 4).join(", ");\n    m.mkRuhe = await page.evaluate(() => ({ fov: cam.fov, arm: cam.position.distanceTo(vehicle.position), v: Math.abs(car.speed) }));\n',
    ],
    [
        '    await page.keyboard.up("KeyW");\n    m.tempo = await page.evaluate(',
        "    m.mkTop = await page.evaluate(() => new Promise((res) => { const vm = fahrGesetzLab().vmax; let best = null, t0 = performance.now(), last = []; const tick = () => { const v = Math.abs(car.speed); const p = { fov: cam.fov, arm: cam.position.distanceTo(vehicle.position), v, vmax: vm }; if (!best || v > best.v) best = p; last.push(v); if (last.length > 60) last.shift(); const stabil = last.length === 60 && Math.max(...last) - Math.min(...last) < 0.05; if (v >= 0.95 * vm || stabil || performance.now() - t0 > 60000) res(Object.assign(best, { nach: +((performance.now() - t0) / 1000).toFixed(1), stabil })); else requestAnimationFrame(tick); }; tick(); }));\n" +
            '    console.log("MK2110 " + JSON.stringify({ ruhe: m.mkRuhe, top: m.mkTop }));\n    await page.keyboard.up("KeyW");\n    m.tempo = await page.evaluate(',
    ],
];
async function probeTempoGarage(H) {
    const { fs, path } = H;
    const { browser } = await H.verbinde();
    const fenster = [];
    let lauf = null;
    const L = H.linse("scripts/diag-garage-labor.cjs", ["laborVerdict"], {
        ersetze: H.seite.MK,
        stumm: {
            hauptLauf: (f) => (lauf = f),
            statikServer: () => ({
                lausche: async () => {},
                zeige: (seite, frist, rest, warte) => seite.goto("http://localhost:" + H.S + "/" + rest, { waitUntil: warte, timeout: frist }),
                close: () => {},
            }),
            // DAS FENSTER DER GARAGE kleiner als das der Welt (1940 × 1200, werkbank --echt): ein Fenster, das sie ganz deckt, lässt
            // Windows die Welt verdeckt nennen — sie zeichnet dann kein Bild (rAF ruht), und der Ritt stand, solange die Garage lief
            starteBrowser: async () => ({
                newPage: async () => {
                    const p = await browser.newPage({ type: "window", windowBounds: { left: 0, top: 0, width: 1300, height: 820 } });
                    fenster.push(p);
                    return p;
                },
                close: async () => {
                    for (const p of fenster.splice(0)) await p.close().catch(() => {});
                },
            }),
            urteilEnde: (rot, roteZeile, grueneZeile) => console.log(rot ? roteZeile : grueneZeile),
        },
    });
    if (!L.laborVerdict || !lauf) throw new Error("die Labor-Linse trägt keinen Lauf (hauptLauf)");
    const tempo = fs.readFileSync(path.join(process.env.K, "bericht", "3010-heil-fahrzeug", "tempo4.js"), "utf8");
    const tw = Date.now();
    const ritt = H.wb("/eval", { code: 'window.__tempoNur = "vmax";\n' + tempo }, Math.max(5, H.rest() - 4) * 1000).catch((e) => ({ fehler: String((e && e.message) || e) }));
    // die Zeilen der Garage gesammelt, solange beide laufen (der Ritt schreibt erst am Ende)
    const log = console.log, puffer = [];
    console.log = (...a) => puffer.push(a.map(String).join(" "));
    console.error = console.log;
    const tg = Date.now();
    const garage = lauf().then(
        () => ({ exit: 0, s: (Date.now() - tg) / 1000 }),
        (e) => (puffer.push("GARAGE ABSTURZ " + String((e && e.stack) || e).split("\n").slice(0, 3).join(" | ")), { exit: 2, s: (Date.now() - tg) / 1000 })
    );
    const welt = await ritt;
    const ms = Date.now() - tw;
    const g = await H.binnen(garage, Math.max(1, H.rest() - 2) * 1000, { exit: 124, s: (Date.now() - tg) / 1000 });
    console.log = log;
    console.error = log;
    log("@@PUNKTE@@ WELT");
    log(JSON.stringify(Object.assign({ ms }, welt), null, 1));
    log("@@PUNKTE@@ EXIT " + (welt && welt.ergebnis && !welt.fehler ? 0 : 1));
    log("@@PUNKTE@@ GARAGE");
    for (const z of puffer) log(z);
    log("@@PUNKTE@@ EXIT " + g.exit);
    log("  (Welt " + (ms / 1000).toFixed(1) + " s · Garage " + g.s.toFixed(1) + " s im Fenster neben ihr)");
    return { welt: !!(welt && welt.ergebnis), garage: g };
}
const TEMPO_GARAGE_PROBE = probeBefehl(probeTempoGarage, 60, { MK: JSON.stringify(MK_ANKER) });

// DAS ERWACHEN DER ZELLE (siedlung.K5, Seite: r = Welt, T = THREE — ein Rumpf an `werkbank eval`): die Messung M36 (Zweig
// koordination bericht/2410-siedlung-k5/m36-stufe.js) ohne ihren Anmarsch. Die Zell-Info der Zelle M.zelle trägt nH = M.nH; der
// Spieler steht M.vor m vor ihrem Rand (`nearM` + `mehrM`), also im Vorlauf-Ring, und der Loop läuft, bis der Vorrat der Zelle da
// ist (Export und Ort-Wahl, `_dorfVorraete`) und die Foundry M.ruhig Bilder in Folge ruht (höchstens M.vorlaufMs) — der Stand eines
// Spielers, der mit 4 m/s durch den Ring kam; dann geht er mit 4 m/s auf den Anker zu, bis sie erwacht (`_autoSettlementSpawnCell`).
// Gezählt wie M36: Erwachen → erstes Haus der Zelle im Sichtkegel in der Stufe seiner Kette für seinen Abstand (in der Mesh-Zone sein
// Mesh, dahinter die Hülle seines Gesetzbuchs im Welt-March), dazu der Bau-Hash. Die Probe endet am ersten Haus (bis 29.10. ging der
// Spieler 450 m an und weiter bis zum ersten Mesh: je nH ein eigener Boot, 6,3 min Radeon b3f9ae95). Eine schon wache Zelle meldet
// `wach` (die Probe holt eine frische Welt).
async function dorfErwachen(M) {
    const st = r.state;
    const A = r.constructor.AUTO_SETTLEMENT;
    const rend = st.renderer;
    delete window.__anazhAutoSettlement; // der Dorf-Zug lebt wie im Spiel (ein Messort davor hielt ihn vielleicht an)
    const info0 = r._autoSettlementCellInfo(M.zelle[0], M.zelle[1]);
    if (!info0) return { fehler: "die Zelle trägt kein Dorf", zelle: M.zelle };
    if ((st.worldMeta.settlementCells || {})[info0.key] || (r._dorfVorraete && r._dorfVorraete.has(info0.key)) || (r._autoSettlementRejected && r._autoSettlementRejected.has(info0.key)))
        return { wach: true, zelle: M.zelle };
    const info = Object.assign({}, info0, { nH: M.nH });
    const orig = r._autoSettlementCellInfo;
    r._autoSettlementCellInfo = function (x, z) {
        return x === M.zelle[0] && z === M.zelle[1] ? info : orig.call(this, x, z);
    };
    const nah = A.nearM + (info.mehrM || 0);
    const start = nah + M.vor;
    const pm = st.playerMesh.position;
    const rx = pm.x - info.x, rz = pm.z - info.z, rl = Math.hypot(rx, rz) || 1;
    const sx = info.x + (rx / rl) * start, sz = info.z + (rz / rl) * start;
    pm.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
    let erwacht = null, erstes = null, gesetzt = null, imRadius = null, bild = 0, hash = null, bereit = null, taktFehler = null;
    const vorher = new Set(st.architectures);
    const spawn = r._autoSettlementSpawnCell;
    r._autoSettlementSpawnCell = function (cx, cz, i) {
        if (cx === M.zelle[0] && cz === M.zelle[1] && !erwacht) erwacht = { t: performance.now(), bild, d: Math.hypot(pm.x - info.x, pm.z - info.z) };
        return spawn.call(this, cx, cz, i);
    };
    const fnv = (s) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        return h.toString(16);
    };
    const vorrat = () => {
        const v = r._dorfVorraete && r._dorfVorraete.get(info.key);
        return !!(v && v.da);
    };
    const ruhig = () => {
        try {
            return !r._weltOffen().foundry;
        } catch (_e) {
            return false;
        }
    };
    const cam = st.camera, frust = new T.Frustum(), mat = new T.Matrix4();
    try {
        await new Promise((ok) => {
            let t0 = null, tGeh = null, still = 0;
            const halt = () => (rend.setAnimationLoop(null), ok());
            rend.setAnimationLoop((t) => {
                try {
                    bild++;
                    t0 ??= t;
                    if (tGeh == null) {
                        still = vorrat() && ruhig() ? still + 1 : 0;
                        if (still >= M.ruhig || t - t0 > M.vorlaufMs) {
                            tGeh = t;
                            bereit = { ms: Math.round(t - t0), bilder: bild, vorrat: vorrat(), ruhig: ruhig() };
                        }
                    }
                    // die gehende Pose wie M36: 4 m/s auf den Anker zu, die Lage absolut je Bild gesetzt
                    const weg = tGeh == null ? 0 : Math.min(start - 30, (4 * (t - tGeh)) / 1000);
                    pm.set(sx - ((sx - info.x) / start) * weg, pm.y, sz - ((sz - info.z) / start) * weg);
                    st.yaw = Math.atan2(info.x - pm.x, info.z - pm.z);
                    st.pitch = 0;
                    r._gameLoopTick(t);
                    if (erwacht && !erstes) {
                        cam.updateMatrixWorld(true);
                        frust.setFromProjectionMatrix(mat.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                        const jetzt = () => ({ ms: +(performance.now() - erwacht.t).toFixed(1), bilder: bild - erwacht.bild });
                        for (const e of st.architectures) {
                            if (vorher.has(e) || !/^haus_/.test(e.type) || Math.hypot(e.position.x - info.x, e.position.z - info.z) > 260) continue;
                            gesetzt ??= jetzt();
                            if (!frust.containsPoint(e.position)) continue;
                            const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                            const nahZone = d <= st.architectureCullingRadius;
                            if (nahZone) imRadius ??= Object.assign(jetzt(), { radius: st.architectureCullingRadius });
                            const h = e._ziegelSlot, L = st.weltMarch && st.weltMarch.listeDaten, fp = h && r._archFoundryPreset(e);
                            const stufe = nahZone
                                ? r._archIsRendered(e) ? "mesh" : null
                                : h && L && L[h.feld * 32 + 3] !== 0 && fp && r._foundryFernForm(fp) === "huelle" ? "huelle" : null;
                            if (!stufe) continue;
                            erstes = Object.assign(jetzt(), {
                                stufe,
                                typ: e.type,
                                same: e.seed,
                                ort: [+e.position.x.toFixed(2), +e.position.z.toFixed(2)],
                                abstand: +d.toFixed(1),
                                auge: [+pm.x.toFixed(1), +pm.y.toFixed(1), +pm.z.toFixed(1)],
                            });
                            hash = fnv([info.seed, info.nH, info.x.toFixed(2), info.z.toFixed(2), e.type, e.seed, erstes.ort].join("|"));
                            break;
                        }
                    }
                    const ohneErwachen = tGeh != null && !erwacht && t - tGeh > 1000 * (M.vor / 4 + 6);
                    if (erstes || ohneErwachen || (erwacht && performance.now() - erwacht.t > M.nachMs)) halt();
                } catch (e) {
                    taktFehler = String((e && e.message) || e);
                    halt();
                }
            });
        });
    } finally {
        r._autoSettlementCellInfo = orig;
        r._autoSettlementSpawnCell = spawn;
        rend.setAnimationLoop(null);
    }
    const zelle = (st.worldMeta.settlementCells || {})[info.key] || null;
    return {
        gesetzt, imRadius, erstes, hash, bereit, taktFehler, nah, start, zelle: M.zelle, nH: M.nH, same: info.seed,
        anker: [+info.x.toFixed(1), +info.z.toFixed(1)], erwacht: erwacht && { bild: erwacht.bild, d: +erwacht.d.toFixed(1) }, bilder: bild, reserviert: zelle,
    };
}
// die Probe: nH 12 in der Welt, wie die Sitzung sie hält (eine schon wache Zelle holt eine frische), nH 300 in einer frischen Welt
// (`punkte.cjs grundstellung`, Spielstand weg, die Seite neu — wie bis 29.10. je nH ein frischer Boot); je nH der Abschnitt
// „@@PUNKTE@@ NH<n>" mit dem JSON-Block, den das Urteil liest
async function probeDorf(H) {
    const j = (H.teil = { je: {} });
    for (const [i, nh] of [12, 300].entries()) {
        let e = null;
        for (let v = 0; v < 2 && H.rest() > 12; v++) {
            if (i > 0 || v > 0) {
                const tg = Date.now();
                H.grundstellung();
                H.zeile("frische Welt (Grundstellung) nach " + ((Date.now() - tg) / 1000).toFixed(1) + " s");
            }
            const M = { zelle: [-4, -6], nH: nh, vor: 8, ruhig: 20, vorlaufMs: 10000, nachMs: 8000 };
            e = await H.evalWelt("return await (" + H.seite.DORF + ")(" + JSON.stringify(M) + ");", Math.max(5, H.rest() - 2) * 1000);
            if (!e || !e.wach) break;
            H.zeile("die Zelle " + M.zelle.join(",") + " ist schon wach — eine frische Welt");
        }
        j.je["nH" + nh] = e;
        console.log("@@PUNKTE@@ NH" + nh);
        console.log(JSON.stringify({ ergebnis: e }, null, 1));
        console.log("@@PUNKTE@@ EXIT 0");
    }
    return j;
}
const DORF_PROBE = probeBefehl(probeDorf, 45, { DORF: dorfErwachen });

// DAS START-DORF VON INNEN (siedlung.K1#2, Seite: r = Welt, T = THREE — ein Rumpf an `werkbank eval`): die Messung von gate:haus-welt
// W10 für die Häuser des Start-Dorfs (scripts/diag-haus-welt.cjs `proben`, Phasen start + haus und `--bild` grund), ohne das
// Drehbuch-Dorf 7/18 am Hang, ohne W9 je Box und ohne die Proben daneben (Wasser, Abbau, Waise, Slot) — sie urteilen bauen.K2 und
// gate:haus-welt. Der Takt der Welt hebt das Start-Dorf am Genesis-Ort (der Dorf-Zug an, bis der Ort steht); je Haus-Slot seines Plans
// v2 (`_ortPlaene` unter `settlementCells.start.ort`) das Haus an seinem Ort — ein Slot ohne Haus ist ROT. Je Haus (1) DER SPIELGANG
// über den Sim-Schritt (W-Taste, `_stepFixedSim`): von der Tür bis Keller und Dachboden, um den Schacht, je Lauf der Spur-Rand, je
// Schritt der Hub; (2) DAS INNEN-BILD aus dem Ausgabe-Pfad (Mittag der Bühne, der Loop ruht): je Box des Körper-Satzes (fachwerk
// `grundVon`) bis zwei freie Blicke, das Auge 1,3 m über der Diele, der dunkelste Median (Luminanz linear) gegen den Boden im Schatten
// derselben Stunde (von DIESEM Haus gegen die Sonne der erste Boden 1 m vor jedem Bau, dessen Strahl zur Sonne einen Werfer trifft,
// das Auge 1,6 m hoch 3 m davor, 13 × 13 px). Bis 29.10. zwei Läufe der Linse in eigenen Browsern (Radeon b3f9ae95 10,72 min).
async function startDorfInnen(o) {
    const THREE = window.THREE || T;
    const s = r.state, A = r.constructor, FC = window.__fachwerkCore, cam = s.camera, pm = s.playerMesh;
    const ende = performance.now() + o.fristMs;
    const aus = { haeuser: [], startDorf: null };
    if (!FC || typeof FC.HAUS !== "function" || typeof FC.grundVon !== "function") return Object.assign(aus, { fehler: "__fachwerkCore fehlt" });
    if (typeof window.__ausgabeAufnahme !== "function") return Object.assign(aus, { fehler: "der Ausgabe-Pfad fehlt in der Seite" });
    const DT = A.FIXED_DT || 1 / 60;
    const FUSS = A.PLAYER_FOOT_OFFSET;
    let t = 5000;
    const rund = (v, k = 100) => Math.round(v * k) / k;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const pumpe = async (n) => {
        for (let k = 0; k < n; k++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (k % 8 === 0) await sleep(10);
        }
    };
    const warteBis = async (bis, n, max, ms) => {
        let ja = false;
        try {
            for (let k = 0, weiter = window.__deckel("start-dorf-innen", max); !(ja = bis()) && weiter() && k++ < 4 * max && performance.now() < ende; )
                await pumpe(n).then(() => ms && sleep(ms));
        } catch (_e) {}
        return ja;
    };
    const welt = (e, lx, lz) => {
        const c = Math.cos(e.rotationY || 0), sn = Math.sin(e.rotationY || 0);
        return { x: e.position.x + lx * c + lz * sn, z: e.position.z - lx * sn + lz * c };
    };
    const stell = (x, y, z) => {
        pm.position.set(x, y, z);
        s._fieldVy = 0;
        if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm.position);
        for (let k = 0; k < 20; k++) r._stepFixedSim((t += DT), DT);
    };
    const gesetz = (e) => {
        const pre = FC.PRESETS && FC.PRESETS[e.type.slice(5)];
        if (!pre) return null;
        const P = FC.hausParams(pre, e.studioOv || null);
        if (!(e.studioOv && e.studioOv.seed != null)) P.seed = e.seed;
        const Hh = FC.HAUS(THREE, FC.mat, P);
        Hh.build({ gelaende: false });
        return Hh;
    };
    // DAS START-DORF
    const g = r._genesisMitte();
    stell(g.x, hh(g.x, g.z) + 2, g.z);
    const takt = window.__anazhAutoSettlement;
    window.__anazhAutoSettlement = true;
    const zelle = () => ((s.worldMeta && s.worldMeta.settlementCells) || {}).start;
    await warteBis(() => !!zelle() && !r._autoSettlementQueue && !r._stlWegePending, 1, 1200);
    window.__anazhAutoSettlement = takt;
    const c = zelle();
    const plan = c && r._ortPlaene && r._ortPlaene.get(c.ort);
    const slots = ((plan && plan.slots) || []).filter((sl) => /^haus_/.test(r._slotBauplan(sl, r._foundry) || ""));
    aus.startDorf = { slots: slots.length, fehlt: [] };
    const SD = [];
    for (const sl of slots) {
        const [x, z] = [c.x + sl.x, c.z + sl.z];
        const e = s.architectures.find((a) => a.tuer && Math.hypot(a.position.x - x, a.position.z - z) < 0.05);
        if (e) SD.push(e);
        else aus.startDorf.fehlt.push(`${sl.kultur}@${Math.round(x)}/${Math.round(z)}`);
    }
    // (1) DER SPIELGANG je Haus (W10 wörtlich: Tür, Keller, jeder Lauf bis zum Dachboden, der Spur-Rand)
    s.keys = s.keys || {};
    for (const e of SD) {
        const h = { typ: e.type, start: true, gierGrad: Math.round((((e.rotationY || 0) * 180) / Math.PI) % 360) };
        aus.haeuser.push(h);
        if (performance.now() > ende) {
            h.fehler = "Frist der Probe";
            continue;
        }
        try {
            stell(e.position.x, e.position.y + 3, e.position.z);
            const l0 = () => e._servedLod === 0 && !!e._hausHuelle && e._hausHuelle.stufe === 0;
            await window.__gebautNach(e, { fertig: l0, bau: () => {}, takt: () => pumpe(10), max: 40 }).catch(() => null);
            const Hh = gesetz(e);
            if (!Hh) {
                h.fehler = "kein Gesetzbuch";
                continue;
            }
            const tu = e.tuer;
            const base = e.position.y - 0.5;
            const dm = Hh.dims || {};
            const fls = (dm.flights || []).filter((f) => f.x1 - f.x0 > 0.3);
            const kf = fls.find((f) => f.atLevel === "keller");
            const auf = fls.filter((f) => f !== kf).sort((a, b) => a.base - b.base || (a.atLevel === "attic") - (b.atLevel === "attic"));
            const gg = (h.gang = { hub: 0, fehlt: [], keller: !!kf, dach: auf.some((f) => f.atLevel === "attic") });
            const eg = dm.levelsY[0];
            const xm = (f) => (f.x0 + f.x1) / 2;
            const oben = (f) => f.zFoot + f.dir * (f.N * f.go + 0.4);
            const seite = (rechts) => (rechts ? dm.stairX1 + 0.6 : dm.stairX0 - 0.6);
            const ziel = (name, lx, lz, soll) => {
                const w = welt(e, lx, lz);
                let kl = 0;
                for (let k = 0, ruhe = 0; ruhe < 10; k++) {
                    s.keys.w = !ruhe && k < 500 && Math.hypot(w.x - pm.position.x, w.z - pm.position.z) > 0.2;
                    if (!s.keys.w) ruhe++;
                    // wie ein Mensch: führt der Weg in eine Wand (≤ 45° neben ihrer Normalen), geht er an ihr entlang, nie hinein
                    let [dx, dz] = [w.x - pm.position.x, w.z - pm.position.z];
                    const dn = dx * s._wandKontaktNx + dz * s._wandKontaktNz;
                    if (s._simZeit - s._wandKontaktAt < A._parkourGesetz().kontaktFrischeSec && dn < -Math.SQRT1_2 * Math.hypot(dx, dz))
                        [dx, dz] = [dx - dn * s._wandKontaktNx, dz - dn * s._wandKontaktNz];
                    s.yaw = Math.atan2(dx, dz);
                    const y0 = pm.position.y;
                    r._stepFixedSim((t += DT), DT);
                    kl += s._parkourKletter > 0;
                    if (pm.position.y - y0 > gg.hub)
                        [gg.hub, gg.wo] = [pm.position.y - y0, `${name}: Fuß ${(y0 - FUSS - base).toFixed(2)} → ${(pm.position.y - FUSS - base).toFixed(2)} m`];
                }
                const rest = Math.hypot(w.x - pm.position.x, w.z - pm.position.z);
                const fuss = pm.position.y - FUSS - base;
                if (rest > 0.4 || Math.abs(fuss - soll) > 0.35 || kl)
                    gg.fehlt.push(`${name} ${rest.toFixed(2)} m neben, Fuß ${fuss.toFixed(2)}/${soll.toFixed(2)}, ${kl} Schritte geklettert`);
                [gg.x, gg.z] = [lx, lz];
            };
            const vor = welt(e, tu.x + tu.w / 2 - 0.3, tu.z - 0.25);
            stell(vor.x, base + 0.75 + FUSS, vor.z);
            ziel("tür", tu.x + tu.w / 2 - 0.3, tu.z + 1.8, NaN);
            if (kf || auf.length) {
                const hin = (name, lx, lz, soll) => {
                    const sr = seite((gg.z > dm.stairZ0 ? gg.x : lx) > (dm.stairX0 + dm.stairX1) / 2);
                    if (gg.z < dm.stairZ0 !== lz < dm.stairZ0) {
                        ziel(name + "-um", sr, gg.z, NaN);
                        ziel(name + "-um", sr, lz, NaN);
                    }
                    ziel(name, lx, lz, soll);
                };
                if (kf) {
                    const kt = kf.zFoot + kf.dir * (kf.N * kf.go + 0.4);
                    hin("keller-kopf", xm(kf), kt, eg);
                    ziel("keller", xm(kf), kf.zFoot - kf.dir * 0.6, kf.base + 0.12);
                    ziel("keller-auf", xm(kf), kt, eg);
                }
                for (const f of auf) {
                    hin(`fuß ${f.atLevel}`, xm(f), f.zFoot - f.dir * 0.6, f.base);
                    ziel(`lauf ${f.atLevel}`, xm(f), oben(f), f.base + f.N * f.rise);
                }
                for (const f of kf ? [kf, ...auf] : auf)
                    for (const v of [-0.12, 0.12]) {
                        const a = welt(e, xm(f) + v, f.zFoot - f.dir * 0.5);
                        stell(a.x, base + f.base + 0.1 + FUSS, a.z);
                        ziel(`rand ${f.atLevel} ${v}`, xm(f) + v, oben(f), f.base + f.N * f.rise);
                    }
            }
        } catch (err) {
            h.fehler = "Gang warf: " + String((err && err.message) || err);
        } finally {
            s.keys.w = false;
        }
    }
    // (2) DAS INNEN-BILD je Haus: die Welt steht, die Bühne (Mittag · Sonne · Sommer), der Loop ruht
    if (performance.now() < ende) await window.__weltStehtNach(() => pumpe(1));
    window.__buehne();
    s.renderer.setAnimationLoop(null);
    const [WB, HB] = [o.WB, o.HB];
    const tick = r._tickNahWiese;
    const schuss = async () => {
        r._tickNahWiese = tick;
        window.__bundlesNeu();
        r._schattenAlleNeu();
        return (await window.__ausgabeAufnahme(WB, HB, 1, { satz: "messung" })).u8;
    };
    const lin = Array.from({ length: 256 }, (_, i) => (i <= 10 ? i / 3294.6 : ((i / 255 + 0.055) / 1.055) ** 2.4));
    const luma = (u8, px = WB >> 1, py = HB >> 1, rad = WB) => {
        const l = [];
        for (let y = Math.max(0, py - rad); y < Math.min(HB, py + rad + 1); y++)
            for (let x = Math.max(0, px - rad), k; x < Math.min(WB, px + rad + 1); x++)
                l.push(0.2126 * lin[u8[(k = 4 * (y * WB + x))]] + 0.7152 * lin[u8[k + 1]] + 0.0722 * lin[u8[k + 2]]);
        return l.sort((a, b) => a - b)[l.length >> 1];
    };
    for (const [n, e] of SD.entries()) {
        const h = aus.haeuser[n];
        if (performance.now() > ende) {
            h.bildFehlt = "Frist der Probe";
            continue;
        }
        try {
            const Hg = gesetz(e);
            if (!Hg) continue;
            const gd = FC.grundVon({ H: Hg });
            const sc = (e.scale > 0 ? e.scale : 1) * (e._hausHuelleSkala > 0 ? e._hausHuelleSkala : 1);
            const base = e.position.y - 0.5;
            const boxen = gd.boxen.map(([x0, x1, z0, z1, traegt], j) => ({ art: gd.arten[j], x0, x1, z0, z1, traegt }));
            const solids = Hg.solids || [];
            const diele = (lx, lz) => {
                let d = -Infinity;
                for (const so of solids)
                    if (so.min[0] <= lx && lx <= so.max[0] && so.min[2] <= lz && lz <= so.max[2] && so.max[1] < 1.2) d = Math.max(d, so.max[1]);
                return d;
            };
            const frei = (lx, ly, lz, m) => !solids.some((so) => [lx, ly, lz].every((q, k) => so.min[k] - m < q && q < so.max[k] + m));
            const ecken = boxen.flatMap((m) => [welt(e, m.x0 * sc, m.z0 * sc), welt(e, m.x1 * sc, m.z1 * sc), welt(e, m.x0 * sc, m.z1 * sc), welt(e, m.x1 * sc, m.z0 * sc)]);
            const [mx0, mx1] = [Math.min(...ecken.map((p) => p.x)), Math.max(...ecken.map((p) => p.x))];
            const [mz0, mz1] = [Math.min(...ecken.map((p) => p.z)), Math.max(...ecken.map((p) => p.z))];
            const steht = () =>
                e._hausHuelle && e._servedLod === 0 && r._bodenSichtChunks(mx0 - 1, mz0 - 1, mx1 + 1, mz1 + 1) && s.nahWiese && s.nahWiese.offen === 0 && s.nahWiese.kacheln.size > 0;
            stell(e.position.x, e.position.y + 1, e.position.z);
            let ruhig = 0;
            await warteBis(() => (ruhig = steht() ? ruhig + 1 : 0) >= 3, 5, 120);
            h.steht = !!steht();
            for (const m of boxen) {
                let blicke = 0;
                const i = 0.45;
                const E4 = [[m.x0 + i, m.z0 + i], [m.x1 - i, m.z1 - i], [m.x1 - i, m.z0 + i], [m.x0 + i, m.z1 - i]];
                const M0 = [(m.x0 + m.x1) / 2, (m.z0 + m.z1) / 2];
                const paare = [[E4[0], E4[1]], [E4[1], E4[0]], [E4[2], E4[3]], [E4[3], E4[2]], ...E4.map((q) => [M0, q])];
                const dm = Number.isFinite(diele(...M0)) ? diele(...M0) : 0.5;
                for (const [[ax, az], [zx, zz]] of paare) {
                    if (blicke >= 2) break;
                    const da = Number.isFinite(diele(ax, az)) ? diele(ax, az) : dm;
                    const dz = Number.isFinite(diele(zx, zz)) ? diele(zx, zz) : dm;
                    const ay = da + 1.3;
                    if (!frei(ax, ay, az, 0.25)) continue;
                    const strahl = Array.from({ length: 19 }, (_, j) => (j + 1) * 0.05).map((q) => [ax + (zx - ax) * q, ay + (dz - ay) * q, az + (zz - az) * q]);
                    if (!strahl.every((q) => Math.hypot(q[0] - zx, q[1] - dz, q[2] - zz) < 0.3 || frei(...q, 0.02))) continue;
                    blicke++;
                    const [p, q] = [welt(e, ax * sc, az * sc), welt(e, zx * sc, zz * sc)];
                    cam.position.set(p.x, base + ay * sc, p.z);
                    cam.lookAt(q.x, base + dz * sc, q.z);
                    cam.updateMatrixWorld(true);
                    h.innen = Math.min(h.innen ?? 1, luma(await schuss()));
                }
            }
            // der Boden im Schatten zur selben Stunde
            const S = s.directionalLight.position.clone().sub(s.directionalLight.target.position).normalize();
            const d = new THREE.Vector3(-S.x, 0, -S.z).normalize();
            const rc = new THREE.Raycaster();
            rc.layers.set(A.SHADOW_TWIN_LAYER);
            let f = null;
            for (let tt = 1; tt < 40 && !f; tt += 0.25) {
                const q = new THREE.Vector3(e.position.x + d.x * tt, 0, e.position.z + d.z * tt);
                if (/haus|bau/.test(r._imGrundriss(q.x, q.z, 1))) continue;
                q.y = r._bodenSichtAt(q.x, q.z) ?? hh(q.x, q.z);
                rc.set(q.clone().setY(q.y + 0.05), S);
                if (rc.intersectObject(s.scene, true).length) f = q;
            }
            if (f) {
                const p = f.clone().addScaledVector(d, 3);
                cam.position.set(p.x, hh(p.x, p.z) + 1.6, p.z);
                cam.lookAt(f);
                cam.updateMatrixWorld(true);
                const G = await schuss();
                const v = f.clone().project(cam);
                h.aussen = luma(G, Math.round(((v.x + 1) / 2) * WB), Math.round(((1 - v.y) / 2) * HB), 6);
            }
            h.quote = rund(h.innen / h.aussen, 1000);
        } catch (err) {
            h.bildFehlt = "Bild warf: " + String((err && err.message) || err);
        }
    }
    r._tickNahWiese = tick;
    return aus;
}
async function probeStartDorf(H) {
    if (!(await H.evalWelt("return typeof window.__ausgabeAufnahme === 'function';", 30000))) {
        const { AUSGABE_INSTALL } = require(H.path.resolve("scripts/lib/ausgabe-aufnahme.cjs"));
        await H.evalWelt(AUSGABE_INSTALL + "\nreturn true;", 30000);
    }
    const o = { WB: 480, HB: 270, fristMs: Math.max(5, H.rest() - 6) * 1000 };
    const j = (H.teil = await H.evalWelt("return await (" + H.seite.INNEN + ")(" + JSON.stringify(o) + ");", Math.max(5, H.rest() - 1) * 1000));
    for (const h of (j && j.haeuser) || [])
        console.log(
            `  ${h.typ} · Gang Hub ${h.gang ? h.gang.hub.toFixed(2) + " m" + (h.gang.fehlt.length ? " · fehlt " + h.gang.fehlt.join(" · ") : "") : "—"} · ` +
                `innen ${h.innen} ÷ außen ${h.aussen} = ${h.quote}${h.fehler ? " · " + h.fehler : ""}${h.bildFehlt ? " · " + h.bildFehlt : ""}`
        );
    return j;
}
const START_DORF_PROBE = probeBefehl(probeStartDorf, 60, { INNEN: startDorfInnen });

const stationen = [
    // ───────── fahrzeug.K3 — die Kamera atmet das Tempo ─────────
    {
        kriterium: "fahrzeug.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Garage: gate:garage-labor mit dem Mess-Patch bei vmax (bericht/2110-mk-kopf/garage-mk.diff, Zeile MK2110); Welt: der GT
        // auf freier Bahn an der Mess-Wiese, Third, Vollgas (bericht/3010-heil-fahrzeug/tempo4.js über werkbank eval, M27).
        // DIE BAHN IST FREI, WEIL DIE WELT SIE FREI HÄLT (w4-heil-fahrzeug, 30.10.): tempo3.js prüfte nur die Hüllen der Bauten —
        // die Natur, die das Feld erst wirft, wenn der Spieler naht, und ein Baum mit wartender Gestalt (K20) standen nicht in ihr; der
        // Wagen fuhr in sie, und das Tempo am Stoß hieß „top" (Radeon-Sitzung 715754fc 13,26 m/s, FOV +7,6°; Null-Renderer an
        // 98ef98bb und 715754fc gleich: Stoß nach 35,5 m an Felsbogen und Kiefer, 13,77 m/s, FOV +8,06°, Arm +15,6 %). tempo4.js legt
        // den Weg der Probe über die Bahn (die Welt räumt die Natur auf ihm), das Gas endet am Plateau der Sim-Zeit, ein Stoß endet
        // es beim Namen (Ende ≠ ok). Null-Renderer 715754fc: Plateau nach 7,9 Sim-s, 15,18 m/s, FOV +9,47°, Arm +18,4 %.
        // IN DER SITZUNG (29.10.): die Garage (eigenes Labor auf {PORT}+20001) läuft NEBEN dem Ritt in der Welt der Sitzung, ihre Zeilen
        // danach; der Patch fällt vor und nach ihr. Der GT und der Weg der Probe bleiben in der Welt (mutiert). Den GT nimmt die
        // Grundstellung zurück (das Werk im Stand), den Weg nicht: `_stlWegeBuild` schreibt die Wege-Karte, das Speicher-Gesetz trägt sie
        // nicht (`_standRueckspielen`) — nur die Tür nach einem Abbruch lädt sie neu. Die mutierenden Proben danach (die Reihe der
        // Sitzung, darunter der Gang des Profi-Bands an der Wiese) stehen sonst neben dem 40-m-Weg (offen am Merge w4-koord-sitzung)
        // DIE GARAGE IM BROWSER DER SITZUNG, DIE WELT BIS ZUM PLATEAU (proben-schnell 30.10., `probeTempoGarage` oben): kein eigener
        // Chrome mehr neben der Welt, kein Doppel von Orbit, Drift und Schüssen (die misst die 2)
        probe: { ...TEMPO_GARAGE_PROBE, mutiert: true, sek: 33 },
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
            if (!w || !w.top || w.fehler) return { gruen: false, zahl: "Welt: kein Ergebnis von tempo4.js" + (w && w.fehler ? " — " + w.fehler : "") };
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
        // die Zusätze der 2: Drift, Rückkehr (tempo4.js in der Welt, auf dem Weg der Probe), Ruck (gate:fahr-leben T4) und EIN
        // FOV-Schreiber (T5)
        // IN DER SITZUNG (29.10.): EIN Lauf mit fahrzeug.K4#1/#2 (FAHR_SITZUNG, Zwillinge)
        probe: { ...FAHR_SITZUNG,  mutiert: true },
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
            if (!w || !w.drift || !w.rueck || w.fehler) return { gruen: false, zahl: "Welt: kein Ergebnis von tempo4.js" + (w && w.fehler ? " — " + w.fehler : "") };
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
                    " s nach " + w.rueck.orbitGrad + "° Orbit · Ruck p95 " + t4.ruckP95 + " m (" + t4.ruckN + ") · FOV-Schreiber [" + schreiber + "]" +
                    (w.ende === "ok" ? "" : " · Ende " + w.ende),
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
        // IN DER SITZUNG (29.10.): EIN Lauf mit fahrzeug.K3#2 (FAHR_SITZUNG, Zwillinge)
        probe: { ...FAHR_SITZUNG,  mutiert: true },
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
    // IN DER SITZUNG (29.10.): EIN Lauf mit Staffel 2 (SIEDLUNG_SITZUNG, Zwillinge) — das Bild mittags ist das der Staffel 1 ({AUS}.mittag)
    {
        kriterium: "siedlung.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { ...SIEDLUNG_SITZUNG,  mutiert: true },
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
            // das Beweisbild mittags ({AUS}.mittag des gemeinsamen Laufs; ein {AUS} ohne mittag ist das Bild selbst)
            const b1 = j && j.mittag !== undefined ? j.mittag : j;
            const bild = !!b1 && b1.ok === true;
            const gruen = zOk && steht && !k.fehler && k.segs > 0 && k.hoeher > 0 && bild;
            return {
                gruen,
                zahl:
                    "Z1 " + (z ? z[2] + "/8 Saaten" : "keine Zeile") + " · Boot-Seed " + w.seed + ": Stadt " +
                    (w.wahl ? w.wahl.cx + "," + w.wahl.cz + " nH " + w.wahl.nH + " " + w.wahl.d + " m vom Genesis-Ort" : "keine mit Ort") +
                    " · Mauer " + (k.segs != null ? k.segs + " Segmente/" + k.tuerme + " Türme" : k.fehler || "?") + ", Pool " + s.mauer +
                    (s.zug ? ", Zug läuft" : "") + " · Schuss vom " + k.art + " " + k.d + " m vor der Mitte, " + k.hoeher + " m höher · " +
                    (b1 && b1.zeile ? b1.zeile.slice(0, 120) : "ohne Abnahme (Exit " + lauf.exit + ")"),
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
        probe: { ...SIEDLUNG_SITZUNG,  mutiert: true },
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
    // IN DER SITZUNG (29.10., `startDorfInnen`): beide Messungen je Haus des Start-Dorfs in der Welt der Sitzung (der Gang über den
    // Sim-Schritt, das Innen-Bild aus dem Ausgabe-Pfad), EIN Lauf statt zweier Linsen-Browser.
    {
        kriterium: "siedlung.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...START_DORF_PROBE,  sek: 33 },
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j) => {
            if (!j || !j.startDorf || !Array.isArray(j.haeuser))
                return { gruen: false, zahl: "keine Ausgabe des Start-Dorfs (Gang und Innen-Bild)" + (j && j.fehler ? " — " + j.fehler : "") };
            const sd = j.startDorf;
            const gaenge = j.haeuser.filter((h) => !h.fehler && h.gang);
            const ganz = gaenge.filter((h) => !h.gang.fehlt.length && h.gang.hub <= 0.3);
            const innen = j.haeuser.filter((h) => Number.isFinite(h.quote));
            const dunkel = j.haeuser.filter((h) => !(h.quote >= 0.15));
            const q = innen.map((h) => h.quote).sort((x, y) => x - y);
            const gruen = sd.slots >= 1 && !sd.fehlt.length && ganz.length === sd.slots && j.haeuser.length === sd.slots && !dunkel.length;
            return {
                gruen,
                zahl:
                    ganz.length + " von " + sd.slots + " Häusern des Start-Dorfs Tür → Keller → Dachboden ganz, Hub max " +
                    Math.max(0, ...gaenge.map((h) => h.gang.hub)).toFixed(2) + " m" + (sd.fehlt.length ? " (ohne Haus: " + sd.fehlt.join(" ") + ")" : "") +
                    " · Innen-Bild " + (j.haeuser.length - dunkel.length) + " von " + j.haeuser.length + " lesbar (Plan " + sd.slots +
                    "), innen ÷ Außen-Schatten min " + q[0] + " · Median " + q[q.length >> 1] + " (Soll ≥ 0,15)" +
                    (dunkel.length ? " · dunkel: " + dunkel.map((h) => h.typ + " " + h.innen + "/" + h.aussen + (h.bildFehlt ? " (" + h.bildFehlt + ")" : "")).join(" · ") : ""),
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
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
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
    // IN DER SITZUNG (29.10., `dorfErwachen`): die Welt der Sitzung (die Kälte misst der EINE Start der Sitzung), der Spieler im
    // Vorlauf-Ring statt 450 m Anmarsch, das Ende am ersten Haus; nH 300 in einer frischen Welt (Grundstellung).
    ...[1, 2].map((staffel) => ({
        kriterium: "siedlung.K5",
        staffel,
        geraet: ["radeon", "gtx"],
        probe: { ...DORF_PROBE, mutiert: true, sek: 27 },
        gpu: true,
        zeit: true,
        minuten: 1,
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

    // ───────── siedlung.K4 — durch die Jahrhunderte (w3s-jahrhunderte: die Chronik im fachwerk-core; w3w-jahrhunderte: die Zahl der Welt) ─────────
    // gate:settlement Teil J (`--nur-j`, Node): je Saat (8) dieselbe Zelle unter 1320 · 1560 · 1860 · 1935 (die Epochen ohne Zahl
    // — die Chronik ihrer Region, `chronikJahr`); je Paar die Überdeckung je Slot (3 × 3 Punkte des Grundrisses im Grundriss des
    // jüngeren), die kleinste ≥ 0,8 — und die Zelle der Welt MIT ihrer Zahl (nH 24, Legende mittelalter, 4 Saaten: die Zahl
    // zählt die Häuser ihres Schnitts, `gestaltFuer`), geschnitten am Ende jeder Epoche; bis w3w schaltete die Zahl die Chronik
    // ab, jede Welt-Handlung rechnete je Epoche einen eigenen Plan. Die Mutante ohne Erbe (je Epoche ein eigener Plan) bricht
    // beide (< 0,8). J2: moderne ergibt stadt mit Turm, vier Epochen vier Kirchen, jedes Baujahr bis zum Schnitt, kein Turm vor
    // 1905, keine Halle vor 1850, die Kultur aus REGION_HIST ihres Baujahrs, die Kleidung die Tracht der Epoche, die Mauer genau
    // am städtischen Schnitt vor 1750 und durch kein Haus; die Mutante (Turm von 1455, keine Tracht, keine Mauer) fällt beim
    // Namen. Teil WW (`--nur-ww`, Null-Renderer-Welt, kein Bild): der Satz „dorf 7 300 jahr 1560" trägt Same, Zahl und Jahr,
    // „dorf 7 hanse" die Epoche; die Akte mit Jahr 1320 und 1935 stehen in der Welt als dorf in Poncho und als stadt mit Turm in
    // T-Shirt (die Tracht liest der Wirt aus dem Export, `_bewohnerGestalten`). Rot-Grund der Buchung (b3f9ae95): „keine Zeile
    // JAHRESRINGE" — Teil J landete erst mit V18.546.122; an 98ef98bb grün 0,915, aber nur am Weg ohne Zahl, den keine Handlung
    // der Welt geht. Am Zweig w3w: Teil J 0,915, mit Zahl 0,958 (ohne Erbe 0,194 · 0,298), 0 Brüche, Mutante 10; WW1 grün. Der
    // Exit von `--nur-ww` trägt auch die Welt-Proben der Staffel 2 (WW2 Wachstum, WW3 Ring-Kern, WW4 jeder nahe Ort je Takt).
    {
        kriterium: "siedlung.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["bash", "-c", "node scripts/diag-settlement.cjs --nur-j; J=$?; node scripts/diag-settlement.cjs --nur-ww; W=$?; exit $((J > W ? J : W))"],
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = jsonZeile(out, /^JAHRESRINGE /);
            const w = jsonZeile(out, /^WELTWACHSTUM /);
            const [j1, j2, ww1] = [
                /^\s*(✅|❌) J1 JAHRESRINGE/m,
                /^\s*(✅|❌) J2 EPOCHE: (\d+) Brüche, die Mutante (\d+)/m,
                /^\s*(✅|❌) WW1 DAS JAHR/m,
            ].map((re) => re.exec(out));
            const zz = (z && z.zahl) || [];
            const gruen =
                !!z && z.min >= 0.8 && zz[0] >= 0.8 && z.ohneErbe < 0.8 && zz[1] < 0.8 && Array.isArray(z.fehl) && !z.fehl.length &&
                !!j1 && j1[1] === "✅" && !!j2 && j2[1] === "✅" && +j2[3] > 0 && !!ww1 && ww1[1] === "✅" && !!w && !w.bruch && lauf.exit === 0;
            const welt = w && w.alt && w.neu
                ? "1320 " + w.alt.groesse + " " + w.alt.tracht + " · 1935 " + w.neu.groesse + (w.neu.turm ? " mit Turm " : " ohne Turm ") + w.neu.tracht
                : "keine Zeile WELTWACHSTUM" + (w && w.bruch ? " (" + String(w.bruch).slice(0, 160) + ")" : "");
            return {
                gruen,
                zahl: z
                    ? "Überdeckung je Slot " + z.min + ", mit der Zahl der Welt " + zz[0] + " (ohne Erbe " + z.ohneErbe + " · " + zz[1] +
                      "), Rolle/Bauart/Kleidung/Mauer " + (z.fehl || []).length + " Brüche" + (j2 ? ", Mutante " + j2[3] : "") + "; in der Welt " + welt + ", Exit " + lauf.exit
                    : "keine Zeile JAHRESRINGE (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "stamm/siedlung-*.js",
            "stamm/feld-leben.js",
            "stamm/gelaende-kollision.js",
            "scripts/diag-settlement.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = dieselbe Zelle unter 1320/1560/1860/1935: der ältere Kern liegt zu ≥ 80 % im jüngeren (Jahresringe), die Epoche moderne ergibt stadt, die Epoche bestimmt Rolle, Bauart und Kleidung im Export",
    },

    // siedlung.K4 Staffel 2 (w3w-jahrhunderte): das Gesetz des Wachstums (gate:settlement Teil W, Node: 6 Orte in 3 h Welt-Uhr bis
    // zur Gegenwart, die Jahresringe je Sprung; wohl 0 und ohne Leute halten, Gewalt bremst, ein Zeitplan fällt — fachwerk
    // `wachstum`: Kraft = Leute × Wohlstand ÷ (1 + Furcht × fluchtJeFurcht) je s, die Akten gesehener Gewalt im Gedächtnis des Orts)
    // und in der warmen Welt der Ring vom Hügel (K4_ORT … K4_KAMERA): der Ort von 1320 steht, ein gesetztes Haus an seinem Rand wird
    // Kern (`_ortKernAkt`), nach 1500 s Welt-Uhr ist er gewachsen (`_ortWachstumTakt` → `_ortWaechst`, der Zug hebt die neuen
    // Häuser), die alten stehen (≥ 0,9), der Median der neuen liegt näher am Haus als am Kern des Orts, und das Beweisbild vom
    // Hügel mittags urteilt grün. Headless am Zweig (Teil WW, Null-Renderer): 1412 → 1724, 12 → 21 Häuser, die alten 0,917;
    // der Ring 26 neue, Median 54 m vom Haus gegen 100 m vom Ort; der Nachbar wächst im selben Takt (WW4). Die Schritte dieser
    // Probe headless am Zweig (Null-Renderer, `umstellen` nachgestellt bis Dorf und Foundry ruhen): Ort 400/693 dorf 12/12, Kern
    // ja, 1412 → 1724, 12 → 19/20 Häuser, die alten 0,917, Ring 8 neu, Median 22 m vom Haus / 59 m vom Ort, Hügel 210 m, 11,9 m
    // höher. Das Bild und die Dauer der Probe an der GPU: ungemessen.
    {
        kriterium: "siedlung.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: {  ...sitzung(90,
            "A=$(cygpath -m '{AUS}')",
            "teil W node scripts/diag-settlement.cjs --nur-w",
            "boot",
            "timeout 60 $W fenster 1600 900 > /dev/null 2>&1",
            K4_SCHRITT("ort", K4_ORT, 120),
            K4_HUEGEL("ort"),
            "[ -n \"$HILL\" ] || { echo '@@PUNKTE@@ KEIN ORT'; exit 4; }",
            "timeout 300 $W umstellen $HILL > /dev/null 2>&1",
            K4_SCHRITT("vor", K4_VOR, 60),
            K4_HUEGEL("vor"),
            "[ -n \"$HILL\" ] || { echo '@@PUNKTE@@ KEIN HAUS AM RAND'; exit 5; }",
            "timeout 300 $W umstellen $HILL > /dev/null 2>&1",
            K4_SCHRITT("uhr", K4_UHR, 60),
            "timeout 300 $W umstellen $HILL > /dev/null 2>&1",
            K4_SCHRITT("stand", K4_STAND, 60),
            K4_SCHRITT("kamera", K4_KAMERA, 60),
            "K=$(" + LIES("console.log(e.pose ? e.pose.join(\" \") : \"\")") + " \"$L/k4-kamera.json\" 2> /dev/null)",
            "[ -n \"$K\" ] || { echo '@@PUNKTE@@ KEINE KAMERA'; exit 6; }",
            "rm -f \"$L/ring.abnahme.json\"",
            "teil BILD $W bild $K --uhr 0.5 --datei \"$L/ring.png\" --w 1600 --h 900",
            "cp \"$L/ring.abnahme.json\" \"$A\" 2> /dev/null; true"
        ), sek: 33 },
        gpu: true,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const teil = (n) => out.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const erg = (n) => ((b) => (b && b.ergebnis) || {})(jsonBlock(teil(n)));
            const [w1, w2] = [/^\s*(✅|❌) W1 WACHSTUM in \d+ s: (.*)$/m, /^\s*(✅|❌) W2 AUS BEWOHNERN/m].map((re) => re.exec(out));
            const [o, v, u, s, k] = ["ORT", "VOR", "UHR", "STAND", "KAMERA"].map(erg);
            const ring = s.ring || {};
            const steht = v.slots > 0 && v.haeuser >= 0.9 * v.slots && v.groesse === "dorf" && !!v.haus;
            const waechst = Array.isArray(s.jahr) && s.jahr[1] > s.jahr[0] && s.haeuser[1] > s.haeuser[0] && s.bleiben >= 0.9 && s.offen === 0;
            const kern = u.kern === true && ring.neu > 0 && ring.zumHaus < ring.zumOrt;
            const bild = !!j && j.ok === true;
            const gruen = !!w1 && w1[1] === "✅" && !!w2 && w2[1] === "✅" && steht && waechst && kern && !k.fehler && k.hoeher > 0 && bild;
            return {
                gruen,
                zahl:
                    "W1 " + (w1 ? w1[1] + " " + w1[2].slice(0, 70) : "keine Zeile") + " · W2 " + (w2 ? w2[1] : "keine Zeile") + " · Ort " +
                    (o.fehler || v.fehler || v.groesse + " " + v.jahr + " " + v.haeuser + "/" + v.slots) + ", Haus " + (v.haus ? "gesetzt" : "fehlt") +
                    ", Kern " + (u.kern ? "ja" : "nein") + " · 1500 s: " +
                    (Array.isArray(s.jahr) ? s.jahr.join(" → ") + ", Häuser " + s.haeuser.join(" → ") + "/" + s.slots + ", die alten " + s.bleiben + (s.offen ? ", offen " + s.offen : "") : "kein Stand") +
                    " · Ring " + ring.neu + " neu, Median " + ring.zumHaus + " m vom Haus / " + ring.zumOrt + " m vom Ort · Schuss vom Hügel " + k.d + " m, " +
                    k.hoeher + " m höher · " + (j && j.zeile ? j.zeile.slice(0, 120) : "ohne Abnahme (Exit " + lauf.exit + ")"),
            };
        },
        pfad: [
            "fachwerk-core.js",
            "tetrapoda-core.js",
            "stamm/siedlung-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/gelaende-boden.js",
            "stamm/dirigent-takt.js",
            "scripts/diag-settlement.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
        ],
        quelle: "2 = der Ort wächst in Spielzeit aus Bewohnern, wohl und lebendig (deterministisch aus Saat + Akten), das Haus des Spielers wird Kern eines Rings, sichtbar vom Hügel (nach v1.0)",
    },

    // ───────── leib.K1 — Taste → Leib im Bild ─────────
    {
        kriterium: "leib.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // werkbank latenz an der Mess-Wiese: CDP-Taste bis zum ersten Ausgabe-Bild mit Leib/Kamera ≥ 1 cm bewegt, je 50 Proben —
        // in LAEUFE eigenen Boots, geurteilt über den schlechtesten (bildraten-fest)
        // IN DER SITZUNG (29.10.): EIN Lauf, LATENZ_PROBEN je Reihe (4 Reihen) — Ziel 30 s
        probe: sitzung(15,
            ...latenzLaeufe(
                "boot",
                "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
                "teil LATENZ{N} $W latenz --proben " + LATENZ_PROBEN + ' --sicht ego,third --verb gehen,wechsel --json "{AUS}.lauf{N}.json"'
            )
        ),
        env: K,
        gpu: true,
        zeit: true,
        minuten: 10,
        urteil: (j) => {
            const { gruen, zahl } = latenzSchlechtester(j, ["ego/gehen", "third/gehen", "ego/wechsel", "third/wechsel"], LATENZ_PROBEN);
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
        // IN DER SITZUNG (29.10.): der Zwilling von halten.K2#1 (LATENZ_HALT_SITZUNG)
        probe: { ...LATENZ_HALT_SITZUNG,  mutiert: true },
        env: K,
        gpu: true,
        zeit: true,
        minuten: 24,
        urteil: (j) => {
            const ids = ["gehen", "springen", "einsteigen", "hieb"].flatMap((v) => ["ego/" + v, "third/" + v]);
            const { gruen, zahl } = latenzSchlechtester(j, ids, LATENZ_PROBEN);
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
        // Seit 29.10. die Probe LEIB_K2 in der Welt der Sitzung (oben, leibK2Seite; vorher der eigene Boot der Linse, 10 Soll-Minuten)
        probe: LEIB_K2,
        gpu: true,
        zeit: false,
        minuten: 1,
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
            "scripts/werkbank.cjs",
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
        // Masse 0,179/2,16 m, Kraft 0,504/3,45 m, Auge 0,315 m, Hüfte 0,326 m. Seit 29.10. dieselbe Probe LEIB_K2 (Zwilling von #1).
        probe: LEIB_K2,
        gpu: true,
        zeit: false,
        minuten: 1,
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
            "scripts/werkbank.cjs",
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
        // gate:kamera-leib (`--teile leib,gang,ninja --bild`); `--teile gang` allein mass nichts (23.10.: „Gang: nicht gemessen“).
        // Seit 29.10. die Probe LEIB_K4 in der Welt der Sitzung (leibK4Seite: die Anker aus leibWiese, der Gang mit gang2 — der
        // Zwilling von #2, EIN Lauf; vorher der eigene Boot, 6 Soll-Minuten)
        probe: LEIB_K4,
        gpu: true,
        zeit: false,
        minuten: 2,
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
            "scripts/werkbank.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-orte.cjs",
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
        // Seit 29.10. dieselbe Probe LEIB_K4 (Zwilling von #1; vorher der eigene Boot, 8 Soll-Minuten).
        probe: LEIB_K4,
        gpu: true,
        zeit: false,
        minuten: 2,
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
            "scripts/werkbank.cjs",
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
        // IN DER SITZUNG (29.10.): der Zwilling von leib.K1#2 (LATENZ_HALT_SITZUNG) — die Reihen hieb in Ego und Third daraus
        probe: { ...LATENZ_HALT_SITZUNG,  mutiert: true },
        env: K,
        gpu: true,
        zeit: true,
        minuten: 14,
        urteil: (j, lauf) => {
            const ids = ["third/hieb", "ego/hieb"];
            const r = latenzSchlechtester(j, ids, LATENZ_PROBEN);
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
        // seit 29.10. die Probe HALTEN_K5 in der Welt der Sitzung (haltenK5Seite; vorher der eigene Boot `--k5`, 4 Soll-Minuten)
        probe: HALTEN_K5,
        gpu: true,
        zeit: false,
        minuten: 1,
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
        pfad: [...KAMPF, "koerper-core.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "scripts/werkbank.cjs"],
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
        probe: HALTEN_K5, // seit 29.10. dieselbe Probe (Zwilling von #1)
        gpu: true,
        zeit: false,
        minuten: 1,
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
        pfad: [...KAMPF, "koerper-core.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "stamm/bau-*.js", "scripts/werkbank.cjs"],
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
        // seit 29.10. die Probe HALTEN_K1 in der Welt der Sitzung (haltenK1Seite; vorher der eigene Boot `--k1`, 6 Soll-Minuten)
        probe: HALTEN_K1,
        gpu: true,
        zeit: false,
        minuten: 1,
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
        pfad: [...KAMPF, "stamm/dirigent-takt.js", "worlds/schmiede/schmiede.js", "worlds/schmiede/index.html", "scripts/werkbank.cjs"],
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
        probe: { befehl: PW.torBefehl(PW.fahrRueck), sek: 15, mutiert: true },
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
        // seit 29.10. die Probe TORE_K3 in der Welt der Sitzung (toreK3Seite: nur K8; vorher der eigene Boot aller Welten, 5 Soll-Minuten)
        probe: TORE_K3, gpu: true, zeit: false, minuten: 2,
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
            "scripts/werkbank.cjs",
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
        probe: TORE_K3, gpu: true, zeit: false, minuten: 2, // seit 29.10. dieselbe Probe (Zwilling von #1)
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
            "scripts/werkbank.cjs",
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
        // IN DER SITZUNG (29.10.): EIN Teleport an die Wiese, die HUD-Maske, 5 Runden echte Eingabe (das Urteil verlangt ≥ 30 HUD- und
        // ≥ 15 Menü-Interaktionen: 4 Runden reichen dem Menü nicht)
        probe: { ...sitzung(90,
            "boot",
            "timeout 60 $W fenster 1920 1080 > /dev/null 2>&1",
            "timeout 600 $W umstellen --ort wiese > /dev/null 2>&1",
            "teil BEDIENUNG $W bedienung --runden 5"
        ),  sek: 13 },
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
    // die Ecken der Dörfer, je ~210 Takte unter 0,8 · vmax). DIE KARTE (w4-proben-heil): bis dahin fuhr `--wegenetz` den
    // Null-Renderer (diag-fahr-leben: nur `--rueckmeldung` zeichnete), kein `[linse-gpu]` stand im Lauf, und die Wand GPU wies jede
    // Fahrt ab (98ef98bb bis 73bdf938 GTX; dort Route 2579 m, gefahren 2577 m, Steckenbleiber 0, Tempo 78,1 % — das Spiel-ROT stand
    // hinter der Wand); in der Sitzung fährt die Probe in der Seite der Welt `--echt` (ihr Zeuge die Karte der Sitzung).
    // IN DER SITZUNG (29.10., proben-welt.cjs `fahrWegenetz`): die Seiten-Probe des Gates (`probeLeben`, `wegenetz`) in der warmen
    // Welt, der Dorf-Zug an wie das Gate vor dem Boot; die Route sind ~12 000 Sim-Schritte in den Bildern der Probe (die Welt kommt
    // je Bild) — die Ausnahme trägt sie. Kennt der Stand die Fahrt nicht, ROT beim Namen in Sekunden. Die Orte erwachen: mutiert.
    {
        kriterium: "fahrzeug.K2", staffel: 1, geraet: ["radeon", "gtx"],
        probe: {
            befehl: PW.torBefehl(PW.fahrWegenetz),
            sek: 10,
            mutiert: true,
            
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

    // ───────── fahrzeug.K2 Staffel 2 — der Verkehr der Stadt (PFLICHT-OFFEN C), dazu Hang, Furt, Ego und Third (w4-sitzung-reif) ─────────
    // DIE BINDUNG (30.10., gelesen an der Karte src/g5.js, Bereich fahrzeug): C — „Wagen mit Bewohnern am Steuer auf den Trassen der
    // Stadt“ — ist die Fahrt, die durchkommt, für die Wagen des Gesetzes: das AAAA von fahrzeug („ein Wagen aus dem Gesetz fährt auf dem
    // Wegenetz …, ohne steckenzubleiben“) und der Name von K2 („das Wegenetz trägt das Rad“). Kein Kriterium der Karte nannte C; die
    // Staffel 2 von K2 nannte Hang, Furt und die Sichten der Fahrt des Spielers — sie wurde um C strenger (R2: strenger, nie weicher).
    // An die 2 OHNE die Erweiterung gebunden, buchte ein grüner Verkehr Hang, Furt und Sichten, die keiner maß. Die Station misst C
    // (proben-welt `fahrVerkehr`, je Stunde 12 s Spielzeit, die Metropole gründet die Probe selbst) und nennt die Teile ohne Probe beim
    // Namen: ROT, bis Hang, Furt und die Sichten eine Probe tragen — C selbst steht je Fahrt in der Zahl (`C GRÜN`/`C ROT`).
    // Die Stadt erwacht, die Uhr springt: mutiert. DER DECKEL geschätzt (ungemessen auf der Karte): headless 2 × 40 s in 122 s samt Boot
    // und Stadt (w3w-verkehr fcfd85d7); hier die Gründung ~20 s und 2 × 12 s Spielzeit zu ~25 ms je Bild — die GPU-Fahrt nennt die Zahl.
    {
        kriterium: "fahrzeug.K2", staffel: 2, geraet: ["radeon", "gtx"],
        probe: {
            befehl: PW.torBefehl(PW.fahrVerkehr, "12"),
            sek: 55,
            mutiert: true,
            ausnahme: "die Metropole von stadt-voll (nH 300) gründet in der Probe, dann je Stunde (10 und 23 Uhr) 12 s Spielzeit im Takt des Spiels",
        },
        gpu: true, zeit: false, minuten: 3,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const m = jsonZeile(t, /^VERKEHR {/);
            const je = [10, 23].map((h) => [h, (new RegExp("^\\s*(✅|❌) VK \\(PFLICHT-OFFEN C\\)[^\\n]*um " + h + " Uhr — (.*)$", "m").exec(t) || [])]);
            const c = !!m && je.every(([, z]) => z[1] === "✅") && lauf.exit === 0;
            const cText = !m ? "keine VERKEHR-Zeile (Exit " + lauf.exit + "): " + (t.trim().split("\n").filter((z) => /keine VERKEHR|PROBE-FEHLER/.test(z))[0] || "die Probe sprach nicht").slice(0, 200)
                : je.map(([h, z]) => h + " Uhr " + (z[1] || "—") + " " + String(z[2] || "keine Zeile").slice(0, 160)).join(" · ");
            // die übrigen Teile der Staffel 2: keine Probe misst sie (fahrWegenetz fährt EINE Sicht, die Route kennt keinen 25°-Hang)
            const ohne = ["25°-Hang", "Furt", "Ego und Third"];
            return {
                gruen: c && ohne.length === 0,
                zahl: "C " + (c ? "GRÜN" : "ROT") + ": der Verkehr der Stadt " + cText + " · ohne Probe: " + ohne.join(", ") + " — die 2 wartet auf sie",
            };
        },
        proben: (() => {
            const vk = (h, ok, w) => "  " + (ok ? "✅" : "❌") + " VK (PFLICHT-OFFEN C) der Verkehr der Stadt um " + h + " Uhr — " + w;
            const zeile = 'VERKEHR {"10":{"wagen":20,"soll":20},"23":{"wagen":20,"soll":20}}';
            return [
                { name: "C grün an beiden Stunden, Hang, Furt und Sichten ohne Probe", stdout: [vk(10, true, "jeder fährt"), vk(23, true, "jeder fährt"), zeile].join("\n"), gruen: false },
                { name: "ein Wagen steckt um 23 Uhr", stdout: [vk(10, true, "jeder fährt"), vk(23, false, "keiner steht die ganze Zeit: min 0 m (Wagen 7)"), zeile].join("\n"), gruen: false },
                { name: "der Stand kennt den Verkehr nicht", stdout: "keine VERKEHR-Zeile: probeLeben kennt den Verkehr der Stadt nicht (gate:fahr-leben --verkehr fehlt am Stand)", gruen: false },
            ];
        })(),
        pfad: ["vehicle-core.js", "fachwerk-core.js", "koerper-core.js", "stamm/koerper-*.js", "stamm/siedlung-*.js", "stamm/dirigent-takt.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "spec/profiband/haushalt.json"],
        quelle: "2 = auch 25°-Hang und Furt, Ego und Third, und der Verkehr der Stadt (PFLICHT-OFFEN C): um 10 und 23 Uhr fährt jeder Wagen des Gesetzes mit seinem Fahrer am Steuer, keiner steckt, keiner berührt Bewohner, Wagen oder Bau, beide Geräte",
    },
];

module.exports = stationen;

// NICHT FASSBAR als Station (befehl null): das Werkzeug fehlt oder die Staffel verlangt, was EIN Lauf auf EINEM Gerät nie misst.
module.exports.fehlt = [
    // DIE FAHRT (29.10., das Gesetz des Schöpfers: eine Fahrt durch jedes System ≤ 30 min je Gerät): auf einer Karte misst jede Station
    // als Probe der EINEN Welt der Sitzung — tore.K5#2 fuhr gate:praegung-welt mit eigenem Boot (A und B je ein Browser, Radeon b3f9ae95
    // 1,69 min, ROT Kontrolle 7 699 ms; GTX 98ef98bb ROT 3,0 min)
    { kriterium: "tore.K5", staffel: 2, befehl: null, grund: "nicht als Probe der Sitzung gebaut: das Kriterium verlangt B als eigenen Browser-Prozess mit frischem Profil (das andere Gerät) neben A, und der Teil (T) samt WELT lebt inline im hauptLauf von scripts/diag-praegung-welt.cjs (686 Z., L S N G R B K T F U in EINEM Lauf mit eigener Welt A) — ohne Seiten-Funktion des Teils (T) im Spiel-Baum misst keine Probe A in der Welt der Sitzung; der eigene Boot je Station ist auf radeon|gtx gefallen (die Fahrt ≤ 30 min). Letzte Messung: Radeon b3f9ae95 ROT (Kontrolle 7 699 ms > 5 s), GTX 98ef98bb ROT" },
    { kriterium: "ultiversum.K4", staffel: 2, befehl: null, grund: "nicht gebaut (w3t-spielergesetz baute Staffel 1): ein Spieler-Gesetzbuch dockt über den Weg von studios.K5 an (ein neuntes Gesetzbuch mit PARAMS_BY_KIND und Bauer, `git diff stamm/` = 0), und der Weg ist selbst ungebaut — die Übergabe kennt eine Positivliste (`stamm/netz-portal.js`, koerper und kreatur), der Wirt kennt Arten beim Namen. Ein Gesetz aus dem Satz („wann immer …“) ist eine Welt-Regel (`_registerWorldRule`), kein Gesetzbuch" },
    // fahrzeug.K2#2 ist seit w4-sitzung-reif eine Station (der Verkehr der Stadt, PFLICHT-OFFEN C); ihre übrigen Teile nennt sie selbst:
    // die feste Route der 1 quert drei Bäche (Furten: zwei Feldwege und eine Gasse von 4,−7), aber keinen 25°-Hang — das Wegenetz legt
    // keinen Weg so steil (die Trassen fallen höchstens um `gefaelle`), ein Hang-Teil braucht eine eigene Strecke am Messort hang
    // (−526/−853, 24,4°); die Seiten-Probe `fahrWegenetz` fährt EINE Sicht, Ego und Third getrennt misst keine.
];
