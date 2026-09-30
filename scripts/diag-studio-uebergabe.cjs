// diag-studio-uebergabe.cjs — STUDIO-ÜBERGABE (Auftrag D): DIE LIVE-BEARBEITUNG REIST IN DIE WELT.
// Der tiefste gemessene Naht-Riss: KEIN Studio trug die Schöpfer-Bearbeitung in die Welt —
// die Welt las nur die GEFRORENEN Kern-Presets (get-book); der Welt-Avatar backte IMMER den
// START_PARAMS-Default (T-Shirt navy · Hose charcoal · Sneaker white), die 5 Tetrapoda-Dials
// reisten nie. Jetzt posten koerperstudio/tetrapoda additiv {type:"uebergabe"} über die
// bestehende W12-Brücke (das settlement/event-Zusatz-Kanal-Muster), der EINE Host-Empfänger
// (_studioUebergabeEmpfang) validiert fail-closed (kind-Positivliste · Kern-Buch-Clamps ·
// Kern-Tabellen-Wahlen · Taille-Cap · must-ignore), und die EINEN Leser-Nähte konsumieren:
// _koerperStudioDials (Avatar-Vorrang-Quelle + Live-Neu-Guss) · _tetrapodaStudioDials
// (künftige Kreatur-Spawns; Guss-Semantik: Bestand bleibt). Diese Linse hält die Naht:
//
//   (S) SELBST-TEST (nicht vakuös): mit GESTRIPPTER Übergabe erkennt der Vergleicher den
//       Default-Zustand (Guss-Fingerabdruck == Default) — d. h. die Linse KANN Gleichheit
//       sehen; zusammen mit (N) ist die Differenz-Messung bewiesen nicht-blind.
//   (N) NAHT: ein uebergabe-Payload (headless direkt an den Host-Empfänger gereicht) ⇒ der
//       Avatar-Neu-Guss trägt MESSBAR andere Gestalt (Geometrie-Fingerabdruck ≠ Default UND
//       Farb-Fingerabdruck: topColor rot [CLOTH_COLORS.red] erscheint, navy-only fällt;
//       der LIVE playerMesh wurde neu gegossen) und ein Kreatur-Spawn der übergebenen
//       Gattung trägt die Dials (size 3.5 ⇒ messbar größere Gestalt als der 2.4-Default).
//   (W) WÄNDE: kaputte Payloads (falsches kind · NaN-only · Riesen-String > Taille ·
//       fremde Felder · erfundene Farb-/Gattungs-Namen) fallen fail-closed OHNE Wurf,
//       der Default bleibt; Zahlen werden auf die Kern-PARAMS-Grenzen geclampt.
//   (R) ROUNDTRIP: die Übergabe überlebt buildStateSnapshot → Restore
//       (_loadStateRestoreSoulAndAtmosphere), und der Restore läuft durch DENSELBEN
//       Validator (vergifteter Snapshot wird geclampt/gesiebt).
//   (B) BYTE-IDENTITÄT ohne Übergabe: _koerperStudioDials liefert die BUCH-REFERENZ
//       (===, kein Merge-Klon), der Guss-Fingerabdruck ist byte-identisch zum Default,
//       und der Default-Memo-Eintrag des Ofens bleibt UNVERGIFTET (eigener Key je Übergabe).
//
//   node scripts/diag-studio-uebergabe.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.STUDIO_UEBERGABE_PORT || 4453);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    // ── Quell-Proben (Konsum-Tripwires: die Naht lebt in Stamm + Shells) ──
    console.log("=== STUDIO-ÜBERGABE — Quell-Proben (die Naht lebt in Stamm + Shells) ===");
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const shellK = fs.readFileSync(path.join(root, "worlds/koerperstudio/koerperstudio.js"), "utf8");
    const shellT = fs.readFileSync(path.join(root, "worlds/tetrapoda/tetrapoda.js"), "utf8");
    const htmlK = fs.readFileSync(path.join(root, "worlds/koerperstudio/index.html"), "utf8");
    const htmlT = fs.readFileSync(path.join(root, "worlds/tetrapoda/index.html"), "utf8");
    check(
        "Q: der W12-Empfänger nimmt uebergabe an (trust-Wand: nie aus einer sandboxed Welt)",
        /msg\.type === "uebergabe" && po\.trust !== "sandboxed"\) this\._studioUebergabeEmpfang\(msg\);/.test(stamm)
    );
    check(
        "Q: _koerperStudioDials trägt die Übergabe als Vorrang-Quelle (EIN Leser)",
        /_koerperStudioDials\(\) \{[\s\S]{0,1400}studioUebergabe\.koerper[\s\S]{0,900}?\n    \}/.test(stamm)
    );
    check(
        "Q: _tetrapodaStudioDials trägt die Übergabe als Vorrang-Quelle (EIN Leser)",
        /_tetrapodaStudioDials\(recId\) \{[\s\S]{0,1600}studioUebergabe\.kreatur[\s\S]{0,900}?\n    \}/.test(stamm)
    );
    check(
        "Q: Snapshot-Zwilling (buildStateSnapshot trägt studioUebergabe + Restore validiert)",
        /studioUebergabe: \(\(\) => \{/.test(stamm) && /_studioUebergabeValidate\("koerper", su\.koerper\)/.test(stamm)
    );
    check(
        "Q: koerperstudio-Shell postet die Übergabe über die W12-Brücke (kind koerper)",
        /type: "uebergabe", world: "koerperstudio", kind: "koerper"/.test(shellK) && /btnUebergabe/.test(htmlK)
    );
    check(
        "Q: tetrapoda-Shell postet die Übergabe über die W12-Brücke (kind kreatur + gattung)",
        /kind: "kreatur"/.test(shellT) && /gattung: gattung/.test(shellT) && /btnUebergabe/.test(htmlT)
    );

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { warm: {}, s: {}, n: {}, w: {}, r: {}, b: {} };
        const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
        // FNV-1a-Fingerabdruck über die Positions-Arrays (die praegung-welt-Sonde).
        const fnv = (h, f32) => {
            const u8 = new Uint8Array(f32.buffer, f32.byteOffset, f32.byteLength);
            for (let i = 0; i < u8.length; i++) {
                h ^= u8[i];
                h = Math.imul(h, 0x01000193);
            }
            return h;
        };
        const fpGroup = (g) => {
            let h = 0x811c9dc5;
            let n = 0;
            g.traverse((o) => {
                const a = o.geometry && o.geometry.attributes && o.geometry.attributes.position;
                if (!a || !a.array) return;
                n++;
                h = fnv(h, a.array);
            });
            return (h >>> 0).toString(16) + "/" + n;
        };
        // Farb-Sonde: die Pipe trägt Farben als VERTEX-Daten auf geteilten
        // Materialien (Render-Diät) — gelesen wird das color-Attribut (Vertex 0
        // je Mesh; der Mensch-Guss füllt jedes Teil uniform aus m.mat.color).
        const colorsOf = (g) => {
            const set = new Set();
            g.traverse((o) => {
                const c = o.geometry && o.geometry.attributes && o.geometry.attributes.color;
                if (c && c.array && c.array.length >= 3) {
                    set.add([c.array[0], c.array[1], c.array[2]].map((v) => v.toFixed(3)).join(","));
                }
            });
            return set;
        };
        const lin = (hx) => {
            const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
            return [f(((hx >> 16) & 255) / 255), f(((hx >> 8) & 255) / 255), f((hx & 255) / 255)]
                .map((v) => v.toFixed(3))
                .join(",");
        };
        const hoeheVon = (g) => {
            const bb = new THREE.Box3().setFromObject(g);
            return bb.max.y - bb.min.y;
        };

        // ===== WARM-ANKER: Boot → f.ready → Buch (mensch + wolf) → !_prefetching =====
        const dl0 = performance.now() + 150000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._studioUebergabeEmpfang !== "function") &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        const f = r._ensureAssetFoundry();
        while (performance.now() < dl0) {
            if (f && f.ready && f.recipes && f.recipes.mensch && f.recipes.wolf && !f._prefetching) break;
            await sleep(120);
        }
        res.warm.ready = !!(f && f.ready);
        res.warm.mensch = !!(f && f.recipes && f.recipes.mensch);
        res.warm.wolf = !!(f && f.recipes && f.recipes.wolf);
        res.warm.kerne = !!(window.__koerperCore && window.__tetrapodaCore && globalThis.BAKERS_BY_KIND);
        res.warm.player = !!(r.state.playerMesh && r.state.playerMesh.userData);
        if (!res.warm.ready || !res.warm.mensch || !res.warm.wolf || !res.warm.kerne) return res;
        const KC = window.__koerperCore;
        const TC = window.__tetrapodaCore;
        const memo = r.constructor._tierOfenMemo;

        // ===== DEFAULT-WAHRHEITEN (vor jeder Übergabe) =====
        const ueInit = r.state.studioUebergabe;
        res.warm.stateFeld = !!(ueInit && typeof ueInit === "object" && "koerper" in ueInit && "kreatur" in ueInit);
        const gDef = r._buildHumanGroup();
        res.b.fpDefault = gDef ? fpGroup(gDef) : null;
        const colsDef = gDef ? colorsOf(gDef) : new Set();
        res.n.defaultHatRot = colsDef.has(lin(KC.CLOTH_COLORS.red.hex));
        res.n.defaultHatNavy = colsDef.has(lin(KC.CLOTH_COLORS.navy.hex));
        const cDef = r._buildCreatureGroup("wolf");
        res.b.fpKreaturDefault = cDef ? fpGroup(cDef) : null;
        res.b.refIdent = r._koerperStudioDials() === f.recipes.mensch.s; // Referenz, kein Klon
        res.b.tetraRefIdent = r._tetrapodaStudioDials("wolf") === f.recipes.wolf.s;
        const memoKeysDef = memo ? Array.from(memo.keys()) : [];
        const defaultMenschKeys = memoKeysDef.filter((k) => k.indexOf("mensch|") === 0);
        // Der ECHTE Spawn-Pfad (die Welt-Größe = bodySize-Wurf × Übergabe-Faktor):
        // Höhe je Wurf normalisiert (h / _creatureBodySize(netId) — deterministisch
        // aus der netId re-berechenbar), damit der Zufalls-Wurf herausfällt.
        const spawnNorm = () => {
            const alt = s2.maxCreatures;
            s2.maxCreatures = Math.max(alt || 0, s2.creatures.length + 2);
            const c = r.spawnCreatureAt(pm0.x + 30, pm0.y + 1, pm0.z, "happy", "wolf", { precise: true });
            s2.maxCreatures = alt;
            if (!c) return null;
            const roll = r._creatureBodySize(c.userData.netId);
            const norm = hoeheVon(c) / (roll || 1);
            const bodySize = c.userData.bodySize;
            r.removeCreature(c);
            return { norm, roll, bodySize };
        };
        const s2 = r.state;
        const pm0 = (s2.playerMesh && s2.playerMesh.position) || { x: 0, y: 5, z: 0 };
        const spDef = spawnNorm();
        res.b.spawnNormDefault = spDef ? spDef.norm : null;
        res.b.spawnFaktorDefault = spDef ? spDef.bodySize / spDef.roll : null;

        // ===== (N) NAHT: Übergabe → Avatar-Neu-Guss + Kreatur-Dials =====
        const fpLiveVorher = r.state.playerMesh ? fpGroup(r.state.playerMesh) : null;
        let threw = 0;
        try {
            res.n.okKoerper = r._studioUebergabeEmpfang({
                type: "uebergabe",
                kind: "koerper",
                s: { height: 1.15, mass: 0.9, tone: 0.8, age: 0.3, gender: 0.2, hairLen: 1.2, hairVol: 1.1, arms: 0.1 },
                gestalt: {
                    skinTone: "ebenholz",
                    hairStyle: "lang",
                    hairColor: "blond",
                    top: "tshirt",
                    topColor: "red",
                    bottom: "shorts",
                    bottomColor: "sand",
                    shoes: "boot",
                    shoeColor: "black",
                },
            });
        } catch (_e) {
            threw++;
            res.n.okKoerper = false;
        }
        const gUe = r._buildHumanGroup();
        res.n.fpUe = gUe ? fpGroup(gUe) : null;
        const colsUe = gUe ? colorsOf(gUe) : new Set();
        res.n.ueHatRot = colsUe.has(lin(KC.CLOTH_COLORS.red.hex)); // topColor rot ≠ navy
        res.n.ueHatHaut = colsUe.has(lin(KC.SKIN_TONES.ebenholz.hex)); // skinTone reist als Guss-Farbe
        const fpLiveNachher = r.state.playerMesh ? fpGroup(r.state.playerMesh) : null;
        res.n.liveNeuGuss = !!(fpLiveVorher && fpLiveNachher && fpLiveVorher !== fpLiveNachher);
        try {
            res.n.okKreatur = r._studioUebergabeEmpfang({
                type: "uebergabe",
                kind: "kreatur",
                gattung: "wolf",
                s: { size: 3.5, neck: 0.263, leg: 0.22, diet: 1.0, build: 0.42 },
            });
        } catch (_e) {
            threw++;
            res.n.okKreatur = false;
        }
        res.n.dialsLeser = r._tetrapodaStudioDials("wolf") && r._tetrapodaStudioDials("wolf").size === 3.5;
        const cUe = r._buildCreatureGroup("wolf");
        res.n.fpKreaturUe = cUe ? fpGroup(cUe) : null;
        // Die WELT-GRÖSSE am echten Spawn-Chokepoint: die Template-Höhe folgt
        // dem size-Dial durch die EINE Pipe (kein Zweit-Faktor) — gemessen als
        // wurf-normalisierte Box3-Höhe; der bodySize-Wurf selbst bleibt byte-alt.
        const spUe = spawnNorm();
        res.n.spawnNormUe = spUe ? spUe.norm : null;
        res.n.spawnFaktorUe = spUe ? spUe.bodySize / spUe.roll : null;
        // Memo-Key-Disziplin: die Übergabe prägt EIGENE Keys (Dials im JSON), die
        // Default-Keys bleiben unangetastet (kein Gift im Ofen).
        const memoKeysUe = memo ? Array.from(memo.keys()) : [];
        res.n.memoNeuKreatur = memoKeysUe.some((k) => k.indexOf("wolf|") === 0 && k.indexOf('"size":3.5') >= 0);
        res.n.memoDefaultBleibt = defaultMenschKeys.every((k) => memo.has(k));

        // ===== (S) SELBST-TEST: gestrippte Übergabe ⇒ der Default-Zustand ist ERKENNBAR =====
        r.state.studioUebergabe.koerper = null;
        r.state.studioUebergabe.kreatur = {};
        const gStrip = r._buildHumanGroup();
        res.s.fpStripped = gStrip ? fpGroup(gStrip) : null;
        res.s.erkanntGleich = !!(res.s.fpStripped && res.b.fpDefault && res.s.fpStripped === res.b.fpDefault);
        const spStrip = spawnNorm();
        res.s.spawnNormStripped = spStrip ? spStrip.norm : null;
        // (B)-Hälfte: Referenz-Identität kehrt zurück (kein Merge-Klon ohne Übergabe).
        res.b.refIdentNachher = r._koerperStudioDials() === f.recipes.mensch.s;
        res.b.tetraRefIdentNachher = r._tetrapodaStudioDials("wolf") === f.recipes.wolf.s;

        // ===== (W) WÄNDE: kaputte Payloads fallen fail-closed ohne Wurf =====
        const wCalls = [
            ["kindFremd", { type: "uebergabe", kind: "haus", s: { height: 2 } }],
            ["nanOnly", { type: "uebergabe", kind: "koerper", s: { height: "quark", mass: NaN }, gestalt: {} }],
            [
                "riesenString",
                { type: "uebergabe", kind: "koerper", s: { height: 1.0 }, gestalt: { top: "x".repeat(9000) } },
            ],
            ["gattungFremd", { type: "uebergabe", kind: "kreatur", gattung: "drache", s: { size: 3 } }],
            ["keinObjekt", "uebergabe"],
            ["arrayPayload", { type: "uebergabe", kind: "koerper", s: [1, 2, 3] }],
        ];
        res.w.abgelehnt = {};
        for (const [tag, payload] of wCalls) {
            try {
                res.w.abgelehnt[tag] = r._studioUebergabeEmpfang(payload) === false;
            } catch (_e) {
                threw++;
                res.w.abgelehnt[tag] = false;
            }
        }
        res.w.defaultBleibt = r.state.studioUebergabe.koerper === null;
        // Clamp + must-ignore: height 99 → PARAMS-max; fremde Felder + erfundene Farbe fallen still.
        try {
            res.w.okClamp = r._studioUebergabeEmpfang({
                type: "uebergabe",
                kind: "koerper",
                s: { height: 99, zusatz: 5 },
                gestalt: { topColor: "neonpink", evil: "x" },
            });
        } catch (_e) {
            threw++;
            res.w.okClamp = false;
        }
        const rowH = (KC.PARAMS_BY_KIND.koerper || []).find((x) => x && x.id === "height");
        const ueK = r.state.studioUebergabe.koerper;
        res.w.clampMax = !!(ueK && rowH && ueK.s.height === rowH.max);
        res.w.mustIgnore = !!(ueK && !("zusatz" in ueK.s) && !("topColor" in ueK.gestalt) && !("evil" in ueK.gestalt));
        res.w.threw = threw;
        // aufräumen für (R):
        r.state.studioUebergabe.koerper = null;

        // ===== (R) ROUNDTRIP: Snapshot → Restore (durch DENSELBEN Validator) =====
        try {
            r._studioUebergabeEmpfang({
                type: "uebergabe",
                kind: "koerper",
                s: { height: 1.15, mass: 0.9 },
                gestalt: { topColor: "red" },
            });
            r._studioUebergabeEmpfang({
                type: "uebergabe",
                kind: "kreatur",
                gattung: "wolf",
                s: { size: 3.5 },
            });
            const snap = r.buildStateSnapshot();
            res.r.snapKoerper = !!(
                snap.studioUebergabe &&
                snap.studioUebergabe.koerper &&
                snap.studioUebergabe.koerper.s.height === 1.15 &&
                snap.studioUebergabe.koerper.gestalt.topColor === "red"
            );
            res.r.snapKreatur = !!(
                snap.studioUebergabe &&
                snap.studioUebergabe.kreatur.wolf &&
                snap.studioUebergabe.kreatur.wolf.s.size === 3.5
            );
            r.state.studioUebergabe.koerper = null;
            r.state.studioUebergabe.kreatur = {};
            r._loadStateRestoreSoulAndAtmosphere({
                studioUebergabe: JSON.parse(JSON.stringify(snap.studioUebergabe)),
            });
            const ue2 = r.state.studioUebergabe;
            res.r.restoreKoerper = !!(
                ue2.koerper &&
                ue2.koerper.s.height === 1.15 &&
                ue2.koerper.gestalt.topColor === "red"
            );
            res.r.restoreKreatur = !!(ue2.kreatur.wolf && ue2.kreatur.wolf.s.size === 3.5);
            // Vergifteter Snapshot: der Restore clampt + siebt (DERSELBE Validator).
            r.state.studioUebergabe.koerper = null;
            r.state.studioUebergabe.kreatur = {};
            r._loadStateRestoreSoulAndAtmosphere({
                studioUebergabe: {
                    koerper: { s: { height: 99 }, gestalt: { topColor: "neonpink" } },
                    kreatur: { drache: { s: { size: 99 } }, wolf: { s: { size: 99 } } },
                },
            });
            const ue3 = r.state.studioUebergabe;
            const rowS = (TC.PARAMS_BY_KIND.kreatur || []).find((x) => x && x.id === "size");
            res.r.giftClamp = !!(ue3.koerper && rowH && ue3.koerper.s.height === rowH.max);
            res.r.giftSieb = !!(
                ue3.koerper &&
                !("topColor" in ue3.koerper.gestalt) &&
                !ue3.kreatur.drache &&
                ue3.kreatur.wolf &&
                rowS &&
                ue3.kreatur.wolf.s.size === rowS.max
            );
        } catch (e) {
            res.r.err = (e && e.message) || String(e);
        }
        // End-Reinigung: die Welt verlässt die Linse im Default.
        r.state.studioUebergabe.koerper = null;
        r.state.studioUebergabe.kreatur = {};
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error("FATAL:", out.fatal);
        process.exit(2);
    }
    console.log("\n=== WARM-ANKER ===");
    check(
        "Foundry warm (Buch trägt mensch + wolf, Kerne + Bäcker-Tisch geladen, state-Feld deklariert)",
        out.warm.ready && out.warm.mensch && out.warm.wolf && out.warm.kerne && out.warm.stateFeld,
        JSON.stringify(out.warm)
    );

    console.log("\n=== (S) SELBST-TEST — der Default-Zustand ist ERKENNBAR (nicht vakuös) ===");
    check(
        "gestrippte Übergabe ⇒ EXAKT der Default-Guss-Fingerabdruck (Gleichheit ist sichtbar)",
        out.s.erkanntGleich === true,
        `stripped=${out.s.fpStripped} vs default=${out.b.fpDefault}`
    );
    check(
        "gestrippte Kreatur-Übergabe ⇒ Spawn-Größe zurück auf Default (Gleichheit ist sichtbar)",
        Number.isFinite(out.s.spawnNormStripped) &&
            Number.isFinite(out.b.spawnNormDefault) &&
            Math.abs(out.s.spawnNormStripped / out.b.spawnNormDefault - 1) < 1e-6,
        `normStripped=${out.s.spawnNormStripped} normDefault=${out.b.spawnNormDefault}`
    );

    console.log("\n=== (N) NAHT — die Übergabe formt Avatar UND Kreatur messbar ===");
    check("der Empfänger nimmt die koerper-Übergabe an", out.n.okKoerper === true);
    check(
        "Avatar-Neu-Guss trägt andere GEOMETRIE (Dials height/mass/… treffen morphAuf)",
        !!out.n.fpUe && !!out.b.fpDefault && out.n.fpUe !== out.b.fpDefault,
        `ue=${out.n.fpUe} default=${out.b.fpDefault}`
    );
    check(
        "Farb-Fingerabdruck: topColor ROT erscheint (Default trägt navy, nie rot)",
        out.n.defaultHatRot === false && out.n.defaultHatNavy === true && out.n.ueHatRot === true,
        `defaultRot=${out.n.defaultHatRot} defaultNavy=${out.n.defaultHatNavy} ueRot=${out.n.ueHatRot}`
    );
    check("skinTone-Wahl (ebenholz) reist als Guss-Farbe der Haut", out.n.ueHatHaut === true);
    check(
        "der LIVE-Avatar (state.playerMesh) wurde NEU GEGOSSEN (applyPlayerSoul-Chokepoint)",
        out.n.liveNeuGuss === true
    );
    check("der Empfänger nimmt die kreatur-Übergabe an (gattung wolf)", out.n.okKreatur === true);
    check("die EINE Kreatur-Dial-Quelle liefert die Übergabe (size 3.5)", out.n.dialsLeser === true);
    check(
        "der Kreatur-Guss formt anders (Baker-Dials ⇒ Proportions-Fingerabdruck ≠ Default)",
        !!out.n.fpKreaturUe && !!out.b.fpKreaturDefault && out.n.fpKreaturUe !== out.b.fpKreaturDefault,
        `ue=${out.n.fpKreaturUe} default=${out.b.fpKreaturDefault}`
    );
    check(
        "Kreatur-SPAWN trägt die Größe: size 3.5 ⇒ Welt-Gestalt ×(3.5/2.4) durch die EINE Pipe (Box3, wurf-normalisiert; der bodySize-Wurf bleibt byte-alt)",
        Math.abs(out.b.spawnFaktorDefault - 1) < 1e-9 &&
            Math.abs(out.n.spawnFaktorUe - 1) < 1e-9 &&
            Number.isFinite(out.n.spawnNormUe) &&
            Number.isFinite(out.b.spawnNormDefault) &&
            Math.abs(out.n.spawnNormUe / out.b.spawnNormDefault - 3.5 / 2.4) < 0.05,
        `bodySizeFaktor=${out.n.spawnFaktorUe} normUe=${out.n.spawnNormUe} normDefault=${out.b.spawnNormDefault}`
    );
    check(
        "Ofen-Memo-Disziplin: Übergabe prägt EIGENE Keys (Dials im JSON), Default-Keys unangetastet",
        out.n.memoNeuKreatur === true && out.n.memoDefaultBleibt === true
    );

    console.log("\n=== (W) WÄNDE — fail-closed ohne Wurf, Default bleibt ===");
    const ab = out.w.abgelehnt || {};
    check(
        "kaputte Payloads fallen (kind fremd · NaN-only · Riesen-String · Gattung fremd · Nicht-Objekt · Array)",
        ab.kindFremd && ab.nanOnly && ab.riesenString && ab.gattungFremd && ab.keinObjekt && ab.arrayPayload,
        JSON.stringify(ab)
    );
    check("kein Wurf auf dem gesamten Wand-Pfad", out.w.threw === 0, `threw=${out.w.threw}`);
    check("nach den Ablehnungen bleibt der Default (koerper null)", out.w.defaultBleibt === true);
    check("Zahlen-Clamp auf die Kern-PARAMS-Grenze (height 99 → max)", out.w.clampMax === true);
    check(
        "must-ignore: fremde s-/gestalt-Felder + erfundene Farbe fallen still, der Rest reist",
        out.w.okClamp === true && out.w.mustIgnore === true
    );

    console.log("\n=== (R) ROUNDTRIP — Snapshot → Restore durch DENSELBEN Validator ===");
    check(
        "buildStateSnapshot trägt die Übergabe (koerper s+gestalt · kreatur je Gattung)",
        out.r.snapKoerper === true && out.r.snapKreatur === true,
        out.r.err
    );
    check("der Restore bringt sie zurück (Feld-genau)", out.r.restoreKoerper === true && out.r.restoreKreatur === true);
    check(
        "ein VERGIFTETER Snapshot wird am Restore geclampt + gesiebt (Chokepoint-Validator)",
        out.r.giftClamp === true && out.r.giftSieb === true
    );

    console.log("\n=== (B) BYTE-IDENTITÄT ohne Übergabe ===");
    check(
        "_koerperStudioDials liefert die BUCH-REFERENZ (===) vor UND nach der Übergabe-Episode",
        out.b.refIdent === true && out.b.refIdentNachher === true
    );
    check(
        "_tetrapodaStudioDials liefert die BUCH-REFERENZ (===) vor UND nach der Übergabe-Episode",
        out.b.tetraRefIdent === true && out.b.tetraRefIdentNachher === true
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    else console.log("  ✅ keine Seiten-Fehler");

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DIE STUDIO-ÜBERGABE TRÄGT: die Live-Bearbeitung des Schöpfers reist über die W12-Brücke in die Welt (Avatar-Neu-Guss mit Gestalt + Farben, Kreatur-Spawns mit Dials), die Wände stehen fail-closed, der Snapshot trägt sie, und ohne Übergabe ist der Guss-Pfad byte-identisch."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Studio-Übergabe-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
