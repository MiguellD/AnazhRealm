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
H.fahre(async function leiterProbe(H) { /* richter fac2fc7971 */ const PLAN = {"leiter":"same.physik.koerper","sprossen":{"1":{"umfang":{"verlangt":1,"einheit":"Körper"},"soll":[{"wort":"ruhe_s","richtung":"≤","wert":2},{"wort":"zittern_cm","richtung":"≤","wert":1},{"wort":"spalt_cm","richtung":"≤","wert":5}],"auge":null},"2":{"umfang":{"verlangt":10,"einheit":"lose Körper der Welt binnen 60 m"},"soll":[{"wort":"durchdringen","richtung":"≤","wert":0},{"wort":"dv_abw_pct","richtung":"≤","wert":10},{"wort":"ruhe_s","richtung":"≤","wert":3}],"auge":null},"3":{"umfang":{"verlangt":100,"einheit":"Teile des größten Werks unter dem Gesetz"},"soll":[{"wort":"truemmer","richtung":"≥","wert":100},{"wort":"lage_cm","richtung":"≤","wert":1}],"auge":null},"4":{"umfang":{"verlangt":1000,"einheit":"lose Körper der Welt binnen 60 m"},"soll":[{"wort":"koerper_fliegen","richtung":"≥","wert":1000},{"wort":"durchdringen","richtung":"≤","wert":0}],"auge":null},"5":{"umfang":{"verlangt":100000,"einheit":"lose Körper der Welt binnen 60 m"},"soll":[{"wort":"kipp_pct","richtung":"≥","wert":95},{"wort":"fehl_pct","richtung":"≤","wert":2}],"auge":null},"6":{"umfang":{"verlangt":1000000,"einheit":"lose Körper der geladenen Welt"},"soll":[{"wort":"lage_cm","richtung":"≤","wert":1}],"auge":null},"7":{"umfang":{"verlangt":1000000000000,"einheit":"lose Körper der geladenen Welt"},"soll":[{"wort":"ursache_pct","richtung":"≥","wert":99}],"auge":null}}};
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
})(H, PLAN, async function koerperLauf(H, P, L) {
                // der offene Grund d0–d1 m um den Spieler: Gesetz und gezeichneter Boden einig (±10 cm), kein Bau binnen `rand`, kein Wasser
                function offen(r, d0, d1, rand) {
                    const s = r.state, A = AnazhRealm, m = s.playerMesh, fuss = m.position.y - A.PLAYER_FOOT_OFFSET, kand = [];
                    for (let k = 0; k < 48; k++) {
                        const d = d0 + ((d1 - d0) * (k >> 3)) / 5, a = (k * Math.PI) / 4 + (k >> 3) * 0.37;
                        const x = m.position.x + d * Math.sin(a), z = m.position.z + d * Math.cos(a);
                        const g = r._koerperBodenUnter(x, fuss + 1, z), b = r._bodenSichtAt(x, z);
                        if (!Number.isFinite(g) || !Number.isFinite(b) || Math.abs(g - b) > 0.1 || Math.abs(g - fuss) > 2 || r._nassAt(x, z)) continue;
                        kand.length = 0;
                        r._blockerNahe(x, z, rand, -Infinity, kand);
                        if (kand.some((e) => (e.blockerAABBs || []).some((bx) => r._boxAbstand2(bx, x, z) <= rand * rand))) continue;
                        return { x, z, g, a };
                    }
                    return null;
                }
                const ev = (f, a, s) => L.ev("const offen = " + offen + ";\nreturn await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 50);
                // DIE ZAHLEN DER WELT, bevor die Probe etwas setzt: lose Körper (nah und geladen), Werke unter dem Gesetz der Statik
                function zaehlen(r, o) {
                    const s = r.state, bp = s.blueprints || {}, p = s.playerMesh.position;
                    let frei = 0, freiNah = 0, werke = 0, gesetz = 0, maxTeile = 0, maxTyp = null;
                    for (const e of s.architectures || []) {
                        const d = Math.hypot(e.position.x - p.x, e.position.z - p.z);
                        if (e._frei) {
                            frei++;
                            if (d <= o.nah) freiNah++;
                            continue;
                        }
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts) || !b.parts.length || d > o.nah) continue;
                        werke++;
                        if (r._istNatur(e) || r._foundryPresetForEntry(e) || typeof b.studioGestalt === "string" || r._foundryNeedsBookForType(e.type)) continue;
                        gesetz++;
                        if (b.parts.length > maxTeile) [maxTeile, maxTyp] = [b.parts.length, e.type];
                    }
                    return { frei, freiNah, werke, gesetz, maxTeile, maxTyp, saat: s.worldMeta && s.worldMeta.seed };
                }
                // S1 · DAS FASS VOM DACH: 4 m über offenem Grund, der Löser im festen Schritt, bis es 1 s schläft (höchstens 15 s)
                async function fassFall(r) {
                    const s = r.state, A = AnazhRealm, F = A.FREI, dt = A.FIXED_DT;
                    const bp = s.blueprints && s.blueprints.fass;
                    if (!s.playerMesh || typeof r._freiSchritt !== "function" || !(bp && bp.frei === true)) return { fehler: "ohne Spieler, Löser (_freiSchritt) oder freien Bauplan fass" };
                    const ort = offen(r, 3, 8, 2);
                    if (!ort) return { fehler: "kein offener Grund 3–8 m um den Spieler (Bau binnen 2 m, Wasser oder Boden-Karte fern vom Gesetz)" };
                    const vor = r._freiImTakt ? r._freiImTakt.size : 0;
                    const e = r.spawnArchitecture("fass", { x: ort.x, y: ort.g + 4.5, z: ort.z }, { precise: true, silent: true, rotationY: 0.3 });
                    const K = e && e._frei;
                    if (!K) {
                        if (e) r.removeArchitecture(e, { still: true });
                        return { fehler: "das Fass trägt keinen freien Körper (_freiKoerperSetzen)" };
                    }
                    const n = r._freiImTakt.size - vor;
                    const tief = () => {
                        let mn = Infinity, j = 1;
                        for (let i = 1; i < K.pw.length; i += 3) if (K.pw[i] < mn) [mn, j] = [K.pw[i], i];
                        return [mn, K.pw[j - 1], K.pw[j + 1]];
                    };
                    try {
                        r._freiLage(K);
                        const y0 = tief()[0];
                        const bahn = [];
                        let t = 0, tLand = null, tSchlaf = null;
                        for (let i = 0; i < 900; i++) {
                            r._freiSchritt(dt);
                            t += dt;
                            bahn.push([t, K.p[0], K.p[1], K.p[2]]);
                            const [mn, lx, lz] = tief();
                            if (tLand === null && mn - r._koerperBodenUnter(lx, mn + 0.5, lz) <= F.spalt) tLand = t;
                            if (K.schlaf && tSchlaf === null) tSchlaf = t;
                            if (tSchlaf !== null && t - tSchlaf >= 1) break;
                        }
                        // das Zittern: der weiteste Abstand der Mitte von ihrer letzten Lage, ab dem Beginn der Ruhe (sonst die letzte Sekunde)
                        const ende = bahn[bahn.length - 1];
                        const ab = tSchlaf !== null ? tSchlaf - F.ruheS : t - 1;
                        let zit = 0;
                        for (const b of bahn) if (b[0] >= ab) zit = Math.max(zit, Math.hypot(b[1] - ende[1], b[2] - ende[2], b[3] - ende[3]));
                        // der Spalt im Bild: je Punkt der Gestalt sein Abstand zum gezeichneten Boden, der nächste zählt (schwebt + / steckt −)
                        let spalt = Infinity, ohne = 0;
                        for (let i = 0; i < K.pw.length; i += 3) {
                            const b = r._bodenSichtAt(K.pw[i], K.pw[i + 2]);
                            if (!Number.isFinite(b)) {
                                ohne++;
                                continue;
                            }
                            spalt = Math.min(spalt, K.pw[i + 1] - b);
                        }
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        return {
                            n,
                            ort: [r3(ort.x), r3(ort.z)],
                            fall_m: r3(y0 - tief()[0]),
                            tLand: r3(tLand),
                            tSchlaf: r3(tSchlaf),
                            ruhe_s: tLand !== null && tSchlaf !== null ? r3(tSchlaf - tLand) : null,
                            zittern_cm: r3(100 * zit),
                            spalt_cm: Number.isFinite(spalt) ? r3(100 * Math.abs(spalt)) : null,
                            spaltRoh_cm: Number.isFinite(spalt) ? r3(100 * spalt) : null,
                            ohneKarte: ohne,
                            masse: r3(K.m),
                            stoff: K.stoff,
                        };
                    } finally {
                        r.removeArchitecture(e, { still: true });
                    }
                }
                // S2 · DER WAGEN IN DIE 10 NÄCHSTEN KÖRPER DER WELT (nur, wenn die Welt sie trägt): der GT rollt mit 20 km/h ohne Gas (`_wagenSchritt`
                // mit Hülle, das EINE Impuls-Gesetz), je Schritt der Impuls der Körper längs der Fahrt vor und nach dem Wagen-Schritt gegen den
                // Impuls, den der Wagen verlor; danach Durchdringen (jeder Punkt in einem anderen Körper > 1 cm) und Ruhe nach dem letzten Stoß
                async function wagenStoss(r, o) {
                    const s = r.state, A = AnazhRealm, dt = A.FIXED_DT, p = s.playerMesh.position;
                    const KS = [...(r._freiImTakt || [])]
                        .map((e) => e._frei)
                        .filter(Boolean)
                        .map((K) => [Math.hypot(K.p[0] - p.x, K.p[2] - p.z), K])
                        .filter((x) => x[0] <= o.nah)
                        .sort((a, b) => a[0] - b[0])
                        .slice(0, o.n)
                        .map((x) => x[1]);
                    if (KS.length < o.n) return { fehler: "nur " + KS.length + " lose Körper binnen " + o.nah + " m" };
                    const G0 = A._fahrSchrittGesetz && A._fahrSchrittGesetz(), vc = G0 && G0.vc;
                    if (!vc || typeof r._wagenSchritt !== "function") return { fehler: "ohne Fahr-Kern oder _wagenSchritt" };
                    if (r._ensureAssetFoundry) r._ensureAssetFoundry();
                    for (let i = 0; i < 200 && !(s.blueprints && s.blueprints.fahrzeug_gt); i++) await new Promise((ok) => setTimeout(ok, 100));
                    if (!(s.blueprints && s.blueprints.fahrzeug_gt)) return { fehler: "der GT ist nicht gebaut (Foundry-Rezept gt binnen 20 s)" };
                    const cx = KS.reduce((q, K) => q + K.p[0], 0) / KS.length, cz = KS.reduce((q, K) => q + K.p[2], 0) / KS.length;
                    const kand = [];
                    let best = null;
                    for (let k = 0; k < 8; k++) {
                        const a = (k * Math.PI) / 4;
                        let hart = 0;
                        for (let t = 4; t <= 14; t += 2) {
                            kand.length = 0;
                            r._blockerNahe(cx - t * Math.sin(a), cz - t * Math.cos(a), 1.5, -Infinity, kand);
                            hart += kand.filter((e) => !e._frei).length;
                        }
                        if (!best || hart < best.hart) best = { a, hart };
                    }
                    const a = best.a, x0 = cx - 14 * Math.sin(a), z0 = cz - 14 * Math.cos(a);
                    const e = r.spawnArchitecture("fahrzeug_gt", { x: x0, y: r.getTerrainHeightAt(x0, z0) + 0.5, z: z0 }, { silent: true, precise: true, rotationY: a - Math.PI / 2 });
                    if (!e) return { fehler: "spawnArchitecture fahrzeug_gt gab nichts" };
                    // die Impulsbilanz ohne Wind am Wagen (wie die Bremsweg-Probe g6): der Wind schöbe die Fahrt zwischen zwei Stößen
                    const wind = Object.prototype.hasOwnProperty.call(r, "_fahrWind") ? r._fahrWind : undefined;
                    r._fahrWind = () => ({ x: 0, z: 0 });
                    try {
                        const G = r._fahrSatz(e, r._vehicleProfile(e));
                        if (!G) return { fehler: "der GT trägt keinen Fahr-Satz (_fahrSatz)" };
                        e._rideYaw = a;
                        const fz = (e._fahr = vc.fahrZustand(x0, z0, a - Math.PI / 2));
                        vc.fahrStand(fz, G, r._fahrBoden(e), 0);
                        fz.vlong = 20 / 3.6;
                        const mW = r._fahrMasse(e, G.m);
                        const [ux, uz] = [Math.sin(a), Math.cos(a)];
                        const impuls = () => KS.reduce((q, K) => q + K.m * (K.v[0] * ux + K.v[2] * uz), 0);
                        let dpW = 0, dpK = 0, kontakte = 0, tLetzt = null, tRuhe = null, t = 0;
                        for (let i = 0; i < 600; i++) {
                            const [q0, v0] = [impuls(), fz.vlong];
                            r._wagenSchritt(e, { throttle: 0, brake: 0, hand: false, steer: 0 }, dt, true, true);
                            const [q1, v1] = [impuls(), fz.vlong];
                            if (Math.abs(q1 - q0) > 1e-9) {
                                kontakte++;
                                dpK += q1 - q0;
                                dpW += mW * (v1 - v0);
                                tLetzt = t;
                            }
                            r._freiSchritt(dt);
                            t += dt;
                            if (tLetzt !== null && t - tLetzt > 0.2 && KS.every((K) => K.schlaf)) {
                                tRuhe = t;
                                break;
                            }
                        }
                        let durch = 0;
                        const aus = {};
                        for (const K of KS) r._freiLage(K);
                        for (const K1 of KS)
                            for (const K2 of KS) {
                                if (K1 === K2) continue;
                                let drin = false;
                                for (let i = 0; i < K1.pw.length && !drin; i += 3) drin = r._freiInnen(K2, K1.pw[i], K1.pw[i + 1], K1.pw[i + 2], 0, aus) && aus.tiefe > 0.01;
                                if (drin) durch++;
                            }
                        return {
                            n: KS.length,
                            kontakte,
                            dv_abw_pct: dpW < 0 ? +((100 * Math.abs(dpK + dpW)) / Math.abs(dpW)).toFixed(2) : null,
                            durchdringen: durch,
                            ruhe_s: tRuhe !== null ? +(tRuhe - tLetzt).toFixed(3) : null,
                            mWagen: +mW.toFixed(1),
                            dpWagen: +dpW.toFixed(2),
                            dpKoerper: +dpK.toFixed(2),
                        };
                    } finally {
                        if (wind === undefined) delete r._fahrWind;
                        else r._fahrWind = wind;
                        r.removeArchitecture(e, { still: true });
                    }
                }
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await ev(zaehlen, { nah: 60 });
                L.zeile("Körper der Welt an der Stadt-Pose: " + JSON.stringify(z));
                await L.je(1, async () => {
                    const f = await ev(fassFall, null, Math.max(5, L.rest() - 20));
                    L.zeile("Fass aus 4 m: " + JSON.stringify(f));
                    if (f.fehler) throw new Error(f.fehler);
                    L.gemessen(
                        1,
                        { ruhe_s: f.ruhe_s, zittern_cm: f.zittern_cm, spalt_cm: f.spalt_cm },
                        { erzeugt: f.n, welt: { fall_m: f.fall_m }, taeter: "Fass (" + f.stoff + ", " + f.masse + " kg) bei " + f.ort.join("/") + ": Aufprall " + f.tLand + " s, Schlaf " + f.tSchlaf + " s, Spalt zum gezeichneten Boden " + f.spaltRoh_cm + " cm" }
                    );
                });
                await L.je(2, async () => {
                    const U = P.sprossen[2].umfang.verlangt;
                    if (z.freiNah < U)
                        return L.umfang(2, z.freiNah, "die Welt trägt " + z.freiNah + " lose Körper binnen 60 m der Stadt-Pose (" + z.frei + " in der geladenen Welt) — die Dinge der Stadt sind keine Körper des Lösers");
                    const w = await ev(wagenStoss, { n: U, nah: 60 }, Math.max(5, L.rest() - 8));
                    L.zeile("Wagen in " + U + " Körper: " + JSON.stringify(w));
                    if (w.fehler) throw new Error(w.fehler);
                    L.gemessen(2, { durchdringen: w.durchdringen, dv_abw_pct: w.dv_abw_pct, ruhe_s: w.ruhe_s }, { erzeugt: w.n, welt: { kontakte: w.kontakte }, taeter: "GT " + w.mWagen + " kg: Δp Wagen " + w.dpWagen + ", Δp Körper " + w.dpKoerper + " kg·m/s" });
                });
                await L.je(3, async () => {
                    const U = P.sprossen[3].umfang.verlangt;
                    if (z.maxTeile < U)
                        return L.umfang(3, z.maxTeile, "das größte Werk unter dem Gesetz der Statik binnen 60 m trägt " + z.maxTeile + " Teile (" + (z.maxTyp || "keines") + "; " + z.gesetz + " von " + z.werke + " Werken unter dem Gesetz) — sein Einsturz gäbe höchstens so viele Trümmer");
                    L.leser(3, "die Lage der Trümmer nach Reload: die Sitzung lädt ohne Welt-Neustart keinen Stand, kein Leser vergleicht den gespeicherten Stand eines Trümmers (`drehung`, `ruht` des Eintrags, stamm/siedlung-satz.js:1442) mit seiner Lage", z.maxTeile);
                });
                await L.je(4, async () => {
                    if (z.freiNah < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.freiNah, "die Gasse der Stadt-Pose trägt " + z.freiNah + " lose Körper binnen 60 m");
                    L.leser(4, "Explosion: kein Gesetz der Druckwelle — das Wort steht nur als Klemme des Gedränges (stamm/kreatur-verhalten.js:525)", z.freiNah);
                });
                await L.je(5, async () => {
                    if (z.freiNah < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.freiNah, "das Viertel der Stadt-Pose trägt " + z.freiNah + " lose Körper binnen 60 m");
                    L.leser(5, "Böe am Körper: der Löser liest kein Wind-Feld, kein Kipp-Moment aus Wind (stamm/koerper-frei.js:421 `_freiSchritt`)", z.freiNah);
                });
                await L.je(6, async () => {
                    if (z.frei < P.sprossen[6].umfang.verlangt) return L.umfang(6, z.frei, "die geladene Welt trägt " + z.frei + " lose Körper");
                    L.leser(6, "Beben: kein Gesetz bewegt den Grund unter den Körpern (stamm/koerper-frei.js:294 `_freiGrund` liest den Grund als ruhende Ebene)", z.frei);
                });
                await L.je(7, async () => L.umfang(7, z.frei, "die geladene Welt trägt " + z.frei + " lose Körper (Saat " + z.saat + ", eine Sitzung, keine Jahrhunderte)"));
            }); });