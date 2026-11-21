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
H.fahre(async function leiterProbe(H) { /* richter 0d33684f7e */ const PLAN = {"leiter":"same.physik.feuer","sprossen":{"1":{"umfang":{"verlangt":1,"einheit":"Zelle"},"soll":[{"wort":"zuendet_trocken","richtung":"≥","wert":1},{"wort":"haelt_nass","richtung":"≥","wert":1},{"wort":"eis_y_cm","richtung":"≤","wert":5}],"auge":null},"2":{"umfang":{"verlangt":2000,"einheit":"brennbare Zellen der Wiese (10⁴ m²)"},"soll":[{"wort":"halt_pct","richtung":"≥","wert":100},{"wort":"frame_p95_ms","richtung":"≤","wert":33}],"auge":null},"3":{"umfang":{"verlangt":1000,"einheit":"m³ des größten Hauses der geladenen Welt"},"soll":[{"wort":"temp_abw_pct","richtung":"≤","wert":20}],"auge":null},"4":{"umfang":{"verlangt":1,"einheit":"km² Laub-Bett im km² um den Spieler"},"soll":[{"wort":"sprung_m","richtung":"≥","wert":20}],"auge":null},"5":{"umfang":{"verlangt":1000,"einheit":"Häuser der geladenen Welt"},"soll":[{"wort":"verhaeltnis","richtung":"≥","wert":5}],"auge":null},"6":{"umfang":{"verlangt":1000000,"einheit":"Häuser der geladenen Welt"},"soll":[{"wort":"wind_faktor","richtung":"≥","wert":2}],"auge":null},"7":{"umfang":{"verlangt":1000000000,"einheit":"m² Gelände in den Chunks der Sitzung"},"soll":[{"wort":"flaeche_abw_pct","richtung":"≤","wert":30}],"auge":null},"8":{"umfang":{"verlangt":100,"einheit":"Planeten-Saaten"},"soll":[{"wort":"phase_pct","richtung":"≥","wert":95}],"auge":null}}};
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
})(H, PLAN, async function feuerLauf(H, P, L) {
                const ev = (f, a, s) => L.ev("return await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 50);
                // S1 · FACKEL AN TROCKENES / NASSES GRAS, EIS TRÄGT
                async function brandEis(r) {
                    const s = r.state, A = AnazhRealm, cs = A.LIFE_FIELD.cell, m = s.playerMesh, p = m.position;
                    if (typeof window.__wetterSetzen !== "function") return { fehler: "window.__wetterSetzen fehlt in der Seite (scripts/lib/ausgabe-aufnahme.cjs:1880)" };
                    const wort0 = s.weather, naesse0 = s.naesse;
                    const saison0 = { season: s.season, phase: s.seasonPhase, anker: r._saisonAnker, auto: s.autoSeason };
                    const bf = s.brandFeld || (s.brandFeld = new Map());
                    // das Feld vor der Probe (die Ankunft einer Nachbarin eines alten Brands schreibt `_brandZuenden` um): danach wie vorher
                    const schnapp = () => new Map([...bf].map(([k, v]) => [k, Object.assign({}, v)]));
                    const loesche = (vorher) => {
                        for (const k of [...bf.keys()]) if (!vorher.has(k)) bf.delete(k);
                        for (const [k, v] of vorher) Object.assign(bf.get(k), v);
                        if (!bf.size) [r._brandBett, r._brandRest] = [null, null];
                    };
                    // der Akt der Fackel (`_brandEntfachen` → `_feldAkt` → `_feldAktWirkt`) wirkt das EINE Fangen `_brandFangen`; die Probe
                    // ruft es selbst — ein Akt in der Reihe des Felds (`_feldFolgeSteht` falsch) brennte die Wiese nach der Probe ab
                    const fange = (c, k) => r._brandFangen((c + 0.5) * cs, (k + 0.5) * cs, null);
                    const wetter = (w) => {
                        if (window.__wetterSetzen(w) !== w) throw new Error("das Wetter gilt nicht: " + w);
                        r._naesseTakt(1e6);
                    };
                    const aus = {};
                    const vor = m.position.clone();
                    try {
                        wetter("sunny");
                        // die Gras-Zellen um den Spieler (zwei Ringe), die trocken ein Tempo tragen
                        const gras = [];
                        const [c0, k0] = [Math.floor(p.x / cs), Math.floor(p.z / cs)];
                        for (let dx = -2; dx <= 2; dx++)
                            for (let dz = -2; dz <= 2; dz++) {
                                const f = r._brandStoff(c0 + dx, k0 + dz);
                                if (f && f.zeile && f.zeile.name === "gras" && !bf.has(c0 + dx + "," + (k0 + dz))) gras.push([c0 + dx, k0 + dz, Math.abs(dx) + Math.abs(dz)]);
                            }
                        gras.sort((a, b) => a[2] - b[2]);
                        aus.grasZellen = gras.length;
                        if (gras.length < 2) return Object.assign(aus, { fehler: "nur " + gras.length + " Gras-Zellen des Brand-Felds binnen 2 Ringen" });
                        const vorher = schnapp();
                        const z1 = fange(gras[0][0], gras[0][1]);
                        aus.feld_neu = bf.size - vorher.size;
                        aus.zuendet_trocken = z1 && z1.t0 !== null && z1.R > 0 ? 1 : 0;
                        aus.trockenR = z1 ? Math.round(z1.R * 1000) / 1000 : null;
                        loesche(vorher);
                        wetter("rainy");
                        aus.naesse = s.naesse;
                        const vorher2 = schnapp();
                        const z2 = fange(gras[1][0], gras[1][1]);
                        aus.haelt_nass = z2 ? 0 : 1;
                        loesche(vorher2);
                        wetter(wort0 || "sunny");
                        // das Eis im Winter: der nächste tragende Spiegel binnen 150 m, der Spieler im Sim-Schritt darauf (höchstens 3 s)
                        if (!r.setSeason("winter")) return Object.assign(aus, { fehler: "setSeason winter gilt nicht" });
                        let E = null;
                        for (let d = 0; d <= 150 && !E; d += 6)
                            for (let k = 0; k < Math.max(1, Math.round(d / 3)) && !E; k++) {
                                const a = (2 * Math.PI * k) / Math.max(1, Math.round(d / 3)), x = p.x + d * Math.sin(a), z = p.z + d * Math.cos(a);
                                const y = r._eisAt(x, z, NaN, Infinity);
                                if (y !== null && Number.isFinite(y)) E = { x, z, y };
                            }
                        if (!E) return Object.assign(aus, { eis_y_cm: null, eisGrund: "kein tragendes Eis binnen 150 m im Winter" });
                        const fuss = A.PLAYER_FOOT_OFFSET, dt = A.FIXED_DT;
                        // der Leib 1 m über dem Eis, der Sim-Schritt trägt ihn (das Muster der Gang-Probe g5: Lage, Fall, Interpolation)
                        m.position.set(E.x, E.y + 1 + fuss, E.z);
                        s.playerVel.setValue(0, 0, 0);
                        s._fieldVy = 0;
                        if (s._fixedSimPos) s._fixedSimPos.copy(m.position);
                        let t = Number.isFinite(s._fixedSimTime) ? s._fixedSimTime : 0, still = 0, y0 = m.position.y;
                        for (let i = 0; i < 180 && still < 20; i++) {
                            r._stepFixedSim((t += dt), dt);
                            still = Math.abs(m.position.y - y0) < 1e-4 ? still + 1 : 0;
                            y0 = m.position.y;
                        }
                        aus.eis = [Math.round(E.x * 10) / 10, Math.round(E.z * 10) / 10, Math.round(E.y * 1000) / 1000];
                        aus.fuss = Math.round((m.position.y - fuss) * 1000) / 1000;
                        aus.eis_y_cm = Math.round(100 * Math.abs(m.position.y - fuss - E.y) * 100) / 100;
                        return aus;
                    } finally {
                        m.position.copy(vor);
                        if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        s._fieldVy = 0;
                        if (s._fixedSimPos) s._fixedSimPos.copy(vor);
                        [s.season, s.seasonPhase, r._saisonAnker, s.autoSeason] = [saison0.season, saison0.phase, saison0.anker, saison0.auto];
                        if (s.weather !== wort0 && wort0) window.__wetterSetzen(wort0);
                        s.naesse = naesse0;
                    }
                }
                // die Zahlen der Welt für S2–S8
                function zaehlen(r) {
                    const s = r.state, A = AnazhRealm, cs = A.LIFE_FIELD.cell, p = s.playerMesh.position, bp = s.blueprints || {};
                    // die Wiese 10⁴ m² (100 × 100 m um den Spieler): ihre brennbaren Zellen
                    const [c0, k0] = [Math.floor((p.x - 50) / cs), Math.floor((p.z - 50) / cs)], [c1, k1] = [Math.floor((p.x + 50) / cs), Math.floor((p.z + 50) / cs)];
                    let wiese = 0;
                    for (let c = c0; c <= c1; c++) for (let k = k0; k <= k1; k++) if (r._brandStoff(c, k)) wiese++;
                    // der km² um den Spieler: Anteil der Zellen mit Laub-Bett (jede 4. Zelle, 64 m)
                    let laub = 0, n = 0;
                    for (let x = -500; x < 500; x += 64)
                        for (let z = -500; z < 500; z += 64) {
                            const f = r._brandStoff(Math.floor((p.x + x) / cs), Math.floor((p.z + z) / cs));
                            n++;
                            if (f && f.zeile && f.zeile.name === "laub") laub++;
                        }
                    let haeuser = 0, maxHaus = 0;
                    for (const e of s.architectures || []) {
                        if (!/^haus_/.test(e.type)) continue;
                        haeuser++;
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts)) continue;
                        let [x0, y0, z0, x1, y1, z1] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
                        for (const t of b.parts) {
                            const a = r._partWorldAABB(t);
                            if (!a) continue;
                            [x0, y0, z0] = [Math.min(x0, a.min.x), Math.min(y0, a.min.y), Math.min(z0, a.min.z)];
                            [x1, y1, z1] = [Math.max(x1, a.max.x), Math.max(y1, a.max.y), Math.max(z1, a.max.z)];
                        }
                        const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
                        if (x1 > x0) maxHaus = Math.max(maxHaus, (x1 - x0) * (y1 - y0) * (z1 - z0) * sc * sc * sc);
                    }
                    const span = r._voxelChunkConfig(0).span;
                    const chunks = s.voxelChunks ? s.voxelChunks.size : 0;
                    return { zelle: cs, wiese, laubKm2: n ? Math.round((1000 * laub) / n) / 1000 : 0, haeuser, maxHaus: Math.round(maxHaus), flaeche: Math.round(chunks * span * span), chunks, saat: s.worldMeta && s.worldMeta.seed };
                }
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                await L.je(1, async () => {
                    const f = await ev(brandEis, null, Math.max(5, L.rest() - 15));
                    L.zeile("Fackel trocken / nass, Eis: " + JSON.stringify(f));
                    if (f.fehler) throw new Error(f.fehler);
                    L.gemessen(
                        1,
                        { zuendet_trocken: f.zuendet_trocken, haelt_nass: f.haelt_nass, eis_y_cm: f.eis_y_cm },
                        { erzeugt: f.zuendet_trocken, welt: { feld_neu: f.feld_neu }, taeter: (f.eisGrund ? f.eisGrund : "Fuß " + f.fuss + " m auf dem Eis " + JSON.stringify(f.eis)) + " · trocken R " + f.trockenR + " m/s · Nässe im Regen " + f.naesse }
                    );
                });
                const z = await ev(zaehlen, null, 50);
                L.zeile("Brand-Feld und Häuser der Welt: " + JSON.stringify(z));
                const nurVegetation = "das Brand-Feld brennt nur Betten der Zeilen gras und laub (stamm/feld-brand.js:214 `_brandStoff`)";
                await L.je(2, async () => {
                    if (z.wiese < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.wiese, "die Wiese 100 × 100 m trägt " + z.wiese + " brennbare Zellen zu " + z.zelle + " m (AnazhRealm.LIFE_FIELD.cell, stamm/feld-leben.js:3078)");
                    L.leser(2, "Halt und Front je Probe: kein Leser nennt die Front-Proben eines Brands (stamm/feld-brand.js:374 `_brandZuenden`)", z.wiese);
                });
                await L.je(3, async () => {
                    if (z.maxHaus < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.maxHaus, "das größte Haus der geladenen Welt misst " + z.maxHaus + " m³ (" + z.haeuser + " Häuser)");
                    L.leser(3, "Raumbrand: kein Gesetz brennt einen Raum, keine Raum-Temperatur — " + nurVegetation, z.maxHaus);
                });
                await L.je(4, async () => {
                    if (z.laubKm2 < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.laubKm2, "der km² um den Spieler trägt " + z.laubKm2 + " km² Laub-Bett (Stichprobe je 64 m)");
                    L.leser(4, "Funkenflug: die Front geht nur an die Nachbar-Zellen (stamm/feld-brand.js:374 `_brandZuenden`, BRAND.nachbarn), kein Funke springt einen Fluss", z.laubKm2);
                });
                await L.je(5, async () => {
                    if (z.haeuser < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.haeuser, "die geladene Welt trägt " + z.haeuser + " Häuser");
                    L.leser(5, "Holz- gegen Steinstadt: kein Haus brennt — " + nurVegetation, z.haeuser);
                });
                await L.je(6, async () => L.umfang(6, z.haeuser, "die geladene Welt trägt " + z.haeuser + " Häuser"));
                await L.je(7, async () => L.umfang(7, z.flaeche, "die Sitzung hält " + z.chunks + " Chunks Gelände (" + z.flaeche + " m²)"));
                await L.je(8, async () => L.umfang(8, 1, "die Sitzung hält eine Planeten-Saat (" + z.saat + ")"));
            }); });