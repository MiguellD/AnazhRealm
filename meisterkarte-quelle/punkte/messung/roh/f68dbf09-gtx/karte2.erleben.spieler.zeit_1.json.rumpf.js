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
H.fahre(async function leiterProbe(H) { /* richter 46a3ea4a64 */ const PLAN = {"leiter":"erleben.spieler.zeit","sprossen":{"1":{"umfang":{"verlangt":60,"einheit":"min Tag-Länge (Regler des Spielers, ab 1 min)"},"soll":[{"wort":"sonnenbahn_fehler_grad","richtung":"≤","wert":1}],"auge":null},"2":{"umfang":{"verlangt":10,"einheit":"× Zeitlupe als Verb des Spielers"},"soll":[{"wort":"fallzeit_abweichung_pct","richtung":"≤","wert":5},{"wort":"sprung_px","richtung":"≤","wert":2}],"auge":null},"3":{"umfang":{"verlangt":1000,"einheit":"× Raffer des Tags als Verb des Spielers"},"soll":[{"wort":"feld_abweichung_pct","richtung":"≤","wert":5},{"wort":"bewohner_ort_pct","richtung":"≥","wert":80}],"auge":null},"4":{"umfang":{"verlangt":100000,"einheit":"× Raffer des Jahrs der Welt"},"soll":[{"wort":"laub_bestand_abweichung_pct","richtung":"≤","wert":10}],"auge":null},"5":{"umfang":{"verlangt":100,"einheit":"Jahre, die die Welt in einer Spielstunde ohne Sprung trägt"},"soll":[{"wort":"eiche_kronenform","richtung":"≥","wert":0.7},{"wort":"sukzession","richtung":"≥","wert":0.8}],"auge":null},"6":{"umfang":{"verlangt":10000,"einheit":"Jahre, die die Welt in einer Spielstunde ohne Sprung trägt"},"soll":[{"wort":"stadt_betretbar_s","richtung":"≤","wert":5}],"auge":null},"7":{"umfang":{"verlangt":100000000,"einheit":"Jahre der Zeitachse des Planeten"},"soll":[{"wort":"ego_bild_s","richtung":"≤","wert":5}],"auge":null},"8":{"umfang":{"verlangt":5,"einheit":"Ga Zukunft der Zeitachse des Planeten"},"soll":[{"wort":"halte_im_band","richtung":"≥","wert":6}],"auge":null},"9":{"umfang":{"verlangt":13.8,"einheit":"Ga Zeitachse des Planeten"},"soll":[{"wort":"ankunft_s","richtung":"≤","wert":5},{"wort":"sprung_bild_diff_pct","richtung":"≤","wert":1}],"auge":null}}};
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
})(H, PLAN, async function zeitLauf(H, P, L) {
                const fs = require("fs");
                const path = require("path");
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const z = await L.ev(`
                    const st = r.state;
                    const alt = { tod: st.timeOfDay, phase: st.seasonPhase, season: st.season, auto: st.autoSeason, anker: r._saisonAnker, sonne: st._sonne ? Object.assign({}, st._sonne) : st._sonne };
                    const proben = [];
                    try {
                        for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                            if (!r.setSeason(w)) throw new Error("das Saison-Wort " + w + " gilt nicht");
                            const phase = st.seasonPhase;
                            for (let i = 0; i < 50; i++) {
                                st.timeOfDay = i / 50;
                                const d = r._sonnenRichtung();
                                proben.push([w, phase, i / 50, d.x, d.y, d.z]);
                            }
                        }
                    } finally {
                        st.timeOfDay = alt.tod; st.seasonPhase = alt.phase; st.season = alt.season; st.autoSeason = alt.auto; r._saisonAnker = alt.anker; st._sonne = alt.sonne;
                    }
                    const ops = Object.keys(r.dslEffects || {});
                    const saetze = (r.chatSystemPatterns || []).map((c) => String((c && c.example) || ""));
                    const worte = ops.concat(saetze);
                    const zeitlupe = worte.filter((k) => /zeitlupe|slow|langsam/i.test(k));
                    const raffer = worte.filter((k) => /raffer|time_?scale|zeit_?faktor|zeitfaktor/i.test(k));
                    const anker = await r._planetAnker();
                    const samen = r._planetSamen();
                    await r._fadenQuelle();
                    const achse = [];
                    for (const zeitMa of [-4500, -4000, 1000, 5000]) {
                        try {
                            const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: (anker.breite * 180) / Math.PI, laenge: (anker.laenge * 180) / Math.PI, zeitMa });
                            achse.push({ zeitMa, ok: true, land: !!o.land });
                        } catch (e) {
                            achse.push({ zeitMa, ok: false, grund: String((e && e.message) || e).slice(0, 140) });
                        }
                    }
                    return {
                        proben, breite: anker.breite, samen,
                        tagMin: r.constructor.DAY_LENGTH_MIN_MINUTES, tagMax: r.constructor.DAY_LENGTH_MAX_MINUTES,
                        jahrSek: st.seasonYearSeconds > 0 ? st.seasonYearSeconds : 2400, jahrSekGesetzt: st.seasonYearSeconds,
                        ops: ops.length, saetze: saetze.length, zeitlupe, raffer, achse,
                    };
                `);
                L.zeile("Zeit der Welt: " + JSON.stringify(Object.assign({}, z, { proben: z.proben.length })));
                const zahl = (x, n) => String(+Number(x).toFixed(n == null ? 1 : n)).replace(".", ",");
                // S1 · die Sonnenbahn gegen die Ephemeride der Breite (Meeus: sin h = sin φ sin δ + cos φ cos δ cos H)
                const PC = require(path.resolve("planet-core.js"));
                const K = PC.planetPlan(z.samen, PC.PLANET_ERDE).koerper;
                const RAD = Math.PI / 180;
                const phi = z.breite, eps = K.neigungRad, dreh = K.drehsinn || 1, hem = phi < 0 ? -1 : 1;
                const ephem = (p, t) => {
                    const dl = hem * Math.asin(Math.sin(eps) * Math.sin(2 * Math.PI * p));
                    const Hw = 2 * Math.PI * (t - 0.5) * dreh;
                    return [-Math.cos(dl) * Math.sin(Hw), Math.cos(phi) * Math.sin(dl) - Math.sin(phi) * Math.cos(dl) * Math.cos(Hw), Math.sin(phi) * Math.sin(dl) + Math.cos(phi) * Math.cos(dl) * Math.cos(Hw)];
                };
                const paare = z.proben.map(([w, p, t, x, y, zz]) => ({ w, t, g: [x, y, zz], e: ephem(p, t) })).filter((q) => q.g[1] > 0 || q.e[2] > 0);
                const winkel = (a, b) => Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b))))) / RAD;
                let best = { f: Infinity, psi: 0, m: 1, w: null, t: null };
                const pruefe = (psi, m) => {
                    const c = Math.cos(psi), sn = Math.sin(psi);
                    let f = 0, wo = null;
                    for (const q of paare) {
                        const [E, N, U] = q.e;
                        const a = winkel([E * c - m * N * sn, U, E * sn + m * N * c], q.g);
                        if (a > f) (f = a), (wo = q);
                        if (f >= best.f) return;
                    }
                    best = { f, psi, m, w: wo && wo.w, t: wo && wo.t };
                };
                for (const m of [1, -1]) for (let g = 0; g < 360; g += 1) pruefe(g * RAD, m);
                const grob = best.psi;
                for (let g = -1; g <= 1; g += 0.05) pruefe(grob + g * RAD, best.m);
                L.zeile("Sonnenbahn bei Breite " + zahl(phi / RAD, 2) + "°: Fehler " + zahl(best.f, 2) + "° (" + paare.length + " Proben, Nord " + zahl(best.psi / RAD) + "°, Spiegel " + best.m + ", am größten " + best.w + " t " + best.t + ")");
                // S2 · Zeitlupe: ein Verb des Spielers, das die Zeit dehnt
                await L.je(2, async () => {
                    if (!z.zeitlupe.length) return L.umfang(2, 1, "kein Verb des Spielers dehnt die Zeit: " + z.ops + " DSL-Ops (stamm/feld-dsl.js:926) und " + z.saetze + " Sätze der Konsole (stamm/feld-leben.js:1004) tragen keine Zeitlupe — die Welt läuft im Takt 1×");
                    L.leser(2, "Fallzeit und Sprung je Bild in der Zeitlupe (" + z.zeitlupe.join(", ") + "): kein Leser (scripts/werkbank.cjs:1892)");
                });
                // S3 · der Raffer des Tags: die Tag-Länge des Spielers (1 min je Tag = 1 440×)
                await L.je(3, async () => {
                    const raffer = 86400 / (z.tagMin * 60);
                    if (raffer < P.sprossen[3].umfang.verlangt && !z.raffer.length) return L.umfang(3, raffer, "die kürzeste Tag-Länge des Spielers ist " + z.tagMin + " min (stamm/daten.js:146): Raffer " + zahl(raffer, 0) + "×");
                    L.leser(3, "Zustand nach Raffer ↔ nach Echtzeit-Lauf: kein Leser, der Feld, Wetter und Bewohner-Orte eines gerafften Tags gegen den Echtzeit-Tag hält — der Raffer des Spielers ist die Tag-Länge (`setDayLength`, stamm/bild-himmel.js:2774, " + z.tagMin + " min je Tag)", raffer);
                });
                // S4 · der Raffer des Jahrs: ein Jahr der Welt dauert seasonYearSeconds Spielzeit (stamm/bild-himmel.js:970)
                const jahrRaffer = (365.25 * 86400) / z.jahrSek;
                const jahreJeStunde = 3600 / z.jahrSek;
                await L.je(4, async () => {
                    if (jahrRaffer < P.sprossen[4].umfang.verlangt) return L.umfang(4, jahrRaffer, "ein Jahr der Welt dauert " + z.jahrSek + " s Spielzeit (seasonYearSeconds " + z.jahrSekGesetzt + ", stamm/bild-himmel.js:970): Raffer " + zahl(jahrRaffer, 0) + "×; kein Verb des Spielers rafft das Jahr auf ≤ 5 min");
                    L.leser(4, "Laub-Deckung und Bestand nach Raffer-Jahr gegen den Normal-Lauf: kein Leser (stamm/bild-himmel.js:898 `_tickSeason`)", jahrRaffer);
                });
                const ohneSprung = "eine Spielstunde trägt " + zahl(jahreJeStunde, 2) + " Jahre (ein Jahr = " + z.jahrSek + " s); der Sprung der Konsole nimmt nur ganze Ma (stamm/feld-leben.js:1278)";
                await L.je(5, async () => {
                    if (jahreJeStunde < P.sprossen[5].umfang.verlangt) return L.umfang(5, jahreJeStunde, ohneSprung);
                    L.leser(5, "Häuser-, Bewohner- und Kronen-Kurve über 10² Jahre: kein Leser (stamm/bild-himmel.js:898)", jahreJeStunde);
                });
                await L.je(6, async () => {
                    if (jahreJeStunde < P.sprossen[6].umfang.verlangt) return L.umfang(6, jahreJeStunde, ohneSprung);
                    L.leser(6, "Bildpaar vor/nach über 10⁴ Jahre: kein Leser (stamm/bild-himmel.js:898)", jahreJeStunde);
                });
                // S7–S9 · die Zeitachse des Planeten, gefragt im Planet-Faden
                const ok = z.achse.filter((a) => a.ok).map((a) => a.zeitMa);
                const achseText = "die Zeitachse des Planeten (planet-core im Planet-Faden) antwortet an " + z.achse.map((a) => a.zeitMa + " Ma " + (a.ok ? "ja" : "nein")).join(" · ");
                const minMa = ok.length ? Math.min(...ok) : 0, maxMa = ok.length ? Math.max(...ok) : 0;
                await L.je(7, async () => {
                    const jahre = (maxMa - minMa) * 1e6;
                    if (jahre < P.sprossen[7].umfang.verlangt) return L.umfang(7, jahre, achseText);
                    L.leser(7, "Raffer an Zufallsdatum anhalten: die Zeitachse des Planeten hat keinen Raffer — die Zeit ist ein Sprung der Konsole in ganzen Ma in eine neue Welt (stamm/feld-leben.js:1278 → stamm/netz-portal.js:660); kein Leser der Zeit bis zum Ego-Bild", jahre);
                });
                await L.je(8, async () => {
                    const ga = maxMa / 1000;
                    if (ga < P.sprossen[8].umfang.verlangt) return L.umfang(8, ga, achseText + " — kein Raffer, die Zukunft endet vor +5 Ga, der Anfang nach −4,5 Ga");
                    L.leser(8, "der ungeschnittene Raffer: kein Raffer über die Zeitachse (stamm/feld-leben.js:1278)", ga);
                });
                await L.je(9, async () => {
                    const ga = (maxMa - minMa) / 1000;
                    if (ga < P.sprossen[9].umfang.verlangt) return L.umfang(9, ga, achseText + " — " + zahl(ga, 2) + " Ga, nicht bis zum ersten Licht; der Sprung nimmt nur ganze Ma");
                    L.leser(9, "Sprung an jedes Datum: kein Leser der Ankunft je Datum (stamm/netz-portal.js:660)", ga);
                });
                // S1 · das Bildpaar des Saison-Worts an derselben Pose (sommer · winter · sommer): zuletzt, es kostet drei Schüsse
                await L.je(1, async () => {
                    const kam = await L.ev("r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];");
                    const AU = require(path.resolve("scripts/lib/abnahme-urteil.cjs"));
                    const schuss = async (saison, name) => {
                        const b = await L.wb("/bild", { px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 640, h: 360, wahl: 0, uhr: 0.5, saison, datei: path.join(L.D, P.leiter + "-S1-" + name + ".png") }, 120);
                        return { datei: b.datei, bild: AU.pngLesen(fs.readFileSync(b.datei)) };
                    };
                    const abstand = (a, b) => {
                        if (a.W !== b.W || a.H !== b.H) throw new Error("die Bilder des Paars haben ungleiche Maße");
                        let s = 0;
                        for (let i = 0; i < a.u8.length; i += 4) s += (Math.abs(a.u8[i] - b.u8[i]) + Math.abs(a.u8[i + 1] - b.u8[i + 1]) + Math.abs(a.u8[i + 2] - b.u8[i + 2])) / 3;
                        return s / (a.W * a.H);
                    };
                    const so1 = await schuss("sommer", "sommer");
                    const wi = await schuss("winter", "winter");
                    const so2 = await schuss("sommer", "sommer-wieder");
                    const rauschen = abstand(so1.bild, so2.bild);
                    const saison = abstand(so1.bild, wi.bild);
                    const delta = saison - rauschen;
                    const taeter = [];
                    if (!(best.f <= 1)) taeter.push("die Sonnenbahn kennt weder Breite noch Saison (welt-licht.js:711 `sonnenRichtung`, gelesen über stamm/bild-himmel.js:1383): " + zahl(best.f, 2) + "° gegen die Ephemeride bei " + zahl(phi / RAD, 2) + "° Breite, am größten " + best.w + " t " + best.t);
                    if (!(delta >= 1)) taeter.push("das Saison-Wort winter ändert das Bild um " + zahl(saison, 2) + " Graustufen bei " + zahl(rauschen, 2) + " Rauschen (stamm/bild-himmel.js:963 `setSeason`)");
                    L.gemessen(1, { sonnenbahn_fehler_grad: +best.f.toFixed(3) }, {
                        erzeugt: z.tagMin <= 1 ? z.tagMax : 0,
                        welt: { sonnen_proben: paare.length, saison_bild_delta: +delta.toFixed(3) },
                        taeter: taeter.join(" · ") || null,
                        beleg: { bilder: [so1.datei, wi.datei, so2.datei], saison: +saison.toFixed(3), rauschen: +rauschen.toFixed(3) },
                    });
                });
            }); });