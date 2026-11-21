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
H.fahre(async function leiterProbe(H) { /* richter 0f0f8e2e80 */ const PLAN = {"leiter":"erleben.klang.getuemmel","sprossen":{"1":{"umfang":{"verlangt":7,"einheit":"Stimmen zugleich"},"soll":[{"wort":"spitze_dbfs","richtung":"≤","wert":0},{"wort":"dauer_min","richtung":"≥","wert":10},{"wort":"duck_db","richtung":"≥","wert":8},{"wort":"duck_db_bis","richtung":"≤","wert":12}],"auge":null},"2":{"umfang":{"verlangt":100,"einheit":"Quellen"},"soll":[{"wort":"wer_pct","richtung":"≤","wert":15}],"auge":null},"3":{"umfang":{"verlangt":10000,"einheit":"Quellen"},"soll":[{"wort":"wer_pct","richtung":"≤","wert":15},{"wort":"menge_senkung_db","richtung":"≤","wert":3}],"auge":null},"4":{"umfang":null,"soll":[{"wort":"schwelle_abweichung_pct","richtung":"≤","wert":30}],"auge":null},"5":{"umfang":{"verlangt":100000,"einheit":"Stimmen"},"soll":[{"wort":"wer_pct","richtung":"≤","wert":20},{"wort":"warn_pct","richtung":"≥","wert":95}],"auge":null},"6":{"umfang":null,"soll":[{"wort":"hoerbar_pct","richtung":"≥","wert":95}],"auge":null}}};
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
})(H, PLAN, async function getuemmelLauf(H, P, L) {
                function getuemmelZensus() {
                    const FC = globalThis.__fachwerkCore, K = window.__klangCore || {};
                    let bew = 0, maxS = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (S.liste) n = S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function")
                            for (const sl of S.plan.slots)
                                try {
                                    n += Math.max(0, FC.leuteVon(sl.ov) | 0);
                                } catch (_e) {}
                        bew += n;
                        if (n > maxS) maxS = n;
                    }
                    let wagen = 0;
                    for (const e of r.state.architectures || []) if (e && e._verkehrWagen) wagen++;
                    const U = K.UMWELT || {};
                    return { bew, maxS, sied, wagen, schwelle: U.hoerschwelleDb, deckel: U.stimmenMax, stimmen: Object.keys(U.stimmen || {}), neu: Object.keys(K).filter((n) => /vertaeub|tinnitus|maskier|zuwend|warnung/i.test(n)) };
                }
                // DIE SEITE DES GETÜMMELS: Spitzen am Ausgang der Wand, Stimmen des Graphen, der Duck bei Stimme
                async function getuemmelSeite(o) {
                    const s = r.state, rend = s.renderer;
                    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
                    const war = !!(s.symphony && s.symphony.enabled), wetter0 = s.weather;
                    const ton0 = (k, sr, n) => (k * sr) / n;
                    let takt = null, an = null, sy = null, ton = null, tonG = null;
                    try {
                        if (!war) r.initSymphony();
                        sy = s.symphony;
                        if (sy.ctx && sy.ctx.state !== "running") await sy.ctx.resume();
                        if (!sy.enabled || !sy.spitze || !sy.lofi || !sy.lofi.duck || !sy.umwelt || !sy.umwelt.graph)
                            return { fehler: "der Klang steht nicht (enabled " + !!sy.enabled + ", Wand " + !!sy.spitze + ", Duck " + !!(sy.lofi && sy.lofi.duck) + ")" };
                        if (o.wetter && s.weather !== o.wetter && window.__wetterSetzen(o.wetter) !== o.wetter) return { fehler: "das Wetter-Wort " + o.wetter + " gilt nicht" };
                        rend.setAnimationLoop((t) => r._gameLoopTick(t));
                        an = sy.ctx.createAnalyser();
                        an.fftSize = 4096;
                        sy.spitze.ausgang.connect(an);
                        const td = new Float32Array(an.fftSize);
                        const U = sy.umwelt.kern.UMWELT;
                        let spitze = 0, proben = 0, stimmenMax = 0, verletzt = 0;
                        const namen = {};
                        const t0 = performance.now();
                        takt = setInterval(() => {
                            an.getFloatTimeDomainData(td);
                            let p = 0;
                            for (let i = 0; i < td.length; i++) {
                                const a = Math.abs(td[i]);
                                if (a > p) p = a;
                            }
                            if (p > spitze) spitze = p;
                            proben++;
                            const zz = sy.umwelt.graph.zensus();
                            const ein = zz.filter((v) => v.an);
                            if (ein.length > stimmenMax) stimmenMax = ein.length;
                            for (const v of ein) namen[v.name] = (namen[v.name] || 0) + 1;
                            if (ein.length >= U.stimmenMax) {
                                const leiseste = Math.min(...ein.map((v) => v.db));
                                if (zz.some((v) => !v.an && v.db > leiseste + U.hystereseDb)) verletzt++;
                            }
                        }, 40);
                        await warte(o.vorMs);
                        // DER DUCK AM ABGRIFF: ein Mess-Ton (−60 dBFS, auf einer Linie der FFT) läuft durch den Duck-Bus der Musik, ein
                        // Analyser an seinem Ausgang liest die Linie vor und nach der Stimme — der Ton hält den Bus zugleich im Takt des
                        // Audio-Fadens (ein Bus ohne Eingang rechnet seine Rampe nicht)
                        const Lf = sy.lofi, ctx = sy.ctx;
                        const an2 = ctx.createAnalyser();
                        an2.fftSize = 4096;
                        an2.smoothingTimeConstant = 0;
                        const k = Math.round(o.tonHz / (ctx.sampleRate / an2.fftSize));
                        ton = ctx.createOscillator();
                        tonG = ctx.createGain();
                        ton.frequency.value = (k * ctx.sampleRate) / an2.fftSize;
                        tonG.gain.value = 1e-3;
                        ton.connect(tonG);
                        tonG.connect(Lf.duck);
                        Lf.duck.connect(an2);
                        ton.start();
                        const fd = new Float32Array(an2.frequencyBinCount);
                        const linie = async () => {
                            let q = 0;
                            for (let i = 0; i < 3; i++) {
                                await warte(60);
                                an2.getFloatFrequencyData(fd);
                                q += Math.pow(10, fd[k] / 10);
                            }
                            return 10 * Math.log10(q / 3);
                        };
                        await warte(200);
                        for (let i = 0; i < 60 && Lf.duckBis > ctx.currentTime; i++) await warte(50);
                        const [l0, g0] = [await linie(), Lf.duck.gain.value];
                        const ok = r._musikDuck("gespraech", o.zeichen);
                        await warte(o.duckMs);
                        const [l1, g1] = [await linie(), Lf.duck.gain.value];
                        ton.stop();
                        tonG.disconnect();
                        Lf.duck.disconnect(an2);
                        [ton, tonG] = [null, null];
                        while (performance.now() - t0 < o.sek * 1000) await warte(100);
                        clearInterval(takt);
                        takt = null;
                        return { ms: Math.round(performance.now() - t0), proben, spitzeDbfs: spitze > 0 ? +(20 * Math.log10(spitze)).toFixed(2) : -999, stimmenMax, namen, verletzt, deckel: U.stimmenMax, duck: { ok: !!ok, tonHz: +ton0(k, ctx.sampleRate, an2.fftSize).toFixed(1), l0: +l0.toFixed(2), l1: +l1.toFixed(2), g0: +g0.toFixed(4), g1: +g1.toFixed(4) }, wetter: s.weather };
                    } finally {
                        if (takt) clearInterval(takt);
                        if (ton)
                            try {
                                ton.stop();
                                tonG.disconnect();
                            } catch (_e) {}
                        rend.setAnimationLoop(null);
                        if (an && sy && sy.spitze)
                            try {
                                sy.spitze.ausgang.disconnect(an);
                            } catch (_e) {}
                        if (wetter0 && s.weather !== wetter0) window.__wetterSetzen(wetter0);
                        if (!war && s.symphony.enabled) r.disposeSymphony();
                    }
                }
                const z = await L.ev("return (" + getuemmelZensus + ")();", 30);
                L.zeile("Zensus Getümmel: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.neu.length) throw new Error("Leser erschienen (" + z.neu.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                const kein = "kein zugewandter Sprecher: Bewohner sprechen nicht, der Begleiter spricht über speechSynthesis außerhalb des Klang-Graphen (stamm/werkstatt-hud.js:73)";
                await L.je(2, async () => {
                    neu(2);
                    if (z.maxS < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.maxS, "die größte Siedlung trägt " + z.maxS + " Bewohner — kein Dorfplatz mit 10² Quellen; und " + kein);
                    L.leser(2, kein, z.maxS);
                });
                await L.je(3, async () => {
                    neu(3);
                    const q = z.bew + z.wagen;
                    if (q < P.sprossen[3].umfang.verlangt) return L.umfang(3, q, "die Sitzung trägt " + z.bew + " Bewohner und " + z.wagen + " Wagen — keine Großstadtstraße mit 10⁴ Quellen; und " + kein);
                    L.leser(3, kein + "; keine Zuwendung im Graphen (der Deckel wählt die lautesten " + z.deckel + " Stimmen, klang-core.js:417)", q);
                });
                await L.je(4, async () => (neu(4), L.leser(4, "keine Vertäubung: die Hörschwelle steht fest bei " + z.schwelle + " dB (klang-core.js:415 UMWELT.hoerschwelleDb), kein Klingeln, kein 130-dB-Ereignis")));
                await L.je(5, async () => {
                    neu(5);
                    if (z.maxS < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.maxS, "die größte Siedlung trägt " + z.maxS + " Bewohner — kein Stadion mit 10⁵ Stimmen; und " + kein);
                    L.leser(5, kein + "; keine Warn-Stimme in UMWELT (klang-core.js:443)", z.maxS);
                });
                await L.je(6, async () => (neu(6), L.leser(6, kein + "; keine Warn-Stimme in UMWELT (" + z.stimmen.join(" · ") + ", klang-core.js:443) — hörbar bleibt nur der eigene Schritt (stamm/klang.js:888)")));
                await L.je(1, async () => {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    const sek = Math.max(6, Math.min(14, L.rest() - 10));
                    const G = await L.ev("return await (" + getuemmelSeite + ")(" + JSON.stringify({ wetter: "rainy", sek, vorMs: Math.round(sek * 300), duckMs: 300, zeichen: 30, tonHz: 15000 }) + ");", Math.max(10, L.rest() - 2));
                    L.zeile("Getümmel am Ohr: " + JSON.stringify(G));
                    if (G.fehler) throw new Error(G.fehler);
                    // der Duck am Abgriff: die Linie des Mess-Tons am Ausgang des Duck-Busses vor gegen nach der Stimme (dB)
                    const duck = Number.isFinite(G.duck.l0) && Number.isFinite(G.duck.l1) ? +(G.duck.l0 - G.duck.l1).toFixed(2) : null;
                    const wechsel = duck == null ? 0 : duck;
                    const dauer = +(G.ms / 60000).toFixed(3);
                    const t = [];
                    if (G.spitzeDbfs > 0) t.push("Spitze " + G.spitzeDbfs + " dBFS hinter der Wand (umweltSpitze klang-core.js:1168, UMWELT.spitze :424)");
                    if (!(duck >= 8 && duck <= 12)) t.push("Duck " + duck + " dB bei Stimme (MUSIK.duck.gespraech klang-core.js:382, `_musikDuck` " + (G.duck.ok ? "lief" : "verweigert") + ")");
                    if (G.stimmenMax < P.sprossen[1].umfang.verlangt) t.push("nur " + G.stimmenMax + " Stimmen zugleich an der Wiese im Regen (" + Object.keys(G.namen).join(", ") + ")");
                    if (dauer < 10) t.push("die Leiter hört " + dauer + " min — 10 min übersteigen den Deckel einer Leiter (60 s)");
                    L.gemessen(1, { spitze_dbfs: G.spitzeDbfs, dauer_min: dauer, duck_db: duck, duck_db_bis: duck }, {
                        erzeugt: G.stimmenMax,
                        welt: { proben: G.proben, duck_wechsel_db: wechsel },
                        taeter: t.join(" · ") || null,
                        beleg: "Wetter " + G.wetter + " · Stimmen je Probe " + JSON.stringify(G.namen) + " · Deckel " + G.deckel + ", lautere stumm " + G.verletzt + "× · Mess-Ton " + G.duck.tonHz + " Hz " + G.duck.l0 + " → " + G.duck.l1 + " dB · Gain des Busses " + G.duck.g0 + " → " + G.duck.g1,
                    });
                });
            }); });