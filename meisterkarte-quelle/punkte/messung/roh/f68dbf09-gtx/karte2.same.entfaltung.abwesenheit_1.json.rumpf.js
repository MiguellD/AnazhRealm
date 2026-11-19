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
abwesenheitTag: async function abwesenheitTag(r, T, o) {
                    const s = r.state, A = r.constructor, pm = s.playerMesh.position;
                    const t0 = performance.now(), zeit = () => performance.now() - t0;
                    const sleep = (ms) => new Promise((f) => setTimeout(f, ms));
                    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
                    const leuteTakt = () => {
                        for (let n = Infinity, still = 0, m; still < 5 && (m = (leute(0), r._weltOffen().leute)); n = m) still = m < n ? 0 : still + 1;
                    };
                    const B = r._bewohnerSiedlungen || new Map();
                    // die Test-Stadt: die Siedlung am Anker der Gründung des Messorts (haushalt.json stadt.gruendung.anker)
                    let key = null, dS = Infinity;
                    for (const [k, X] of B) {
                        const d = Math.hypot(X.ox - o.anker[0], X.oz - o.anker[1]);
                        if (d < dS) [key, dS] = [k, d];
                    }
                    if (key === null || dS > 60) throw new Error("keine Siedlung der Bewohner am Anker " + o.anker.join("/") + " (nächste " + Math.round(dS) + " m)");
                    const Sx = () => (B.get(key) || {}).liste || [];
                    const alleDa = () => Sx().length > 0 && Sx().every((b) => b.leib && !b.ankunft);
                    const wer = (b) => b.rolle + "/" + b.beruf + " #" + b.heim + ":" + b.same;
                    const lagen = () => new Map(Sx().filter((b) => b.leib).map((b) => [wer(b), b.leib.position.clone()]));
                    const warteDa = async (wo) => {
                        while (!alleDa()) {
                            if (zeit() > o.deckelMs)
                                throw new Error(wo + ": " + Sx().filter((b) => b.leib && !b.ankunft).length + " von " + Sx().length + " Bewohnern angekommen nach " + Math.round(zeit() / 1000) + " s");
                            r._tickFoundryIngest();
                            leuteTakt();
                            await sleep(16);
                        }
                    };
                    const P0 = pm.clone(), tag0 = s.timeOfDay, dl0 = s.dayLengthMinutes;
                    const offen = window.__offen || (window.__offen = new Set()), offenNeu = !offen.has("bewohner");
                    // DIE TEST-STADT ALLEIN: die übrigen Siedlungen (stadt-voll liegt 175 m daneben) ruhen im Lauf — Zuschauer und
                    // Abwesenheit rechnen dieselben 118, die Ordnung der Liste kehrt danach zurück
                    const ordnung = [...B];
                    for (const [k] of ordnung) if (k !== key) B.delete(k);
                    offen.add("bewohner");
                    s.dayLengthMinutes = A.DAY_LENGTH_DEFAULT_MINUTES;
                    try {
                        const tagS = A.DAY_LENGTH_DEFAULT_MINUTES * 60, DT = 0.1, takte = Math.round((0.1 / 24) * tagS * 10);
                        for (const h of [o.beginnH + 12, o.beginnH]) (r._uhrSetzen((h % 24) / 24, "regler"), leute(0));
                        await warteDa("die Ankunft vor dem Tag");
                        const n0 = Sx().length, blieb = [];
                        let weg = 0, vor = lagen();
                        for (let i = 1; i <= 240; i++) {
                            for (let k = 0; k < takte; k++) (r._uhrSetzen((s.timeOfDay + DT / tagS) % 1, "uhr"), leute(DT));
                            if (i % 10) continue;
                            const jetzt = lagen();
                            for (const [id, p] of jetzt) if (vor.has(id)) weg += p.distanceTo(vor.get(id));
                            vor = jetzt;
                            if (i % o.jeZehntel === 0) blieb.push([s.timeOfDay * 24, jetzt]);
                            if (zeit() > o.deckelMs) throw new Error("der Tag mit Zuschauer riss nach " + i / 10 + " von 24 Spielstunden in " + Math.round(zeit() / 1000) + " s");
                            await sleep(0);
                        }
                        // FORT: jenseits nearM × fernFaktor vom Ursprung der Siedlung (der Leser `_tickBewohner` misst dort, siedlung-bewohner.js:1588)
                        const S0 = B.get(key), fern = A.AUTO_SETTLEMENT.nearM * A.BEWOHNER.fernFaktor + 80;
                        const [dx, dz] = [P0.x - S0.ox, P0.z - S0.oz], l = Math.hypot(dx, dz);
                        const [ux, uz] = l > 1 ? [dx / l, dz / l] : [1, 0];
                        let n = 0, maxM = 0, fehlt = 0, fort = Infinity, schlecht = "";
                        for (const [stunde, sah] of blieb) {
                            pm.x = S0.ox + ux * fern;
                            pm.z = S0.oz + uz * fern;
                            r._uhrSetzen((((stunde - o.fortH) % 24) + 24) % 24 / 24, "regler");
                            leute(0);
                            fort = Math.min(fort, n0 - Sx().filter((b) => b.leib).length);
                            r._uhrSetzen((stunde % 24) / 24, "regler");
                            pm.copy(P0);
                            await warteDa("die Wiederkehr um " + stunde.toFixed(1) + " Uhr");
                            const kam = lagen();
                            for (const [id, p] of sah) {
                                const q = kam.get(id);
                                if (!q) {
                                    fehlt++;
                                    schlecht = schlecht || id + " fehlt um " + stunde.toFixed(1) + " Uhr";
                                    continue;
                                }
                                const d = q.distanceTo(p);
                                n++;
                                if (d > maxM) [maxM, schlecht] = [d, id + " um " + stunde.toFixed(1) + " Uhr " + d.toFixed(2) + " m neben dem Zuschauer"];
                            }
                        }
                        return { n0, n, maxM, fehlt, fort: Number.isFinite(fort) ? fort : 0, weg: Math.round(weg), pruef: blieb.length, ms: Math.round(zeit()), schlecht, key: String(key) };
                    } finally {
                        pm.copy(P0);
                        B.clear();
                        for (const [k, X] of ordnung) B.set(k, X);
                        r._uhrSetzen(tag0, "regler");
                        s.dayLengthMinutes = dl0;
                        if (offenNeu) offen.delete("bewohner");
                    }
                }
};
H.fahre(async function leiterProbe(H) { /* richter b9276caa60 */ const PLAN = {"leiter":"same.entfaltung.abwesenheit","sprossen":{"1":{"umfang":{"verlangt":118,"einheit":"Bewohner der Test-Stadt"},"soll":[{"wort":"lage_max_m","richtung":"≤","wert":1}],"auge":null},"2":{"umfang":{"verlangt":10000,"einheit":"Wesen (Menschen, Tiere, Wuchs)"},"soll":[{"wort":"statistik_pct","richtung":"≤","wert":5},{"wort":"widersprueche","richtung":"≤","wert":0}],"auge":null},"3":{"umfang":{"verlangt":1000000,"einheit":"Menschen einer Metropole"},"soll":[{"wort":"stichproben","richtung":"≥","wert":100}],"auge":null},"4":{"umfang":{"verlangt":100000000,"einheit":"Menschen eines Kontinents"},"soll":[{"wort":"statistik_pct","richtung":"≤","wert":10},{"wort":"widersprueche","richtung":"≤","wert":0}],"auge":null},"5":{"umfang":{"verlangt":10000000000,"einheit":"Menschen eines Planeten"},"soll":[{"wort":"zipf_exponent","richtung":"≥","wert":0.8},{"wort":"zipf_exponent_max","richtung":"≤","wert":1.2},{"wort":"orte_veraendert_pct","richtung":"≥","wert":50}],"auge":null},"6":{"umfang":{"verlangt":1000000,"einheit":"Jahre Zeitsprung"},"soll":[{"wort":"diff_pct","richtung":"≤","wert":1}],"auge":null},"7":{"umfang":{"verlangt":1000,"einheit":"Besuche an zufälligen (Welt, Ort, Zeit)"},"soll":[{"wort":"widersprueche","richtung":"≤","wert":0},{"wort":"statistik_pct","richtung":"≤","wert":10}],"auge":null}}};
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
})(H, PLAN, async function abwesenheitLauf(H, P, L) {
                // ZUERST DER UMFANG (billig, ohne Ortswechsel): Wesen, Saat, Epoche der Welt der Sitzung
                const w = await L.ev(
                    "let menschen = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; menschen += S.liste ? S.liste.length : S.plan && S.plan.slots ? S.plan.slots.length : 0; }" +
                        " let wuchs = 0; for (const a of r.state.architectures || []) if (a && r._istNatur(a)) wuchs++;" +
                        " const teil = r._gelaende().ort.teil; return { menschen, sied, tiere: (r.state.creatures || []).length, wuchs, saat: r.state.worldMeta && r.state.worldMeta.seed, planet: r._planetSamen(), zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0 };"
                );
                L.zeile("die Welt der Sitzung: " + JSON.stringify(w));
                const wesen = w.menschen + w.tiere + w.wuchs;
                await L.je(2, async () =>
                    wesen >= 1e4
                        ? L.leser(2, "Klassen-Statistik Rückkehr ↔ Zuschauer für Tiere und Wuchs: kein Leser zählt Tiere und Wuchs nach der Abwesenheit gegen den Zuschauer-Lauf — Haken neben der Wiederkehr der Menschen (scripts/lib/kreatur-mensch.cjs:776)", wesen)
                        : L.umfang(2, wesen, "die Welt trägt " + w.menschen + " Menschen, " + w.tiere + " Tiere, " + w.wuchs + " Gewächse")
                );
                await L.je(3, async () => L.umfang(3, w.menschen, "die Welt trägt " + w.menschen + " Menschen in " + w.sied + " Siedlungen — keine Metropole"));
                await L.je(4, async () => L.umfang(4, w.menschen, "die Welt trägt " + w.menschen + " Menschen — kein Kontinent, kein Lauf über 100 Jahre"));
                await L.je(5, async () => L.umfang(5, w.menschen, "die Welt trägt " + w.menschen + " Menschen auf einem Planeten (Samen " + w.planet + ") — keine Stadtgrößen über Jahrhunderte"));
                await L.je(6, async () =>
                    L.umfang(6, 0, "die Welt der Sitzung springt nie in der Epoche: sie steht in zeitMa " + w.zeitMa + " (eine Epoche), der Satz reise wechselt die Welt (stamm/feld-leben.js:1277) — 0 Jahre Zeitsprung")
                );
                await L.je(7, async () => L.umfang(7, new Set([String(w.saat)]).size, "die Sitzung trägt eine Welt (Saat " + w.saat + ") — Besuche an zufälligen Welten verlangen Welten, die Leiter teilt EINE"));
                // S1 · der Tag in der Test-Stadt (der Messort stadt gründet „dorf 7 120“ am Anker der Spec)
                await L.je(1, async () => {
                    await L.ort("stadt", "ego");
                    L.preisPose("stadt", "ego");
                    const rest = H.rest();
                    if (rest < 15) throw new Error("die Frist trägt den Tag nicht mehr: " + Math.round(rest) + " s Rest nach dem Ort");
                    const M = require(require("path").resolve("spec/profiband/haushalt.json")).messorte;
                    const anker = (Array.isArray(M) ? M.find((x) => x.id === "stadt") : M.stadt).gruendung.anker;
                    const o = { deckelMs: Math.round((rest - 8) * 1000), beginnH: 12.5, fortH: 6, jeZehntel: 60, anker };
                    const e = await L.ev("return await (" + H.seite.abwesenheitTag + ")(r, T, " + JSON.stringify(o) + ");", Math.max(10, rest - 3));
                    L.zeile("Abwesenheit: " + JSON.stringify(e));
                    L.gemessen(1, { lage_max_m: e.fehlt ? 1e9 : +e.maxM.toFixed(3) }, {
                        erzeugt: e.n0,
                        welt: { weg_m: e.weg, leiber_fort: e.fort },
                        taeter: (e.fehlt ? e.fehlt + " Lagen fehlen nach der Wiederkehr · " : "") + (e.schlecht || "keiner") + " (" + e.pruef + " Prüf-Stunden, je 6 h fort, " + e.n + " Lagen)",
                        beleg: { siedlung: e.key, ms: e.ms },
                    });
                });
            }); });