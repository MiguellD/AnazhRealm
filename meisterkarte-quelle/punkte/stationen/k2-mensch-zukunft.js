// DIE PERSPEKTIVE zukunft DES KAPITELS mensch (Meisterkarte 2): vier Leitern, je Leiter EINE Probe in der warmen Welt der Sitzung
// (k2-mensch.js, die Fabrik), alle an der vollsten Stadt (stadt-voll: 295 Häuser, 1092 Bewohner, 20 Wagen). Gemessen wird der
// Umfang am ERGEBNIS der Welt: die Werke der Szene nach Art (Typ-Zähler über `state.architectures`), die Bewohner der Orte und ihre
// Leiber (`S.liste`, stamm/siedlung-bewohner.js), die Kreaturen, die Wagen der Zeit-Achse jenseits von heute (der Stempel
// `epoche` > 4, vehicle-core EPOCHE_GESETZ). Wo die Welt den Umfang nicht stellt, urteilt die Probe „nicht“ mit der Zahl.
// Die Fronten S1 (pm-faecher-mensch 24.11., Meta-Gesetz M4) urteilen das GESETZ am Fächer (stationen/faecher.js): die Leiber der
// Saaten (LEIBER_AN, k2-mensch-leib.js), der Plan einer Saat zur Gegenwart und +50 Jahre (TECHNIK_ZEIT_AN), die Flächen einer Saat
// (MEDIEN_AN), der Wortschatz der Leiber und Werke jedes Kerns (MASCHINE_AN).
"use strict";

const { FAECHER } = require("./faecher.js");
const { LEIBER_AN } = require("./k2-mensch-leib.js");

// DIE STADT +50 JAHRE AM GESETZ (technik#1): je Adresse a.saat × a.zeit (Jahre nach der Gegenwart) der Plan der Saat (fachwerk-core.js
// :5182 DORF, die Epoche der Zelle aus siedlungsEpoche :4494) an ihrer Gegenwart T0 (das Ende ihrer Zeitachse: `chronik.ende` = jahr +
// spanne, der Leser stamm/siedlung-ort.js bestellt ihn mit dem Jahr des Orts, `wachstum`), an T0 + a.zeit und an T0 − a.zeit; die DINGE
// eines Plans: Rolle, Stil, Kultur und Dach jedes Hauses, der Technik-Stand (`technik`), die Tracht, die Gattungen seiner Flotte
// (vehicle-core.js:4809 flotte, der Leser stamm/siedlung-verkehr.js:372). Dazu die Achse des Fahrzeug-Kerns an beiden Jahren
// (vehicle-core.js:4980 epocheAusJahr) — die Achse, die nach vorn reicht.
const TECHNIK_ZEIT_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore;
    const VC = globalThis.__vehicleCore;
    if (!FC || typeof FC.DORF !== "function") return { fehlt: "der Kern trägt keinen Plan (fachwerk DORF)" };
    if (!VC || typeof VC.flotte !== "function") return { fehlt: "der Kern trägt keine Flotte (vehicle flotte)" };
    const ep = FC.siedlungsEpoche(a.saat);
    const D0 = FC.DORF({ seed: a.saat, nH: mit.nH, epoche: ep });
    const T0 = D0.chronik && Number.isFinite(D0.chronik.ende) ? D0.chronik.ende : D0.jahr + D0.spanne;
    const plan = (j) => FC.DORF({ seed: a.saat, nH: mit.nH, epoche: ep, jahr: j });
    const dinge = (D) => {
        const s = new Set();
        for (const h of D.houses) for (const k of ["rolle", "stil", "kultur", "dachTyp"]) if (h[k] != null) s.add(k + ":" + h[k]);
        for (const t of (D.technik && D.technik.stand) || []) s.add("technik:" + t);
        const K = D.kleidung || {};
        s.add("tracht:" + [K.top, K.bottom, K.shoes].join("/") + ":" + (K.farben || []).join(","));
        for (const g of VC.flotte(D.houses.length, a.saat)) s.add("wagen:" + g);
        return s;
    };
    const [B, P, M] = [plan(T0), plan(T0 + a.zeit), plan(T0 - a.zeit)].map((D) => ({ D, s: dinge(D) }));
    const ohne = (x, y) => Array.from(x.s).filter((k) => !y.s.has(k));
    const neu = ohne(P, B);
    return {
        saat: a.saat,
        T0,
        chronik: !!D0.chronik,
        jahrPlus: P.D.schnitt ? P.D.schnitt.jahr : P.D.jahr,
        jahrNull: B.D.schnitt ? B.D.schnitt.jahr : B.D.jahr,
        haeuser: [B.D.houses.length, P.D.houses.length],
        neu: neu.length,
        neuDinge: neu.slice(0, 12),
        weg: ohne(B, P).length,
        zurueck: ohne(B, M).length,
        dinge: B.s.size,
        wagenAchse: [+VC.epocheAusJahr(T0).toFixed(2), +VC.epocheAusJahr(T0 + a.zeit).toFixed(2)],
    };
};

// DIE BILDFLÄCHEN EINER SAAT AM GESETZ (medien#1): je Adresse a.saat der Plan (fachwerk-core.js:5182 DORF) und der Wortschatz dessen,
// was an einer Straße stehen kann (die Ausstattung :7525 AUSSTATTUNG, die Werke :8809 WERKE, die Parameter jedes Hauses): je Ding, ob
// es eine Fläche ist (Schild, Schirm, Leuchtschrift, Plakat, Anzeige, Uhr) und ob sein Gesetz einen INHALT trägt (Text, Bild,
// Schrift); dazu die Häuser, die ein Inhalt nennen könnte (jede Rolle außer Wohnhaus und Scheune: Laden, Werkstatt, Gasthaus, Kirche …).
const MEDIEN_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore;
    if (!FC || typeof FC.DORF !== "function" || !FC.AUSSTATTUNG || !FC.WERKE) return { fehlt: "der Kern trägt keinen Plan oder keine Ausstattung (fachwerk DORF, AUSSTATTUNG, WERKE)" };
    const FL = /schild|schirm|leucht|plakat|anzeige|reklame|display|monitor|hologramm|zifferblatt|uhr$/i;
    const INHALT = /inhalt|text|schrift|bild|botschaft|nachricht/i;
    const D = FC.DORF({ seed: a.saat, nH: mit.nH, epoche: FC.siedlungsEpoche(a.saat) });
    const wort = Object.assign({}, FC.AUSSTATTUNG, FC.WERKE);
    const flaecheWort = Object.keys(wort).filter((k) => FL.test(k) || FL.test(String(wort[k].lab || "")));
    const inhaltWort = Object.keys(wort).filter((k) => Object.keys(wort[k]).some((x) => INHALT.test(x)));
    let flaecheHaus = 0;
    const laeden = {};
    for (const h of D.houses) {
        flaecheHaus += Object.keys(h).filter((k) => FL.test(k) && h[k]).length;
        if (h.rolle && h.rolle !== "wohnhaus" && h.rolle !== "scheune") laeden[h.rolle] = (laeden[h.rolle] || 0) + 1;
    }
    return {
        saat: a.saat,
        haeuser: D.houses.length,
        flaechen: flaecheHaus + flaecheWort.length,
        flaecheWort,
        inhaltWort,
        laeden: Object.values(laeden).reduce((s, x) => s + x, 0),
        ladenArten: Object.keys(laeden),
        wortschatz: Object.keys(wort).length,
    };
};

// DIE MASCHINEN IM WORTSCHATZ DER KERNE (maschinenwesen#1): je Adresse a.ort ein Kern und was er an Leibern, Gattungen, Profilen und
// Werken kennt — koerper (koerper-core.js:80 MOTION, :5432 die Rollen des Tags), tetrapoda (GATTUNGEN, ART_GESTALT), vehicle
// (vehicle-core GATTUNGEN, PRESETS), fachwerk (BAU_NUTZUNG :2686, AUSSTATTUNG :7525, WERKE :8809) — und die Namen darunter, die eine
// Maschine nennen, die sich selbst bewegt (Roboter, Android, Drohne, Automat, Golem). In der warmen Welt zählt der Zensus oben die
// Kreaturen und Werke der Szene.
const MASCHINE_AN = async (r, T, a, mit) => {
    const KERN = { koerper: globalThis.__koerperCore, tetrapoda: globalThis.__tetrapodaCore, fahrzeug: globalThis.__vehicleCore, fachwerk: globalThis.__fachwerkCore };
    const C = KERN[a.ort];
    if (!C) return { fehlt: "der Kern " + a.ort + " ist nicht geladen" };
    const liste = (x) => (Array.isArray(x) ? x : Object.keys(x || {}));
    const tafel = {
        koerper: () => [...Object.keys(C.MOTION || {}), ...Object.keys((C.TAGES_GESETZ && C.TAGES_GESETZ.rollen) || {})],
        tetrapoda: () => [...liste(C.GATTUNGEN), ...liste(C.ART_GESTALT)],
        fahrzeug: () => [...liste(C.GATTUNGEN), ...liste(C.PRESETS)],
        fachwerk: () => [...Object.keys(C.BAU_NUTZUNG || {}), ...Object.keys(C.AUSSTATTUNG || {}), ...Object.keys(C.WERKE || {})],
    }[a.ort];
    const namen = Array.from(new Set(tafel().map(String)));
    const MASCHINE = /robot|android|drohne|automat|maschinen?wesen|golem|mech|kybern|cyborg|servo/i;
    return { kern: a.ort, namen: namen.length, maschinen: namen.filter((n) => MASCHINE.test(n)), auswahl: namen.slice(0, 16) };
};

// DER ZENSUS DER ZUKUNFT (Seite der Welt)
const zensusZukunft = async (r, T, arg) => {
    const s = r.state;
    const A = s.architectures || [];
    const pm = s.playerMesh.position;
    const typen = {};
    for (const e of A) if (e && typeof e.type === "string") typen[e.type] = (typen[e.type] || 0) + 1;
    const zaehle = (re) => Object.keys(typen).filter((t) => re.test(t)).reduce((a, t) => a + typen[t], 0);
    let bewohner = 0;
    let eingriff = 0;
    let geraet = 0;
    const orte = [];
    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
        const L = S && Array.isArray(S.liste) ? S.liste : [];
        if (L.length) orte.push(S.plan && S.plan.name);
        for (const b of L) {
            bewohner++;
            if (b && (b.prothese || b.ersatzglied || b.eingriff || b.implantat)) eingriff++;
            if (b && (b.geraet || b.telefon || b.netz)) geraet++;
        }
    }
    const art = (c) => String((c && (c.archetype || c.art || c.kind || c.typ || (c.userData && (c.userData.art || c.userData.archetype)))) || "");
    const kreaturen = s.creatures || [];
    const maschinen = kreaturen.filter((c) => /robot|android|maschine|drohne/i.test(art(c))).length + zaehle(/robot|android|drohne/i);
    const zukunftWagen = A.filter((e) => e && /^fahrzeug_/.test(e.type || "") && e.studioOv && Number(e.studioOv.epoche) > 4).length;
    const energie = zaehle(/fusion|reaktor|kraftwerk|solarturm|orbitspiegel/i);
    const mega = zaehle(/arkolog|orbitalring|dyson|schwarm|weltraumlift/i);
    return {
        bewohner,
        orte: orte.length,
        eingriff,
        geraet,
        spielerEingriff: Object.keys(s).filter((k) => /prothese|implantat|eingriff|einbau|ersatzglied/i.test(k)).length,
        kreaturen: kreaturen.length,
        maschinen,
        zukunftWagen,
        zukunftDinge: zukunftWagen + energie + mega,
        energie,
        mega,
        flaechen: zaehle(/schild|schirm|leuchtschrift|plakat|anzeigetafel|bildschirm|reklame|hologramm/i),
        terminals: zaehle(/terminal|rechner|computer/i),
        fremd: zaehle(/fremd|alien|xeno/i),
        saat: s.worldMeta && s.worldMeta.seed != null ? 1 : 0,
        pose: { px: pm.x, py: pm.y + 1.7, pz: pm.z, lx: pm.x + Math.sin(s.yaw || 0) * 30, ly: pm.y + 4, lz: pm.z + Math.cos(s.yaw || 0) * 30 },
    };
};

const PFAD = ["stamm/siedlung-*.js", "stamm/koerper-*.js", "vehicle-core.js", "fachwerk-core.js"];
const PROBE = "[linse-gpu] amd/rdna-3 (Probe)";

module.exports = (F) => [
    // ── mensch.zukunft.technik — Technik jenseits der Gegenwart. Gezählt: die Dinge der Zukunft in der Stadt (Wagen der Epoche
    // „zukunft“, Energie-Bauten, Megabauten), die Saaten der Sitzung.
    F.leiter("mensch.zukunft.technik", {
        sek: 45,
        pfad: PFAD,
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: " + JSON.stringify(z).slice(0, 300));
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().energie, fehlt: "+200 Jahre, die Energiequelle prägt die Stadt: kein Fusions-, Sonnen- oder Erdwärme-Bau in der Welt" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().zukunftDinge, fehlt: "+500 Jahre, neue Stoffe und Bauweisen: kein Bau eines Stoffs nach heute (das Bau-Gesetz endet an der Moderne 1935)" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().saat, fehlt: "+1 000 Jahre an 10 Saaten: die Sitzung trägt eine Saat und keine Zukunft der Stadt" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().mega, fehlt: "Energiehaushalt eines Planeten (10¹⁷ W): kein Megabau, kein Orbit-Ring, keine Wetter-Lenkung" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().mega, fehlt: "Energiehaushalt eines Sterns (10²⁶ W): kein Schwarm um den Stern" }));
            await K.schritt(7, async () => K.nicht(7, { n: da().zukunftDinge, fehlt: "10⁴–10⁶ Jahre Zukunft je Saat: keine Technik-Epoche nach heute in der Welt" }));
            // S1 AM GESETZ (der Fächer, stationen/faecher.js): 20 Saaten × +50 Jahre — der Plan jeder Saat an ihrer Gegenwart und 50 Jahre
            // danach, die Dinge, die er dann NEU trägt; dazu, was die 50 Jahre davor brachten (die Achse zurück) und die Achse des
            // Fahrzeug-Kerns. Trägt das Gesetz keine 10 neuen Dinge, „Umfang nicht erzeugbar“ mit dem Schnitt beim Namen
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.TECHNIK_ZEIT_AN, export: "fachwerk-core.js:5182 DORF (das Jahr des Orts, der Schnitt :5290) + vehicle-core.js:4809 flotte, :4980 epocheAusJahr", leser: "stamm/siedlung-ort.js:3077" },
                    adressen: { saaten: 20, zeiten: [50] },
                    mit: { nH: 60 },
                    masse: {
                        neu: { wie: "summe", feld: "neu" },
                        neuMax: { wie: "max", feld: "neu" },
                        zurueck: { wie: "summe", feld: "zurueck" },
                        chronik: { wie: "anteil", feld: "chronik" },
                        wagen: { wie: (v, aus) => Math.max(0, ...aus.map((x) => x.w.wagenAchse[1] - x.w.wagenAchse[0])) },
                    },
                    schlecht: { feld: "neu", richtung: "min" },
                    pose: (a, w) => "Saat " + a.saat + " an ihrer Gegenwart " + w.T0 + " und " + (w.T0 + a.zeit) + ": " + w.haeuser.join(" = ") + " Häuser, " + w.dinge + " Dinge, neu " + w.neu,
                    ungemessen: [
                        "das Bildpaar Jahr 0 / +50 am selben Ort (≥ 10 neue Dinge im Bild benannt): ungemessen bis zum Gerät (die Bildpflicht braucht die Karte und das Panel)",
                        "der Gegenlauf (Vorgänger gekappt → das Ding fehlt ≥ 80 %): ohne neues Ding kein Vorgänger zu kappen",
                    ],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Technik S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W) + " · die 50 Jahre VOR der Gegenwart brachten " + W.zurueck + " Dinge (die Achse zurück trägt die Chronik, " + Math.round(W.chronik * 100) + " % der Saaten)");
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "EINE Stadt +50 Jahre: " + R.fehlt });
                if (W.neuMax >= 10) {
                    const b = await K.bild(1, da().pose);
                    return K.auge(1, { bild: b.datei, pose: "stadt-voll: der Blick des Spielers, 30 m voraus", mass: R.akte.slice(0, 300) });
                }
                K.nicht(1, {
                    n: W.neuMax,
                    fehlt: "EINE Stadt +50 J.: an " + R.gemessen + " Saaten trägt der Plan +50 J. höchstens " + W.neuMax + " neue Dinge — DORF schneidet das Jahr an der Gegenwart (fachwerk-core.js:5290 T ≤ jahr + spanne); die Fahrzeug-Achse rückt +" + W.wagen.toFixed(2) + " (vehicle-core.js:4980), die Flotte liest kein Jahr (stamm/siedlung-verkehr.js:372)",
                });
            });
        },
        seite: { ZENSUS: zensusZukunft, FAECHER, TECHNIK_ZEIT_AN },
        sprossen: {
            1: {
                auge: { pose: "Messort stadt-voll: der Blick des Spielers 30 m voraus, Jahr 0 und +50 an derselben Pose", vorbild: "Bildpaar derselben Straße Jahr 0 / +50: ≥ 10 neue Dinge im Bild benannt, Gegenlauf Vorgänger gekappt" },
                erwartet: "nicht",
                fehlt: "EINE Stadt +50 Jahre: der Plan jeder Saat endet an ihrer Gegenwart (fachwerk DORF :5290), +50 Jahre tragen 0 neue Dinge an 20 Saaten",
            },
            2: {
                auge: { pose: "Messort stadt-voll: das Stadtbild +200 Jahre vom Turm", vorbild: "eingefrorener Leser nennt aus dem Stadtbild die Energiequelle (Ursachen-Probe R10), Gegenlauf Quelle getauscht" },
                erwartet: "nicht",
                fehlt: "+200 Jahre: kein Energie-Bau der Zukunft",
            },
            3: {
                umfang: { soll: 1, wort: "Bau eines Stoffs nach heute (+500 Jahre)" },
                masse: [
                    { key: "unterGrenze", wort: "höchste Spannweite und Höhe ÷ Grenze des Stoffs der Epoche", soll: 1, richtung: "≤" },
                    { key: "ueberHeute", wort: "höchste Spannweite und Höhe ÷ Grenze heutiger Stoffe", soll: 1, richtung: ">" },
                ],
                erwartet: "nicht",
                fehlt: "kein Bau eines Stoffs nach heute",
            },
            4: {
                auge: { pose: "10 Saaten je +1 000 Jahre, das Stadtbild an derselben Pose", vorbild: "Blind-Sortierung: 10 Stadtbilder zur richtigen Saat ≥ 80 %, je Paar ≥ 5 benannte Unterschiede mit Ursache" },
                erwartet: "nicht",
                fehlt: "10 Saaten mit eigener Zukunft: die Sitzung trägt eine Saat ohne Zukunft",
            },
            5: {
                umfang: { soll: 1, wort: "Zivilisation mit dem Energiehaushalt eines Planeten (10¹⁷ W)" },
                masse: [{ key: "bilanzQ", wort: "Energie-Bilanz aus dem Bild ÷ Quelle", soll: 1, tol: 0.5 }],
                erwartet: "nicht",
                fehlt: "kein Megabau, keine planetare Energie",
            },
            6: {
                auge: { pose: "Heimatplanet aus dem Orbit, Sternlicht gegen den Schwarm", vorbild: "Fremdwelt-Probe (R10): Sternlicht gedimmt um den Anteil des Schwarms ±10 %" },
                erwartet: "nicht",
                fehlt: "kein Schwarm um den Stern",
            },
            7: {
                auge: { pose: "100 Saaten, je Epoche ein Bild der Stadt", vorbild: "Kette lückenlos (jedes Ding hat einen Vorgänger) und Neuheit gegen den Korpus der Gegenwart und der Vergleichstitel ≥ 30 % (R10)" },
                erwartet: "nicht",
                fehlt: "keine Technik-Epoche nach heute",
            },
        },
        proben: {
            3: [
                {
                    name: "ATTRAPPE: ein Turm über der Grenze seines Stoffs (1,3×) — er trüge nicht",
                    j: { leiter: "mensch.zukunft.technik", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 1, werte: { unterGrenze: 1.3, ueberHeute: 2 } } } },
                    gruen: false,
                    zahl: /ROT an höchste Spannweite und Höhe ÷ Grenze des Stoffs der Epoche 1\.3 verfehlt/,
                },
                {
                    name: "ein Bau, den heutiger Stoff schon trägt (0,8 der heutigen Grenze)",
                    j: { leiter: "mensch.zukunft.technik", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 1, werte: { unterGrenze: 0.6, ueberHeute: 0.8 } } } },
                    gruen: false,
                    zahl: /ROT an höchste Spannweite und Höhe ÷ Grenze heutiger Stoffe 0\.8 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.zukunft.medien — Bildflächen, Nachrichten, Netz. Gezählt: die Bildflächen der Szene, die Geräte der Bewohner, die
    // Terminals.
    F.leiter("mensch.zukunft.medien", {
        sek: 45,
        pfad: PFAD,
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Flächen " + z.flaechen + " · Geräte " + z.geraet + " · Terminals " + z.terminals + " · Bewohner " + z.bewohner);
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().flaechen, fehlt: "ein Viertel mit 10² bewegten Flächen: die Stadt trägt " + da().flaechen + " Bildflächen" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().flaechen, fehlt: "10⁴ Flächen und Nachrichten: keine Fläche, keine Meldung eines Ereignisses" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().geraet, fehlt: "10⁵ Bewohner mit Gerät: " + da().bewohner + " Bewohner, keiner trägt ein Gerät, kein Netz" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().flaechen, fehlt: "Megastadt mit Hologramm und Raum-Bild: keine Bildfläche in der Welt" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().terminals, fehlt: "20 Terminals mit dem Zustand der Welt: kein Rechner steht in der Welt" }));
            await K.schritt(7, async () => K.nicht(7, { n: da().fremd, fehlt: "Medien fremder Sinne: keine fremde Art in der Welt" }));
            // S1 AM GESETZ (der Fächer): 20 Saaten — je Plan die Flächen seiner Häuser und des Wortschatzes der Straße (Ausstattung,
            // Werke), ob ihr Gesetz einen Inhalt trägt, und die Läden, die ein Inhalt nennen könnte. Trägt das Gesetz keine 10 Flächen,
            // „Umfang nicht erzeugbar“ mit dem fehlenden Gesetz beim Namen
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.MEDIEN_AN, export: "fachwerk-core.js:5182 DORF + :7525 AUSSTATTUNG + :8809 WERKE", leser: "stamm/siedlung-ort.js:3077" },
                    adressen: { saaten: 20 },
                    mit: { nH: 60 },
                    masse: {
                        flaechen: { wie: "summe", feld: "flaechen" },
                        flaechenMax: { wie: "max", feld: "flaechen" },
                        mitInhalt: { wie: (v, aus) => new Set(aus.flatMap((x) => x.w.inhaltWort)).size },
                        laeden: { wie: "summe", feld: "laeden" },
                        haeuser: { wie: "summe", feld: "haeuser" },
                        wortschatz: { wie: "max", feld: "wortschatz" },
                    },
                    schlecht: { feld: "laeden", richtung: "max" },
                    pose: (a, w) => "Saat " + a.saat + ": " + w.laeden + " Häuser mit eigener Rolle (" + w.ladenArten.join(", ") + ") ohne eine Fläche, die sie nennt",
                    ungemessen: ["das Bild der Straße mit den Flächen (Inhalt stimmt mit der Welt, keine zwei gleich): ungemessen bis zum Gerät (die Bildpflicht braucht die Karte)"],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Medien S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W));
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "EINE Straße mit 10 Bildflächen: " + R.fehlt });
                if (W.flaechenMax >= 10) throw new Error("das Gesetz trägt " + W.flaechenMax + " Flächen je Saat: ihr Inhalt gegen die Welt (Laden, Uhr, Wetter) misst diese Probe noch nicht — UNGEMESSEN");
                K.nicht(1, {
                    n: W.flaechenMax,
                    fehlt: "EINE Straße mit 10 Bildflächen: " + W.flaechen + " Flächen an " + R.gemessen + " Saaten (" + W.haeuser + " Häuser, " + W.laeden + " mit eigener Rolle als Inhalt) — kein Gesetz von Schild, Schirm, Leuchtschrift (fachwerk-core.js:7525 AUSSTATTUNG, :8809 WERKE: " + W.wortschatz + " Dinge, " + W.mitInhalt + " mit Inhalt)",
                });
            });
        },
        seite: { ZENSUS: zensusZukunft, FAECHER, MEDIEN_AN },
        sprossen: {
            1: {
                umfang: { soll: 10, wort: "Bildflächen einer Straße (Schild, Schirm, Leuchtschrift)" },
                masse: [
                    { key: "inhaltStimmt", wort: "Anteil der Flächen, deren Inhalt mit der Welt stimmt", soll: 1, richtung: "≥" },
                    { key: "zwillinge", wort: "Flächen mit gleichem Inhalt", soll: 0, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "keine Bildfläche im Gesetz: 0 Flächen an 20 Saaten, kein Schild, Schirm, keine Leuchtschrift (fachwerk AUSSTATTUNG, WERKE)",
            },
            2: {
                auge: { pose: "Messort stadt-voll bei Nacht: die Straße der Flächen auf Augenhöhe", vorbild: "Blindpaar gegen das Foto einer Leuchtschrift-Straße (Shinjuku, Kabukichō) ≤ 80 %; Leuchtdichte folgt dem Inhalt r ≥ 0,7" },
                erwartet: "nicht",
                fehlt: "keine bewegte Fläche",
            },
            3: {
                umfang: { soll: 10000, wort: "Bildflächen und Nachrichten der Stadt" },
                masse: [
                    { key: "gemeldet", wort: "Anteil der 20 Ereignisse, binnen 1 Spielstunde gemeldet", soll: 0.8, richtung: "≥" },
                    { key: "ohneEreignis", wort: "Meldungen im Gegenlauf ohne Ereignis", soll: 0, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "keine Fläche, keine Meldung",
            },
            4: {
                umfang: { soll: 100000, wort: "Bewohner mit Gerät" },
                masse: [
                    { key: "treffen", wort: "Anteil, bei dem B nach der Nachricht von A zum Treffpunkt kommt", soll: 0.8, richtung: "≥" },
                    { key: "ohneNetz", wort: "Treffen im Gegenlauf Netz aus", soll: 0, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "kein Bewohner trägt ein Gerät",
            },
            5: {
                auge: { pose: "Messort stadt-voll bei Nacht und Regen: die Straße der Hologramme", vorbild: "Blindpaar gegen die Nachtstraße der Vergleichstitel (Blade Runner 2049, Cyberpunk 2077) ≥ 50 % und gegen Fotos 2AFC ≤ 65 %" },
                erwartet: "nicht",
                fehlt: "kein Hologramm, kein Raum-Bild",
            },
            6: {
                umfang: { soll: 20, wort: "Terminals der Welt" },
                masse: [{ key: "wahr", wort: "Anteil der Abfragen mit dem wahren Zustand, am Ort nachgeprüft", soll: 0.95, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "kein Rechner in der Welt",
            },
            7: {
                auge: { pose: "je Art ihr Medium an fester Pose", vorbild: "Fremdwelt-Probe (R10): Medium aus den Sinnen der Art vorhergesagt Rang ≥ 0,7, Verständigung mit Gegenlauf" },
                erwartet: "nicht",
                fehlt: "keine fremde Art",
            },
        },
        proben: {
            1: [
                {
                    name: "ATTRAPPE: zehn Flächen, alle mit demselben Inhalt",
                    j: { leiter: "mensch.zukunft.medien", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 10, werte: { inhaltStimmt: 1, zwillinge: 9 } } } },
                    gruen: false,
                    zahl: /ROT an Flächen mit gleichem Inhalt 9 verfehlt/,
                },
                {
                    name: "zehn Flächen, eine zeigt einen Laden, den es nicht gibt",
                    j: { leiter: "mensch.zukunft.medien", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 10, werte: { inhaltStimmt: 0.9, zwillinge: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Anteil der Flächen, deren Inhalt mit der Welt stimmt 0\.9 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.zukunft.maschinenwesen — Roboter, Androiden, Maschinen-Personen. Gezählt: die Maschinen unter den Kreaturen und
    // Werken der Szene.
    F.leiter("mensch.zukunft.maschinenwesen", {
        sek: 45,
        pfad: PFAD,
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Maschinen " + z.maschinen + " unter " + z.kreaturen + " Kreaturen · Bewohner " + z.bewohner);
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().maschinen, fehlt: "10² Maschinen in 10 Bauarten: die Stadt trägt " + da().maschinen + " Maschinen" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().maschinen, fehlt: "10⁴ Maschinen im Stoffwechsel der Stadt: keine Maschine lädt, liefert oder fällt aus" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().maschinen, fehlt: "10³ Androiden und KI-Personen: jede Person der Welt ist ein Mensch (" + da().bewohner + " Bewohner)" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().bewohner + da().maschinen, fehlt: "10⁶ Personen aus Menschen und Maschinen: " + da().bewohner + " Menschen, " + da().maschinen + " Maschinen" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().maschinen, fehlt: "Megastadt mit 10⁷ Maschinen-Personen: keine Maschinen-Person" }));
            await K.schritt(7, async () => K.nicht(7, { n: da().maschinen, fehlt: "Maschinen-Zivilisationen ohne Erbauer: keine Maschine in der Welt" }));
            // S1 AM GESETZ (der Fächer): je Kern der Wortschatz seiner Leiber, Gattungen, Profile und Werke — trägt einer eine Maschine, die
            // sich selbst bewegt, misst die Probe sie an ihrer Aufgabe; sonst „Umfang nicht erzeugbar“ mit dem Fehlen beim Namen
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.MASCHINE_AN, export: "koerper-core.js:80 MOTION · tetrapoda GATTUNGEN · vehicle GATTUNGEN · fachwerk-core.js:2686 BAU_NUTZUNG, :7525 AUSSTATTUNG, :8809 WERKE", leser: "stamm/kreatur-leben.js:2621" },
                    adressen: { orte: ["koerper", "tetrapoda", "fahrzeug", "fachwerk"] },
                    masse: {
                        namen: { wie: "summe", feld: "namen" },
                        maschinen: { wie: (v, aus) => aus.reduce((s, x) => s + x.w.maschinen.length, 0) },
                    },
                    schlecht: { feld: "namen", richtung: "max" },
                    pose: (a, w) => "Kern " + w.kern + ": " + w.namen + " Namen (" + w.auswahl.slice(0, 8).join(", ") + " …), keine Maschine",
                    ungemessen: ["der Roboter an seiner Aufgabe aus 6 m (Schrittfolge, Gelenkgrenzen ≥ 90 %, Blindpaar ≤ 85 %): ungemessen bis zum Gerät, und ohne Roboter im Gesetz ohne Pose"],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Maschinen S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W) + (z ? " · warme Welt: " + z.maschinen + " Maschinen unter " + z.kreaturen + " Kreaturen" : ""));
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "EIN Arbeits-Roboter: " + R.fehlt });
                if (W.maschinen > 0) throw new Error("das Gesetz trägt " + W.maschinen + " Maschinen-Namen: ihren Gang an der Aufgabe misst diese Probe noch nicht — UNGEMESSEN");
                K.nicht(1, {
                    n: W.maschinen + (z ? z.maschinen : 0),
                    fehlt: "EIN Arbeits-Roboter an EINER Aufgabe: 0 Maschinen unter " + W.namen + " Namen der Kerne (koerper MOTION und Rollen, tetrapoda und vehicle GATTUNGEN, fachwerk BAU_NUTZUNG, AUSSTATTUNG, WERKE) — kein Gesetz eines Leibs, der sich als Maschine bewegt",
                });
            });
        },
        seite: { ZENSUS: zensusZukunft, FAECHER, MASCHINE_AN },
        sprossen: {
            1: {
                auge: { pose: "Messort stadt-voll: der Roboter an seiner Aufgabe aus 6 m, Augenhöhe", vorbild: "Film realer Arbeits-Roboter (Boston Dynamics Stretch, Spot): Blindpaar ≤ 85 %, Schrittfolge und Gelenkgrenzen passen zum Bau ≥ 90 %" },
                erwartet: "nicht",
                fehlt: "kein Roboter im Gesetz: 0 Maschinen unter den 76 Namen der Kerne (Leiber, Gattungen, Profile, Werke)",
            },
            2: {
                auge: { pose: "je Bauart eine Maschine aus 6 m", vorbild: "Aufgabe aus dem Bild der Maschine erraten ≥ 70 % (Panel), Gegenlauf Aufgabe getauscht" },
                erwartet: "nicht",
                fehlt: "keine Maschine in der Stadt",
            },
            3: {
                umfang: { soll: 10000, wort: "Maschinen im Stoffwechsel der Stadt" },
                masse: [
                    { key: "lieferQ", wort: "Lieferzeit gekappt ÷ mit Maschinen binnen 1 Spieltag", soll: 1, richtung: ">" },
                    { key: "muellQ", wort: "Müll gekappt ÷ mit Maschinen binnen 1 Spieltag", soll: 1, richtung: ">" },
                ],
                erwartet: "nicht",
                fehlt: "keine Maschine im Stoffwechsel",
            },
            4: {
                umfang: { soll: 1000, wort: "Androiden und KI-Personen" },
                masse: [
                    { key: "tagEigen", wort: "Anteil der 100 gefolgten mit eigenem, wiederkehrendem Tagesprofil", soll: 1, richtung: "≥" },
                    { key: "gespraechWahr", wort: "Anteil wahrer Fakten ihres Lebens im Gespräch", soll: 0.95, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "keine Maschinen-Person",
            },
            5: {
                umfang: { soll: 1000000, wort: "Personen aus Menschen und Maschinen" },
                masse: [
                    { key: "rollenMessbar", wort: "Rollen und Wohnorte je Art aus dem Stadtbild messbar (1 ja)", soll: 1, richtung: "≥" },
                    { key: "planWechsel", wort: "Tagespläne wechseln nach dem Maschinen-Recht, im Gegenlauf nicht (1 ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "keine Gesellschaft aus Menschen und Maschinen",
            },
            6: {
                auge: { pose: "Messort stadt-voll: die Straßenszene auf Augenhöhe", vorbild: "Blindpaar gegen die Straße der Vergleichstitel (Detroit: Become Human) ≥ 50 %, Maschinen mit eigenem Tagesplan je Straße" },
                erwartet: "nicht",
                fehlt: "keine Maschinen-Person",
            },
            7: {
                auge: { pose: "100 Saaten, je Saat eine Maschinen-Zivilisation", vorbild: "Fremdwelt-Probe (R10): Bauart aus Welt und Geschichte vorhergesagt Rang ≥ 0,7, Gegenlauf, Neuheit ≥ 30 %" },
                erwartet: "nicht",
                fehlt: "keine Maschinen-Zivilisation",
            },
        },
        proben: {
            3: [
                {
                    name: "ATTRAPPE: Maschinen gekappt, Lieferzeit und Müll bleiben gleich",
                    j: { leiter: "mensch.zukunft.maschinenwesen", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 10000, werte: { lieferQ: 1, muellQ: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Lieferzeit gekappt ÷ mit Maschinen binnen 1 Spieltag 1 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.zukunft.leib — der veränderte Leib. Gezählt: die Bewohner und ihre Eingriffe (Ersatzglied, Implantat).
    F.leiter("mensch.zukunft.leib", {
        sek: 45,
        pfad: PFAD,
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Bewohner " + z.bewohner + " · mit Eingriff " + z.eingriff);
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().eingriff, fehlt: "10² Bewohner mit 10 Arten von Eingriff: " + da().bewohner + " Bewohner, " + da().eingriff + " mit Eingriff" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().bewohner, fehlt: "Stadt mit 10⁴ Bewohnern, Eingriffe nach Beruf, Stand und Geld: die Stadt trägt " + da().bewohner + ", keinen Eingriff, keine Klinik" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().spielerEingriff, fehlt: "der Spieler verändert seinen Leib: der Zustand des Spielers trägt " + da().spielerEingriff + " Eingriffe, kein Verb wird durch einen Einbau möglich" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().bewohner, fehlt: "Gentechnik über Generationen an 10⁶: " + da().bewohner + " Bewohner ohne Erbgang über Generationen" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().eingriff, fehlt: "10² veränderte Leiber je Straße: kein veränderter Leib" }));
            await K.schritt(7, async () => K.nicht(7, { n: da().fremd, fehlt: "Leiber jenseits des Menschen: kein hochgeladener, verteilter oder für andere Welten gebauter Leib" }));
            // S1 AM GESETZ (der Fächer): 20 Saaten × 60 Leiber (LEIBER_AN, k2-mensch-leib.js) — trägt das Genom, der Bau oder das Können
            // eines Bewohners ein Ersatzglied, und wie ungleich gehen links und rechts (die Achsen des Baus mit eigener Seite, die
            // Ungleichheit der Haltungs-Profile)? DAS BAND DER PROTHESEN-TRÄGER (Richtwert, Volltext ungeprüft: Schrittlängen-Verhältnis
            // der Seiten einseitig Unterschenkel-Amputierter ~0,93–0,98, gesund ~1,00 ± 0,02; PMC9201932 Tab. 2, eScholarship qt41w410h4)
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.LEIBER_AN, export: "stamm/siedlung-bewohner.js:557 _bewohnerGenome (stamm/koerper-leib.js:12 _rollHumanoidGenome, koerper-core.js:1634 BAU_GESETZ)", leser: "stamm/siedlung-bewohner.js:607" },
                    adressen: { saaten: 20 },
                    mit: { nH: 60, n: 60 },
                    masse: {
                        leiber: { wie: "summe", feld: "n" },
                        ersatz: { wie: "summe", feld: "ersatz" },
                        seitig: { wie: "max", feld: "seitig" },
                        asym: { wie: "max", feld: "asym" },
                    },
                    schlecht: { feld: "ersatz", richtung: "min" },
                    pose: (a, w) => "Saat " + a.saat + ": " + w.n + " Leiber, " + w.ersatz + " mit Ersatzglied, Bau-Achsen mit eigener Seite " + w.seitig + ", MOTION links ↔ rechts |Δ| " + w.asym + " rad",
                    ungemessen: ["der Gang des Trägers im Bild (Schrittlänge, Symmetrie gegen Aufnahmen von Prothesen-Trägern): ungemessen bis zum Gerät, und ohne Träger im Gesetz ohne Pose"],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Ersatzglied S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W));
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "EIN Bewohner mit Ersatzglied: " + R.fehlt });
                if (W.ersatz > 0) throw new Error("das Gesetz trägt " + W.ersatz + " Bewohner mit Ersatzglied: ihren Gang gegen das Band misst diese Probe noch nicht — UNGEMESSEN");
                K.nicht(1, {
                    n: W.ersatz,
                    fehlt: "EIN Bewohner mit Ersatzglied: 0 von " + W.leiber + " Leibern an " + R.gemessen + " Saaten — kein Glied fehlt im Genom (stamm/koerper-leib.js:12), der Bau trägt " + W.seitig + " Achsen mit eigener Seite (koerper-core.js:1634), MOTION links = rechts (|Δ| " + W.asym + "): Schritt-Verhältnis 1,000, Band 0,93–0,98",
                });
            });
        },
        seite: { ZENSUS: zensusZukunft, FAECHER, LEIBER_AN },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Bewohner mit Ersatzglied" },
                masse: [
                    { key: "schrittImBand", wort: "Schrittlänge im Band der Aufnahmen von Prothesen-Trägern (1 ja)", soll: 1, richtung: "≥" },
                    { key: "symmetrieImBand", wort: "Symmetrie im Band der Aufnahmen von Prothesen-Trägern (1 ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Bewohner mit Ersatzglied: 0 von 1200 Leibern an 20 Saaten, der Bau ohne Seite, der Gang spiegelgleich",
            },
            2: {
                umfang: { soll: 100, wort: "Bewohner mit Eingriff (10 Arten)" },
                masse: [
                    { key: "leistungImBand", wort: "Anteil der Eingriffe, deren Träger um die genannte Spanne mehr leistet", soll: 1, richtung: "≥" },
                    { key: "gegenlauf", wort: "Anteil, der im Gegenlauf Eingriff aus auf das Unveränderte fällt", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Bewohner mit Eingriff",
            },
            3: {
                umfang: { soll: 10000, wort: "Bewohner der Stadt" },
                masse: [
                    { key: "r", wort: "Eingriffs-Dichte je Viertel ↔ Einkommen und Beruf (r)", soll: 0.5, richtung: "≥" },
                    { key: "klinikQ", wort: "Dichte Jahre nach Entfernen der Klinik ÷ vorher", soll: 1, richtung: "<" },
                ],
                erwartet: "nicht",
                fehlt: "keine Klinik, kein Eingriff, die Stadt bleibt unter 10⁴ Bewohnern",
            },
            4: {
                umfang: { soll: 10, wort: "Eingriffe am Leib des Spielers" },
                masse: [
                    { key: "neueVerben", wort: "Eingriffe, nach denen ein vorher unmögliches Verb möglich ist", soll: 10, richtung: "≥" },
                    { key: "preis", wort: "Eingriffe mit Preis im Leib (Ladung, Wartung, Abstoßung)", soll: 10, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Eingriff am Leib des Spielers",
            },
            5: {
                umfang: { soll: 1000000, wort: "Bewohner über Generationen" },
                masse: [
                    { key: "folgtR", wort: "r Häufigkeit eines Merkmals über 5 Generationen ↔ Vererbung und Gesetz der Stadt", soll: 0, richtung: ">" },
                    { key: "verbotQ", wort: "Häufigkeit nach dem Verbot ÷ im Gegenlauf ohne Verbot", soll: 1, richtung: "<" },
                ],
                erwartet: "nicht",
                fehlt: "kein Erbgang über Generationen",
            },
            6: {
                auge: { pose: "Messort stadt-voll: 100 Passanten einer Straße auf Augenhöhe", vorbild: "Blindpaar gegen die Straße der Vergleichstitel (Cyberpunk 2077) ≥ 50 %, verschiedene Eingriffe je 100 Passanten, Zwillinge 0" },
                erwartet: "nicht",
                fehlt: "kein veränderter Leib",
            },
            7: {
                auge: { pose: "je Zielwelt ein Leib an fester Pose", vorbild: "Fremdwelt-Probe (R10): Zweck und Zielwelt aus dem Leib gelesen Rang ≥ 0,7" },
                erwartet: "nicht",
                fehlt: "kein Leib jenseits des Menschen",
            },
        },
        proben: {
            1: [
                {
                    name: "der Träger geht spiegelgleich (Schritt-Verhältnis 1,000, außerhalb des Bands der Prothesen-Träger) — ROT am Gang",
                    j: { leiter: "mensch.zukunft.leib", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { schrittImBand: 1, symmetrieImBand: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Symmetrie im Band der Aufnahmen von Prothesen-Trägern \(1 ja\) 0 verfehlt/,
                },
            ],
            2: [
                {
                    name: "ATTRAPPE: hundert Eingriffe, keiner ändert, was der Träger kann",
                    j: { leiter: "mensch.zukunft.leib", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 100, werte: { leistungImBand: 0, gegenlauf: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Anteil der Eingriffe, deren Träger um die genannte Spanne mehr leistet 0 verfehlt/,
                },
            ],
        },
    }),
];
module.exports.TECHNIK_ZEIT_AN = TECHNIK_ZEIT_AN;
module.exports.MEDIEN_AN = MEDIEN_AN;
module.exports.MASCHINE_AN = MASCHINE_AN;
