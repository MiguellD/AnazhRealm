const H = (function sitzungWerkzeug() {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");
    const http = require("http");
    const S = Number(process.argv[1]);
    const W = S + 20000;
    const H = { S, W, AUS: process.argv[2], FRIST_S: Number(process.argv[3]) - 6, t0: Date.now(), fs, path, teil: undefined };
    if (!(H.FRIST_S > 0)) {
        console.log("@@ PROBE-FEHLER der Deckel des Laufs fehlt (argv „" + process.argv[3] + "“: der Läufer ersetzt den Platzhalter SEK)");
        process.exit(2);
    }
    // DIE MARKE der gerissenen Frist (punkte.cjs FRIST_MARKE), EINMAL je Probe: am Deckel der Frist (H.fahre) oder wo die Probe selbst
    // Fälle an ihr auslässt
    H.fristRiss = (was) => {
        if (H.gerissen) return;
        H.gerissen = was;
        console.log("@@PUNKTE@@ FRIST " + H.FRIST_S + " s der Probe gerissen — " + was);
    };
    const abbau = [];
    H.url = "http://localhost:" + S + "/index.html";
    H.sek = () => +((Date.now() - H.t0) / 1000).toFixed(1);
    H.rest = () => H.FRIST_S - (Date.now() - H.t0) / 1000;
    H.schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
    H.zeile = (t) => console.log("@@ " + H.sek() + " s · " + t);
    H.beimAbbau = (f) => abbau.push(f);
    // höchstens ms warten: der Wert oder `ersatz` — ein Wurf des Wartenden (auch nach der Frist, etwa die Seite, die neu lädt) steht
    // beim Namen in der Ausgabe, nie als unbehandelte Ablehnung, die die Probe risse
    H.binnen = (p, ms, ersatz = null) =>
        Promise.race([
            Promise.resolve(p).catch((e) => (console.log("@@ " + H.sek() + " s · gewartet, geworfen: " + String((e && e.message) || e).split("\n")[0]), ersatz)),
            H.schlaf(Math.max(0, ms)).then(() => ersatz),
        ]);
    // DER MESSORT (punkte.cjs keinUrteil (d)): ein Wurf der Wege, die Ort und Seite stellen (/umstellen, /fenster, /status, /reload), der
    // Anschluss an den Browser der Sitzung und die Grundstellung tragen `messort` — erreicht er den Rand der Probe (H.fahre), sagt sie
    // die EINE Marke
    const MESSORT_WEG = /^\/(umstellen|fenster|status|reload)\b/;
    H.messort = (e, weg) => {
        const t = e && typeof e === "object" ? String(e.message || e).replace(/\s+/g, " ") : "";
        if ((!weg || MESSORT_WEG.test(weg)) && t && !e.messort) e.messort = (!weg || t.startsWith(weg) ? "" : weg + ": ") + t.slice(0, 280);
        return e;
    };
    // DIE WERKBANK der Sitzung (POST mit Frist)
    H.wb = (weg, nutz, ms = 120000) =>
        new Promise((ja, nein0) => {
            const nein = (e) => nein0(H.messort(e, weg));
            const q = http.request({ host: "127.0.0.1", port: W, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        ja(JSON.parse(d));
                    } catch (_e) {
                        nein(new Error(weg + ": " + d.slice(0, 200)));
                    }
                });
            });
            q.setTimeout(Math.max(1000, ms), () => q.destroy(new Error(weg + " ohne Antwort binnen " + Math.round(ms / 1000) + " s")));
            q.on("error", nein);
            q.end(JSON.stringify(nutz || {}));
        });
    // ein Funktionsrumpf in der Seite der Welt (r = Welt, T = THREE), wie `werkbank eval`
    H.evalWelt = async (code, ms) => {
        const a = await H.wb("/eval", { code }, ms);
        if (!a || a.fehler) throw new Error("werkbank eval: " + (a && a.fehler) + " " + JSON.stringify((a && a.stapel) || []));
        return a.ergebnis;
    };
    // eine frische Welt in der Sitzung (die Grundstellung der Maschine: Spielstand weg, die Seite neu)
    H.grundstellung = () => {
        const p = require("child_process").spawnSync(process.execPath, [process.env.PUNKTE_MASCHINE, "grundstellung"], {
            encoding: "utf8",
            env: process.env,
            timeout: 240000,
        });
        if (p.status !== 0) throw H.messort(new Error("grundstellung: " + String((p.stdout || "") + (p.stderr || "")).trim().split(/\r?\n/).slice(-2).join(" | ")));
    };
    // DER BROWSER DER SITZUNG
    H.verbinde = async () => {
        const pp = require("puppeteer");
        // DER ANSCHLUSS ÜBER /status (die EINE Quelle, wie proben-welt tor.seite): die Werkbank nennt das Profil ihres Browsers —
        // bis z216 suchte die Probe werkbank-profil-<W>-* im tmp, seit w11-profil-leck trägt der Starter ein Scratch-Profil
        const st = await H.wb("/status", {}, 30000);
        const profil = st && st.boot && st.boot.profil;
        const kand = [profil && path.join(profil, "DevToolsActivePort")].filter((f) => f && fs.existsSync(f));
        const fehl = [];
        for (const f of kand) {
            const [port, weg] = fs.readFileSync(f, "utf8").split(/\r?\n/);
            let b = null;
            try {
                b = await pp.connect({ browserWSEndpoint: "ws://127.0.0.1:" + port + weg, defaultViewport: null, protocolTimeout: 600000 });
                const seiten = await b.pages();
                const page = seiten.find((p) => p.url().startsWith("http://localhost:" + S + "/"));
                if (!page) throw new Error("keine Seite der Welt (" + seiten.map((p) => p.url()).join(" ") + ")");
                const vorher = new Set(seiten);
                // die souveräne Geste (window.confirm des Teilens, ein Dialog beim Verlassen) nimmt die Probe an — die Werkbank hört keinen
                const ja = (d) => d.accept().catch(() => {});
                page.on("dialog", ja);
                // seit spielgang.K5 (29643272, 02.11.) fragt die Welt nie mehr über window.confirm, sondern über ihre eigene
                // Oberfläche (#frage-dialog, `_frage`; die souveräne Geste `_sovereignGesture`) — der Hörer oben hört sie nicht, die
                // Geste des Teilens stand offen, bis die Probe riss (bauen.K5#2 geteilt: „Waiting failed: 30000ms" seit 02.11.). Die
                // Probe sagt dort Ja wie `frageJa` (scripts/lib/welt-boot.cjs), solange sie verbunden ist.
                await page.evaluate(() => {
                    const d = document.getElementById("frage-dialog");
                    if (!d) return;
                    const jaKlick = () => d.open && d.querySelector("#frage-ja").click();
                    (window.__sitzungFrageJa = new MutationObserver(jaKlick)).observe(d, { attributes: true, attributeFilter: ["open"] });
                    jaKlick();
                });
                H.beimAbbau(async () => {
                    page.off("dialog", ja);
                    await page.evaluate(() => (window.__sitzungFrageJa && window.__sitzungFrageJa.disconnect(), delete window.__sitzungFrageJa)).catch(() => {});
                    await page.keyboard.up("KeyW").catch(() => {});
                    for (const p of await b.pages().catch(() => [])) if (!vorher.has(p)) await p.close().catch(() => {});
                    await page.bringToFront().catch(() => {});
                    await b.disconnect();
                });
                Object.assign(H, { browser: b, page });
                return { browser: b, page };
            } catch (e) {
                fehl.push(path.basename(path.dirname(f)) + ": " + e.message);
                if (b) await b.disconnect().catch(() => {});
            }
        }
        throw H.messort(new Error("kein Browser der Sitzung an :" + W + " (" + (fehl.join(" · ") || (profil ? "kein DevToolsActivePort in " + profil : "/status nennt kein Profil der Werkbank")) + ")"));
    };
    // DIE LINSE ALS BIBLIOTHEK
    H.linse = (datei, namen, { argv = [], ersetze = [], stumm = {} } = {}) => {
        const Module = require("module");
        const f = path.resolve(datei);
        let text = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n"); // die Anker in LF, wie auch immer der Baum auscheckt
        for (const [alt, neu] of ersetze) {
            const n = text.split(alt).length - 1;
            if (n !== 1) throw new Error(datei + ": der Anker „" + alt.slice(0, 70) + "“ steht " + n + "× im Text (Soll 1) — die Linse änderte sich");
            text = text.replace(alt, () => neu);
        }
        const wbt = require(path.resolve("scripts/lib/welt-boot.cjs"));
        const ersatz = Object.assign({ hauptLauf: () => {} }, stumm);
        const alt = Object.fromEntries(Object.keys(ersatz).map((k) => [k, wbt[k]]));
        const av = process.argv;
        Object.assign(wbt, ersatz);
        process.argv = [av[0], f, ...argv];
        try {
            const m = new Module(f, module);
            m.filename = f;
            m.paths = Module._nodeModulePaths(path.dirname(f));
            m._compile(text + "\n;module.exports = { " + namen.join(", ") + " };\n", f);
            return m.exports;
        } finally {
            Object.assign(wbt, alt);
            process.argv = av;
        }
    };
    // DER EREIGNIS-STROM jeder Eingabe des Spielers (pointerdown · keydown · wheel, vor jedem Hörer der Seite) — wie die Linse
    // diag-werkstatt-weg ihn je Seite anlegt; in einer schon geladenen Seite einmal
    H.ereignisStrom = (page) =>
        page.evaluate(() => {
            if (window.__eingabeStrom) return;
            const strom = (window.__eingabeStrom = []);
            for (const typ of ["pointerdown", "keydown", "wheel"])
                window.addEventListener(typ, (e) => strom.push({ was: typ === "keydown" ? e.code : typ === "wheel" ? "Rad" : "Klick", echt: e.isTrusted, t: performance.now() }), {
                    capture: true,
                    passive: true,
                });
        });
    // DIE SEITE NEU im warmen Browser: warm der Zweit-Boot (nur die Seite neu: Platte, HTTP- und Shader-Cache bleiben), kalt vorher
    // die Herkunft leer — IndexedDB (Welten, Platte, Chunk-Netze), localStorage, Cache- und Shader-Speicher — samt HTTP-Cache des
    // Browsers und der Stand-Dateien des save-servers (Pflicht-OFFEN B: „IDB geleert, wie nach jedem Versions-Update"). Rückgabe
    // die Uhr ab der Navigation (die Kontrolle von außen zählt ab ihr).
    H.lade = async (page, { kalt = false } = {}) => {
        if (kalt) {
            const herkunft = "http://localhost:" + S;
            await page.goto("about:blank", { waitUntil: "load", timeout: 60000 });
            const c = await page.target().createCDPSession();
            try {
                await c.send("Storage.clearDataForOrigin", { origin: herkunft, storageTypes: "all" });
                await c.send("Network.clearBrowserCache");
            } finally {
                await c.detach().catch(() => {});
            }
            for (const d of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) fs.rmSync(d, { force: true });
        }
        const t0 = Date.now();
        await page.goto(H.url, { waitUntil: "domcontentloaded", timeout: 120000 });
        return t0;
    };
    // DER LAUF der Probe: ihr Ergebnis ist das JSON der Ausgabe; die Frist (H.FRIST_S) baut ab und schreibt den Stand `H.teil`
    H.fahre = (fn) => {
        let fertig = false;
        const ende = async (code, j) => {
            if (fertig) return;
            fertig = true;
            clearTimeout(uhr);
            if (j !== undefined)
                try {
                    fs.writeFileSync(H.AUS, JSON.stringify(j));
                } catch (e) {
                    console.log("@@ Ausgabe: " + e.message);
                }
            for (const f of abbau.reverse()) await H.binnen(Promise.resolve().then(f).catch((e) => console.log("@@ Abbau: " + e.message)), 15000);
            process.exit(code);
        };
        const uhr = setTimeout(() => {
            H.fristRiss("Abbau, die Ausgabe trägt den Stand bis hier");
            ende(3, H.teil);
        }, H.FRIST_S * 1000);
        Promise.resolve()
            .then(() => fn(H))
            .then(
                (j) => ende(0, j),
                (e) => {
                    if (e && e.messort) console.log("@@PUNKTE@@ MESSORT " + e.messort);
                    console.log("@@ PROBE-FEHLER " + String((e && e.stack) || e).split("\n").slice(0, 5).join(" | "));
                    ende(2, H.teil);
                }
            );
    };
    return H;
})();
H.seite = {

};
H.fahre(async function leiterProbe(H) { /* richter a85976e36e */ const PLAN = {"leiter":"erleben.klang.raum","sprossen":{"1":{"umfang":{"verlangt":24,"einheit":"Quellenlagen"},"soll":[{"wort":"pegel_pct","richtung":"≥","wert":100},{"wort":"laufzeit_pct","richtung":"≥","wert":100}],"auge":null},"2":{"umfang":{"verlangt":4,"einheit":"Raumklassen"},"soll":[{"wort":"nachhall_faktor_min","richtung":"≥","wert":1.3},{"wort":"verdeckung_db","richtung":"≥","wert":6}],"auge":null},"3":{"umfang":{"verlangt":1000,"einheit":"begehbare Orte"},"soll":[{"wort":"lokalisierung_pct","richtung":"≥","wert":85},{"wort":"rt60_abweichung_pct","richtung":"≤","wert":25}],"auge":null},"4":{"umfang":{"verlangt":100000,"einheit":"Innenräume"},"soll":[{"wort":"oktav_rt60_abweichung_pct","richtung":"≤","wert":20},{"wort":"daemmung_abweichung_db","richtung":"≤","wert":5}],"auge":null},"5":{"umfang":{"verlangt":10,"einheit":"km Fernschall"},"soll":[{"wort":"laufzeit_abweichung_pct","richtung":"≤","wert":2},{"wort":"hoehendaempfung_abweichung_db","richtung":"≤","wert":3}],"auge":null},"6":{"umfang":null,"soll":[{"wort":"schwerpunkt_abweichung_pct","richtung":"≤","wert":20},{"wort":"schall_faktor_wasser","richtung":"≥","wert":4.3}],"auge":null},"7":{"umfang":{"verlangt":100,"einheit":"Saaten"},"soll":[{"wort":"atmosphaere_pct","richtung":"≥","wert":95},{"wort":"luftschall_vakuum","richtung":"≤","wert":0}],"auge":null}}};
return (async function leiterRahmen(H, P, lauf) {
    const fs = require("fs");
    const logDatei = process.env.PUNKTE_SITZUNG_LOG;
    const log = logDatei && fs.existsSync(logDatei) ? fs.readFileSync(logDatei, "utf8") : "";
    const hw = (/\[linse-gpu\][^\r\n]*/.exec(log) || [null])[0];
    console.log(hw || "[linse-gpu] ungenannt (kein Log der Sitzung)");
    const j = (H.teil = { leiter: P.leiter, hw, sprossen: {}, fehler: {}, zeilen: [], preisPose: null });
    const D = String(H.AUS).replace(/\.json$/, "") + "-bilder";
    // DER STAND NACH JEDER SPROSSE (punkte.cjs keinUrteil (e)): die Ausgabe trägt jede geurteilte Sprosse ganz, ehe die nächste misst —
    // reißt danach die Frist oder tötet die Leine die Probe, urteilt die Sprosse aus ihr (geschrieben neben der Ausgabe, dann umbenannt:
    // nie ein halbes JSON)
    const stand = () => {
        try {
            fs.writeFileSync(H.AUS + ".stand", JSON.stringify(j));
            fs.renameSync(H.AUS + ".stand", H.AUS);
        } catch (e) {
            H.zeile("Stand: " + String((e && e.message) || e).split("\n")[0]);
        }
    };
    const setze = (nr, e) => {
        if (!P.sprossen[nr]) throw new Error("S" + nr + " ist keine Sprosse dieser Station");
        if (j.sprossen[nr]) throw new Error("S" + nr + " zweimal geurteilt");
        j.sprossen[nr] = Object.assign(e, { t: H.sek() });
        stand();
        H.zeile(P.leiter + " S" + nr + " " + e.art + " " + JSON.stringify(e).slice(0, 220));
    };
    const L = {
        P,
        j,
        D,
        rest: () => H.rest(),
        zeile: (t) => (j.zeilen.push(t), H.zeile(t)),
        wb: async (weg, nutz, s = 60) => {
            const o = await H.wb(weg, nutz, s * 1000);
            if (o && typeof o.fehler === "string") throw H.messort(new Error(weg + ": " + o.fehler.slice(0, 240)), weg);
            return o;
        },
        ev: (code, s = 60) => H.evalWelt(code, s * 1000),
        ort: (ort, sicht, pose) => L.wb("/umstellen", Object.assign({ ort, sicht: sicht || "ego" }, pose ? { pose } : {}), 240),
        // DIE ERGEBNISSE: werte {wort: Zahl} in den Einheiten der Karte · o.erzeugt der Umfang, den die Welt trug · o.welt die Zeugen
        // {wort: Zahl} · o.taeter der nächste Täter beim Namen
        gemessen: (nr, werte, o) => setze(nr, { art: "gemessen", werte, erzeugt: (o || {}).erzeugt, welt: (o || {}).welt || {}, taeter: (o || {}).taeter || null, beleg: (o || {}).beleg || null }),
        umfang: (nr, erzeugt, was) => setze(nr, { art: "umfang", erzeugt, was }),
        leser: (nr, fehlt, erzeugt) => setze(nr, { art: "leser", fehlt, erzeugt }),
        // DAS AUGE: das Bild an fester Pose (Messort, Sicht, Pose der Werkbank; b: Uhr, Wetter, Saison wie `werkbank bild`)
        auge: async (nr, o) => {
            try {
                if (o && o.ort) await L.ort(o.ort, o.sicht, o.pose);
                const kam = await L.ev("r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];");
                const datei = require("path").join(D, P.leiter + "-S" + nr + ".png");
                const b = await L.wb("/bild", Object.assign({ px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 1280, h: 720, datei }, (o && o.b) || {}), 120);
                setze(nr, { art: "auge", bild: (b && b.datei) || datei, werte: (o && o.werte) || null, erzeugt: o && o.erzeugt });
            } catch (e) {
                if (e && e.messort) throw e;
                setze(nr, { art: "auge", bild: null, grund: String((e && e.message) || e).split("\n")[0].slice(0, 160), werte: (o && o.werte) || null, erzeugt: o && o.erzeugt });
            }
        },
        // DER STROM DER SITZUNG (punkte.cjs stromZapfen · stromLesen — dieselbe Quelle, aus der richter-akte.cjs den Preis liest; kein
        // eigener Bild-Messer): L.zelle(name) nennt die Zelle der folgenden Bilder (null: keine), L.bilder(name) gibt die Bilder dieser
        // Probe in ihr ({ dt, gpu, vram, dreiecke, sicht, … } je Bild), L.p95 wie der Kopf des Stroms (Rang ⌊0,95·n⌋)
        zelle: async (name) => {
            const M = require(process.env.PUNKTE_MASCHINE || "-");
            if (!process.env.PUNKTE_SITZUNG_STROM) throw H.messort(new Error("die Sitzung trägt keinen Strom (PUNKTE_SITZUNG_STROM fehlt)"));
            const z = await M.stromZapfen(Number(process.env.WERKBANK_PORT) || H.W, process.env.PUNKTE_SITZUNG_STROM, process.env.PUNKTE_PROBE, { zelle: name });
            if (!z.ok) throw H.messort(new Error("der Strom zapft nicht: " + z.grund));
        },
        bilder: (name) =>
            require(process.env.PUNKTE_MASCHINE || "-").stromLesen(process.env.PUNKTE_SITZUNG_STROM).bilder.filter((b) => b.probe === process.env.PUNKTE_PROBE && b.zelle === name && b.dt >= 0),
        p95: (a) => {
            const s = a.filter(Number.isFinite).sort((x, y) => x - y);
            return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))] : null;
        },
        // DIE DICHTESTE POSE der Leiter (R3): dort endet die Probe, dort fährt der Preis-Lauf der Sitzung
        preisPose: (ort, sicht, pose) => (j.preisPose = { ort, sicht: sicht || "ego", pose: pose || null }),
        // je Sprosse ein eigener Versuch: ein Wurf steht beim Namen in j.fehler, die Sprosse bleibt ohne Ergebnis (UNGEMESSEN), die
        // nächste misst weiter — außer der Wurf trägt den Messort (dann reißt die Probe, punkte.cjs keinUrteil (d))
        je: async (nr, f) => {
            try {
                await f();
            } catch (e) {
                if (e && e.messort) throw e;
                j.fehler[nr] = String((e && e.message) || e).split("\n")[0].slice(0, 240);
                H.zeile(P.leiter + " S" + nr + " warf: " + j.fehler[nr]);
            }
        },
    };
    await lauf(H, P, L);
    if (j.preisPose) {
        try {
            await L.ort(j.preisPose.ort, j.preisPose.sicht, j.preisPose.pose);
            j.preisPose.steht = true;
        } catch (e) {
            j.preisPose.steht = false;
            j.preisPose.grund = String((e && e.message) || e).split("\n")[0].slice(0, 160);
        }
    }
    return j;
})(H, PLAN, async function raumLauf(H, P, L) {
                // DER ZENSUS (in der Seite): Bauten ohne den Wuchs der Natur (`_klangWuchs`), die Hörweiten des Gesetzes, neue Leser
                function raumZensus() {
                    const K = window.__klangCore || {};
                    const A = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
                    let bauten = 0;
                    for (const e of r.state.architectures || []) if (e && !A._klangWuchs(e) && !e._verkehrWagen) bauten++;
                    const U = K.UMWELT || {};
                    const weit = [["fahrt", (K.FAHRT_OHR || {}).hoerweiteM], ["tier", (U.tier || {}).hoerweiteM]]
                        .concat(Object.entries(U.stimmen || {}).map(([n, v]) => [n, v && v.hoerweiteM]))
                        .filter((x) => Number.isFinite(x[1]));
                    let rufM = 0;
                    if (typeof K.tierRufPegel === "function") for (let d = 1; d < 2e4; d *= 1.02) if (K.tierRufPegel(d) >= U.hoerschwelleDb) rufM = d;
                    const top = weit.reduce((a, b) => (b[1] > a[1] ? b : a), ["—", 0]);
                    const k = Object.keys(K);
                    return {
                        saat: r.state.worldMeta && r.state.worldMeta.seed,
                        bauten,
                        weitM: Math.max(top[1], rufM),
                        weitWer: top[1] >= rufM ? top[0] : "tier-ruf",
                        rufM: +rufM.toFixed(1),
                        c: (K.FAHRT_OHR || {}).c,
                        hrtf: k.filter((n) => /hrtf|binaural|itd|laufzeit/i.test(n)),
                        medium: k.filter((n) => /medium|hydrophon|koerperschall|unterwasser/i.test(n)),
                    };
                }
                // DIE SEITE DES RAUMS: (S2) der Loop mischt raumMs lang, dann der Nachhall des Graphen am Ort; (S1) EIN Leib ruft an 24 Lagen
                async function raumSeite(o) {
                    const s = r.state, K = window.__klangCore, cam = s.camera, rend = s.renderer, pm = s.playerMesh.position;
                    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
                    const war = !!(s.symphony && s.symphony.enabled);
                    const c0 = cam.position.clone(), q0 = cam.quaternion.clone();
                    let eigen = null, tier = null, tp = null, raum = null;
                    const lagen = [];
                    try {
                        if (!war) r.initSymphony();
                        const sy = s.symphony;
                        if (sy.ctx && sy.ctx.state !== "running") await sy.ctx.resume();
                        if (!sy.enabled || !sy.umwelt || !sy.umwelt.werkstatt) return { fehler: "der Klang steht nicht (enabled " + !!sy.enabled + ", Werkstatt " + !!(sy.umwelt && sy.umwelt.werkstatt) + ")" };
                        rend.setAnimationLoop((t) => r._gameLoopTick(t));
                        await warte(o.raumMs);
                        rend.setAnimationLoop(null);
                        const um = sy.umwelt, lr = (um.lage && um.lage.raum) || {};
                        raum = { rt60: um.raum && Number.isFinite(um.raum.rt60) ? +um.raum.rt60.toFixed(3) : null, deckung: lr.deckung, bau: lr.bau, fels: lr.fels, hoehle: lr.hoehle };
                        tier = (s.creatures || []).find((c) => c && c.position && !(c.userData && c.userData.dying)) || null;
                        if (!tier) tier = eigen = r.spawnCreatureAt(pm.x + 3, pm.y, pm.z, "happy", "wolf", { precise: true, bodySize: 1 });
                        if (!tier) return { fehler: "kein Leib für den Ruf (spawnCreatureAt wolf gab null)", raum };
                        tp = tier.position.clone();
                        for (const d of o.abstaende)
                            for (const w of o.winkel) {
                                // der Blick steht so, dass die Quelle (+x vom Ohr) w° rechts von ihm klingt
                                const a = (-w * Math.PI) / 180;
                                tier.position.set(pm.x + d, pm.y, pm.z);
                                cam.position.set(pm.x, pm.y, pm.z);
                                cam.lookAt(pm.x + Math.cos(a), pm.y, pm.z + Math.sin(a));
                                cam.updateMatrixWorld(true);
                                const seite = Math.sign(cam.matrixWorld.elements[0]);
                                const ruf = r._tierRuf(tier, "ruhe");
                                if (!ruf) {
                                    lagen.push({ d, w, seite, ruf: false });
                                    continue;
                                }
                                const ctx = new OfflineAudioContext(2, Math.round(48000 * o.sek), 48000);
                                K.tierRuf(ctx, ctx.destination, ruf);
                                const buf = await ctx.startRendering();
                                const A = buf.getChannelData(0), B = buf.getChannelData(1);
                                let pa = 0, pb = 0;
                                for (let i = 0; i < A.length; i++) (pa += A[i] * A[i]), (pb += B[i] * B[i]);
                                // die Laufzeit: der Gipfel von Σ L[i]·R[i−t] — R später (Quelle links) gibt t < 0, L später t > 0
                                let lag = 0, best = 0;
                                for (let t = -o.maxLag; t <= o.maxLag; t++) {
                                    let v = 0;
                                    for (let i = Math.max(0, t), n = Math.min(A.length, A.length + t); i < n; i++) v += A[i] * B[i - t];
                                    if (v > best * (1 + 1e-9) + 1e-15) (lag = t), (best = v);
                                }
                                lagen.push({ d, w, seite, ruf: true, dWelt: +ruf.d.toFixed(2), pan: +ruf.pan.toFixed(3), ild: +(10 * Math.log10((pb + 1e-12) / (pa + 1e-12))).toFixed(2), db: +(10 * Math.log10((pa + pb) / A.length + 1e-15)).toFixed(2), lag });
                            }
                        return { raum, lagen, eigen: !!eigen };
                    } finally {
                        rend.setAnimationLoop(null);
                        if (tier && tp && !eigen) tier.position.copy(tp);
                        if (eigen) r.removeCreature(eigen);
                        cam.position.copy(c0);
                        cam.quaternion.copy(q0);
                        cam.updateMatrixWorld(true);
                        if (!war && s.symphony.enabled) r.disposeSymphony();
                    }
                }
                const z = await L.ev("return (" + raumZensus + ")();", 30);
                L.zeile("Zensus Raum: " + JSON.stringify(z));
                const neu = (nr, k) => {
                    if (z[k].length) throw new Error("Leser erschienen (" + z[k].join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                // die billigen Sprossen zuerst (reißt die Frist am Ohr, stehen sie schon in der Ausgabe)
                await L.je(3, async () => {
                    neu(3, "hrtf");
                    if (z.bauten < P.sprossen[3].umfang.verlangt)
                        return L.umfang(3, z.bauten, "die Sitzung trägt " + z.bauten + " Bauten (begehbare Hüllen) — keine Siedlung mit 10³ begehbaren Orten; und das Ohr kennt kein vorn/hinten/oben (EIN StereoPanner je Quelle, klang-core.js:1277)");
                    L.leser(3, "kein vorn/hinten/oben am Ohr: jede Quelle geht durch EINEN StereoPanner, kein HRTF (klang-core.js:1277); der Nachhall ist die Formel basis + krone + bau + fels + hoehle (klang-core.js:1182), keine Sabine-Zahl aus Volumen und Absorption", z.bauten);
                });
                await L.je(4, async () => {
                    if (z.bauten < P.sprossen[4].umfang.verlangt)
                        return L.umfang(4, z.bauten, "die Sitzung trägt " + z.bauten + " Bauten — keine Stadt mit 10⁵ Innenräumen; kein Raum-in-Raum: der Raum am Ohr liest 16 waagerechte Strahlen (UMWELT.raum, klang-core.js:440)");
                    L.leser(4, "keine Impulsantwort je Raum und keine Wanddämmung nach Stoff: der Raum am Ohr sind vier Kammfilter mit EINER RT60 (klang-core.js:1188 umweltRaum), die Verdeckung pauschal −10 dB (klang-core.js:442 verdecktDb)", z.bauten);
                });
                await L.je(5, async () => {
                    const km = +(z.weitM / 1000).toFixed(3);
                    if (km < P.sprossen[5].umfang.verlangt)
                        return L.umfang(5, km, "das weiteste Ohr des Gesetzes reicht " + z.weitM + " m (" + z.weitWer + "; FAHRT_OHR.hoerweiteM klang-core.js:1757, Tier-Ruf " + z.rufM + " m) — kein Fernschall bis 10 km, keine Laufzeit (fahrtAmOhr ohne Verzögerung, klang-core.js:1759), keine Luftdämpfung nach ISO 9613");
                    L.leser(5, "keine Laufzeit und keine Höhendämpfung: fahrtAmOhr rechnet nur Doppler und −20·log10(d) (klang-core.js:1759)", km);
                });
                await L.je(6, async () => (neu(6, "medium"), L.leser(6, "kein Medienwechsel: unter Wasser schweigt nur der Schritt (stamm/klang.js:911), c = " + z.c + " m/s fest (klang-core.js:1757 FAHRT_OHR), kein Körperschall und keine Bodenwelle")));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 100 Saaten verlangt; c und Dämpfung stehen fest im Gesetz (klang-core.js:1757), keine Atmosphären-Zeile, kein Vakuum"));
                // DAS OHR AN DER WIESE (S2, S1): EIN Seiten-Lauf
                let R = null, fehlR = null;
                try {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    R = await L.ev("return await (" + raumSeite + ")(" + JSON.stringify({ raumMs: 2000, abstaende: [3, 8, 20], winkel: [-90, -60, -30, -15, 15, 30, 60, 90], sek: 0.6, maxLag: 40 }) + ");", Math.max(10, L.rest() - 3));
                    L.zeile("Raum am Ohr: " + JSON.stringify(R).slice(0, 2400));
                } catch (e) {
                    if (e && e.messort) throw e;
                    fehlR = String((e && e.message) || e).split("\n")[0].slice(0, 200);
                }
                await L.je(2, async () => {
                    const rt = R && R.raum ? R.raum.rt60 : null;
                    L.umfang(2, Number.isFinite(rt) ? 1 : 0, "binnen einer Leiter (60 s) liest das Ohr EINEN Raum: das Feld der Wiese (RT60 " + (Number.isFinite(rt) ? rt + " s" : "ungelesen" + (fehlR ? ": " + fehlR : "")) + ") — Wald, Gasse und Höhle verlangen drei Ortswechsel mit kaltem Ring (11–28 s je Ort); klang.K3#2 misst sie headless in 10 min");
                });
                await L.je(1, async () => {
                    if (fehlR) throw new Error(fehlR);
                    if (!R || R.fehler) throw new Error((R && R.fehler) || "der Seiten-Lauf gab nichts");
                    const n = P.sprossen[1].umfang.verlangt;
                    const echt = R.lagen.filter((x) => x.ruf && Math.abs(x.dWelt - x.d) < 0.1);
                    const pegel = echt.filter((x) => x.seite !== 0 && Math.sign(x.ild) === x.seite && Math.abs(x.ild) >= 1);
                    const zeit = echt.filter((x) => x.seite !== 0 && Math.sign(x.lag) === x.seite);
                    const db = (d, w) => (echt.find((x) => x.d === d && x.w === w) || {}).db;
                    const sp = [...new Set(echt.map((x) => x.w))].map((w) => db(3, w) - db(20, w)).filter(Number.isFinite);
                    const spanne = sp.length ? +(sp.reduce((a, b) => a + b, 0) / sp.length).toFixed(2) : 0;
                    const stumm = R.lagen.filter((x) => !x.ruf || Math.abs(x.dWelt - x.d) >= 0.1);
                    const lag0 = echt.filter((x) => x.lag === 0).length;
                    const taeter =
                        zeit.length < n
                            ? "kein Laufzeitunterschied: tierRufSpielen führt den Ruf durch EINEN StereoPannerNode ohne Verzögerung je Ohr (klang-core.js:1277) — Lag 0 Samples an " + lag0 + " von " + echt.length + " Lagen"
                            : pegel.length < n
                              ? "Pegel mit falschem Vorzeichen oder < 1 dB an " + echt.filter((x) => !pegel.includes(x)).map((x) => x.w + "° " + x.d + " m (" + x.ild + " dB)").slice(0, 4).join(", ") + " — _umweltPanorama (stamm/klang.js:350)"
                              : null;
                    L.gemessen(1, { pegel_pct: +((100 * pegel.length) / n).toFixed(1), laufzeit_pct: +((100 * zeit.length) / n).toFixed(1) }, {
                        erzeugt: echt.length,
                        welt: { lagen: echt.length, pegel_spanne_db: spanne },
                        taeter: (taeter || "") + (stumm.length ? (taeter ? " · " : "") + stumm.length + " Lagen ohne Ruf im verlangten Abstand" : "") || null,
                        beleg: "Leib " + (R.eigen ? "gesetzt (Wolf)" : "der Welt") + " · ILD " + echt.map((x) => x.w + "°/" + x.d + "m " + x.ild).slice(0, 8).join(" · "),
                    });
                });
            }); });