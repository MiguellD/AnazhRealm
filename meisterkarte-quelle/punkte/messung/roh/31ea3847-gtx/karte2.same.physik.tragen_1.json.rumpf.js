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
H.fahre(async function leiterProbe(H) { /* richter 2a923edf50 */ const PLAN = {"leiter":"same.physik.tragen","sprossen":{"1":{"umfang":{"verlangt":1,"einheit":"Glied"},"soll":[{"wort":"abw_pct","richtung":"≤","wert":20},{"wort":"abw_halbe_pct","richtung":"≤","wert":20}],"auge":null},"2":{"umfang":{"verlangt":10,"einheit":"Glieder eines Werks unter dem Gesetz"},"soll":[{"wort":"treffer_pct","richtung":"≥","wert":100},{"wort":"liegen_min","richtung":"≥","wert":10}],"auge":null},"3":{"umfang":{"verlangt":1000,"einheit":"m³ des größten Werks unter dem Gesetz"},"soll":[{"wort":"biege_abw_pct","richtung":"≤","wert":20}],"auge":null},"4":{"umfang":{"verlangt":1000,"einheit":"Saaten"},"soll":[{"wort":"stehen_pct","richtung":"≥","wert":100},{"wort":"fallen_halbe_pct","richtung":"≥","wert":10}],"auge":null},"5":{"umfang":{"verlangt":100000,"einheit":"m³ des größten Werks unter dem Gesetz"},"soll":[{"wort":"periode_abw_pct","richtung":"≤","wert":25},{"wort":"kollaps_abw_pct","richtung":"≤","wert":30}],"auge":null},"6":{"umfang":{"verlangt":10000000,"einheit":"m³ der Werke unter dem Gesetz"},"soll":[{"wort":"ems_pct","richtung":"≥","wert":70}],"auge":null},"7":{"umfang":{"verlangt":100,"einheit":"Planeten-Saaten"},"soll":[{"wort":"hoehe_abw_pct","richtung":"≤","wert":30},{"wort":"jury_pct","richtung":"≥","wert":80}],"auge":null}}};
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
})(H, PLAN, async function tragenLauf(H, P, L) {
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
                // die Werke unter dem Gesetz der Statik binnen `nah` (die Wand von `_werkGesetzSetzen`): Zahl, größte Teile-Zahl, Raum (Hülle der Teile × Skala³)
                function zaehlen(r, o) {
                    const s = r.state, bp = s.blueprints || {}, p = s.playerMesh.position;
                    let werke = 0, gesetz = 0, maxTeile = 0, maxTyp = null, maxVol = 0, sumVol = 0, haeuser = 0;
                    for (const e of s.architectures || []) {
                        if (e._frei) continue;
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts) || !b.parts.length || Math.hypot(e.position.x - p.x, e.position.z - p.z) > o.nah) continue;
                        werke++;
                        if (/^haus_/.test(e.type)) haeuser++;
                        if (r._istNatur(e) || r._foundryPresetForEntry(e) || typeof b.studioGestalt === "string" || r._foundryNeedsBookForType(e.type)) continue;
                        gesetz++;
                        let [x0, y0, z0, x1, y1, z1] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
                        for (const t of b.parts) {
                            const a = r._partWorldAABB(t);
                            if (!a) continue;
                            [x0, y0, z0] = [Math.min(x0, a.min.x), Math.min(y0, a.min.y), Math.min(z0, a.min.z)];
                            [x1, y1, z1] = [Math.max(x1, a.max.x), Math.max(y1, a.max.y), Math.max(z1, a.max.z)];
                        }
                        const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
                        const v = x1 > x0 && y1 > y0 && z1 > z0 ? (x1 - x0) * (y1 - y0) * (z1 - z0) * sc * sc * sc : 0;
                        sumVol += v;
                        maxVol = Math.max(maxVol, v);
                        if (b.parts.length > maxTeile) [maxTeile, maxTyp] = [b.parts.length, e.type];
                    }
                    return { werke, gesetz, maxTeile, maxTyp, maxVol: Math.round(maxVol * 10) / 10, sumVol: Math.round(sumVol * 10) / 10, haeuser, saat: s.worldMeta && s.worldMeta.seed };
                }
                // S1 · DIE SÄULE: die Schwelle des Gesetzes über die Dicke der Platte (Bisektion, log), je E und E/2, je zwei Werke in der Welt
                async function saeule(r) {
                    const s = r.state, g = Number.isFinite(s.gravity) ? Math.max(0, -s.gravity) : 9.81;
                    const b = 0.1, Lh = 3;
                    const plan = (d) => ({
                        name: "k2_saeule",
                        label: "k2_saeule",
                        builtIn: false,
                        role: "architecture",
                        roleManual: true,
                        connections: [],
                        parts: [
                            { shape: "box", material: "holz", size: { x: b, y: Lh, z: b }, position: { x: 0, y: Lh / 2, z: 0 } },
                            { shape: "box", material: "stein", size: { x: 2, y: d, z: 2 }, position: { x: 0, y: Lh + d / 2, z: 0 } },
                        ],
                    });
                    const last = (bp) => (r._teilMasse(bp.parts[1]) + r._teilMasse(bp.parts[0]) / 2) * g;
                    const ort = offen(r, 4, 10, 3);
                    if (!ort) return { fehler: "kein offener Grund 4–10 m um den Spieler" };
                    const setze = (d) => {
                        s.blueprints.k2_saeule = plan(d);
                        const e = r.spawnArchitecture("k2_saeule", { x: ort.x, y: ort.g, z: ort.z }, { precise: true, silent: true });
                        const knickt = !!(e && e._gesetz && e._gesetz.sturz && e._gesetz.sturz.grund === "knickt");
                        const steht = !!(e && !e._gesetz);
                        if (e) r.removeArchitecture(e, { still: true });
                        return { knickt, steht };
                    };
                    const schwelle = () => {
                        let [lo, hi] = [1e-4, 2.3];
                        if (!r._failsUnderLoad(plan(hi)).buckles) return { F: null, grund: "knickt nicht unter " + Math.round(last(plan(hi))) + " N" };
                        if (r._failsUnderLoad(plan(lo)).buckles) return { F: last(plan(lo)), grund: "knickt schon unter der dünnsten Platte" };
                        for (let i = 0; i < 48; i++) {
                            const mid = Math.sqrt(lo * hi);
                            if (r._failsUnderLoad(plan(mid)).buckles) hi = mid;
                            else lo = mid;
                        }
                        const ueber = setze(hi * 1.02), unter = setze(lo / 1.02);
                        return { F: last(plan(hi)), d: hi, knick: +ueber.knickt, steht: +unter.steht };
                    };
                    const holz = r._stoff("holz");
                    if (!holz || !(holz.E > 0)) return { fehler: "die Zeile holz trägt kein E" };
                    const euler = (E) => (Math.PI * Math.PI * E * (b ** 4 / 12)) / (Lh * Lh);
                    const eigen = Object.prototype.hasOwnProperty.call(r, "_stoff") ? r._stoff : null;
                    const basis = r._stoff;
                    let voll, halb;
                    try {
                        voll = schwelle();
                        r._stoff = function (n, f) {
                            const zl = basis.call(this, n, f);
                            return n === "holz" && zl ? Object.assign({}, zl, { E: zl.E / 2 }) : zl;
                        };
                        halb = schwelle();
                    } finally {
                        if (eigen) r._stoff = eigen;
                        else delete r._stoff;
                        delete s.blueprints.k2_saeule;
                    }
                    const abw = (F, Fe) => (Number.isFinite(F) && Fe > 0 ? Math.round((10000 * Math.abs(F - Fe)) / Fe) / 100 : null);
                    return {
                        E: holz.E,
                        lambda: Lh / b,
                        F_euler: Math.round(euler(holz.E)),
                        F_voll: voll.F && Math.round(voll.F * 10) / 10,
                        F_halb: halb.F && Math.round(halb.F * 10) / 10,
                        abw_pct: abw(voll.F, euler(holz.E)),
                        abw_halbe_pct: abw(halb.F, euler(holz.E / 2)),
                        knick: (voll.knick || 0) + (halb.knick || 0),
                        steht: (voll.steht || 0) + (halb.steht || 0),
                        frueher: voll.F && halb.F ? halb.F < voll.F : null,
                        grund: [voll.grund, halb.grund].filter(Boolean).join(" · ") || null,
                        knickSicherheit: AnazhRealm.PHYSIS && AnazhRealm.PHYSIS.knickSicherheit,
                    };
                }
                // S2 · DER PFOSTEN: ein zufälliger Pfosten des größten Werks unter dem Gesetz fehlt (der Plan ohne ihn, neben dem Spieler gesetzt);
                // die Erwartung aus dem Bau (Berührung der Hüllen ±2 cm bis zum Grund), nie aus dem Lastpfad des Spiels; dann 10 min Löser
                async function pfosten(r, o) {
                    const s = r.state, A = AnazhRealm, dt = A.FIXED_DT, p = s.playerMesh.position;
                    const e0 = (s.architectures || [])
                        .filter((e) => e.type === o.typ && !e._frei)
                        .sort((a, b) => Math.hypot(a.position.x - p.x, a.position.z - p.z) - Math.hypot(b.position.x - p.x, b.position.z - p.z))[0];
                    const bp = e0 && s.blueprints[o.typ];
                    if (!bp) return { fehler: "das Werk " + o.typ + " steht nicht mehr" };
                    const box = bp.parts.map((t) => r._partWorldAABB(t));
                    const pf = box
                        .map((a, i) => [a, i])
                        .filter(([a]) => a && a.min.y <= 0.05 && a.max.y - a.min.y >= 1.2 * Math.min(a.max.x - a.min.x, a.max.z - a.min.z))
                        .map((x) => x[1]);
                    if (!pf.length) return { fehler: "das Werk " + o.typ + " trägt keinen Pfosten auf dem Grund" };
                    const weg = pf[Math.floor(((Date.now() % 9973) / 9973) * pf.length)];
                    const rest = bp.parts.filter((_, i) => i !== weg).map((t) => JSON.parse(JSON.stringify(t)));
                    const rb = rest.map((t) => r._partWorldAABB(t));
                    const nah = (a, b) => a.min.x <= b.max.x + 0.02 && b.min.x <= a.max.x + 0.02 && a.min.y <= b.max.y + 0.02 && b.min.y <= a.max.y + 0.02 && a.min.z <= b.max.z + 0.02 && b.min.z <= a.max.z + 0.02;
                    const getragen = new Set(rb.map((a, i) => (a && a.min.y <= 0.02 ? i : -1)).filter((i) => i >= 0));
                    for (let wuchs = true; wuchs; ) {
                        wuchs = false;
                        for (let i = 0; i < rb.length; i++)
                            if (rb[i] && !getragen.has(i))
                                for (const j of getragen)
                                    if (nah(rb[i], rb[j])) {
                                        getragen.add(i);
                                        wuchs = true;
                                        break;
                                    }
                    }
                    const maß = (t) => [t.size.x, t.size.y, t.size.z].map((v) => Math.round((v || 0) * 100)).sort((a, b) => a - b).join("x") + ":" + t.material;
                    const erwartet = rest.filter((_, i) => !getragen.has(i)).map(maß).sort();
                    const R = Math.max(1, ...box.filter(Boolean).map((a) => Math.max(Math.abs(a.min.x), Math.abs(a.max.x), Math.abs(a.min.z), Math.abs(a.max.z))));
                    const ort = offen(r, R + 4, R + 20, R + 1);
                    if (!ort) return { fehler: "kein offener Grund für ein Werk mit Radius " + R.toFixed(1) + " m" };
                    const plaene = new Set(Object.keys(s.blueprints));
                    const typ = "k2_ohne_pfosten";
                    s.blueprints[typ] = { name: typ, label: typ, builtIn: false, connections: [], role: r._displayRole(bp), roleManual: true, parts: rest };
                    const vor = new Set(s.architectures);
                    try {
                        r.spawnArchitecture(typ, { x: ort.x, y: ort.g, z: ort.z }, { precise: true, silent: true, seed: 11, rotationY: e0.rotationY || 0 });
                        let t = 0, ruhe = null;
                        for (let i = 0; i < 1200 && ruhe === null; i++) {
                            r._tickWerkGesetz(dt);
                            r._freiSchritt(dt);
                            t += dt;
                            if (i >= 2 && s.architectures.filter((a) => !vor.has(a) && a._frei).every((a) => a._frei.schlaf)) ruhe = t;
                        }
                        const neu = s.architectures.filter((a) => !vor.has(a));
                        const tr = neu.filter((a) => a._frei);
                        const gefallen = tr.map((a) => maß(s.blueprints[a.type].parts[0])).sort();
                        const rw = neu.filter((a) => !a._frei);
                        const restTeile = rw.reduce((q, a) => q + ((s.blueprints[a.type] && s.blueprints[a.type].parts.length) || 0), 0);
                        const rest2 = erwartet.slice();
                        let treffer = 0;
                        for (const g of gefallen) {
                            const i = rest2.indexOf(g);
                            if (i >= 0) {
                                treffer++;
                                rest2.splice(i, 1);
                            }
                        }
                        const nenner = Math.max(erwartet.length, gefallen.length);
                        // ZEHN MINUTEN (36 000 Schritte): je 10 s der weiteste Weg eines Trümmers von seiner Ruhe-Lage; die Wanduhr der Probe
                        // deckelt (`o.budgetMs`) — was sie nicht rechnete, zählt nicht als gelegen
                        const lage0 = tr.map((a) => Array.from(a._frei.p));
                        const t0 = performance.now();
                        let liegen = null;
                        for (let i = 1; i <= 36000 && liegen === null; i++) {
                            r._tickWerkGesetz(dt);
                            r._freiSchritt(dt);
                            if (i % 600 !== 0) continue;
                            if (tr.some((a, k) => !a._frei || Math.hypot(a._frei.p[0] - lage0[k][0], a._frei.p[1] - lage0[k][1], a._frei.p[2] - lage0[k][2]) > 0.01)) liegen = (i - 600) / 3600;
                            else if (i === 36000) liegen = 10;
                            else if (performance.now() - t0 > o.budgetMs) liegen = i / 3600;
                        }
                        return {
                            weg,
                            pfosten: pf.length,
                            erwartet: erwartet.length,
                            gefallen: gefallen.length,
                            treffer_pct: nenner ? Math.round((10000 * treffer) / nenner) / 100 : 100,
                            liegen_min: Math.round(liegen * 100) / 100,
                            ruhe_s: ruhe && Math.round(ruhe * 1000) / 1000,
                            teile_welt: restTeile + tr.length,
                            glieder: bp.parts.length,
                        };
                    } finally {
                        for (const a of s.architectures.filter((x) => !vor.has(x))) r.removeArchitecture(a, { still: true });
                        for (const k of Object.keys(s.blueprints)) if (!plaene.has(k)) delete s.blueprints[k];
                    }
                }
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await ev(zaehlen, { nah: 120 });
                L.zeile("Werke unter dem Gesetz an der Stadt-Pose (120 m): " + JSON.stringify(z));
                const ohneStatik = z.haeuser + " Häuser binnen 120 m sind Studio-Gestalten ohne Statik (stamm/bau-teile.js:2493)";
                await L.je(1, async () => {
                    const f = await ev(saeule, null, Math.max(5, L.rest() - 25));
                    L.zeile("Säule λ 30 gegen Euler: " + JSON.stringify(f));
                    if (f.fehler) throw new Error(f.fehler);
                    L.gemessen(
                        1,
                        { abw_pct: f.abw_pct, abw_halbe_pct: f.abw_halbe_pct },
                        { erzeugt: 1, welt: { knick: f.knick, steht: f.steht }, taeter: "Holzsäule 0,1 × 3 m: versagt bei " + f.F_voll + " N (E/2: " + f.F_halb + " N), Euler " + f.F_euler + " N — knickSicherheit " + f.knickSicherheit + " (stamm/bau-buch.js:2592)" + (f.grund ? " · " + f.grund : "") }
                    );
                });
                await L.je(2, async () => {
                    if (z.maxTeile < P.sprossen[2].umfang.verlangt)
                        return L.umfang(2, z.maxTeile, "das größte Werk unter dem Gesetz binnen 120 m trägt " + z.maxTeile + " Glieder (" + (z.maxTyp || "keines") + ") — " + ohneStatik);
                    const w = await ev(pfosten, { typ: z.maxTyp, budgetMs: Math.max(1000, (L.rest() - 12) * 1000) }, Math.max(5, L.rest() - 5));
                    L.zeile("Pfosten entfernt: " + JSON.stringify(w));
                    if (w.fehler) throw new Error(w.fehler);
                    L.gemessen(2, { treffer_pct: w.treffer_pct, liegen_min: w.liegen_min }, { erzeugt: w.glieder, welt: { teile_welt: w.teile_welt }, taeter: z.maxTyp + " ohne Pfosten " + w.weg + ": erwartet " + w.erwartet + " fallende Teile, gefallen " + w.gefallen });
                });
                await L.je(3, async () => {
                    if (z.maxVol < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.maxVol, "das größte Werk unter dem Gesetz binnen 120 m misst " + z.maxVol + " m³ — " + ohneStatik);
                    L.leser(3, "Durchbiegung: das Gesetz urteilt nur steht · kippt · knickt · schwebt, kein Leser nennt die Biegelinie eines Balkens unter Last (stamm/bau-teile.js:2488 `_werkGesetzSetzen`)", z.maxVol);
                });
                await L.je(4, async () => L.umfang(4, 1, "die Sitzung hält eine Saat (" + z.saat + "); " + z.gesetz + " von " + z.werke + " Werken binnen 120 m stehen unter dem Gesetz — " + ohneStatik));
                await L.je(5, async () => {
                    if (z.maxVol < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.maxVol, "das größte Werk unter dem Gesetz binnen 120 m misst " + z.maxVol + " m³");
                    L.leser(5, "Schwingung der Turmspitze: kein Gesetz schwingt ein Werk im Wind (stamm/bau-teile.js:2563 `_tickWerkGesetz`)", z.maxVol);
                });
                await L.je(6, async () => {
                    if (z.sumVol < P.sprossen[6].umfang.verlangt) return L.umfang(6, z.sumVol, "die Werke unter dem Gesetz binnen 120 m messen zusammen " + z.sumVol + " m³");
                    L.leser(6, "Beben: kein Gesetz bewegt den Grund unter den Werken (stamm/bau-teile.js:2563 `_tickWerkGesetz`)", z.sumVol);
                });
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Planeten-Saat (" + z.saat + ")"));
            }); });