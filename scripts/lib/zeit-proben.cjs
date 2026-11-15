"use strict";
// scripts/lib/zeit-proben.cjs — DIE PROBEN DER ZEIT (`werkbank zerlegen`, `werkbank lauf`, `werkbank haenger`/`takt`, w28-werkbank-teilt): die
// GPU-Zerlegung je Verbraucher (ABBA, scripts/lib/zerlege-linse.cjs), der echte Lauf mit der EINEN Spur und dem Boden des Geräts (die
// Belegung) und die Hänger-Linse mit den Stichproben derselben Spur (scripts/lib/haenger-linse.cjs). Die Wege des Steuer-Servers
// (`zeitWege`: die Seite der Werkbank, ihr Browser, ihre Spur, ihre Stempel-Wache, ihr Fehler-Buch — je Ruf) und die Gänge der Befehle
// über ihre Rufe (`zerlegenGang`, `laufGang`, `haengerGang`).
const { fehlerText, sleep, selbsttestEnde, pngDatei, path, fs, jsonLesen } = require("./welt-boot.cjs");
const { wetterUrteil, buehneSelbsttest } = require("./ausgabe-aufnahme.cjs");
const BAND = require("./band-urteil.cjs");
const ZL = require("./zerlege-linse.cjs");
const HL = require("./haenger-linse.cjs");

// DIE WEGE DER ZEIT für EINEN Ruf (`b`) → je Weg seine Antwort: `/zerlegen`, `/lauf`, `/haenger`
function zeitWege(W, b) {
    const { page, browser, seite, stempel, spur, stempelWarnung, fehler, ECHT, ECHT_SEITE, SEITEN_PORT, bootZeile, ablage, zeitAblage, jsonAb } = W; // prettier-ignore
    const wege = {};
    // DIE GPU-ZERLEGUNG (scripts/lib/zerlege-linse.cjs): Inventur (ein Zähl-Frame + Pass-Baum + Frame-Anatomie) →
    // Schalter aus dem echten Weg → ABBA je Schalter mit der Bank-Runde → Beleg je Schalter → Tabelle.
    wege["/zerlegen"] = async () => {
        const n = Number(b.n) || 12;
        const runden = Math.max(4, Number(b.runden) || 4);
        const kette = ZL.KETTE.map((x) => x.uniform);
        let last = null;
        // der Pool beginnt leer: die Aufnahmen einer Linse davor ließen ihn voll (Radeon nach `licht --kontakt`: Spitze
        // 2048/2048, die ersten Bank-Bilder der Zerlegung ohne Abfrage, STEMPEL-POOL ROT 30)
        await page.evaluate(() => st.renderer.resolveTimestampsAsync("render"));
        const zw0 = await stempel();
        if (b.selbsttest) {
            await page.evaluate(() => {
                window.__zerlegeVorSelbst = __zerlegeZustand();
            });
            last = await seite("__zerlegeLast", {
                an: true,
                iter: Number(b.last) || 96,
            });
            if (!last || last.fehler) return (Object.assign({ fehler: "Selbsttest-Last" }, last || {}));
        }
        try {
            const inv = await seite("__zerlegeInventur", { n, kette });
            if (inv.fehler) return (inv);
            const { haushalt } = BAND.ladeSpec();
            const sch = ZL.zerlegeSchalter(inv, haushalt, {
                nur: b.nur ? String(b.nur).split(",") : null,
                unbekannteImmer: !!b.selbsttest,
            });
            const roh = await seite("__zerlegeMessen", {
                schalter: sch.schalter,
                n,
                runden,
                bilder: !!b.bilder,
            });
            if (roh.fehler) return (roh);
            // Die Bilder des Belegs (Ausgabe-Pfad, AN einmal, AUS je Schalter) in den Ordner, nie ins JSON.
            let ordner = null;
            if (b.bilder) {
                ordner = path.resolve(
                    typeof b.bilder === "string"
                        ? b.bilder
                        : ablage(`zerlegen-${Date.now()}`)
                );
                fs.mkdirSync(ordner, { recursive: true });
                const schreibe = (name, png) =>
                    pngDatei(path.join(ordner, name), png);
                if (roh.bildAn) schreibe("00-an.png", roh.bildAn);
                delete roh.bildAn;
                roh.schalter.forEach((e, i) => {
                    if (e.beleg?.bild) {
                        schreibe(
                            `${String(i + 1).padStart(2, "0")}-${e.id.replace(/[^a-z0-9_-]+/gi, "_")}-aus.png`,
                            e.beleg.bild
                        );
                        delete e.beleg.bild;
                    }
                });
            }
            const a = ZL.zerlegeAuswerten(roh, sch.schalter);
            let selbst = null;
            if (last) {
                await seite("__zerlegeLast", { an: false });
                last.weg = true;
                const inv2 = await seite("__zerlegeInventur", { n: 3, kette });
                const zurueck = await page.evaluate(() =>
                    __zerlegeVergleich(window.__zerlegeVorSelbst, __zerlegeZustand())
                );
                const z = a.zeilen.find((x) => x.id === "pass:zerlege-selbsttest");
                const toleranzMs = +Math.max(1, 0.35 * last.alleinMs).toFixed(2);
                selbst = {
                    iter: last.iter,
                    ziel: last.ziel,
                    alleinMs: last.alleinMs,
                    alleinWerte: last.alleinWerte,
                    deltaMs: z ? z.deltaMs : null,
                    streuungMs: z ? z.streuungMs : null,
                    // die Stempel-Probe: was der r184-Pass-Stempel von dieser bekannten Last sieht
                    stempelMs: a.stempelJePass ? a.stempelJePass["zerlege-selbsttest"] : null,
                    toleranzMs,
                    gefunden: !!z,
                    plausibel:
                        !!z &&
                        Math.abs(z.deltaMs - last.alleinMs) <= toleranzMs &&
                        z.deltaMs > 2 * z.streuungMs,
                    verschwunden: !inv2.passe.some((p) => p.name === "zerlege-selbsttest"),
                    zurueck,
                };
                selbst.urteil =
                    selbst.gefunden && selbst.plausibel && selbst.verschwunden && !zurueck.length
                        ? "GRUEN"
                        : "ROT";
            }
            // Die Stempel der Zerlegung gelten nur ohne verweigerte Abfrage in ihrer Dauer (`__stempelWache`).
            const zw1 = await stempel();
            const stempelZ =
                zw0 && zw1
                    ? {
                          imZerlegen: zw1.ueberlauf - (zw0.ueberlauf || 0),
                          seitBoot: zw1.ueberlauf,
                          warnung: zw1.warnung,
                          spitze: zw1.spitze,
                          pool: zw1.pool,
                      }
                    : null;
            const datei = zeitAblage(b.json, "zerlegen", "json");
            jsonAb(datei, {
                echt: ECHT,
                boot: bootZeile(),
                inventur: inv,
                schalter: sch,
                auswertung: a,
                roh,
                selbsttest: selbst,
                stempel: stempelZ,
            });
            let tabelle = ZL.zerlegeTabelle(a, inv, sch);
            if (selbst)
                tabelle +=
                    `\n\nSELBSTTEST ${selbst.urteil}: eingeschmuggelter Vollbild-Pass (${selbst.iter} Runden sin/cos, ` +
                    `${selbst.ziel.join("×")}) allein ${selbst.alleinMs} ms, als Posten pass:zerlege-selbsttest ` +
                    `${selbst.gefunden ? selbst.deltaMs + " ± " + selbst.streuungMs + " ms" : "NICHT GEFUNDEN"} ` +
                    `(Toleranz ± ${selbst.toleranzMs} ms: ${selbst.plausibel ? "plausibel" : "NICHT plausibel"}); ` +
                    `ohne ihn: Posten ${selbst.verschwunden ? "verschwunden" : "NOCH DA"}, Zustand ` +
                    `${selbst.zurueck.length ? "NICHT zurück (" + selbst.zurueck.join(" · ") + ")" : "zurück"}` +
                    `\nSTEMPEL-PROBE: der r184-Pass-Stempel derselben Last zeigt ${selbst.stempelMs} ms ` +
                    `(${selbst.stempelMs != null && selbst.alleinMs ? Math.round((100 * selbst.stempelMs) / selbst.alleinMs) : "–"} % ` +
                    "ihrer Kosten allein) — so viel Fragment-Arbeit sehen die Stempel dieses Geräts";
            if (stempelZ)
                tabelle +=
                    `\nSTEMPEL-POOL ${stempelZ.imZerlegen === 0 ? "GRUEN" : "ROT"}: ${stempelZ.imZerlegen} verweigerte ` +
                    `Abfragen in der Zerlegung (seit Boot ${stempelZ.seitBoot}, Warnung ${stempelZ.warnung}), Spitze ` +
                    `${stempelZ.spitze}${stempelZ.pool ? "/" + stempelZ.pool.max : ""}`;
            const ok =
                !a.zurueck.length &&
                !a.fenster.some((e) => !e.geschluckt) &&
                a.zeilen.every((z) => z.geschaltet !== false) &&
                (!selbst || selbst.urteil === "GRUEN") &&
                (!stempelZ || stempelZ.imZerlegen === 0);
            return ({
                tabelle,
                ok,
                datei,
                ordner,
                selbsttest: selbst,
                stempel: stempelZ,
            });
        } finally {
            if (last && !last.weg) await seite("__zerlegeLast", { an: false });
        }
    };
    // DIE EINE SPUR (CDP-Trace) um den Lauf (`ZL.lauf`, scripts/lib/zerlege-linse.cjs), nur im Mess-Fenster: die Belegung liest den Faden (`BELEGUNG_SPUR`,
    // `belegungAuswerten`), Profil und Hänger-Linse lesen Stichproben aus derselben Spur (`HL.spurProfil`) — nie ein
    // zweites Instrument; ein langer Hänger-Lauf nimmt nur Marken, Stichproben und die Aufträge des GPU-Prozesses
    // (`gpu`: eine Leine ohne Auftrag der Seite heißt nach ihm) — der Faden voll sprengt den Puffer.
    const laufMitSpur = async (k, kategorien) => {
        const cdp = await page.target().createCDPSession(), ev = [];
        cdp.on("Tracing.dataCollected", (e) => e.value.forEach((x) => ev.push(x)));
        let an = false, o;
        spur.an = () => cdp.send("Tracing.start", { traceConfig: { includedCategories: kategorien } }).then(() => (an = true));
        try {
            o = await page.evaluate(ZL.lauf, Object.assign({ regler: b.regler || "voll", tiere: b.tiere || "halten", wetter: b.wetter, spur: true }, k));
        } finally {
            spur.an = null;
            const komplett = an && new Promise((r) => cdp.once("Tracing.tracingComplete", r));
            if (an) await cdp.send("Tracing.end").then(() => komplett);
            await cdp.detach();
        }
        return { o, ev };
    };
    // DER BODEN DES GERÄTS (w27-belegung-boden, `ZL.bodenAuswerten`): vor dem Lauf die LEERE WebGPU-Leinwand in einer zweiten
    // Seite DESSELBEN Browsers (dieselben Schalter, derselbe Ursprung), so groß wie die Leinwand des Spiels, mit derselben Spur
    // — 2 s Anlauf, `sek` s gemessen. Scheitert sie, trägt der Boden den Grund beim Namen, und die Belegung steht UNGEMESSEN.
    const bodenMessen = async (sek = 6) => {
        let p = null;
        try {
            const masse = await page.evaluate(() => ["width", "height"].map((k) => document.getElementById("world-canvas")[k]));
            p = await browser.newPage();
            if (page.viewport()) await p.setViewport(page.viewport());
            await p.goto(`${ECHT ? ECHT_SEITE : `http://127.0.0.1:${SEITEN_PORT}`}/cores.manifest.json`);
            await p.bringToFront();
            await p.evaluate(ZL.bodenLeinwand, masse);
            await sleep(2000);
            const cdp = await p.target().createCDPSession(), ev = [];
            cdp.on("Tracing.dataCollected", (e) => ev.push(...e.value));
            await cdp.send("Tracing.start", { traceConfig: { includedCategories: ZL.BELEGUNG_SPUR } });
            await sleep(sek * 1000);
            const komplett = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
            await cdp.send("Tracing.end").then(() => komplett);
            return Object.assign(ZL.bodenAuswerten(ev), { leinwand: masse, sek });
        } catch (e) {
            return { quelle: "leere WebGPU-Leinwand", fehler: fehlerText(e).split("\n")[0] };
        } finally {
            if (p) await p.close().catch(() => {});
            await page.bringToFront();
        }
    };
    const PROBEN = ["blink.user_timing", "disabled-by-default-v8.cpu_profiler", "gpu"];
    wege["/lauf"] = async () => {
        const boden = await bodenMessen();
        const { o, ev } = await laufMitSpur(
            { sek: Number(b.sek) || 20, ein: b.ein != null ? Number(b.ein) : 30, ruhe: Number(b.ruhe) || 0, regler: b.regler || "frei", wandern: b.wandern },
            ZL.BELEGUNG_SPUR
        );
        o.belegung = ZL.belegungAuswerten(ev, { boden });
        o.stempel.warnung = stempelWarnung.n;
        if (o.wetterHalt) o.wetterHalt = wetterUrteil(o.wetterHalt);
        return (Object.assign(o, { fehler: fehler.slice(-5) }));
    };
    // DIE HÄNGER-LINSE (scripts/lib/haenger-linse.cjs): der echte Lauf (`ZL.lauf`, `k.haenger`) mit den Stichproben der
    // Spur (1 ms), je Frame über der Schwelle die Ursache beim Namen (TAKT · NEBEN · GC · GPU und die Engstelle);
    // `spitze` urteilt die Takt-Spitze (`takt`), `wandern: bahn` geht die Bahn der OMEN-Zellen „geht".
    wege["/haenger"] = async () => {
        const { o: l, ev } = await laufMitSpur({
            sek: Number(b.sek) || 120,
            ein: b.ein != null ? Number(b.ein) : 10,
            tiere: b.tiere || "frei",
            wandern: b.wandern || "aus",
            probe: !!b.probe,
            haenger: true,
        }, PROBEN);
        const roh = Object.assign(l.haenger, { bahnM: l.bahnM, wandern: b.wandern, wetterHalt: wetterUrteil(l.wetterHalt) });
        const sp = HL.spurProfil(ev);
        const a = HL.linseWerten(roh, sp, b);
        const datei = zeitAblage(b.json, b.spitze ? "takt" : "haenger", "json");
        jsonAb(datei, Object.assign({ echt: ECHT, boot: bootZeile() }, a));
        // Das ROHE (Takte + Stichproben der Spur) daneben: `haenger --auswerten <roh>` urteilt es neu, ohne Welt
        fs.writeFileSync(datei.replace(/\.json$/, "") + ".roh.json", JSON.stringify({ roh, spur: sp }));
        const { tabelle, befunde, cpuMs, taeter } = a;
        return ({ tabelle, befunde, cpuMs, taeter, wetterHalt: roh.wetterHalt, datei });
    };
    return wege;
}

// DER GANG DES BEFEHLS `werkbank zerlegen` → die Antwort, die die Werkbank ausgibt (mit Tabelle oder Fehler endet er selbst)
async function zerlegenGang({ argv, opt, SELBST, rufe, endeMit }) {
    let o;
    const bi = argv.indexOf("--bilder");
    o = await rufe("/zerlegen", {
        runden: opt("--runden"),
        n: opt("--n"),
        nur: opt("--nur"),
        json: opt("--json"),
        bilder: bi < 0 ? false : argv[bi + 1] && !argv[bi + 1].startsWith("--") ? argv[bi + 1] : true,
        selbsttest: SELBST,
        last: opt("--last"),
    });
    if (o?.tabelle) endeMit(o.tabelle + "\n\n" + o.datei + (o.ordner ? "\n" + o.ordner : ""), o.ok);
    if (!o || o.fehler) endeMit(o);
    return o;
}

// DER GANG DES BEFEHLS `werkbank lauf` → die Antwort, die die Werkbank ausgibt (ein ROT endet selbst)
async function laufGang({ a, opt, SELBST, rufe, endeMit }) {
    let o;
    if (SELBST) {
        selbsttestEnde([...ZL.zweiGipfelSelbsttest(), ...ZL.belegungSelbsttest(), ...buehneSelbsttest()], "die Pass-Teilung trennt zwei Gipfel " +
            "(rein = der untere, anteilOben genau) und lässt einhöckrige Pässe ganz; die Belegung nennt eine Pflicht-Last je " +
            "Bild beim Klassen-Namen über dem Boden des Geräts (Spiel ohne Last auf einem schnellen und einem langsamen GRÜN, mit 1,0 ms " +
            "Last auf beiden ROT, mit 0,3 ms GRÜN, ohne Leer-Messung UNGEMESSEN beim Namen) und lässt vertagbare Zeitgeber im " +
            "Bild-Fenster GRÜN; die Bühne stellt n Tiere im Ring auf Land, " +
            "füllt nur auf und bricht ohne Platz laut");
        process.exit(0);
    }
    o = await rufe("/lauf", {
        sek: a[0],
        ein: opt("--ein"),
        regler: opt("--regler", "frei"),
        tiere: opt("--tiere", "halten"),
        wetter: opt("--wetter"),
        ruhe: opt("--ruhe", 0),
        wandern: opt("--wandern"),
    });
    if (o.kreis) console.log("KREIS " + JSON.stringify(o.kreis));
    // Die Wetter-Wache (ein Lauf, der das Wetter nicht hält) und die Belegung enden mit Exit 1 und nennen den Täter.
    const rot = [
        o.wetterHalt?.urteil === "ROT" && `WETTER-WACHE ROT: ${o.wetterHalt.taeter.join(" · ")}`,
        // UNGEMESSEN (der Boden des Geräts fehlt) urteilt nicht GRÜN: Exit 1 beim Namen wie ROT
        /^(ROT|UNGEMESSEN)$/.test(o.belegung?.urteil || "") && `BELEGUNG ${o.belegung.urteil}: ${o.belegung.befund}`,
        o.buehnenTiere < Number(opt("--tiere")) && `BÜHNE ROT: ${o.buehnenTiere} von ${opt("--tiere")} Tieren stehen am Ende`,
    ].filter(Boolean);
    if (rot.length) endeMit(JSON.stringify(o, null, 1) + "\n" + rot.join("\n"));
    return o;
}

// DER GANG DER BEFEHLE `werkbank haenger` und `werkbank takt` — endet selbst
async function haengerGang({ cmd, a, opt, hat, SELBST, rufe, endeMit }) {
    let o;
    // `takt` ist die Takt-Spitze des Gehens (Bahn, 30 s nach 2 s Einschwingen), `haenger` die Hänger über der Schwelle
    const spitze = cmd === "takt";
    if (SELBST) {
        const f = HL.selbsttest();
        // der Selbsttest: die Hänger-Linse nennt Takt-Last, Neben-Last, Collector, GPU-Warten nach synchronen Pipelines und den
        // Auftrag des GPU-Prozesses beim Namen, die Takt-Marken legen die Stichproben der Spur auf die Takte; die Takt-Spitze
        // nennt eine 3-ms-Last je 10. Takt allein beim Namen und ist ohne Last GRÜN, in Fahrt ein computeVertexNormals im Takt
        // beim Namen und einen stehenden Wagen; die Halter der Ankunft nennen jede Aufgabe ≥ 50 ms vor dem ersten Bild mit
        // Funktion und Datei:Zeile, nie eine danach, und sind blind ROT; ein verlorener ProfileChunk reißt keine Linse und
        // steht beim Namen
        selbsttestEnde(f);
        process.exit(0);
    }
    // `--auswerten <x.roh.json>`: ein gesicherter Lauf neu geurteilt (nur Node — eine andere Schwelle, eine neue Linse)
    if (opt("--auswerten")) {
        const { roh, spur } = jsonLesen(opt("--auswerten"));
        const w = HL.linseWerten(roh, spur, { spitze, schwelle: opt("--schwelle"), posten: opt("--posten") });
        console.log(w.tabelle);
        if (w.befunde.length) console.log("\nLINSE ROT:\n  " + w.befunde.join("\n  "));
        process.exit(w.befunde.length ? 1 : 0);
    }
    o = await rufe("/haenger", {
        spitze,
        sek: opt("--sek", a[0] || (spitze ? 30 : undefined)),
        ein: opt("--ein", spitze ? 2 : undefined),
        regler: opt("--regler", "voll"),
        tiere: opt("--tiere", "frei"),
        wetter: opt("--wetter"),
        wandern: opt("--wandern", spitze ? "bahn" : "aus"),
        schwelle: opt("--schwelle", 100),
        posten: opt("--posten"),
        probe: hat("probe"),
        json: opt("--json"),
    });
    if (!o || o.fehler || !o.tabelle) endeMit(o);
    console.log(o.tabelle + "\n\n" + o.datei);
    if (o.befunde.length) console.log("\nLINSE ROT:\n  " + o.befunde.join("\n  "));
    process.exit(o.befunde.length ? 1 : 0);
    return o;
}

module.exports = { zeitWege, zerlegenGang, laufGang, haengerGang };
