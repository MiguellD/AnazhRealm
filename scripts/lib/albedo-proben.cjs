"use strict";
// scripts/lib/albedo-proben.cjs — DIE PROBEN DER ALBEDO (`werkbank albedo [--tafel]`, `werkbank albedo --nah-fern`, w28-werkbank-teilt):
// die Welt-Seite der Albedo-Tafel (spec/farbe/albedo-tafel.json, Urteil scripts/lib/albedo-tafel.cjs) und die Albedo nah gegen fern
// (Urteil scripts/lib/licht-linsen.cjs `nahFernUrteil`, Wand gate:nah-fern) — die Wege `/albedo` des Steuer-Servers (`nahFernRoute`,
// `tafelRoute`: die Seite der Werkbank, ihr Gerät, ihr Ort) und der Gang des Befehls über ihre Rufe (`albedoGang`).
const { selbsttestEnde, pngDatei, path, fs, jsonSchreiben } = require("./welt-boot.cjs");
const LL = require("./licht-linsen.cjs");
const AT = require("./albedo-tafel.cjs");

// DIE ALBEDO NAH GEGEN FERN (der Weg `/albedo` mit `b.nahFern`) → die Antwort des Wegs
async function nahFernRoute(W, b) {
    const { page, seite } = W;
    // DIE ALBEDO NAH GEGEN FERN: Boden-Satz gegen Fern-Ring an derselben Stelle, das Urteil in Node.
    // Den Takt treibt die Route selbst wie `umstellen` (danach läuft kein
    // Loop: einmal stand die Welt 120 s bei 9 Chunks und bereit 0). Steht sie am Deckel nicht, misst die Linse
    // trotzdem und urteilt laut — mit dem Zustand der Welt (`welt`) beim Namen.
    // DAS QUADRAT DER LINSE ist das 5 × 5 der Chunks um den Chunk des SPIELERS (die Linse wählt ihre Orte um
    // ihn): jeder steht im Boden-Satz oder ist leer. `_builtRingRadius` misst um `lastPlayerVoxelChunk` — in
    const welt = await page.evaluate(async () => {
        const st = r.state;
        const t0 = performance.now();
        const quadrat = () => {
            const satz = st.chunkSaetze?.get("boden");
            const span = r._voxelChunkConfig().span;
            const pp = st.playerMesh.position;
            const cx = Math.floor(pp.x / span),
                cz = Math.floor(pp.z / span);
            const fehlt = [];
            for (let dx = -2; dx <= 2; dx++)
                for (let dz = -2; dz <= 2; dz++) {
                    const key = `${cx + dx},${cz + dz}`;
                    const e = st.voxelChunks ? st.voxelChunks.get(key) : null;
                    if (!e?.empty && !satz?.bloecke.has(key)) fehlt.push(key);
                }
            return { chunk: `${cx},${cz}`, fehlt };
        };
        let q = quadrat(),
            takte = 0;
        // DIE KARTE GEHÖRT DIESEM ORT: ihr Anker ist die Chunk-Mitte des Spielers in der Größe des Rings
        // (`_fernKroneNahTakt`) — bereit 1 ohne Job hiess nach dem Umstellen zweimal von acht: die Karte des alten
        // Orts (Welt stand nach 2 Takten), dann füllte sie neu und der Boden mischte im Schuss nichts (ROT „Karte“).
        const karteHier = (k) => {
            const a = k?.anker;
            const span = r._voxelChunkConfig().span;
            const ring = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
            const p = st.playerMesh.position;
            return (
                !!a &&
                k.U.bereit.value === 1 &&
                !k.job &&
                a.x === (Math.floor(p.x / span) + 0.5) * span &&
                a.z === (Math.floor(p.z / span) + 0.5) * span &&
                a.groesse === span * (2 * ring + 1 + r.constructor.FERN_KRONE_NAH.rand)
            );
        };
        const zustand = (gestanden) => {
            const k = st.fernKroneNah;
            return {
                gestanden,
                ms: Math.round(performance.now() - t0),
                takte,
                chunk: q.chunk,
                fehlt: q.fehlt,
                gebaut: r._builtRingRadius(),
                ring: st.chunkRingRadius,
                imBau: st.voxelMeshPending ? st.voxelMeshPending.size : 0,
                karte: k ? (karteHier(k) ? 1 : 0) : null,
            };
        };
        const steht = () => {
            if (!(st.chunkRingRadius >= 2)) st.chunkRingRadius = 2;
            if (!(st._activeRingRadius >= 2)) st._activeRingRadius = 2;
            const k = st.fernKroneNah;
            const baut = st.voxelMeshPending?.size > 0;
            q = quadrat();
            return q.fehlt.length === 0 && !baut && (!k || karteHier(k));
        };
        const takt = async () => {
            __werkTakt();
            takte++;
            await sleep(50);
        };
        return __gebautNach("das Quadrat der Linse", { fertig: steht, takt, max: 1800 }).then(
            () => zustand(true),
            () => (steht(), zustand(false))
        );
    });
    // DER UPLOAD IM HAUPTBILD, VOR der Linse in der stehenden Welt: die Linse schießt in
    // einem eigenen Pass — dort baut jedes Render-Objekt neu und lädt jede Textur frisch, das Hauptbild nicht
    // (die Observer-Diät refresht nur, was sich ändert). Die Daten-Bilder des Boden-Stoffs (Fern-Krone,
    // Wege-Karte, Kronen-Streu) heben ihre Version, dann laufen drei Takte der Welt: jede muss die GPU erreichen
    // (r184 `_textures`), sonst zeichnet der Boden im Spiel ein altes Bild. Vor dem Textur-Wächter der Diät
    // hielt die GPU 20 Takte lang die alte.
    const upload = await page.evaluate(async () => {
        const st = r.state;
        const rend = st.renderer;
        const texe = [];
        if (st.fernKroneNah) texe.push(st.fernKroneNah.tex);
        if (st.wegeKarte) texe.push(st.wegeKarte.stufen[0].tex, st.wegeKarte.stufen[0].kronen.tex); // je Art EINE Array-Textur
        const gpu = (t) => {
            const d = rend._textures.get(t);
            return d && Number.isFinite(d.version) ? d.version : -1;
        };
        // DIE BILDER: ein Takt zeichnet nur, wenn die GPU-Leine frei ist (`_gpuLeineFrei`) — im Software-Holz
        // zeichneten drei Takte hintereinander kein Bild (die Probe war blind). Gezählt wird `_loopRender`.
        let gezeichnet = 0;
        const eigen = Object.hasOwn(r, "_loopRender");
        const altRender = r._loopRender;
        r._loopRender = function (...a) {
            gezeichnet++;
            return altRender.apply(this, a);
        };
        // je Gang die Abgabe der GPU: danach ist die Leine frei, der nächste Takt zeichnet
        const bilder = async (n) => {
            const ziel = gezeichnet + n;
            for (const weiter = __deckel("die Bilder der Linse", 120, false); gezeichnet < ziel && weiter(); ) {
                try {
                    if (window.__buehne) __buehne();
                    r._gameLoopTick(performance.now());
                } catch {}
                await rend.backend.device.queue.onSubmittedWorkDone();
            }
            return n - Math.max(0, ziel - gezeichnet);
        };
        // DIE RUHE: jede Änderung am Boden-Satz (ein Chunk tritt ein, der Geomorph schreibt) refresht sein
        // Render-Objekt und lädt dabei jede Textur mit — die Probe gilt nur in drei Bildern, in denen der Satz
        // ruht (nach der Linse lud das Neu-Aufnehmen der Bündel jede Textur ohnehin: blind). Ruht er in fünf
        // Versuchen nie, urteilt die Probe laut.
        const satzV = () => {
            const s = st.chunkSaetze?.get("boden");
            const g = s?.geom;
            if (!g) return "leer";
            let v = g.id + ":" + (g.index ? g.index.version : -1);
            for (const k in g.attributes) v += ":" + g.attributes[k].version;
            return v;
        };
        let versuche = 0,
            ruhig = false,
            soll = null,
            danach = 0;
        try {
            while (versuche < 5 && !ruhig) {
                versuche++;
                await bilder(versuche === 1 ? 10 : 5);
                const v0 = satzV();
                soll = texe.map((t) => {
                    t.needsUpdate = true;
                    return t.version;
                });
                danach = await bilder(3);
                ruhig = satzV() === v0;
            }
        } finally {
            if (eigen) r._loopRender = altRender;
            else delete r._loopRender;
        }
        return {
            ruhig,
            versuche,
            bilder: danach,
            texe: texe.map((t, i) => ({ name: t.name, soll: soll[i], gpu: gpu(t) })),
        };
    });
    const m = await seite("__nahFernSicht", {});
    m.welt = welt;
    m.upload = upload;
    const u = LL.nahFernUrteil(m);
    const aus = Object.assign({ messung: m }, u);
    if (b.datei) jsonSchreiben(path.resolve(b.datei), aus);
    return Object.assign(aus, { datei: b.datei ? path.resolve(b.datei) : null });
}

// DIE WELT-SEITE DER ALBEDO-TAFEL (der Weg `/albedo`) → die Antwort des Wegs
async function tafelRoute(W, b) {
    const { page, seite, geraetInfo, ECHT, ablage, jsonAb, kernStand } = W;
    // DIE WELT-SEITE DER ALBEDO-TAFEL: dieselbe Linse, je Tafel-Zeile Exemplar · Klasse · Stoff.
    const t = AT.ladeTafel();
    // DAS AUGE DER STUFE (`exemplar.stufe`, K63-n7, S8) wählt die Stufe JEDES Exemplars neu — jede solche Zeile misst in ihrem eigenen Gang NACH
    // den übrigen, die Karte der Eichung liest der erste Gang — nur er schießt sie (`eichen`)
    // DIE UHR-SPALTEN (`uhren`, material.K3 Staffel 2): jede Stufen-Zeile misst zu jeder Uhr der Tafel — die erste ist
    // die Bühne (Mittag), jede weitere steht als `<id>@<uhr>`. Alle Uhren einer Zeile in IHREM Gang (w13-gtx-proben): die
    // gestellte Stufe trägt jede Uhr — bis dahin je Uhr ein Gang, 21 statt 11, an der GTX die Tafel über ihrer Frist
    const nahZ = t.zeilen.filter((z) => Number.isInteger(z.welt.exemplar.stufe)),
        liste = [];
    for (const zeilen of [t.zeilen.filter((z) => !nahZ.includes(z)), ...nahZ.map((z) => [z])])
        liste.push(...(await seite("__albedoSicht", { zeilen, w: 640, h: 400, uhren: zeilen.length > 1 ? [0.5] : t.uhren, eichen: zeilen.length > 1 })));
    const ordner = path.resolve(b.ordner || ablage("albedo-tafel"));
    fs.mkdirSync(ordner, { recursive: true });
    const welt = {};
    let eichung = null;
    for (const e of liste) {
        if (e.png) {
            pngDatei(path.join(
                    ordner,
                    "welt-" + String(e.id || e.name).replace(/[^a-z0-9_-]+/gi, "_") + ".png"
                ), e.png);
            delete e.png;
        }
        if (e.name === "graukarte") eichung = e.gesamt ? e.gesamt.Y : null;
        else
            welt[e.id] = e.gesamt
                ? {
                      Y: e.gesamt.Y,
                      rgb: e.gesamt.rgb,
                      pixel: e.pixel,
                      zuege: e.zuege,
                      stoffe: e.stoffe,
                      gesetzt: e.gesetzt,
                      stufen: e.stufen,
                  }
                : { Y: null, fehler: e.fehler || "kein Pixel" };
    }
    const geraet = await geraetInfo();
    const spieler = await page.evaluate(() => {
        const p = st.playerMesh.position;
        return [p.x, p.z].map((v) => +v.toFixed(1));
    });
    const messung = {
        datum: new Date().toISOString(),
        // der Stand der Welt-Seite (abnahme-urteil `kernStand`): Version und Prüfsumme jedes Kerns
        stand: kernStand(),
        echt: ECHT,
        geraet,
        ort: W.aktOrt,
        spieler,
        eichung,
        welt,
    };
    const datei = path.resolve(b.datei || path.join(ordner, `welt-${Date.now()}.json`));
    jsonAb(datei, messung);
    // Das Urteil gegen das LABOR-Ist der Tafel (die Labor-Seite misst diag-albedo-tafel.cjs --labor).
    const g = { labor: {}, welt, karten: {}, eichung: { welt: eichung, labor: {} } };
    for (const z of t.zeilen) if (z.ist) g.labor[z.id] = z.ist.labor;
    for (const [sid, k] of Object.entries(t.karten)) {
        if (k.ist) g.karten[sid] = k.ist;
        g.eichung.labor[sid] = t.karte.albedo;
    }
    const u = AT.tafelUrteil(t, g);
    return { urteil: u.urteil, tabelle: AT.tafelTabelle(u), datei, ordner };
}

// DER GANG DES BEFEHLS (`werkbank albedo …`) → die Antwort, die die Werkbank ausgibt (die Tafel und das Nah-Fern-Urteil enden selbst)
async function albedoGang({ hat, opt, SELBST, rufe, endeMit }) {
    let o;
    if (hat("nah-fern")) {
        // DIE ALBEDO NAH GEGEN FERN: je Ort im Chunk-Quadrat Boden-Satz gegen Fern-Ring aus 420 m, dazu das Gesetz an
        // der Stelle; `--selbsttest` (ohne Welt) prüft das Urteil: im Band grün (auch ein Ring, der im Band seiner Abtastung
        // rauscht), der Boden-Satz doppelt so hell rot mit dem Täter Boden-Satz, ein Ring neben dem Gesetz mit dem Täter
        // Fern-Ring, zu wenige Orte, ein leerer Schuss, ein fehlendes Gesetz und eine Karte, die nicht steht, laut.
        if (SELBST) {
            const ort = (klasse, x, nY, fY, nG, gY) => ({
                klasse,
                ort: [x, 0],
                deckung: klasse === "wald" ? 0.9 : 0.3,
                nah: { n: 4096, Y: nY, rgb: [nY * 0.8, nY * (nG || 1.1), nY * 0.5] },
                fern: { n: 4096, Y: fY, rgb: [fY * 0.8, fY * 1.1, fY * 0.5] },
                gesetz: { Y: gY || fY },
            });
            const ruhig = ["wald", "wald", "wald", "wiese", "wiese", "wiese"].map((k, i) =>
                ort(k, i * 50, 0.06, 0.058)
            );
            const f = [];
            // das Urteil, wenn der erste Ort `x` ist und die übrigen ruhig stehen
            const nf = (orte, mehr) => LL.nahFernUrteil({ orte, ...mehr }), erst = (x) => nf(ruhig.map((o, i) => (i ? o : x)));
            const pruefe = (name, u, muss) => {
                const ok = muss ? u.befunde.some((b) => muss.test(b)) : u.befunde.length === 0;
                if (!ok) f.push(`${name}: ${u.befunde.join(" · ") || "(grün)"}`);
            };
            pruefe("im Band", nf(ruhig), null);
            pruefe(
                "main (Boden doppelt so hell)",
                erst(ort("wald", 0, 0.115, 0.056)),
                /^NAH-FERN wald 0\/0 .*Y 0.115 gegen Fern-Ring Y 0.056 \(\+105 %\).*Täter Boden-Satz \+105 %/
            );
            pruefe(
                "der Ring neben dem Gesetz",
                erst(ort("wald", 0, 0.055, 0.075, 1.1, 0.056)),
                /Täter Fern-Ring \+34 %/
            );
            pruefe(
                "das Rauschen des Rings im Band",
                erst(ort("wald", 0, 0.055, 0.066, 1.1, 0.056)),
                null
            );
            pruefe(
                "ohne Gesetz",
                erst(Object.assign(ort("wald", 0, 0.06, 0.06), { gesetz: null })),
                /ohne das Gesetz an der Stelle/
            );
            pruefe("zu wenige Wiesen-Orte", nf(ruhig.slice(0, 4)), /NAH-FERN wiese: 1 Orte/);
            pruefe(
                "leerer Schuss",
                LL.nahFernUrteil({
                    orte: ruhig.concat([Object.assign(ort("wiese", 400, 0.06, 0.06), { nah: { n: 0 } })]),
                }),
                /leerer Schuss/
            );
            pruefe("Karte steht nicht", nf(ruhig, { nahKarte: 0 }), /NAH-FERN Karte: .*bereit 0/);
            const frisch = [
                { name: "fern-krone-nah", soll: 4, gpu: 4 },
                { name: "wege-karte:nah", soll: 21, gpu: 21 },
            ];
            const hoch = (texe, ruhigOk, bilder) => ({
                ruhig: ruhigOk !== false,
                versuche: 1,
                bilder: bilder == null ? 3 : bilder,
                texe,
            });
            pruefe(
                "das Hauptbild lädt jedes Daten-Bild",
                nf(ruhig, { upload: hoch(frisch) }),
                null
            );
            pruefe(
                "ein Daten-Bild bleibt alt",
                LL.nahFernUrteil({
                    orte: ruhig,
                    upload: hoch([frisch[0], { name: "kronen-streu:nah", soll: 18, gpu: 17 }]),
                }),
                /NAH-FERN Upload: kronen-streu:nah — die GPU hält Version 17, der Schreiber hob sie auf 18/
            );
            pruefe(
                "die Upload-Probe ohne Bild",
                nf(ruhig, { upload: hoch([]) }),
                /die Probe ist blind/
            );
            pruefe(
                "die Upload-Probe ohne gezeichnetes Bild",
                nf(ruhig, { upload: hoch(frisch, true, 0) }),
                /NAH-FERN Upload: 0 von 3 Bildern gezeichnet/
            );
            pruefe(
                "die Upload-Probe in einer Welt, die nie ruht",
                nf(ruhig, { upload: hoch(frisch, false) }),
                /NAH-FERN Upload: der Boden-Satz ruhte in 1 Versuchen nie drei Takte/
            );
            pruefe(
                "die Welt steht",
                nf(ruhig, { welt: { gestanden: true, ms: 900, chunk: "-21,-20", fehlt: [] } }),
                null
            );
            pruefe(
                "die Welt stand nicht",
                LL.nahFernUrteil({
                    orte: ruhig,
                    welt: {
                        gestanden: false,
                        ms: 120000,
                        chunk: "-21,-20",
                        fehlt: ["-19,-18"],
                        gebaut: 1,
                        ring: 2,
                        imBau: 3,
                        karte: 1,
                    },
                }),
                /NAH-FERN Welt: das Quadrat der Linse stand nach 120 s nicht \(Chunk -21,-20, fehlt 1: -19,-18/
            );
            pruefe(
                "ein Schuss, der nicht stillsteht",
                erst(Object.assign(ort("wald", 0, 0.06, 0.058), { nah: { n: 4096, Y: 0.6, rgb: [0.6, 0.6, 0.6], still: false, spur: { hell: [[4096, 0.69]] } } })),
                /NAH-FERN wald 0\/0: der Schuss nah stand nicht still oder wiederholte sich nicht/
            );
            pruefe(
                "ein Paar, das sich in vier Runden nicht wiederholt",
                LL.nahFernUrteil({
                    orte: ruhig.map((o, i) => {
                        if (i) return o;
                        const w = ort("wald", 0, 0.06, 0.058);
                        w.fern.wiederholt = false;
                        return Object.assign(w, { runden: 4, verworfen: [[0.06, 0.15]] });
                    }),
                }),
                /NAH-FERN wald 0\/0: der Schuss fern stand nicht still oder wiederholte sich nicht \(Runden 4/
            );
            selbsttestEnde(f, "das Nah-Fern-Urteil nennt die zwei Farben derselben Stelle beim Namen");
            process.exit(0);
        }
        o = await rufe("/albedo", { nahFern: true, datei: opt("--datei") });
        if (o?.zeilen) {
            const w = o.messung?.welt;
            if (w)
                console.log(
                    `  Welt ${w.gestanden ? "steht" : "STAND NICHT"} nach ${w.ms} ms (${w.takte} Takte): Chunk ${w.chunk}, ` +
                        `fehlt ${w.fehlt.length}, gebaut ${w.gebaut}, Ring ${w.ring}, im Bau ${w.imBau}, Karte ${w.karte}`
                );
            for (const z of o.zeilen)
                console.log(
                    `  ${z.klasse.padEnd(5)} ${z.ort.join("/").padEnd(12)} Deckung ${z.deckung} · nah Y ${z.nahY} · fern Y ${z.fernY} · ` +
                        `${(z.dY * 100).toFixed(0)} % · Gesetz Y ${z.gesetzY}: nah ${z.nahGesetz} (Grün ${z.gruenNah}), fern ${z.fernGesetz} (Grün ${z.gruenFern}) · Runden ${z.runden}`
                );
            const up = o.messung?.upload;
            if (up)
                console.log(
                    `  Upload im Hauptbild (${up.ruhig ? "ruhig" : "UNRUHIG"}, Versuch ${up.versuche}, ${up.bilder} Bilder): ` +
                        (up.texe || []).map((u) => `${u.name} GPU ${u.gpu}/${u.soll}`).join(" · ")
                );
            for (const b of o.befunde) console.log("  ROT " + b);
            console.log(
                o.befunde.length
                    ? "\n❌ NAH-FERN ROT — zwei Farben derselben Stelle"
                    : "\n✅ NAH-FERN GRÜN — EINE Boden-Farbe je Ort"
            );
            if (o.datei) console.log(o.datei);
            process.exit(o.befunde.length ? 1 : 0);
        }
    } else {
        // die Tafel (`--tafel` bleibt das Wort der Rufer); ein Fehler der Tafel ist nie grün
        o = await rufe("/albedo", { ordner: opt("--ordner"), datei: opt("--datei") });
        if (o?.tabelle) endeMit(o.tabelle + "\n\n" + o.datei + "\n" + o.ordner, o.urteil === "GRUEN");
        endeMit(o);
    }
    return o;
}

module.exports = { nahFernRoute, tafelRoute, albedoGang };
