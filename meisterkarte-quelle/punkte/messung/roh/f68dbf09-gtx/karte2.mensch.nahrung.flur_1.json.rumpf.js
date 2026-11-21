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
K: function k2Werkzeug(H, SPEC) {
    const K = { H, SPEC, sicht: "ego" };
    const j = (K.j = H.teil = { leiter: SPEC.leiter, adapter: null, sprossen: {} });
    // DER ADAPTER DER SITZUNG: die Welt nennt ihn in ihrem Log (PUNKTE_SITZUNG_LOG) — Zeile der Probe und Feld des JSON
    K.adapter = () => {
        let z = null;
        try {
            const t = H.fs.readFileSync(String(process.env.PUNKTE_SITZUNG_LOG || ""), "utf8");
            z = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
        } catch (_e) {}
        j.adapter = z || "[linse-gpu] ungenannt";
        console.log(j.adapter);
        return j.adapter;
    };
    // ein Funktionsrumpf in der Seite der Welt (r = Welt, T = THREE)
    K.welt = (code, ms) => H.evalWelt(code, ms || 30000);
    // DER MESSORT (spec/profiband/haushalt.json `messorte`): der Aufruf im Text heißt `K.messort("<ort>")` — so liest die Sitzung den Ort
    // und stellt VOR dem Deckel um (punkte.cjs probeOrt); die Sicht vorher über K.sicht ("ego" | "third")
    K.messort = async (ort) => {
        const a = await H.wb("/umstellen", { ort, sicht: K.sicht }, 120000);
        if (!a || a.fehler) throw H.messort(new Error("/umstellen " + ort + ": " + ((a && a.fehler) || "ohne Antwort")), "/umstellen");
        H.zeile("am Messort " + ort + " (" + K.sicht + ")");
        return a;
    };
    K.warte = (ms) => H.schlaf(ms);
    // JE SPROSSE EIN SCHRITT: ein Wurf ist keine Messung (die Sprosse bleibt ohne Ergebnis → UNGEMESSEN beim Namen), ein Wurf des
    // Messorts endet die Probe (die Marke MESSORT); an der Frist bleibt die Sprosse ungemessen, nie geraten
    K.schritt = async (n, f) => {
        if (H.rest() < 2) {
            H.zeile("S" + n + " an der Frist ausgelassen (" + H.sek() + " s)");
            return null;
        }
        try {
            return await f();
        } catch (e) {
            if (e && e.messort) throw e;
            const t = String((e && e.message) || e).split("\n")[0].slice(0, 300);
            H.zeile("S" + n + " warf: " + t);
            j.sprossen[n] = { art: "fehler", text: t };
            return null;
        }
    };
    const kurz = (t) => String(t == null ? "" : t).slice(0, 300);
    K.zahl = (n, o) =>
        (j.sprossen[n] = { art: "zahl", n: o.n, werte: o.werte || {}, ...(o.beleg ? { beleg: kurz(o.beleg) } : {}), ...(o.taeter ? { taeter: kurz(o.taeter) } : {}) });
    K.nicht = (n, o) => (j.sprossen[n] = { art: "nicht", n: o.n, fehlt: kurz(o.fehlt) });
    K.leser = (n, o) => (j.sprossen[n] = { art: "leser", fehlt: kurz(o.fehlt), wo: kurz(o.wo), ...(o.n != null ? { n: o.n } : {}) });
    K.auge = (n, o) => (j.sprossen[n] = { art: "auge", bild: o.bild, pose: kurz(o.pose), vorbild: kurz(o.vorbild || (SPEC.sprossen[n] && SPEC.sprossen[n].auge && SPEC.sprossen[n].auge.vorbild)), ...(o.mass ? { mass: kurz(o.mass) } : {}) });
    // DAS BILD EINER AUGEN-SPROSSE: der Ausgabe-Pfad der Spiel-Kamera (werkbank /bild) an fester Pose { px, py, pz, lx, ly, lz },
    // abgelegt neben der Ausgabe der Probe (<AUS>-S<n>.png; die Abnahme der Werkbank legt ein ROT-Bild als -rot.png daneben)
    K.bild = async (n, pose, mehr) => {
        const datei = String(H.AUS).replace(/\.json$/i, "") + "-S" + n + ".png";
        let a = null;
        try {
            a = await H.wb("/bild", Object.assign({ datei, w: 1280, h: 720 }, pose, mehr || {}), 90000);
        } catch (e) {
            a = { fehler: String((e && e.message) || e) };
        }
        const da = [a && a.datei, datei, datei.replace(/\.png$/i, "-rot.png")].find((f) => f && H.fs.existsSync(f));
        if (!da) throw new Error("kein Bild S" + n + ": " + kurz(a && (a.fehler || a.abnahme)));
        return { datei: da, abnahme: kurz(a && (a.abnahme || a.fehler)) };
    };
    K.ende = () => j;
    return K;
},
SPEC: {"leiter":"mensch.nahrung.flur","sprossen":{"1":{"umfang":{"soll":1,"wort":"gemalte Äcker am Feldweg-Ende"},"masse":[{"key":"imBild","wort":"Äcker als Fläche im Bild am Dorfrand","soll":1,"richtung":"≥"}]},"2":{"auge":{"pose":"Luftbild 150 m über der Mitte des Dorfs, 80 m südlich","vorbild":"die reale Flur eines Dorfs ≈ 1 km² (Gewannflur Mitteleuropa, Luftbild/Kataster): Feldgrößen-Verteilung KS ≤ 0,25, Blindurteil ≤ 65 %"}},"3":{"auge":{"pose":"Luftbild 150 m über der Mitte des Dorfs","vorbild":"20 Satellitenbilder realer Agrarlandschaft (10² km², 10³ Parzellen) an 8 Saaten, Blindurteil ≤ 65 %"}},"4":{"umfang":{"soll":16,"wort":"Saaten je Region 10⁴ km²"},"masse":[{"key":"r","wort":"Acker/Weide/Wald über Abstand (r)","soll":0.8,"richtung":"≥"},{"key":"anteil","wort":"Saaten mit r ≥ 0,8","soll":0.8,"richtung":"≥"}]},"5":{"umfang":{"soll":1000000,"wort":"km² Kontinent"},"masse":[{"key":"fao","wort":"Abweichung Nutzfläche je Klimazone gegen FAO","soll":0.25,"richtung":"≤"}]},"6":{"auge":{"pose":"100 Zufallslandungen, Ego 1,7 m","vorbild":"Fotos realer Kulturlandschaft je Landungsort: plausibel ≥ 90 %"}},"7":{"auge":{"pose":"Luftbild je Welt, 150 m","vorbild":"Panel „bewirtschaftet“ ≥ 70 % an 64 Welten, Lagerente (Thünen) r ≥ 0,7"}}}},
ZENSUS: async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const offen = () => {
        const o = typeof r._weltOffen === "function" ? r._weltOffen() : {};
        return !o.leute && !o.leiber;
    };
    const alle = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan);
    await window.__gebautNach("die Siedlung am Messort (Zensus nahrung)", {
        fertig: () => alle().some((S) => Array.isArray(S.liste) && S.liste.length > 0) && offen(),
    });
    const SL = alle().sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    if (!SL.length) throw new Error("keine Siedlung mit Plan am Messort");
    const plus = (o, k) => (o[k] = (o[k] || 0) + 1);
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return a.acker || 0;
    };
    const Z = {
        siedlungen: SL.length, bewohner: 0, berufe: {}, rollen: {}, slotRollen: {}, haeuser: 0, wagen: 0, fahrer: 0, staende: 0,
        maerkte: 0, feldwege: 0, felder: [], jahre: [], feld10: 0, mahl: 0, mahlMitte: null, garten: null, kreaturen: 0, zahm: 0,
        jaeger: 0, hirten: 0, spieler: { x: pm.x, z: pm.z }, nah: { ox: SL[0].ox, oz: SL[0].oz, name: SL[0].plan.name || null },
    };
    let mx = 0;
    let mz = 0;
    for (const S of SL) {
        const P = S.plan;
        if (Number.isFinite(P.jahr)) Z.jahre.push(P.jahr);
        for (const sl of P.slots || []) {
            Z.haeuser++;
            const ro = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            plus(Z.slotRollen, ro);
            if (!Z.garten && /garten|gewaechs|glas|treib|farm/i.test(ro)) Z.garten = { x: S.ox + sl.x, z: S.oz + sl.z, rolle: ro };
        }
        for (const b of Array.isArray(S.liste) ? S.liste : []) {
            Z.bewohner++;
            const wer = String(b.beruf) + " " + String(b.rolle);
            plus(Z.berufe, String(b.beruf));
            plus(Z.rollen, String(b.rolle));
            if (/jag|fisch|hirt/i.test(wer)) Z.jaeger++;
            if (/hirt/i.test(wer)) Z.hirten++;
            if (b.wagen) Z.fahrer++;
            const z10 = r._bewohnerSoll(b, 10);
            const z12 = r._bewohnerSoll(b, 12.5);
            if (b.beruf === "feld" && z10 && !z10.drinnen && z10.ziel) Z.feld10++;
            if (z12 && z12.akt === "mittag" && !z12.drinnen && z12.ziel) {
                Z.mahl++;
                mx += z12.ziel.x;
                mz += z12.ziel.z;
            }
        }
        Z.wagen += S.verkehr && Array.isArray(S.verkehr.wagen) ? S.verkehr.wagen.length : 0;
        const st = (P.staende || []).length;
        Z.staende += st;
        if (st > 0) Z.maerkte++;
        Z.feldwege += (P.feldwege || []).length;
        for (const fd of P.felder || []) {
            if (!fd || !Number.isFinite(fd.cx) || !Number.isFinite(fd.ex)) continue;
            const x = S.ox + fd.cx;
            const z = S.oz + fd.cz;
            const c = Math.cos(fd.phi || 0);
            const sn = Math.sin(fd.phi || 0);
            const pt = (u, v) => [x + u * c - v * sn, z + u * sn + v * c];
            let i = 0, ni = 0, a = 0, na = 0;
            for (let p = -2; p <= 2; p++)
                for (let q = -2; q <= 2; q++) {
                    const w = pt((p / 2.5) * fd.ex, (q / 2.5) * fd.ez);
                    ni++;
                    if (acker(w[0], w[1]) >= 0.5) i++;
                }
            for (const t of [-1, -0.5, 0, 0.5, 1])
                for (const uv of [[fd.ex + 2.5, t * fd.ez], [-(fd.ex + 2.5), t * fd.ez], [t * fd.ex, fd.ez + 2.5], [t * fd.ex, -(fd.ez + 2.5)]]) {
                    const w = pt(uv[0], uv[1]);
                    na++;
                    if (acker(w[0], w[1]) >= 0.5) a++;
                }
            Z.felder.push({ x: +x.toFixed(2), z: +z.toFixed(2), phi: fd.phi || 0, ex: fd.ex, ez: fd.ez, m2: +(4 * fd.ex * fd.ez).toFixed(1), gemalt: +(i / ni).toFixed(3), rand: +(a / na).toFixed(3) });
        }
    }
    if (Z.mahl) Z.mahlMitte = { x: mx / Z.mahl, z: mz / Z.mahl };
    const C = s.creatures || [];
    Z.kreaturen = C.length;
    Z.zahm = C.filter((c) => c && c.userData && (c.userData.bond || 0) >= 0.5).length;
    return Z;
},
FLUR_BLICK: async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()]
        .filter((x) => x && x.plan)
        .sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z))[0];
    if (!S) throw new Error("keine Siedlung am Messort");
    const P = S.plan;
    const h = (x, z) => r.getTerrainHeightAt(x, z);
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return a.acker || 0;
    };
    const F = (P.felder || [])
        .filter((fd) => fd && Number.isFinite(fd.cx) && Number.isFinite(fd.ex))
        .map((fd) => ({ x: S.ox + fd.cx, z: S.oz + fd.cz, c: Math.cos(fd.phi || 0), s: Math.sin(fd.phi || 0), ex: fd.ex, ez: fd.ez }));
    const pt = (f, u, v) => [f.x + u * f.c - v * f.s, f.z + u * f.s + v * f.c];
    const flaeche = (f) => {
        let i = 0, ni = 0, a = 0, na = 0;
        for (let p = -2; p <= 2; p++)
            for (let q = -2; q <= 2; q++) {
                const w = pt(f, (p / 2.5) * f.ex, (q / 2.5) * f.ez);
                ni++;
                if (acker(w[0], w[1]) >= 0.5) i++;
            }
        for (const t of [-1, -0.5, 0, 0.5, 1])
            for (const uv of [[f.ex + 2.5, t * f.ez], [-(f.ex + 2.5), t * f.ez], [t * f.ex, f.ez + 2.5], [t * f.ex, -(f.ez + 2.5)]]) {
                const w = pt(f, uv[0], uv[1]);
                na++;
                if (acker(w[0], w[1]) >= 0.5) a++;
            }
        return { innen: i / ni, rand: a / na };
    };
    const cam = new T.PerspectiveCamera(Number.isFinite(A.KAM_FOV_GRAD) ? A.KAM_FOV_GRAD : 60, 16 / 9, 0.1, 2000);
    const frei = (ax, ay, az, bx, by, bz) => {
        for (let k = 1; k < 24; k++) {
            const t = k / 24;
            const x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
            if (h(x, z) > y + 0.05) return false;
            if (typeof r._imGrundriss === "function" && r._imGrundriss(x, z)) return false;
        }
        return true;
    };
    const v = new T.Vector3(), vu = new T.Vector3(), vv = new T.Vector3();
    const imBild = (e, f) => {
        cam.position.set(e.x, e.y, e.z);
        cam.lookAt(f.x, h(f.x, f.z), f.z);
        cam.updateMatrixWorld(true);
        const N = 8, du = (2 * f.ex) / N, dv = (2 * f.ez) / N;
        let anteil = 0;
        for (let p = 0; p < N; p++)
            for (let q = 0; q < N; q++) {
                const u = -f.ex + (p + 0.5) * du, w = -f.ez + (q + 0.5) * dv;
                const m = pt(f, u, w);
                const y = h(m[0], m[1]) + 0.05;
                if (acker(m[0], m[1]) < 0.5) continue;
                v.set(m[0], y, m[1]).project(cam);
                if (!(Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z > -1 && v.z < 1)) continue;
                if (!frei(e.x, e.y, e.z, m[0], y, m[1])) continue;
                const m1 = pt(f, u + du, w), m2 = pt(f, u, w + dv);
                vu.set(m1[0], h(m1[0], m1[1]) + 0.05, m1[1]).project(cam);
                vv.set(m2[0], h(m2[0], m2[1]) + 0.05, m2[1]).project(cam);
                anteil += Math.abs((vu.x - v.x) * (vv.y - v.y) - (vu.y - v.y) * (vv.x - v.x)) / 4;
            }
        return anteil;
    };
    const flaechen = F.map(flaeche);
    const gemalt = flaechen.filter((q) => q.innen >= 0.6 && q.rand <= 0.2).length;
    let best = null;
    for (const fw of P.feldwege || []) {
        const p0 = fw && fw.pts && fw.pts[0];
        if (!p0) continue;
        const ex = S.ox + p0.x, ez = S.oz + p0.z;
        const e = { x: ex, y: h(ex, ez) + 1.7, z: ez };
        let n = 0, top = null;
        F.forEach((f, i) => {
            if (Math.hypot(f.x - ex, f.z - ez) > 45) return;
            const q = flaechen[i];
            if (!(q.innen >= 0.6 && q.rand <= 0.2)) return;
            const a = imBild(e, f);
            if (a >= 0.005) n++;
            if (!top || a > top.a) top = { a, f };
        });
        if (top && (!best || n > best.n || (n === best.n && top.a > best.top.a))) best = { n, e, top };
    }
    const aus = { felder: F.length, gemalt, feldwege: (P.feldwege || []).length, imBild: best ? best.n : 0, anteil: best ? +best.top.a.toFixed(4) : 0, pose: null };
    if (best) {
        const f = best.top.f, e = best.e;
        aus.pose = { px: +e.x.toFixed(2), py: +e.y.toFixed(2), pz: +e.z.toFixed(2), lx: +f.x.toFixed(2), ly: +h(f.x, f.z).toFixed(2), lz: +f.z.toFixed(2) };
        // DER SPIELER AN DER POSE: Stand am Feldweg-Ende, die Gier auf den Acker (die Kopfrichtung der Kamera gemessen, wie dorfZaehlung)
        pm.set(e.x, h(e.x, e.z) + A.PLAYER_FOOT_OFFSET, e.z);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
        const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
        const kopf = async () => {
            await window.__seitenTakt();
            await window.__seitenTakt();
            const d = s.camera.getWorldDirection(new T.Vector3());
            return Math.atan2(d.x, d.z);
        };
        const ziel = Math.atan2(f.x - e.x, f.z - e.z);
        for (let it = 0; it < 2; it++) {
            const h0 = await kopf();
            const y0 = s.yaw;
            s.yaw = y0 + 0.1;
            const h1 = await kopf();
            const sg = Math.sign(wrap(h1 - h0)) || 1;
            s.yaw = y0 + sg * wrap(ziel - h0);
        }
    }
    return aus;
}
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const flaechen = () => z().felder.filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2);
            const km2 = () => flaechen().reduce((a, f) => a + f.m2, 0) / 1e6;
            const luft = () => ({ px: z().nah.ox, py: "+150", pz: z().nah.oz + 80, lx: z().nah.ox, ly: "+0", lz: z().nah.oz });
            H.zeile("Flur: " + (Z ? Z.felder.length + " Äcker im Plan, gemalt als Fläche " + flaechen().length + ", " + km2().toFixed(5) + " km²" : "kein Zensus (" + zf + ")"));
            await K.schritt(2, async () => {
                const a = km2();
                if (a < 0.5) return K.nicht(2, { n: +a.toFixed(6), fehlt: "die Flur eines Dorfs ≈ 1 km²: " + flaechen().length + " gemalte Äcker decken " + a.toFixed(5) + " km² (fachwerk-core dorfLayout: 1–2 Äcker je Feldweg-Ende, 12–21 × 8–15 m)" });
                const b = await K.bild(2, luft());
                K.auge(2, { bild: b.datei, pose: "Luftbild 150 m über der Mitte des Dorfs, 80 m südlich", mass: "Flur " + a.toFixed(3) + " km², " + flaechen().length + " Äcker" });
            });
            await K.schritt(3, async () => {
                const n = flaechen().length;
                if (n < 1000) return K.nicht(3, { n, fehlt: "10³ Parzellen auf 10² km²: die Welt am Messort trägt " + n + " gemalte Äcker (" + z().siedlungen + " Siedlung(en)), 8 Saaten trägt die Sitzung nicht" });
                const b = await K.bild(3, luft());
                K.auge(3, { bild: b.datei, pose: "Luftbild 150 m über der Mitte des Dorfs", mass: n + " Parzellen" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: 1, fehlt: "16 Saaten je Region 10⁴ km²: die Sitzung trägt EINE Saat; Weide als Nutzung trägt kein Plan (" + Object.keys(z().slotRollen).join("/") + ")" }));
            await K.schritt(5, async () => K.nicht(5, { n: +km2().toFixed(6), fehlt: "Nutzflächen eines Kontinents (10⁶ km²) je Klimazone: die gemalte Flur am Messort deckt " + km2().toFixed(5) + " km²" }));
            await K.schritt(6, async () => K.nicht(6, { n: flaechen().length, fehlt: "10⁹ Parzellen eines Planeten für 100 Zufallslandungen: " + flaechen().length + " gemalte Äcker am Messort" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "64 Welten mit fremden Agrarformen: die Sitzung trägt eine Welt, ihr Acker ist ein gemaltes Rechteck" }));
            // S1 zuletzt: der Spieler endet an ihrer Pose (der Preis der Sitzung)
            await K.schritt(1, async () => {
                const B = await ruf("FLUR_BLICK");
                const n = flaechen().length;
                K.zahl(1, {
                    n,
                    werte: { imBild: B.imBild },
                    beleg: B.felder + " Äcker im Plan, " + B.gemalt + " als Fläche gemalt, " + B.feldwege + " Feldwege; bestes Bild " + (B.anteil * 100).toFixed(2) + " % an Pose " + JSON.stringify(B.pose),
                    taeter: B.imBild >= 1 ? null : n ? "kein gemalter Acker frei im Bild vom Feldweg-Ende (Gelände/Grundriss verdeckt oder ≥ 45 m fern)" : "kein Acker als Fläche gemalt (stamm/siedlung-wege.js felder-Schicht: _landAt oder ortKraut verweigert)",
                });
            });
        })(H, K);
    return K.ende();
});