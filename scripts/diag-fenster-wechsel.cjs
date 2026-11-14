// diag-fenster-wechsel.cjs — DIE FENSTER-WAND (npm run gate:fenster-wechsel).
//
// Ein Fenster-Wechsel (Größe, DPR) lässt keine zerstörte Textur in einer Bindung („Destroyed texture … used in a submit"):
// die Observer-Diät sieht das neu angelegte Tiefen-Abbild über ihren Vorher-Textur-Wächter (`_diaetVorTextur`).
//
// Die Wand fährt den ECHTEN Frame: WebGPU auf swiftshader, das Software-Holz (`?holz=kienspan`) mit der Pixel-Kappe des
// Holzes nah (1,25 — die Kappe, die ein DPR-Wechsel trifft), am Ufer des Bachs der Mess-Wiese (das Wasser liest das Tiefen-
// Abbild, dazu das Fern-Wasser), der Spiel-Loop LÄUFT. Je Schritt zählt die Wand gerendete Frames (die GPU-Leine), nie die Uhr:
//   E1  vergrößern (640×360 → 704×396) — das resize-Ereignis, die Szenen-Tiefe wird neu angelegt
//   E2  DPR 2 — die Kappe stellt die Pixel-Ratio auf 1,25, Frames nach dem Ereignis
//   E3  zurück (640×360, DPR 1)
//   E4  die Pixel-Ratio ALLEIN (1,25, dann 1), wie die Kappe sie stellt, ohne resize-Ereignis
//   je Schritt ROT bei JEDER WebGPU-Validierung beim Namen (Device-Meldung und GPU-Wache des Stamms)
//   E5  nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe
//   G   je Schritt: jede Bildgröße am Render-Objekt folgt (der Puffer der eigenen Gruppe trägt die Größe seines Passes; Objekt ·
//       Stoff · Uniform beim Namen) · G5 nicht vakuös (das Panorama des Feld-Passes wird geprüft) · GS Selbsttest: ohne den
//       Uniform-Wächter der Größe bleibt das Panorama hinter dem Schritt · GZ mit ihm holt es nach
//   K   kein Zwilling: der resize-Handler baut keinen Leser der Szenen-Tiefe neu (Quelle, kommentarfrei)
//   ES  Selbsttest am echten Frame, der letzte Schritt: ohne den Wächter (`_diaetVorTextur` → false) MUSS ein Pixel-Ratio-
//       Schritt „Destroyed texture …" an einem Größen-Ziel beim Namen zeigen (`GROESSEN_ZIELE`: Szenen-Tiefe, seit D10 der Spiegel-Strahl,
//       seit schatten.K3 die Kontakt-Verdeckung, das halbe Szenen-Ziel — welches zuerst fällt, ist ein Rennen). JEDER Schritt urteilt in Bau-Ereignissen: jeder Submit unter einem eigenen Fehler-Bereich, nach n Frames
//       das Urteil, sobald der GPU-Prozess sie geprüft hat — ein Bereich von r184 (je async Pipeline-Bau offen, swiftshader-Linux
//       42–292 s) fängt keine Meldung, die Schritte warten auf keinen Bau der ganzen Welt. K hält den Rest.
//
//   node scripts/diag-fenster-wechsel.cjs
const {
    statikServer,
    starteBrowser,
    uferStellen,
    laufUhr,
    pruefer,
    fehlerText,
    stammLib,
} = require("./lib/welt-boot.cjs");
const { ladeSpec } = require("./lib/band-urteil.cjs");

const GROESSEN_ZIELE = /Destroyed texture \[Texture "(szene:tiefenabbild|spiegel:strahl|kontakt:verdeckung)"\]/;
const LESER_NEUBAU =
    /_tiefenKnotenTausch|_tiefenLeserNeuBinden|_ensureHydroSurfaceMaterial|_feldPassDispose|hydroSurfaceMaterial\s*=/;
const server = statikServer();

const { errs, check } = pruefer();

// K: der Körper des resize-Handlers (der EINE Absenz-Helfer; ohne Handler wirft er) — kein Leser der Szenen-Tiefe wird dort neu gebaut
const RESIZE_KOPF = /window\.addEventListener\("resize", \(\) => \{/;

// vor jedem Seiten-Skript — die Device-Meldungen je Schritt (`__fensterEcht.schritt` setzt die Wand)
function fensterSammler() {
    const S = (window.__fensterEcht = { schritt: "boot", gpu: {}, offen: new Set(), n: 0 });
    if (typeof GPUAdapter === "undefined") return;
    const melde = (m) => {
        const k = String(m).split("\n")[0].slice(0, 160);
        const p = S.gpu[S.schritt] || (S.gpu[S.schritt] = {});
        p[k] = (p[k] || 0) + 1;
    };
    // JEDER SCHRITT prüft jeden Submit unter einem EIGENEN Fehler-Bereich zuoberst: sein Pop antwortet, sobald der GPU-Prozess
    // den Submit geprüft hat — kein offener Bereich des async Pipeline-Baus von r184 hält die Meldung zurück (s. Kopf)
    const submit = GPUQueue.prototype.submit;
    GPUQueue.prototype.submit = function (b) {
        if (S.schritt === "boot") return submit.call(this, b);
        const id = ++S.n;
        S.offen.add(id);
        this.__geraet.pushErrorScope("validation");
        submit.call(this, b);
        const pop = this.__geraet.popErrorScope();
        pop.then((e) => e && melde(e.message)).finally(() => S.offen.delete(id));
    };
    const rd = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        dev.queue.__geraet = dev;
        dev.addEventListener("uncapturederror", (ev) => melde(ev.error?.message || ev.error));
        return dev;
    };
}

// G — DIE BILDGRÖSSE AM RENDER-OBJEKT (w28-himmel-flaeche): jedes Render-Objekt, das die Diät prüft, trägt in seiner EIGENEN
// Gruppe die Größe SEINES Passes (r184 `screenSize` hinter `screenUV`, EIN Vektor für alle Programme — sein Wert ist die Größe
// des laufenden Renders). Der Fang liest je Besuch den Puffer VOR der Prüfung und die Größe des Passes danach: stand der Pass
// im Bild davor schon in dieser Größe und trägt der Puffer eine andere, steht die Uniform hinter ihrem Knoten — beim Namen
// (Objekt · Stoff · Uniform). Ein Leser einer größen-abhängigen Textur frischt über den Textur-Wächter auf; wer keine liest
// (das Panorama des Feld-Passes zieht nur NDC und Strahl aus der Größe), hängt allein am Uniform-Wächter (`_diaetGang` frei).
function groesseFang() {
    if (window.__groesse) return;
    const G = (window.__groesse = { hinten: new Map(), geprueft: new Set(), programme: new Set(), besuche: 0 });
    const vek = () => {
        const s = THREE.TSL.screenSize;
        return s && s._output ? s._output.value : null;
    };
    const name = (ro) => {
        const o = ro.object || {},
            m = ro.material || {};
        return `${o.name || (o.userData && o.userData.inventar) || o.type} · ${m.name || m.type}`;
    };
    // die Uniforms des Render-Objekts, deren Wert der EINE Größen-Vektor ist (eigene Gruppen)
    const groessen = (ro, v) => {
        if (ro.__groesseU && ro.__groesseV === v) return ro.__groesseU;
        const l = [];
        for (const g of ro.getBindings()) {
            const b0 = g.bindings && g.bindings[0];
            if (b0 && b0.groupNode && b0.groupNode.shared === true) continue;
            for (const b of g.bindings)
                if (b.isUniformBuffer === true && b.uniforms)
                    for (const u of b.uniforms)
                        if (u.nodeUniform && u.nodeUniform.node && u.nodeUniform.node.value === v) l.push([b, u]);
        }
        ro.__groesseV = v;
        return (ro.__groesseU = l);
    };
    const roh = AnazhRealm._diaetRefresh;
    AnazhRealm._diaetRefresh = function (obs, ro, frame, alt) {
        const v = ro ? vek() : null;
        const l = v ? groessen(ro, v) : null;
        if (!l || l.length === 0) return roh.call(this, obs, ro, frame, alt);
        const vor = l.map(([b, u]) => [b.buffer[u.offset], b.buffer[u.offset + 1]]);
        const aus = roh.call(this, obs, ro, frame, alt);
        G.besuche++;
        G.geprueft.add(name(ro));
        G.programme.add(ro.getNodeBuilderState());
        const jetzt = [v.x, v.y],
            war = ro.__groessePass;
        if (war && war[0] === jetzt[0] && war[1] === jetzt[1])
            l.forEach(([, u], i) => {
                const k = `${name(ro)} · ${u.name}`;
                if (vor[i][0] !== jetzt[0] || vor[i][1] !== jetzt[1])
                    G.hinten.set(k, `Puffer ${vor[i].join("×")} gegen Pass ${jetzt.join("×")}`);
                else G.hinten.delete(k);
            });
        ro.__groessePass = jetzt;
        return aus;
    };
}

// ein Schritt nach der Änderung: `n` gerenderte Frames im laufenden Loop (die GPU-Leine zählt sie) — mit `pr` erst, bis die
// Pixel-Ratio dort steht (höchstens 60 Frames); dann der Stand des Schritts
async function fensterSchritt(o) {
    const L = () => (r._gpuLeine ? r._gpuLeine.gerendert : 0);
    if (o.pr != null) {
        const f0 = L();
        await window.__gebautNach("noch: Math.abs(st.renderer.getPixelRatio() - o.pr) > 1e-6 && L() - f0 < 60", {
            fertig: () => !(Math.abs(st.renderer.getPixelRatio() - o.pr) > 1e-6 && L() - f0 < 60),
            takt: async () => {
                await sleep(20);
            },
            max: 2400,
        });
    }
    const f0 = L();
    const S = window.__fensterEcht;
    const W0 = (r._gpuWache || { n: 0 }).n;
    const gemeldet = () => Object.keys(S.gpu[S.schritt] || {}).length > 0 || (r._gpuWache || { n: 0 }).n > W0;
    // n Frames (die Leine trägt 2 im Flug), dann bis der GPU-Prozess die Submits des Schritts geprüft hat (der Selbsttest
    // endet mit der ersten Meldung)
    const halt = () => o.bisMeldung && gemeldet();
    while (L() - f0 < o.n && !halt()) await sleep(20);
    for (const offen = [...S.offen]; !halt() && offen.some((e) => S.offen.has(e));) await sleep(20);
    const t = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
    const W = r._gpuWache || { n: 0, meldungen: [] };
    return {
        frames: L() - f0,
        pr: st.renderer.getPixelRatio(),
        abbild: t?.image ? { id: t.id, version: t.version, b: t.image.width, h: t.image.height } : null,
        gpu: S.gpu[S.schritt] || {},
        wache: W.n,
        wacheKoepfe: W.meldungen.map((m) => `${m.quelle}: ${m.kopf}`),
        groesse: window.__groesse
            ? {
                  hinten: [...window.__groesse.hinten].map(([k, v]) => `${k}: ${v}`),
                  geprueft: [...window.__groesse.geprueft],
                  programme: window.__groesse.programme.size,
                  besuche: window.__groesse.besuche,
              }
            : null,
    };
}

(async () => {
    const log = laufUhr();
    console.log("=== K — kein Zwilling im resize-Handler (Quelle) ===");
    check(
        "K der resize-Handler baut keinen Leser der Szenen-Tiefe neu (die Diät trägt jeden Größenwechsel)",
        stammLib.fehlt(RESIZE_KOPF, LESER_NEUBAU)
    );
    console.log(
        "=== E — der echte Frame mit laufendem Loop (WebGPU auf swiftshader, kienspan, Kappe 1,25, am Bach) ==="
    );
    await server.lausche(0);
    // Erwartet: ES erntet ein Größen-Ziel — die Linse richtet die Meldung selbst (je Phase gezählt), jede andere bleibt ROT.
    const browser = await starteBrowser({ art: "linse", frist: 900000, erwartet: GROESSEN_ZIELE });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 640, height: 360, deviceScaleFactor: 1 });
        await page.evaluateOnNewDocument(fensterSammler);
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        // jeder Leser der Szenen-Tiefe steht (Wasser, Feld-Pass: Boden und Horizont); Bäume und Streu lesen sie nicht
        const u = await page.evaluate(uferStellen, {
            messort: ladeSpec("wiese").ort.spieler,
            kappe: 1.25,
            welt: ["boden", "horizont"],
        });
        if (u.fehler) throw new Error(u.fehler);
        log(`am Ufer ${JSON.stringify(u)}`);
        await page.evaluate(groesseFang);
        const vor = await page.evaluate(fensterSchritt, { n: 3 });
        if (Object.keys(vor.gpu).length) console.log(`  (vor den Schritten: ${JSON.stringify(vor.gpu)})`);
        let wacheVor = vor.wache;
        const schritt = async (name, text, tu, pr, bisMeldung) => {
            await page.evaluate((s) => (window.__fensterEcht.schritt = s), name);
            await tu();
            const kopfVor = await page.evaluate(() => (r._gpuWache || { meldungen: [] }).meldungen.length);
            const s = await page.evaluate(fensterSchritt, { n: bisMeldung ? 2 : 3, pr, bisMeldung: !!bisMeldung });
            s.fremd = Object.entries(s.gpu).map(([k, n]) => `${n}× ${k}`);
            s.wacheNeu = s.wache - wacheVor;
            s.wacheKoepfe = s.wacheKoepfe.slice(kopfVor);
            wacheVor = s.wache;
            const abb = s.abbild ? `${s.abbild.b}×${s.abbild.h} v${s.abbild.version}` : "-";
            log(
                `${name} ${text}: Pixel-Ratio ${s.pr}, Abbild ${abb}, ${s.frames} Frames, ` +
                    `${s.fremd.length ? s.fremd.join(" | ") : "0 Meldungen"}, GPU-Wache +${s.wacheNeu}`
            );
            return s;
        };
        const befund = (s) =>
            s.fremd.join(" | ") ||
            (s.wacheNeu ? `GPU-Wache +${s.wacheNeu}: ${s.wacheKoepfe.slice(-2).join(" | ")}` : "");
        const fenster = (w, h, dsf) => () => page.setViewport({ width: w, height: h, deviceScaleFactor: dsf });
        const pixelRatio = (v) => () => page.evaluate((x) => st.renderer.setPixelRatio(x), v);
        const erg = {};
        const SCHRITTE = [
            ["E1", "704×396 DPR 1", fenster(704, 396, 1), null],
            ["E2", "704×396 DPR 2", fenster(704, 396, 2), 1.25],
            ["E3", "640×360 DPR 1", fenster(640, 360, 1), 1],
            ["E4a", "setPixelRatio(1.25)", pixelRatio(1.25), 1.25],
            ["E4b", "setPixelRatio(1)", pixelRatio(1), 1],
        ];
        for (const [name, text, tu, pr] of SCHRITTE) {
            const s = await schritt(name, text, tu, pr);
            erg[name] = s;
            check(`${name} keine WebGPU-Validierung (${text}, laufender Loop)`, !befund(s), befund(s));
            check(
                `${name} G jede Bildgröße am Render-Objekt folgt dem Schritt (Puffer = Größe seines Passes)`,
                s.groesse && s.groesse.hinten.length === 0,
                s.groesse
                    ? `${s.groesse.hinten.length} hinter ihrem Knoten: ${s.groesse.hinten.slice(0, 6).join(" | ")}`
                    : "kein Fang"
            );
        }
        const abbilder = new Set(Object.values(erg).map((s) => s.abbild && s.abbild.id + ":" + s.abbild.version));
        check(
            "E5 nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe",
            u.wasser > 0 &&
                u.fernWasser > 0 &&
                abbilder.size >= 5 &&
                erg.E2.pr === 1.25 &&
                erg.E3.pr === 1 &&
                erg.E4a.pr === 1.25 &&
                Object.values(erg).every((s) => s.frames >= 3),
            `Wasser ${u.wasser} (Fern-Wasser ${u.fernWasser} Quads), Abbild-Stände ${abbilder.size}, Pixel-Ratio E2 ${erg.E2.pr} · E3 ${erg.E3.pr} · E4 ` +
                `${erg.E4a.pr}/${erg.E4b.pr}, Frames ${Object.values(erg)
                    .map((s) => s.frames)
                    .join("/")}`
        );
        const gp = erg.E4b.groesse || { geprueft: [], programme: 0, besuche: 0 };
        check(
            "G5 nicht vakuös: die Wand prüft die Bildgröße an Render-Objekten, das Panorama des Feld-Passes eingeschlossen",
            gp.geprueft.some((n) => n.startsWith("feld-pass")) && gp.programme >= 2,
            `${gp.geprueft.length} Objekte in ${gp.programme} Programmen, ${gp.besuche} Besuche: ${gp.geprueft.slice(0, 8).join(" | ")}`
        );
        // GS: der Selbsttest der Bildgröße — ohne den Uniform-Wächter der Größe (der Stand vor w28-himmel-flaeche für jedes
        // Programm, das beim ersten Gang das zuletzt gebaute war) bleibt nach einem Größen-Schritt hinter seinem Knoten, wer
        // keine größen-abhängige Textur liest: das Panorama, beim Namen. Danach steht der Wächter wieder.
        await page.evaluate(() => {
            const v = THREE.TSL.screenSize._output.value;
            window.__groesseOhne = [];
            for (const nbs of window.__groesse.programme) {
                const k = nbs._anazhGang;
                if (!k) continue;
                window.__groesseOhne.push([k, k.frei]);
                k.frei = k.frei.filter((u) => !(u.nodeUniform && u.nodeUniform.node && u.nodeUniform.node.value === v));
            }
        });
        const gs = await schritt("GS", "704×396 ohne den Wächter der Bildgröße", fenster(704, 396, 1), null);
        check(
            "GS Selbsttest: ohne den Wächter der Bildgröße steht das Panorama nach dem Schritt hinter seinem Knoten — beim Namen",
            !!gs.groesse && gs.groesse.hinten.some((k) => k.startsWith("feld-pass")),
            gs.groesse ? gs.groesse.hinten.slice(0, 6).join(" | ") || "0 hinter ihrem Knoten" : "kein Fang"
        );
        await page.evaluate(() => {
            for (const [k, frei] of window.__groesseOhne) k.frei = frei;
        });
        const gz = await schritt("GZ", "640×360 mit Wächter (zurück)", fenster(640, 360, 1), 1);
        check(
            "GZ mit dem Wächter holt jedes Render-Objekt die Bildgröße nach",
            !!gz.groesse && gz.groesse.hinten.length === 0,
            gz.groesse ? gz.groesse.hinten.slice(0, 6).join(" | ") : "kein Fang"
        );
        // ES: der Selbsttest am echten Frame — ohne den Wächter fällt der Pixel-Ratio-Schritt beim Namen (der letzte Schritt)
        await page.evaluate(() => (AnazhRealm._diaetVorTextur = () => false));
        const es = await schritt("ES", "setPixelRatio(1.25) ohne Wächter", pixelRatio(1.25), 1.25, true);
        const faellt = (s) => [...s.fremd, ...s.wacheKoepfe].some((k) => GROESSEN_ZIELE.test(k));
        check(
            "ES Selbsttest: ohne den Wächter fällt „Destroyed texture …“ an einem Größen-Ziel beim Pixel-Ratio-Schritt",
            faellt(es),
            [...es.fremd, ...es.wacheKoepfe].join(" | ") || "0"
        );
    } catch (e) {
        check("E Lauf", false, fehlerText(e));
    }
    await browser.close();
    server.close();
    log(errs.length ? "ROT" : "GRÜN");
    console.log(errs.length ? "ROT fenster-wechsel" : "GRÜN fenster-wechsel");
    process.exit(errs.length ? 1 : 0);
})();
