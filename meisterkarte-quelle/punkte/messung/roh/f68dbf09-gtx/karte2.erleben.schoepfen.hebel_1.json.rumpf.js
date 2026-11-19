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
H.fahre(async function leiterProbe(H) { /* richter 46bf0eaf40 */ const PLAN = {"leiter":"erleben.schoepfen.hebel","sprossen":{"1":{"umfang":null,"soll":[{"wort":"wille_bild_s","richtung":"≤","wert":1},{"wort":"eingaben","richtung":"≤","wert":3}],"auge":null},"2":{"umfang":null,"soll":[{"wort":"blind_unterscheidet_pct","richtung":"≤","wert":60}],"auge":{"pose":"dorf third Mittag — der Hof eines Spieler-Werks neben einem Hof des Plans derselben Region","vorbild":"Gesetz-Hof derselben Region (Hof des fachwerk-Plans der Siedlung)"}},"3":{"umfang":{"verlangt":10,"einheit":"Werke einer Weg-Geste"},"soll":[{"wort":"bewohner_wege_neu","richtung":"≥","wert":1}],"auge":null},"4":{"umfang":{"verlangt":100,"einheit":"Werke je Geste"},"soll":[{"wort":"belegung_abw_pct","richtung":"≤","wert":10},{"wort":"blind_pinsel_pct","richtung":"≤","wert":60}],"auge":{"pose":"dorf third Mittag — das gemalte Viertel neben einem Gesetz-Viertel","vorbild":"Gesetz-Viertel derselben Region (fachwerk-Plan)"}},"5":{"umfang":null,"soll":[{"wort":"edit_fernring_s","richtung":"≤","wert":1},{"wort":"blind_plausibel_pct","richtung":"≥","wert":70}],"auge":{"pose":"gipfel-blick third — derselbe Talgrund vor dem Eingriff und nach 1 Spieljahr","vorbild":"reale Landschaft nach einer Flussverlegung (Luftbild-Paar vorher/nachher)"}},"6":{"umfang":{"verlangt":100000,"einheit":"Bewohner unter einem Gesetz"},"soll":[{"wort":"stadtplan_band_pct","richtung":"≥","wert":80}],"auge":null},"7":{"umfang":{"verlangt":100000000,"einheit":"Bewohner eines Reichs"},"soll":[{"wort":"domaenen","richtung":"≥","wert":3}],"auge":null},"8":{"umfang":null,"soll":[{"wort":"erdmuster_pct","richtung":"≥","wert":80}],"auge":null},"9":{"umfang":null,"soll":[{"wort":"folge_anteil","richtung":"≥","wert":0.8}],"auge":null}}};
return (async function leiterRahmen(H, P, lauf) {
    const fs = require("fs");
    const logDatei = process.env.PUNKTE_SITZUNG_LOG;
    const log = logDatei && fs.existsSync(logDatei) ? fs.readFileSync(logDatei, "utf8") : "";
    const hw = (/\[linse-gpu\][^\r\n]*/.exec(log) || [null])[0];
    console.log(hw || "[linse-gpu] ungenannt (kein Log der Sitzung)");
    const j = (H.teil = { leiter: P.leiter, hw, sprossen: {}, fehler: {}, zeilen: [], preisPose: null });
    const D = String(H.AUS).replace(/\.json$/, "") + "-bilder";
    const setze = (nr, e) => {
        if (!P.sprossen[nr]) throw new Error("S" + nr + " ist keine Sprosse dieser Station");
        if (j.sprossen[nr]) throw new Error("S" + nr + " zweimal geurteilt");
        j.sprossen[nr] = Object.assign(e, { t: H.sek() });
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
})(H, PLAN, async function hebelLauf(H, P, L) {
                // ── S1 · EIN Werk über den Weg des Spielers + der Prüfsatz der Konstruktionen ──
                await L.je(1, async () => {
                    const W = H.linse("scripts/diag-werkstatt-weg.cjs", ["probe", "wegHelfer", "bauWeg", "wegLauf", "WERKE", "TEILE"]);
                    const { page } = await H.verbinde();
                    await page.setViewport({ width: 1280, height: 720 });
                    // die Schleife des Spiels läuft wie im Spiel (die Werkbank hält sie zwischen ihren Befehlen an)
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t)));
                    H.beimAbbau(() => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null)));
                    await H.ereignisStrom(page);
                    const { frei } = await page.evaluate(W.probe, { nurOrt: true });
                    if (!frei) throw new Error("kein freier, trockener Ort um den Spieler (Linse diag-werkstatt-weg probe nurOrt)");
                    await H.binnen(page.evaluate(() => window.__weltStehtNach()), 15000);
                    if (await page.evaluate(() => window.anazhRealm._ladeschirmSteht())) throw new Error("der Ladeschirm steht — keine Taste der Welt");
                    await page.evaluate(W.wegHelfer, { frei, teile: { eigen_huette: W.TEILE.eigen_huette }, bild: true });
                    let offen = true;
                    H.beimAbbau(() => offen && W.bauWeg(page, "ende"));
                    await W.bauWeg(page, "konsum");
                    const e = await H.binnen(W.wegLauf(page, { lage: "schöpfer", weg: "hotbar", name: W.WERKE.Haus, sicht: "Ego" }), Math.max(5, H.rest() - 30) * 1000, { fehler: "Frist der Leiter" });
                    offen = false;
                    await W.bauWeg(page, "ende");
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
                    // der Prüfsatz in der Welt: gesetzt über den Bau-Weg (Hotbar, Phantom, confirmBuild), 150 Takte zu 1/30 s
                    const pruefFn = function (r, T, arg) {
                        const st = r.state;
                        const bm = st.buildMode;
                        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
                        const setze = (name, plan, x, z) => {
                            const key = "__pruef_" + name;
                            const vor = new Set(st.architectures);
                            const modus = r.getGameMode();
                            const slot = st.hotbar[6];
                            const teil = (p) => ({ shape: p[7] || "box", material: p[6] || "stein", position: { x: p[0], y: p[1], z: p[2] }, size: { x: p[3], y: p[4], z: p[5] }, rotation: { x: 0, y: 0, z: p[8] || 0 } });
                            st.blueprints[key] = { name: key, label: name, parts: plan.map(teil) };
                            r.setGameMode("schöpfer");
                            r._clearBuildMode();
                            bm.slotIndex = -1;
                            r.setHotbarSlot(6, key);
                            r.selectHotbarSlot(6);
                            bm.phantomMesh.position.set(x, r._voxelSurfaceY(x, z), z);
                            bm.phantomMesh.rotation.y = 0;
                            bm.phantomOnGround = true;
                            try {
                                r.confirmBuild();
                            } finally {
                                r._clearBuildMode();
                                r.setHotbarSlot(6, slot);
                                r.setGameMode(modus);
                            }
                            return st.architectures.find((x2) => !vor.has(x2) && x2.type === key) || null;
                        };
                        const bild = (e) => {
                            const m = new T.Matrix4();
                            if (e.mesh) m.compose(e.mesh.position, e.mesh.quaternion, e.mesh.scale);
                            else if (e.instSlots && e.instSlots.length) st.archInstanceGroups.get(e.instSlots[0].key).mesh.getMatrixAt(e.instSlots[0].slot, m);
                            else return null;
                            const p = new T.Vector3();
                            const q = new T.Quaternion();
                            m.decompose(p, q, new T.Vector3());
                            return { p, q };
                        };
                        const grad = (a, b) => (360 / Math.PI) * Math.acos(Math.min(1, Math.abs(a.q.dot(b.q))));
                        const f = arg.frei;
                        const pos0 = st.playerMesh.position.clone();
                        st.playerMesh.position.set(f.x, f.y + 1.2, f.z);
                        const aus = {};
                        try {
                            for (const art of ["stabil", "instabil"])
                                for (const name of Object.keys(arg.satz[art])) {
                                    const n0 = zeilen().length;
                                    const e = setze(name, arg.satz[art][name], f.x + 12, f.z);
                                    const b0 = e && bild(e);
                                    const o = { art, neigung: 0, fall: 0 };
                                    for (let t = 0; t < 150 && b0 && st.architectures.includes(e); t++) {
                                        r.tickAffordances(1 / 30);
                                        const b = st.architectures.includes(e) && bild(e);
                                        if (b) {
                                            o.neigung = Math.max(o.neigung, grad(b0, b));
                                            o.fall = Math.max(o.fall, b0.p.y - b.p.y);
                                        }
                                    }
                                    const da = !!e && st.architectures.includes(e);
                                    o.gesetzt = !!b0;
                                    o.steht = da && o.neigung < 0.5 && o.fall < 0.01;
                                    o.zeile = (zeilen().slice(n0).find((l) => l.includes(name)) || "").slice(0, 120);
                                    o.richtig = o.gesetzt && (art === "stabil" ? o.steht : (o.neigung >= 30 || o.fall >= 0.3) && !!o.zeile);
                                    o.neigung = +o.neigung.toFixed(2);
                                    o.fall = +o.fall.toFixed(3);
                                    if (da) r.removeArchitecture(e);
                                    aus[name] = o;
                                }
                        } finally {
                            for (const k of Object.keys(st.blueprints)) if (k.startsWith("__pruef_")) delete st.blueprints[k];
                            st.playerMesh.position.copy(pos0);
                        }
                        return aus;
                    };
                    const satz = require(require("path").resolve("spec/pruefsatz/bauen-k3.json"));
                    const ps = await L.ev("return (" + pruefFn + ")(r, T, " + JSON.stringify({ frei, satz: { stabil: satz.stabil, instabil: satz.instabil } }) + ");", 45);
                    const faelle = Object.entries(ps || {});
                    const falsch = faelle.filter(([, o]) => !o.richtig);
                    const z = (e && e.zeiten) || [];
                    const werte = { wille_bild_s: Number.isFinite(z[4]) ? z[4] / 1000 : null, eingaben: Number.isFinite(e && e.eingaben) ? e.eingaben : null };
                    const welt = {
                        werk_steht: e && e.steht === 1 ? 1 : 0,
                        eingaben_echt_pct: e && e.eingaben > 0 ? (100 * (e.eingaben - (e.unecht || 0))) / e.eingaben : 0,
                        bau_gleich_l0: e && e.bau && e.bau === e.soll ? 1 : 0,
                        pruefsatz_richtig_pct: faelle.length ? (100 * (faelle.length - falsch.length)) / faelle.length : 0,
                    };
                    const taeter = [
                        e && e.fehler ? "Weg: " + e.fehler : null,
                        e && e.unecht ? e.unecht + " unechte Eingaben" : null,
                        e && e.bau !== e.soll ? "Bau-Hash ≠ L0 (" + e.bau + " / " + e.soll + ")" : null,
                        ...falsch.map(([k, o]) => "Prüfsatz " + k + " (" + o.art + ": steht " + o.steht + ", Neigung " + o.neigung + "°, Fall " + o.fall + " m, Zeile „" + o.zeile + "“)"),
                    ].filter(Boolean);
                    L.zeile("hebel S1 Weg " + JSON.stringify({ steht: e && e.steht, eingaben: e && e.eingaben, zeiten: z, kalt: e && e.kalt }) + " · Prüfsatz " + (faelle.length - falsch.length) + "/" + faelle.length);
                    const sollOk = werte.wille_bild_s !== null && werte.wille_bild_s <= 1 && werte.eingaben !== null && werte.eingaben <= 3;
                    const weltOk = welt.werk_steht >= 1 && welt.eingaben_echt_pct >= 100 && welt.bau_gleich_l0 >= 1 && welt.pruefsatz_richtig_pct >= 100;
                    if (sollOk && weltOk)
                        return L.leser(
                            1,
                            "Bildvergleich Studio ↔ Welt im Band: kein Leser vergleicht das Bild des Werks im Studio mit dem in der Welt — der Haken säße am Bild-Weg der Linse (scripts/diag-werkstatt-weg.cjs:935 wegHelfer bild); gemessen: Wille → Bild " +
                                werte.wille_bild_s + " s, " + werte.eingaben + " Eingaben, Prüfsatz " + faelle.length + "/" + faelle.length + " richtig"
                        );
                    L.gemessen(1, werte, { erzeugt: welt.werk_steht, welt, taeter: taeter.join(" · ") || "Wille → Bild " + werte.wille_bild_s + " s, " + werte.eingaben + " Eingaben" });
                });
                // ── die Geste im echten Chat (der Halt der Messung fällt für sie, danach steht er wieder): Werke je Geste ──
                const gesteFn = function (r, saetze) {
                    const st = r.state;
                    const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
                    const uhr = st.weatherEffectTime;
                    const aus = [];
                    st.weatherEffectTime = 0;
                    try {
                        for (const satz of saetze) {
                            const vor = new Set(st.architectures);
                            const n0 = zeilen().length;
                            const t0 = performance.now();
                            r.processChatCommand(satz);
                            const ms = performance.now() - t0;
                            const neu = st.architectures.filter((a) => !vor.has(a));
                            aus.push({ satz, neu: neu.length, werke: neu.filter((a) => a.werk).length, ms: Math.round(ms), zeile: zeilen().slice(n0 + 1).join(" | ").slice(0, 200) });
                            for (const a of neu) r.removeArchitecture(a);
                        }
                    } finally {
                        st.weatherEffectTime = uhr;
                    }
                    return aus;
                };
                const worte = await L.ev("return { haeuser: !!r._studioBlueprintForWord('häuser'), weg: r._studioBlueprintForWord('weg') || null, werke: (r.state.architectures || []).filter((a) => a.werk).length };");
                const saetze = ["bau mir einen weg", "bau mir 100 " + (worte.haeuser ? "häuser" : "haus")];
                const g = await L.ev("return (" + gesteFn + ")(r, " + JSON.stringify(saetze) + ");", 40).then(
                    (x) => x,
                    (e) => ({ fehler: String((e && e.message) || e).split("\n")[0] })
                );
                L.zeile("hebel Geste " + JSON.stringify(g).slice(0, 400));
                // ── S2 · ein Werk wird Teil des Orts ──
                await L.je(2, async () =>
                    L.leser(
                        2,
                        "ein Spieler-Werk als Slot eines Orts: kein Leser führt es — der Plan der Siedlung kennt nur die Slots seines Gesetzes (stamm/siedlung-ort.js:738), das Werk trägt nur die Marke `werk` (stamm/siedlung-satz.js:1358); die Welt trägt " +
                            worte.werke + " Spieler-Werke"
                    )
                );
                // ── S3 · einen Weg setzen ──
                await L.je(3, async () => {
                    if (g.fehler) throw new Error("die Geste warf: " + g.fehler);
                    const w = g[0];
                    if (w.werke < P.sprossen[3].umfang.verlangt)
                        return L.umfang(3, w.werke, "„" + w.satz + "“ setzt " + w.werke + " Werke (Wort „weg“ im Katalog: " + (worte.weg || "keines") + ", Antwort „" + w.zeile + "“) — das Wegenetz ist eine Funktion des Plans (`_wegeNetzGrund`, stamm/siedlung-ort.js:3231), keine Geste legt einen Weg hinein");
                    L.leser(3, "Bewohner-Wege über den neuen Weg: kein Leser — das Wegenetz der Bewohner liest nur den Plan (stamm/siedlung-ort.js:3231 `_wegeNetzGrund`)", w.werke);
                });
                // ── S4 · der Viertel-Pinsel: 100 Werke je Geste ──
                await L.je(4, async () => {
                    if (g.fehler) throw new Error("die Geste warf: " + g.fehler);
                    const w = g[1];
                    if (w.werke < P.sprossen[4].umfang.verlangt)
                        return L.umfang(4, w.werke, "„" + w.satz + "“ setzt " + w.werke + " Werke in " + w.ms + " ms — spawn_studio klemmt die Anzahl auf 1–24 (stamm/feld-dsl.js:2019), kein Viertel-Pinsel");
                    L.leser(4, "Belegung gegen ein Gesetz-Viertel: kein Leser der Belegung eines gemalten Viertels (stamm/siedlung-ort.js:738)", w.werke);
                });
                // ── S5–S9 · die Op-Tafel (die EINE Quelle der Taten, `dslEffects`) und die Bewohner der Sitzung ──
                const t = await L.ev(
                    "const ops = Object.keys(r.dslEffects || {}); const st = r.state; const FC = globalThis.__fachwerkCore; let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === 'function' ? S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0) : 0); } const p = st.playerMesh ? st.playerMesh.position : null; return { ops: ops.length, fluss: ops.filter((o) => /fluss|river|wasserlauf|berg|erosion|abtrag/i.test(o)), planet: ops.filter((o) => /platte|plate|tekton|vulkan|volcano|klima|climate|zeitalter|epoch/i.test(o)), system: ops.filter((o) => /sonne|sun|planet|orbit|stern|star/i.test(o)), bew, sied, pos: p ? [Math.round(p.x), Math.round(p.z)] : null };"
                );
                L.zeile("hebel Op-Tafel " + JSON.stringify(t));
                await L.je(5, async () =>
                    L.leser(
                        5,
                        "Fluss umleiten, Berg abtragen: kein Verb der Geste in der Op-Tafel (" + t.ops + " Ops, Treffer [" + t.fluss.join(", ") + "], stamm/feld-dsl.js:926 dslEffects) und kein Raffer über 1 Spieljahr — der Haken säße im Wortschatz der DSL (stamm/feld-nexus.js:1068 `_dslVokabular`)"
                    )
                );
                // der Umfang als Argument: erreicht die Welt ihn, fehlt der Leser des Urteils (nie ein Umfang, der sich widerspricht)
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                await L.je(6, async () =>
                    urteile(6, t.bew, "die Welt trägt an der Pose " + JSON.stringify(t.pos) + " " + t.bew + " Bewohner in " + t.sied + " Siedlungen — keine Stadt von 10⁵ unter einem Gesetz", "Stadtplan-Statistik nach 50 Spieljahren: kein Leser, kein Raffer (stamm/siedlung-ort.js:738)")
                );
                await L.je(7, async () => urteile(7, t.bew, "die Welt trägt " + t.bew + " Bewohner in " + t.sied + " Siedlungen — kein Reich von 10⁸, keine Megastruktur ≥ 10 km", "Kopplungskette über 3 Domänen: kein Leser (stamm/feld-dsl.js:926)"));
                await L.je(8, async () =>
                    L.leser(8, "Platte schieben, Vulkan, Klima, Zeitalter je Geste: kein Verb in der Op-Tafel (Treffer [" + t.planet.join(", ") + "], stamm/feld-dsl.js:926), kein Raffer über 10⁷ Spieljahre — der Haken säße im Wortschatz der DSL (stamm/feld-nexus.js:1068 `_dslVokabular`)")
                );
                await L.je(9, async () =>
                    L.leser(9, "ein Sonnensystem je Geste: kein Verb (Treffer [" + t.system.join(", ") + "], stamm/feld-dsl.js:926) — der Planet ist der Same der Welt (`_planetSamen`, stamm/gelaende-chunks.js:672), kein Leser der Folge am Gesicht eines Bewohners")
                );
            }); });