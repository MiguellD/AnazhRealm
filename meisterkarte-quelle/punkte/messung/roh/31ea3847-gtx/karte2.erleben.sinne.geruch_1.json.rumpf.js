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
H.fahre(async function leiterProbe(H) { /* richter 63e89a98c2 */ const PLAN = {"leiter":"erleben.sinne.geruch","sprossen":{"1":{"umfang":null,"soll":[{"wort":"suchzeit_faktor_aus","richtung":"≥","wert":3},{"wort":"suchzeit_faktor_wind","richtung":"≥","wert":3}],"auge":null},"2":{"umfang":null,"soll":[{"wort":"zeit_s","richtung":"≤","wert":90},{"wort":"faktor_nase_aus","richtung":"≥","wert":3}],"auge":null},"3":{"umfang":null,"soll":[{"wort":"intermittenz_abweichung_pct","richtung":"≤","wert":30}],"auge":null},"4":{"umfang":null,"soll":[{"wort":"abweichung_m","richtung":"≤","wert":5}],"auge":null},"5":{"umfang":{"verlangt":10000000,"einheit":"Personen der Megastadt"},"soll":[{"wort":"treffer","richtung":"≥","wert":0.8}],"auge":null},"6":{"umfang":{"verlangt":20,"einheit":"Saaten"},"soll":[{"wort":"trefferquote","richtung":"≥","wert":0.9}],"auge":null}}};
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
})(H, PLAN, async function geruchLauf(H, P, L) {
                // DIE SEITE DER JAGD (im Fenster der Sitzung, r = die Welt): Bühne wie kreatur-proben `buehne` (eigene Tier-Liste, die
                // Welt-Tiere ruhen, Spieler · Modus · Gefühl zurück), drei Läufe an demselben Ort und Wind
                async function jagdSeite(o) {
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
                    const ruhig = (c) => (c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 });
                    const takt = (dt) => {
                        r._kreaturStossSchritt(dt);
                        r._leibKontakte();
                        r.updateCreatures(dt);
                    };
                    const weg = () => [...s.creatures].forEach((c) => r.removeCreature(c));
                    try {
                        r.setGameMode("pfad");
                        const M = frei(0, 70, 30);
                        if (!M) return { fehler: "kein freies Feld (30 m ohne Hülle und Wasser) um den Spieler" };
                        const d = r._windDirAt(s._simZeit);
                        const reh0 = neben(M.x - d.x * o.abstandM * 0.5, M.z - d.z * o.abstandM * 0.5);
                        const wolf0 = neben(M.x + d.x * o.abstandM * 0.5, M.z + d.z * o.abstandM * 0.5);
                        const sp = neben(M.x - d.z * 70, M.z + d.x * 70); // der Spieler quer zum Wind, jenseits der Witterung des Wolfs
                        const dt = 1 / 60;
                        let takteSumme = 0;
                        const lauf = (art, deckelS) => {
                            weg();
                            Object.assign(s, { _creatureNetSeq: 1e6, creatureAnimationTime: 100 });
                            Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
                            const ab2 = [];
                            if (art === "aus") ab2.push(leihe(r, { _scentAt: () => 0 }));
                            if (art === "wind") {
                                const alt = r._windAt;
                                ab2.push(leihe(r, { _windAt: function (x, z, t, aus) { const w = alt.call(this, x, z, t, aus); w.x = -w.x; w.z = -w.z; return w; } }));
                            }
                            try {
                                pm.set(sp.x, sp.y, sp.z);
                                if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                                const wolf = r.spawnCreatureAt(wolf0.x, wolf0.y, wolf0.z, "happy", "wolf", { precise: true, bodySize: 1 });
                                const reh = r.spawnCreatureAt(reh0.x, reh0.y, reh0.z, "happy", "wesen", { precise: true, bodySize: 0.6 });
                                if (!wolf || !reh) return { fehler: "Spawn " + (!wolf ? "wolf" : "wesen") };
                                ruhig(wolf);
                                ruhig(reh);
                                const deckel = Math.ceil(deckelS / dt);
                                const alt = wolf.position.clone();
                                let k = 0, fund = null, witter = null, wegM = 0, minD = ab(wolf.position, reh.position), wand = false;
                                for (; k < deckel; k++) {
                                    if (s.player.emotions) Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 });
                                    takt(dt);
                                    wegM += ab(wolf.position, alt);
                                    alt.copy(wolf.position);
                                    if (witter == null && wolf.userData._beute === reh) witter = (k + 1) * dt;
                                    const dd = s.creatures.includes(reh) ? ab(wolf.position, reh.position) : 0;
                                    minD = Math.min(minD, dd);
                                    if (dd <= o.fundM) {
                                        fund = (k + 1) * dt;
                                        k++;
                                        break;
                                    }
                                    if (performance.now() - t0 > o.wandMs) {
                                        wand = true;
                                        break;
                                    }
                                }
                                takteSumme += k;
                                return { art, fundS: fund, bisS: +(k * dt).toFixed(2), deckelS: +deckelS.toFixed(2), witterS: witter, wegM: +wegM.toFixed(1), minD: +minD.toFixed(1), wand };
                            } finally {
                                ab2.reverse().forEach((f) => f());
                            }
                        };
                        const an = lauf("an", o.deckelS);
                        if (an.fehler || an.fundS == null) return { an, takte: takteSumme, wind: d };
                        const aus = lauf("aus", o.faktor * an.fundS);
                        const wind = lauf("wind", o.faktor * an.fundS);
                        return { an, aus, gedreht: wind, takte: takteSumme, wind: { x: +d.x.toFixed(3), z: +d.z.toFixed(3) }, ms: Math.round(performance.now() - t0) };
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
                    "let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && S.plan.slots ? S.plan.slots.length : 0); } const TC = globalThis.__tetrapodaCore || {}; return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, sied, nase: Object.keys(TC).filter((k) => /geruch|duft|faehrte|pheromon|nase/i.test(k)) };",
                    30
                );
                L.zeile("Zensus Geruch: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.nase.length) throw new Error("Leser erschienen (" + z.nase.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                // die billigen Sprossen zuerst (reißt die Frist im Gegenlauf, stehen sie schon in der Ausgabe)
                await L.je(2, async () => (neu(2), L.leser(2, "der Spieler hat keine Nase: das Geruch-Feld `_scentAt` (stamm/koerper-seele.js:1614) lesen nur die Jagd und das Aas der Tiere (stamm/kreatur-verhalten.js:223, :282), kein Leser des Spielers")));
                await L.je(3, async () => (neu(3), L.leser(3, "keine Fahne mit Turbulenz und Alter: `_scentAt` ist ein Augenblicks-Feld exp(−d/rangeM) × Wind ohne Filamente, Intermittenz und Spur-Gedächtnis (stamm/koerper-seele.js:1614)")));
                await L.je(4, async () => (neu(4), L.leser(4, "keine Duftklassen und keine Fährte: Quellen des Felds sind nur Leiber und Fleisch (stamm/kreatur-verhalten.js:221, :282) — keine Blüte, kein Rauch, kein Mensch, kein Pheromon, keine Spur über eine Stunde")));
                await L.je(5, async () => {
                    if (z.bew < 1e7) return L.umfang(5, z.bew, "die Sitzung trägt " + z.bew + " Bewohner in " + z.sied + " Siedlungen, keine Megastadt mit 10⁷ Personen, und keine Person emittiert Geruch");
                    L.leser(5, "keine Person emittiert Geruch (stamm/kreatur-verhalten.js:221)", z.bew);
                });
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 20 Saaten verlangt; kein Fluss trägt Duft (kein Lachs, kein Pheromon-Netz)"));
                await L.je(1, async () => {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    const wandMs = Math.max(5000, (L.rest() - 12) * 1000);
                    const J = await L.ev("return await (" + jagdSeite + ")(" + JSON.stringify({ abstandM: 40, fundM: 8, deckelS: 90, faktor: 3.2, wandMs }) + ");", Math.max(10, L.rest() - 4));
                    L.zeile("Jagd-Gegenlauf: " + JSON.stringify(J));
                    if (J.fehler) throw new Error(J.fehler);
                    if (J.an.fehler) throw new Error(J.an.fehler);
                    const welt = { weg_wolf_m: J.an.wegM, takte: J.takte };
                    if (J.an.fundS == null)
                        return L.gemessen(1, { suchzeit_faktor_aus: null, suchzeit_faktor_wind: null }, { welt, taeter: "der Wolf fand das Reh MIT Witterung nicht in " + J.an.bisS + " s (nächster Abstand " + J.an.minD + " m" + (J.an.wand ? ", Wand-Deckel" : "") + ") — _creatureScentHuntDir (stamm/kreatur-verhalten.js:190)" });
                    for (const g of [J.aus, J.gedreht]) if (!g || g.fehler) throw new Error("Gegenlauf: " + ((g && g.fehler) || "fehlt"));
                    // die Suchzeit eines Gegenlaufs: gefunden → seine Zeit; am Deckel ohne Fund → mindestens der Deckel (bzw. so weit er lief)
                    const f = (g) => +((g.fundS != null ? g.fundS : g.bisS) / J.an.fundS).toFixed(2);
                    const fa = f(J.aus), fw = f(J.gedreht);
                    const schlecht = fa <= fw ? ["Witterung aus", J.aus, fa] : ["Wind gedreht", J.gedreht, fw];
                    L.gemessen(1, { suchzeit_faktor_aus: fa, suchzeit_faktor_wind: fw }, {
                        welt,
                        taeter: schlecht[0] + ": Suchzeit " + (schlecht[1].fundS != null ? schlecht[1].fundS.toFixed(1) + " s" : "> " + schlecht[1].bisS + " s") + " gegen " + J.an.fundS.toFixed(1) + " s mit Witterung (Faktor " + schlecht[2] + ")" +
                            (schlecht[0] === "Wind gedreht" ? " — gegen den Wind wittert der Wolf mit windMod ≥ minDirectional weiter (stamm/koerper-seele.js:1636), _creatureScentHuntDir wählt jede Witterung > 0 (stamm/kreatur-verhalten.js:224)" : "") +
                            (schlecht[1].wand ? " · Wand-Deckel der Probe" : ""),
                    });
                });
            }); });