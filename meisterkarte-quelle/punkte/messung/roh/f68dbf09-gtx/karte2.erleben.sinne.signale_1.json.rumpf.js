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
H.fahre(async function leiterProbe(H) { /* richter c3a3557b2c */ const PLAN = {"leiter":"erleben.sinne.signale","sprossen":{"1":{"umfang":null,"soll":[{"wort":"anteil_zweite_hand","richtung":"≥","wert":0.7}],"auge":null},"2":{"umfang":null,"soll":[{"wort":"richtungsfehler_grad","richtung":"≤","wert":15}],"auge":null},"3":{"umfang":{"verlangt":20,"einheit":"Saaten"},"soll":[{"wort":"r_aehnlichkeit_distanz","richtung":"≥","wert":0.4}],"auge":null},"4":{"umfang":null,"soll":[{"wort":"generationen","richtung":"≥","wert":1000}],"auge":null},"5":{"umfang":null,"soll":[{"wort":"anteil_vor_ereignis","richtung":"≥","wert":0.6}],"auge":null},"6":{"umfang":null,"soll":[{"wort":"empfaenger_reagieren","richtung":"≥","wert":0.8}],"auge":null}}};
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
})(H, PLAN, async function signaleLauf(H, P, L) {
                // DIE SEITE DER HERDE (im Fenster der Sitzung): Bühne wie kreatur-proben `buehne`, zwei Läufe (Alarm an · aus) am selben Ort
                async function herdeSeite(o) {
                    const s = r.state;
                    const A = r.constructor;
                    const pm = s.playerMesh.position;
                    const P0 = pm.clone();
                    const t0 = performance.now();
                    const altModus = r.getGameMode();
                    const altGefuehl = Object.assign({}, s.player.emotions || {});
                    const altSpieler = Object.assign({}, s.player);
                    const altVel = s.playerVel ? [s.playerVel.x(), s.playerVel.y(), s.playerVel.z()] : null;
                    const tote0 = new Set(s.leichname || []);
                    const zurueck = [
                        leihe(s, { creatures: [], creatureEmotions: [], maxCreatures: 64, creatureAnimationTime: 100, _herdContagionAcc: 0, _creatureNetSeq: 1e6, dayLengthMinutes: A.DAY_LENGTH_DEFAULT_MINUTES, lifeField: undefined, emotionField: undefined, faunaBestand: undefined, feldAkte: [], spielZeit: s.spielZeit, faunaLifecycle: s.faunaLifecycle }),
                        leihe(r, { _creatureAiFrame: 0, _faunaStroeme: null, _spielerLageAlt: null }),
                    ];
                    const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                    const neben = (x, z) => {
                        const h = r.getTerrainHeightAt(x, z);
                        return { x, y: (Number.isFinite(h) ? h : pm.y) + 0.5, z };
                    };
                    const imUmkreisLand = (x, z, R) => {
                        if (r._imGrundriss(x, z)) return false;
                        for (const f of [0.5, 1])
                            for (let q = 0; q < 8; q++) {
                                const a = (q / 8) * 2 * Math.PI;
                                const px = x + Math.cos(a) * R * f, pz = z + Math.sin(a) * R * f;
                                if (!r._landAt(px, pz) || r._imGrundriss(px, pz)) return false;
                            }
                        return true;
                    };
                    const kand = [];
                    const huelleNah = (x, z, h, R) => {
                        kand.length = 0;
                        r._blockerUmPlatz(x, z, R + 8, kand);
                        for (const e of kand)
                            for (const b of e.blockerAABBs || []) {
                                if (b.topY <= h + A.PLAYER_STEP_UP || b.botY >= h + 2) continue;
                                if (r._boxAbstand2(b, x, z) < R * R) return true;
                            }
                        return false;
                    };
                    const frei = (dx, dz, R) => {
                        for (let ring = 0; ring < 40; ring++) {
                            const n = Math.max(1, ring * 6);
                            for (let q = 0; q < n; q++) {
                                const a = (q / n) * 2 * Math.PI;
                                const x = P0.x + dx + Math.cos(a) * ring * 8, z = P0.z + dz + Math.sin(a) * ring * 8;
                                const p = r._landAt(x, z) && imUmkreisLand(x, z, R) && neben(x, z);
                                if (p && !huelleNah(x, z, p.y - 0.5, R)) return p;
                            }
                        }
                        return null;
                    };
                    const takt = (dt) => {
                        r._kreaturStossSchritt(dt);
                        r._leibKontakte();
                        r.updateCreatures(dt);
                    };
                    const weg = () => [...s.creatures].forEach((c) => r.removeCreature(c));
                    try {
                        r.setGameMode("frieden");
                        const heim = frei(0, 70, 40);
                        if (!heim) return { fehler: "kein freies Land für die Herde (40 m ohne Hülle und Wasser)" };
                        const lauf = (alarm) => {
                            weg();
                            Object.assign(s, { _creatureNetSeq: 1e6, creatureAnimationTime: 100 });
                            Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
                            const ab2 = alarm ? [] : [leihe(r, { _kreaturVerbandAlarm: (c, NAT, von, w) => ((c.userData._alarmEigen = w >= NAT.fleeThreshold), w) })];
                            try {
                                const p0 = neben(heim.x - 30, heim.z);
                                pm.set(p0.x, p0.y, p0.z);
                                if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                                const glieder = r._kreaturWurf({ x: heim.x, z: heim.z }, "wesen", "happy", r._faunaRng("verband"), 7) || [];
                                if (!glieder.length) return { fehler: "der Wurf trug kein Glied" };
                                const alt = glieder.map((c) => c.position.clone());
                                const beginn = [];
                                let k = 0, wegM = 0, wand = false;
                                for (; k < o.takte; k++) {
                                    const q = neben(heim.x - 30 + (1.4 * k) / 60, heim.z);
                                    pm.set(q.x, q.y, q.z);
                                    takt(1 / 60);
                                    glieder.forEach((c, i) => {
                                        const d = ab(c.position, alt[i]);
                                        wegM += d;
                                        alt[i].copy(c.position);
                                        if (!beginn[i] && c.userData._motionZustand === "flucht" && d > 1 / 60) beginn[i] = [k, c.userData._alarmEigen === true];
                                    });
                                    if (performance.now() - t0 > o.wandMs) {
                                        wand = true;
                                        break;
                                    }
                                }
                                const B = beginn.filter(Boolean);
                                return { n: glieder.length, laufen: B.length, zweiteHand: B.filter((x) => !x[1]).length, wegM: +wegM.toFixed(1), takte: k, ersterS: B.length ? +(Math.min(...B.map((x) => x[0])) / 60).toFixed(2) : null, letzterS: B.length ? +(Math.max(...B.map((x) => x[0])) / 60).toFixed(2) : null, wand };
                            } finally {
                                ab2.forEach((f) => f());
                            }
                        };
                        const an = lauf(true);
                        if (an.fehler) return { an };
                        const aus = lauf(false);
                        return { an, aus, heim: { x: Math.round(heim.x), z: Math.round(heim.z) }, ms: Math.round(performance.now() - t0) };
                    } finally {
                        weg();
                        for (const c of s.leichname || []) if (!tote0.has(c)) r.removeCreature(c);
                        for (const f of zurueck.reverse()) f();
                        pm.copy(P0);
                        const span = r._voxelChunkConfig().span, pc = s.lastPlayerVoxelChunk;
                        if (pc && (pc.cx !== Math.floor(P0.x / span) || pc.cz !== Math.floor(P0.z / span))) await __weltStehtNach();
                        r.setGameMode(altModus);
                        if (s.player.emotions) Object.assign(s.player.emotions, altGefuehl);
                        for (const k of Object.keys(s.player)) if (!(k in altSpieler)) delete s.player[k];
                        Object.assign(s.player, altSpieler);
                        if (altVel && s.playerVel) s.playerVel.setValue(altVel[0], altVel[1], altVel[2]);
                    }
                }
                const z = await L.ev(
                    "let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && S.plan.slots ? S.plan.slots.length : 0); } const TC = globalThis.__tetrapodaCore || {}; return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, sied, signal: Object.keys(TC).filter((k) => /signal|tanz|marke|gesang|dialekt|mimikry/i.test(k)) };",
                    30
                );
                L.zeile("Zensus Signale: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.signal.length) throw new Error("Leser erschienen (" + z.signal.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                // die billigen Sprossen zuerst (reißt die Frist in der Herde, stehen sie schon in der Ausgabe)
                await L.je(2, async () => (neu(2), L.leser(2, "kein Bienentanz und keine Reviermarke: kein Wesen schreibt Richtung und Entfernung, kein Revier liest eine Marke (tetrapoda-core.js:62 GATTUNGEN, stamm/kreatur-verhalten.js:190 — die Nase liest nur Leiber)")));
                await L.je(3, async () => L.umfang(3, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 20 Saaten verlangt; kein Gesang je Population"));
                await L.je(4, async () => (neu(4), L.leser(4, "kein Lauscher, kein Fälscher: der Räuber wittert nur Leiber (stamm/kreatur-verhalten.js:190), der Tier-Ruf klingt nur im Ohr des Spielers (stamm/klang.js:506 _tierRuf)")));
                await L.je(5, async () => (neu(5), L.leser(5, "kein Bewohner liest ein Signal der Welt vor dem Ereignis: die Flucht der Bewohner folgt dem gesehenen Jäger aus zweiter Hand (stamm/siedlung-bewohner.js:2174), kein Hirte treibt vor dem Wolf ein", z.bew)));
                await L.je(6, async () => (neu(6), L.leser(6, "keine Signale in fremden Kanälen (UV, Entladung, Biolumineszenz): kein Sinnes-Genom von Sender und Empfänger, nur das Menschenbild (stamm/bild-sicht.js:2)")));
                await L.je(1, async () => {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    const wandMs = Math.max(5000, (L.rest() - 12) * 1000);
                    const J = await L.ev("return await (" + herdeSeite + ")(" + JSON.stringify({ takte: 3600, wandMs }) + ");", Math.max(10, L.rest() - 4));
                    L.zeile("Herde Alarm an/aus: " + JSON.stringify(J));
                    if (J.fehler) throw new Error(J.fehler);
                    if (J.an.fehler) throw new Error(J.an.fehler);
                    if (!J.aus || J.aus.fehler) throw new Error("Gegenlauf Alarm aus: " + ((J.aus && J.aus.fehler) || "fehlt"));
                    if (J.an.wand || J.aus.wand) throw new Error("Wand-Deckel der Probe: Lauf " + J.an.takte + " / Gegenlauf " + J.aus.takte + " von 3600 Takten — der Gegenlauf ist unvollständig");
                    const anteil = (t) => (t && t.laufen ? t.zweiteHand / t.laufen : 0);
                    const a = +anteil(J.an).toFixed(3), b = +anteil(J.aus).toFixed(3);
                    L.gemessen(1, { anteil_zweite_hand: J.an.laufen ? a : null }, {
                        welt: { fluechter: J.an.laufen, gegenlauf_pp: Math.round((a - b) * 100) },
                        taeter: "zweite Hand " + J.an.zweiteHand + " von " + J.an.laufen + " Flüchtern (Herde " + J.an.n + ", Flucht ab " + J.an.ersterS + " s bis " + J.an.letzterS + " s; Alarm aus: " + J.aus.zweiteHand + " von " + J.aus.laufen + ") — der Alarm des Verbands (stamm/kreatur-furcht.js:7 _kreaturVerbandAlarm)",
                    });
                });
            }); });