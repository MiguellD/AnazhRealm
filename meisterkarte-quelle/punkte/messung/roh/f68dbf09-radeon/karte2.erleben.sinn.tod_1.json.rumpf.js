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
H.fahre(async function leiterProbe(H) { /* richter e607a50f7a */ const PLAN = {"leiter":"erleben.sinn.tod","sprossen":{"1":{"umfang":null,"soll":[{"wort":"rueckkehr_s","richtung":"≤","wert":5}],"auge":null},"2":{"umfang":null,"soll":[{"wort":"wunde_min","richtung":"≥","wert":10}],"auge":{"pose":"der Todesort der Sitzung, Ego — das Bild vor dem Tod (-S2-vor.png) und nach der Rückkehr (-S2.png)","vorbild":"dasselbe Bild vor dem Tod (Bildpaar vor/nach am Todesort: Lebensspur)"}},"3":{"umfang":null,"soll":[{"wort":"nennen_pct","richtung":"≥","wert":80}],"auge":null},"4":{"umfang":{"verlangt":40,"einheit":"Jahre eines Spieler-Lebens im Zeitraffer"},"soll":[],"auge":{"pose":"der Leib des Spielers vor seinem Haus, Ego/Third — mit 20 und mit 60 Jahren","vorbild":"derselbe Mensch mit 20 und 60 Jahren (Altersfotos), Haus und Beziehungen geändert"}},"5":{"umfang":null,"soll":[{"wort":"bestaende_erbe","richtung":"≥","wert":3}],"auge":null},"6":{"umfang":{"verlangt":1000000,"einheit":"Bewohner, die den Spieler nie sahen"},"soll":[{"wort":"unterschied_pp","richtung":"≥","wert":20}],"auge":null},"7":{"umfang":null,"soll":[{"wort":"teil_pct","richtung":"≥","wert":70}],"auge":null}}};
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
})(H, PLAN, async function todLauf(H, P, L) {
                const path = require("path");
                // ── das Bild vor dem Tod an der Pose der Sitzung (dieselbe Kamera und dasselbe /bild wie L.auge) ──
                try {
                    const kam = await L.ev(
                        "r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];"
                    );
                    const b = await L.wb("/bild", { px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 1280, h: 720, datei: path.join(L.D, P.leiter + "-S2-vor.png") }, 60);
                    L.zeile("tod Bild vor dem Tod " + ((b && b.datei) || "?"));
                } catch (e) {
                    if (e && e.messort) throw e;
                    L.zeile("tod Bild vor dem Tod warf: " + String((e && e.message) || e).split("\n")[0].slice(0, 160));
                }
                const frist = Math.max(10, H.rest() - 12);
                const capRueck = Math.min(22, Math.max(5, frist / 2));
                const capZurueck = Math.min(22, Math.max(5, frist - capRueck));
                // ── der Tod in der Welt der Sitzung (in der Seite; danach steht der Leib wieder, wo er war) ──
                const todFn = async function (r, T, arg) {
                    const st = r.state;
                    const S = st.player;
                    const pmesh = st.playerMesh;
                    const pm = pmesh.position;
                    const o = {};
                    const zahlen = (x) => Object.fromEntries(Object.entries(x || {}).filter(([, v]) => typeof v === "number" && Number.isFinite(v)));
                    const steht = () => r._weltSteht() && !r._bepflanzungWartet();
                    // das Warten der Werkbank (`__weltStehtNach`, scripts/lib/welt-boot.cjs:306) mit Frist: Takt um Takt der Seite, bis die Welt steht
                    const warte = async (capMs) => {
                        const t0 = performance.now();
                        const regler = st.perfRegulator;
                        st.perfRegulator = false;
                        let n = 0;
                        try {
                            while (performance.now() - t0 < capMs) {
                                await window.__seitenTakt(n);
                                n++;
                                if (steht()) return { s: +((performance.now() - t0) / 1000).toFixed(2), takte: n, steht: true };
                            }
                        } finally {
                            st.perfRegulator = regler;
                        }
                        return { s: +((performance.now() - t0) / 1000).toFixed(2), takte: n, steht: false };
                    };
                    const J = () => (st.worldJournal && st.worldJournal.entries) || [];
                    const vor = {
                        pos: pm.clone(),
                        modus: r.getGameMode(),
                        hp: S.hp,
                        wunde: S.deathWoundIntensity || 0,
                        gnade: S.respawnGraceUntil,
                        letzt: S.deathLastTick,
                        emo: S.emotions ? { sorrow: S.emotions.sorrow, awe: S.emotions.awe } : null,
                        halt: st.weatherEffectTime,
                        ausdauer: S.stamina,
                        mana: S.mana,
                        stats: zahlen(S.stats),
                        letzte: J()[J().length - 1] || null,
                    };
                    const neu = [];
                    let wagen = null;
                    try {
                        try {
                            // das Gefährt: das nächste fahrbare Werk ≤ 40 m, sonst ein Wagen aus dem Satz des Spielers (spawn_studio)
                            const ab = (a) => Math.hypot(a.position.x - vor.pos.x, a.position.z - vor.pos.z);
                            wagen = st.architectures.filter((a) => a && a.position && a.affordances && a.affordances.moveable && ab(a) <= 40).sort((a, b) => ab(a) - ab(b))[0] || null;
                            o.wagenHer = wagen ? "Welt (" + wagen.type + ")" : null;
                            if (!wagen) {
                                const alt = new Set(st.architectures);
                                st.weatherEffectTime = 0;
                                try {
                                    r.processChatCommand("bau mir einen wagen");
                                } finally {
                                    st.weatherEffectTime = vor.halt;
                                }
                                for (const a of st.architectures) if (!alt.has(a)) neu.push(a);
                                wagen = neu.find((a) => a.affordances && a.affordances.moveable) || null;
                                o.wagenHer = wagen ? "Satz „bau mir einen wagen“ (" + wagen.type + ")" : "keines (" + neu.length + " neue Werke aus „bau mir einen wagen“)";
                            }
                            if (wagen) {
                                const m = r.mountArchitecture(wagen);
                                o.aufgesessen = S.mountedArch === wagen.id ? 1 : 0;
                                if (!o.aufgesessen) o.aufsitzen = (m && m.reason) || "?";
                            }
                            const wp = wagen ? { x: wagen.position.x, z: wagen.position.z } : null;
                            // der Tod im Pfad (frieden und schöpfer verwerfen jeden Schaden, `damagePlayer`), ohne Gnade einer früheren Rückkehr
                            if (vor.modus !== "pfad") r.setGameMode("pfad");
                            S.respawnGraceUntil = -Infinity;
                            const t0 = performance.now();
                            for (let i = 0; i < 6 && !((S.respawnGraceUntil || -Infinity) > st.spielZeit); i++) r.damagePlayer(1000, "probe");
                            o.tot = (S.respawnGraceUntil || -Infinity) > st.spielZeit ? 1 : 0;
                            o.todZeit = S.respawnGraceUntil - AnazhRealm.RESPAWN_GRACE_SEC;
                            o.todMs = +(performance.now() - t0).toFixed(1);
                            const e = J()[J().length - 1];
                            o.journal = e && e !== vor.letzte && e.type === "loss" ? 1 : 0;
                            o.leib = st.playerMesh === pmesh ? 1 : 0;
                            o.ritt = S.mountedArch === null || S.mountedArch === undefined ? false : S.mountedArch;
                            o.wunde = S.deathWoundIntensity;
                            const statsTod = zahlen(S.stats);
                            o.gemindert = Object.keys(vor.stats)
                                .filter((k) => Number.isFinite(statsTod[k]) && statsTod[k] < vor.stats[k] - 1e-9)
                                .map((k) => k + " " + +vor.stats[k].toFixed(3) + "→" + +statsTod[k].toFixed(3));
                            if (o.tot) {
                                // die Rückkehr: bis die Welt am Ankunftsort steht (das Bild trägt den Leib dort)
                                o.rueckkehr = await warte(arg.capRueck);
                                const M = r._genesisMitte();
                                o.anker = M ? +Math.hypot(pm.x - M.x, pm.z - M.z).toFixed(2) : null;
                                o.wegM = +Math.hypot(pm.x - vor.pos.x, pm.z - vor.pos.z).toFixed(1);
                                if (wagen) o.wagen = { da: st.architectures.includes(wagen) ? 1 : 0, d: +Math.hypot(wagen.position.x - wp.x, wagen.position.z - wp.z).toFixed(2), ritt: o.ritt };
                                // die Wunde über die Uhr der Vitals (`tickPlayerVitals`, die Spiel-Uhr) im Raffer zu 10 s, bis sie verheilt ist
                                // (die Lebenszeit der Wunde ab dem Tod in Spiel-Sekunden: die Rückkehr trug schon Takte der Vitals)
                                let t = Math.max(Number.isFinite(S.deathLastTick) ? S.deathLastTick : -Infinity, st.spielZeit);
                                let sek = 0;
                                for (; sek < 1800 && (S.deathWoundIntensity || 0) > 0; sek += 10) r.tickPlayerVitals((t += 10));
                                o.wundeSek = +(t - o.todZeit).toFixed(1);
                                o.wunde_min = o.gemindert.length && !((S.deathWoundIntensity || 0) > 0) ? +(o.wundeSek / 60).toFixed(2) : o.gemindert.length ? 30 : 0;
                            }
                        } finally {
                            // der Leib der Sitzung zurück: Ort, Modus, Lebenswerte, Wunde, Gnade, Gefühl — das Tagebuch behält den Tod
                            if (wagen && S.mountedArch === wagen.id) r.dismountArchitecture();
                            pm.copy(vor.pos);
                            if (st.playerVel && st.playerVel.setValue) st.playerVel.setValue(0, 0, 0);
                            st._fieldVy = 0;
                            if (r.getGameMode() !== vor.modus) r.setGameMode(vor.modus);
                            S.deathWoundIntensity = vor.wunde;
                            S.respawnGraceUntil = vor.gnade;
                            S.deathLastTick = vor.letzt;
                            if (vor.emo && S.emotions) Object.assign(S.emotions, vor.emo);
                            S.stamina = vor.ausdauer;
                            S.mana = vor.mana;
                            r.recomputePlayerStats();
                            S.hp = vor.hp;
                            st.weatherEffectTime = vor.halt;
                        }
                        // zurück an der Pose der Sitzung: die Welt dort steht wieder, das Gefährt steht im Bild, wo er fiel
                        o.zurueck = await warte(arg.capZurueck);
                        if (wagen && o.wagen) o.wagen.bild = st.architectures.includes(wagen) && r._archIsRendered(wagen) ? 1 : 0;
                    } finally {
                        for (const a of neu) if (st.architectures.includes(a)) r.removeArchitecture(a, { still: true });
                    }
                    return o;
                };
                const o = await L.ev("return (" + todFn + ")(r, T, " + JSON.stringify({ capRueck: capRueck * 1000, capZurueck: capZurueck * 1000 }) + ");", capRueck + capZurueck + 15).then(
                    (x) => x,
                    (e) => ({ fehler: String((e && e.message) || e).split("\n")[0].slice(0, 240) })
                );
                L.zeile("tod " + JSON.stringify(o).slice(0, 700));
                // ── S1 · Tod setzt zurück an den Ankunftsort ──
                await L.je(1, async () => {
                    if (o.fehler) throw new Error("der Tod warf: " + o.fehler);
                    const w = o.wagen || {};
                    const R = o.rueckkehr || {};
                    const werte = { rueckkehr_s: R.steht ? R.s : null };
                    const welt = {
                        tod_journal: o.journal || 0,
                        leib_gleich: o.leib || 0,
                        am_anker: Number.isFinite(o.anker) && o.anker <= 2 ? 1 : 0,
                        gefaehrt_bleibt: w.da === 1 && w.d <= 0.5 && w.ritt === false && w.bild === 1 ? 1 : 0,
                    };
                    const taeter = [
                        !o.tot ? "der Leib starb nicht (" + o.todMs + " ms Schaden im Pfad)" : null,
                        o.tot && !R.steht ? "die Welt am Ankunftsort stand nach " + R.s + " s noch nicht (" + R.takte + " Takte)" : null,
                        !o.wagen ? "kein Gefährt: " + o.wagenHer + (o.aufsitzen ? ", Aufsitzen " + o.aufsitzen : "") : null,
                        o.wagen && !welt.gefaehrt_bleibt ? "das Gefährt (" + o.wagenHer + "): " + JSON.stringify(w) : null,
                        !welt.am_anker ? "der Leib steht " + o.anker + " m von der Mitte des Genesis-Orts" : null,
                        "Rückkehr " + R.s + " s über " + o.wegM + " m",
                    ].filter(Boolean);
                    L.gemessen(1, werte, { welt, taeter: taeter.join(" · ") });
                });
                // ── S2 · die Spur am Todesort und die Wunde ──
                await L.je(2, async () => {
                    if (o.fehler) throw new Error("der Tod warf: " + o.fehler);
                    if (!o.tot) throw new Error("kein Tod in der Sitzung — kein Bildpaar am Todesort");
                    L.zeile("tod S2 Wunde " + JSON.stringify({ gemindert: o.gemindert, sek: o.wundeSek, zurueck: o.zurueck }));
                    await L.auge(2, { werte: { wunde_min: o.wunde_min } });
                });
                const zaehlFn = function (r) {
                    const st = r.state;
                    const FC = globalThis.__fachwerkCore;
                    let bew = 0;
                    let sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        if (S.liste) bew += S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function") bew += S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0);
                    }
                    const inv = st.player && Array.isArray(st.player.inventory) ? st.player.inventory.filter(Boolean).length : 0;
                    return { bew, sied, inv };
                };
                const t = await L.ev("return (" + zaehlFn + ")(r);");
                L.zeile("tod Welt " + JSON.stringify(t));
                await L.je(3, async () =>
                    L.leser(3, "Zeugen erzählen den Tod, der Täter steigt im Ruf: kein Bewohner trägt ein Gedächtnis gesehener Taten, kein Ruf eines Täters — der Tod steht nur im Tagebuch (stamm/koerper-seele.js:379 journalAppend „loss“)")
                );
                await L.je(4, async () =>
                    L.leser(4, "der Leib altert nicht: das Alter des Spielers ist ein Wert seiner Gestalt (stamm/koerper-leib.js:55 `alter`), keine Uhr altert ihn, kein Zeitraffer über 40 Jahre (die Welt-Uhr `_weltTag`, stamm/feld-leben.js:2604)")
                );
                await L.je(5, async () =>
                    L.leser(5, "kein Erbe: der Tod kehrt denselben Leib zurück (stamm/koerper-seele.js:355 `_playerDeathRespawn`), kein Kind, kein Gesetz des Erbes — " + t.inv + " Bestände im Inventar bleiben beim selben Leib")
                );
                await L.je(6, async () =>
                    t.bew >= P.sprossen[6].umfang.verlangt
                        ? L.leser(6, "der Ruf reist: kein Ruf des Spielers in der Welt (stamm/koerper-seele.js:355)", t.bew)
                        : L.umfang(6, t.bew, "die Welt trägt " + t.bew + " Bewohner in " + t.sied + " Siedlungen — keine ferne Stadt, keine 10⁶ Bewohner, die den Spieler nie sahen")
                );
                await L.je(7, async () =>
                    L.leser(7, "Tod als Wendepunkt in jeder Epoche, auf jedem Planeten, als jede Art: die Rückkehr kennt nur die Mitte des Genesis-Orts derselben Welt und Zeit (stamm/koerper-seele.js:355, `_genesisAnkunft` stamm/gelaende-boden.js:561); kein Leser der Beschreibung blinder Spieler")
                );
            }); });