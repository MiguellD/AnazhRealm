// DIE RICHTER-STATIONEN DER PERSPEKTIVE netz (Meisterkarte 2, Kapitel mensch; die Fabrik k2-mensch.js): vier Leitern, je Leiter EIN
// Mess-Programm in der warmen Welt der Sitzung am Messort stadt-voll. Gemessen wird das ERGEBNIS der Welt: die Wege der Pläne der
// Orte, deren Häuser stehen (Klasse nach fachwerk WEGE_KLASSE: Generation 0/1/≥2, Feldweg), ihr Gefälle über dem Grund der Welt
// (`_terrainMacroSurfaceY` — derselbe Grund wie ort-proben.cjs `gassenGefaelle`, siedlung.K3), die festen Blocker-Kisten der Szene
// im Fahrkorridor (± WEGENETZ.halbM, 0,3–1,5 m über der Fahrbahn), die Wagen des Verkehrs (`S.verkehr.wagen`), die Bewohner und die
// Orte ihrer Tage, und die Bauten der Szene nach ihrer Art (Laterne, Brunnen, Ampel, Bahn, Leitung). Wo die Welt den Umfang nicht
// stellen kann, misst die Probe den, den sie stellt („Umfang nicht erzeugbar“ mit der Zahl); wo das Spiel nichts trägt, was den Richter
// beobachtbar machen kann, nennt sie den fehlenden Leser mit der Stelle — trägt die Szene doch einen Bau dieser Art, wirft die Sprosse
// (ihre Messung ist dann nicht gebaut: UNGEMESSEN beim Namen, nie ein falsches ROT).
"use strict";

// ───────────────────────── DIE SEITE DER WELT: das Netz am Spieler (r = Welt, T = THREE) ─────────────────────────
// o: wand (die Probe des Fahrkorridors, bis zur Frist budgetMs)
const NETZ = async (r, T, o) => {
    o = o || {};
    const st = r.state;
    const pm = st.playerMesh.position;
    const t0 = performance.now();
    const r2 = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v * 100) / 100 : null);
    const B = r._bewohnerSiedlungen || new Map();
    const alle = [...B.values()].filter((q) => q && q.plan && Array.isArray(q.plan.slots));
    if (!alle.length) return { fehler: "keine Siedlung mit Plan in der Welt der Sitzung (r._bewohnerSiedlungen leer)" };
    const dS = (q) => Math.hypot(q.ox - pm.x, q.oz - pm.z);
    // WAS STEHT: der Bau der Welt mit dem Samen des Slots an seinem Ort (stadt-proben.cjs)
    const jeSame = new Map();
    for (const e of st.architectures || [])
        if (e && e.position) {
            const k = e.seed >>> 0;
            const L = jeSame.get(k);
            if (L) L.push(e);
            else jeSame.set(k, [e]);
        }
    const steht = (q) => q.plan.slots.filter((sl) => sl && (jeSame.get(sl.seed >>> 0) || []).some((x) => Math.hypot(x.position.x - q.ox - sl.x, x.position.z - q.oz - sl.z) < 1)).length;
    const je = alle.map((q) => ({ q, n: steht(q) })).filter((x) => x.n > 0);
    if (!je.length) return { fehler: "keine Siedlung mit stehenden Häusern (" + alle.length + " Pläne)" };
    const nah = je.filter((x) => dS(x.q) < 600);
    let O = (nah.length ? nah : je)[0];
    for (const x of nah.length ? nah : je) if (nah.length ? x.n > O.n : dS(x.q) < dS(O.q)) O = x;
    const S = O.q;
    // DIE WEGE eines Plans mit ihrer Klasse (fachwerk WEGE_KLASSE, `wegeNetz`: Generation 0 Ortsdurchfahrt, 1 Wohnstraße, ≥ 2 Gasse;
    // ein Feldweg des Plans ist Feldweg)
    const KL = ["ortsdurchfahrt", "wohnstrasse", "gasse"];
    const wege = (q) => {
        const L = [];
        for (const rd of q.plan.roads || []) if (rd && Array.isArray(rd.pts) && rd.pts.length >= 2) L.push({ rd, klasse: KL[Math.max(0, Math.min(2, rd.gen | 0))] });
        for (const rd of q.plan.feldwege || []) if (rd && Array.isArray(rd.pts) && rd.pts.length >= 2) L.push({ rd, klasse: "feldweg" });
        return L;
    };
    const lang = (p) => {
        let L = 0;
        for (let k = 1; k < p.length; k++) L += Math.hypot(p[k].x - p[k - 1].x, p[k].z - p[k - 1].z);
        return L;
    };
    const grund = (x, z) => (typeof r._terrainMacroSurfaceY === "function" ? r._terrainMacroSurfaceY(x, z, true) : r.getTerrainHeightAt(x, z));
    // DAS GEFÄLLE je Saat (ort-proben.cjs `gassenGefaelle`): p95 in % von |Δ Grund| / Länge über jeden Schritt ≥ 0,5 m jeder Gasse
    const gefaelle = (q) => {
        const gs = [];
        for (const rd of q.plan.roads || []) {
            const P = (rd && rd.pts) || [];
            for (let k = 1; k < P.length; k++) {
                const d = Math.hypot(P[k].x - P[k - 1].x, P[k].z - P[k - 1].z);
                if (d >= 0.5) gs.push(Math.abs(grund(q.ox + P[k].x, q.oz + P[k].z) - grund(q.ox + P[k - 1].x, q.oz + P[k - 1].z)) / d);
            }
        }
        gs.sort((a, b) => a - b);
        return gs.length ? +(100 * gs[Math.round(0.95 * (gs.length - 1))]).toFixed(1) : null;
    };
    const saaten = je.map((x) => {
        const W = wege(x.q);
        return { key: x.q.key, seed: x.q.plan.seed >>> 0, steht: x.n, gefaelle: gefaelle(x.q), netzKm: r2(W.reduce((a, w) => a + lang(w.rd.pts), 0) / 1000), klassen: [...new Set(W.map((w) => w.klasse))] };
    });
    const gef = saaten.filter((s) => s.gefaelle != null);
    const steil = gef.length ? gef.reduce((a, s) => (s.gefaelle > a.gefaelle ? s : a)) : null;
    const aus = {
        ort: { key: S.key, name: S.plan.name, steht: O.n, netzKm: r2(wege(S).reduce((a, w) => a + lang(w.rd.pts), 0) / 1000), d: r2(dS(S)) },
        saaten,
        klassen: [...new Set(saaten.flatMap((s) => s.klassen))],
        gefaelleMax: steil ? steil.gefaelle : null,
        gefaelleBei: steil ? steil.key : null,
        welten: [st.worldMeta && st.worldMeta.seed].filter((x) => x != null).length,
    };
    // DIE WAND IM FAHRKORRIDOR: je Meter jeder Klasse jedes stehenden Orts — eine feste Kiste der Szene (ohne Pflanze, ohne stempelfreie
    // Teile wie Wagen und Brücken-Durchlass, ohne Trittfläche) näher als halbM an der Achse, die 0,3–1,5 m über der Fahrbahn steht
    if (o.wand) {
        const halb = AnazhRealm.WEGENETZ && AnazhRealm.WEGENETZ.halbM;
        if (!(typeof halb === "number" && halb > 0)) return Object.assign(aus, { fehler: "AnazhRealm.WEGENETZ.halbM fehlt" });
        const Z = 4;
        const gitter = new Map();
        let gross = 0;
        for (const e of st.architectures || []) {
            if (!e || !Array.isArray(e.blockerAABBs)) continue;
            for (const a of e.blockerAABBs) {
                if (!a || a.pflanze || a.stempelfrei || a.tritt || !isFinite(a.minX) || !isFinite(a.maxX) || !isFinite(a.minZ) || !isFinite(a.maxZ)) continue;
                if (a.maxX - a.minX > 400 || a.maxZ - a.minZ > 400) {
                    gross++;
                    continue;
                }
                for (let i = Math.floor((a.minX - halb) / Z); i <= Math.floor((a.maxX + halb) / Z); i++)
                    for (let k = Math.floor((a.minZ - halb) / Z); k <= Math.floor((a.maxZ + halb) / Z); k++) {
                        const key = i + "," + k;
                        const L = gitter.get(key);
                        if (L) L.push([a, e]);
                        else gitter.set(key, [[a, e]]);
                    }
            }
        }
        const wand = {};
        let geprueftM = 0;
        let voll = true;
        for (const x of je) {
            for (const w of wege(x.q)) {
                const c = (wand[w.klasse] = wand[w.klasse] || { m: 0, stellen: 0, taeter: null });
                const P = w.rd.pts;
                for (let k = 1; k < P.length; k++) {
                    const ax = x.q.ox + P[k - 1].x;
                    const az = x.q.oz + P[k - 1].z;
                    const bx = x.q.ox + P[k].x;
                    const bz = x.q.oz + P[k].z;
                    const L = Math.hypot(bx - ax, bz - az);
                    for (let u = 0; u < L; u += 1) {
                        const px = ax + ((bx - ax) * u) / L;
                        const pz = az + ((bz - az) * u) / L;
                        const y = r.getTerrainHeightAt(px, pz);
                        const hit = (gitter.get(Math.floor(px / Z) + "," + Math.floor(pz / Z)) || []).find(([a]) => {
                            const qx = Math.max(a.minX, Math.min(a.maxX, px));
                            const qz = Math.max(a.minZ, Math.min(a.maxZ, pz));
                            const unten = isFinite(a.botY) ? a.botY : -Infinity;
                            return Math.hypot(qx - px, qz - pz) <= halb && unten < y + 1.5 && a.topY > y + 0.3;
                        });
                        if (hit) {
                            c.stellen++;
                            if (!c.taeter) c.taeter = (hit[1].type || "Bau") + " bei " + px.toFixed(1) + "," + pz.toFixed(1) + " (" + (x.q.key || "?") + ")";
                        }
                    }
                    c.m += L;
                    geprueftM += L;
                }
                if (performance.now() - t0 > (o.budgetMs || 15000)) voll = false;
                if (!voll) break;
            }
            if (!voll) break;
        }
        for (const k of Object.keys(wand)) wand[k].m = Math.round(wand[k].m);
        aus.wand = wand;
        aus.wandStellen = Object.values(wand).reduce((a, c) => a + c.stellen, 0);
        aus.wandVoll = voll;
        aus.wandM = Math.round(geprueftM);
        aus.wandGross = gross;
    }
    // DER VERKEHR: die Wagen des Orts und der Sitzung (fahrend, mit Bewohner am Steuer), die Kreuzungen seines Plans
    const wagenVon = (q) => (q.verkehr && Array.isArray(q.verkehr.wagen) ? q.verkehr.wagen : []);
    const W0 = wagenVon(S);
    aus.verkehr = {
        wagenStadt: W0.length,
        faehrt: W0.filter((w) => w && w.zustand === "faehrt").length,
        amSteuer: W0.filter((w) => w && w.b && w.b.amSteuer).length,
        wagenAlle: alle.reduce((a, q) => a + wagenVon(q).length, 0),
        kreuzungen: S.plan.verkehr && Array.isArray(S.plan.verkehr.kreuzungen) ? S.plan.verkehr.kreuzungen.length : null,
    };
    // DIE BAUTEN DER SZENE nach ihrer Art: Ampel und Übergang, Massenverkehr, Leitungen, Laternen, Brunnen
    const art = (re) => (st.architectures || []).filter((e) => e && typeof e.type === "string" && re.test(e.type));
    const ampeln = art(/(^|_)(ampel|zebra|uebergang|fussgaengerueberweg)(_|$)/i);
    aus.ampeln = ampeln.length;
    const bahn = art(/(^|_)(bahn|bahnhof|gleis|schiene|haltestelle|bahnsteig|tram|metro|ubahn|bus)(_|$)/i);
    aus.bahn = bahn.length;
    // die Fahrgäste: Leiber binnen 5 m eines Baus des Massenverkehrs
    aus.bahnGaeste = alle.reduce((a, q) => a + (q.liste || []).filter((b) => b && b.leib && b.leib.position && bahn.some((e) => Math.hypot(e.position.x - b.leib.position.x, e.position.z - b.leib.position.z) <= 5)).length, 0);
    aus.leitungen = art(/(^|_)(leitung|kabel|rohr|mast|trafo|pumpe|kanal)(_|$)/i).length;
    aus.laternen = art(/^(wand)?laterne_dorf$/).length;
    aus.brunnen = art(/^brunnen_dorf$/).length;
    // die Teilnehmer an Ampel und Übergang: Wagen und Leiber binnen 15 m eines solchen Baus
    {
        const nahAn = (p) => p && ampeln.some((e) => Math.hypot(e.position.x - p.x, e.position.z - p.z) <= 15);
        let n = 0;
        for (const q of alle) {
            for (const w of wagenVon(q)) if (w && w.entry && nahAn(w.entry.position)) n++;
            for (const b of q.liste || []) if (b && b.leib && nahAn(b.leib.position)) n++;
        }
        aus.ampelTeilnehmer = n;
    }
    // DIE WEGE AM TAG aus den Orten der Tage: je Bewohner jeder Ort seines Tags mit Anlass (Werk, Platz, Mahl, Abend, Besuch)
    aus.reisende = alle.reduce((a, q) => a + (Array.isArray(q.liste) ? q.liste.length : 0), 0);
    aus.wegeTag = alle.reduce((a, q) => a + (q.liste || []).reduce((s, b) => s + (b && b.orte ? ["werk", "platz", "mahl", "abend", "besuch"].filter((k) => b.orte[k]).length : 0), 0), 0);
    aus.s = r2((performance.now() - t0) / 1000);
    return aus;
};

const PFAD = ["stamm/siedlung-*.js", "stamm/gelaende-kollision.js", "stamm/gelaende-boden.js", "fachwerk-core.js", "spec/profiband/haushalt.json", "scripts/lib/ort-proben.cjs"];
const KARTE = "[linse-gpu] amd/rdna-3 (Probe)";

module.exports = (F) => [
    // ═════ mensch.netz.gestalt — Das Netz als Gestalt ═════
    // S1 misst die Saaten der Sitzung: Gefälle p95 je Saat (siedlung.K3), die Klassen, das Netz des Orts und die Wand im Fahrkorridor
    // jeder Klasse — die Wand-Probe liest die Szene, sie FÄHRT nicht (das Befahren der Klassen trägt fahrzeug.K2 an EINER Route)
    F.leiter("mensch.netz.gestalt", {
        sek: 45,
        pfad: PFAD,
        seite: { NETZ },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let N;
            try {
                N = await K.welt("return await (" + H.seite.NETZ + ")(r, T, " + JSON.stringify({ wand: true, budgetMs: Math.max(3000, Math.floor((H.rest() - 12) * 1000)) }) + ");", Math.max(10, H.rest() - 4) * 1000);
            } catch (e) {
                N = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!N || N.fehler) throw new Error("das Netz am Messort: " + ((N && N.fehler) || "ohne Antwort"));
                return N;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (N && !N.fehler ? N.saaten.length + " Saaten, Klassen " + N.klassen.join(",") + ", Gefälle p95 bis " + N.gefaelleMax + " %, Wand-Stellen " + N.wandStellen + " auf " + N.wandM + " m" : (N && N.fehler) || "ohne Antwort"));
            await K.schritt(1, async () => {
                da();
                if (!N.wandVoll) throw new Error("die Wand-Probe endete an ihrer Frist (" + N.wandM + " m geprüft)");
                const fehltKl = ["ortsdurchfahrt", "wohnstrasse", "gasse", "feldweg"].filter((k) => !N.klassen.includes(k));
                const wandBei = Object.entries(N.wand).filter(([, c]) => c.stellen > 0).map(([k, c]) => k + " " + c.stellen + " (" + c.taeter + ")");
                K.zahl(1, {
                    n: N.saaten.length,
                    werte: { gefaelle: N.gefaelleMax, klassen: N.klassen.length, wand: N.wandStellen, netzKm: N.ort.netzKm },
                    beleg: "Saaten " + N.saaten.map((s) => s.key + " " + s.gefaelle + " %").join(", ") + " · je Klasse m " + Object.entries(N.wand).map(([k, c]) => k + " " + c.m).join(", ") + " · der Korridor gelesen, nicht gefahren",
                    taeter: [N.gefaelleMax > 9.5 ? "Gefälle " + N.gefaelleMax + " % an " + N.gefaelleBei + " (fachwerk STRASSENGRAPH)" : null, fehltKl.length ? "ohne Klasse " + fehltKl.join(", ") : null, wandBei.length ? "Wand im Korridor: " + wandBei.join("; ") : null].filter(Boolean).join(" · ") || null,
                });
            });
            await K.schritt(2, async () => nicht(2, da().ort.steht, 1000, "10³ Häuser und ~50 km Netz in 32 Saaten: der größte Ort trägt " + N.ort.steht + " stehende Häuser und " + N.ort.netzKm + " km Weg; dazu das OSM-Band — kein Baum trägt es"));
            await K.schritt(3, async () => nicht(3, da().ort.steht, 1e4, "10⁴ Häuser, ~500 km mit Achsen und Ring: der größte Ort trägt " + N.ort.steht + " Häuser"));
            await K.schritt(4, async () => nicht(4, da().ort.steht, 1e5, "10⁵ Häuser, ~5 000 km, Kreuze auf 2 Ebenen: der größte Ort trägt " + N.ort.steht + " Häuser"));
            await K.schritt(5, async () => nicht(5, da().ort.steht, 1e6, "10⁶ Häuser in 5 Ebenen (Megastadt): der größte Ort trägt " + N.ort.steht + " Häuser"));
            await K.schritt(6, async () => nicht(6, da().ort.steht, 1e7, "10⁷ Häuser, ~5·10⁵ km in 3 D: der größte Ort trägt " + N.ort.steht + " Häuser"));
            await K.schritt(7, async () => nicht(7, da().welten, 3, "3 Welten × 32 Saaten: die Sitzung trägt " + N.welten + " Welt"));
        },
        sprossen: {
            1: {
                umfang: { soll: 8, wort: "Saaten (Orte mit stehendem Plan)" },
                masse: [
                    { key: "gefaelle", wort: "Gefälle p95 % (die steilste Saat)", soll: 9.5, richtung: "≤" },
                    { key: "klassen", wort: "Wegeklassen", soll: 4, richtung: "≥" },
                    { key: "wand", wort: "Wand-Stellen im Fahrkorridor", soll: 0, richtung: "≤" },
                    { key: "netzKm", wort: "Netz des Orts km", soll: 10, richtung: "≥" },
                ],
            },
            2: { umfang: { soll: 1000, wort: "Häuser" }, masse: [{ key: "osmBand", wort: "Saaten mit 3 von 4 Kennzahlen im OSM-Band ± 20 %", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "10³ Häuser und das OSM-Band" },
            3: { auge: { pose: "Luftbild der Stadt", vorbild: "Luftbild realer Städte mit Achsen und Ring (10⁴ Häuser): Echtheits-Probe; Breite ↔ Fahrten r ≥ 0,7" }, erwartet: "nicht", fehlt: "10⁴ Häuser" },
            4: { auge: { pose: "64 Netzbilder", vorbild: "Netze realer Kulturen: der Unterscheider ordnet ≥ 80 %" }, erwartet: "nicht", fehlt: "10⁵ Häuser" },
            5: { auge: { pose: "Luftbild der Megastadt", vorbild: "Luftbilder von Tokio und Shanghai; Umweg-Faktor im Tokio-Band" }, erwartet: "nicht", fehlt: "10⁶ Häuser" },
            6: {
                umfang: { soll: 1e7, wort: "Häuser" },
                masse: [
                    { key: "tuerZeit", wort: "Tür-zu-Tür-Zeit ÷ Tokio-Referenz", soll: 1, richtung: "≤" },
                    { key: "umweg", wort: "Umweg-Faktor", soll: 1.4, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "10⁷ Häuser",
            },
            7: { umfang: { soll: 3, wort: "Welten × 32 Saaten" }, masse: [{ key: "kennzahlen", wort: "Kennzahlen aus dem Gesetz der Welt ± 20 % (Anteil)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "3 Welten" },
        },
        proben: {
            1: [
                { name: "ATTRAPPE: 8 Saaten, 4 Klassen, doch ein Stand mitten auf der Gasse", j: { leiter: "mensch.netz.gestalt", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 8, werte: { gefaelle: 7.2, klassen: 4, wand: 3, netzKm: 11 } } } }, gruen: false, zahl: /ROT an Wand-Stellen im Fahrkorridor 3 / },
                { name: "die Trasse folgt dem Hang nicht: 12 %", j: { leiter: "mensch.netz.gestalt", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 8, werte: { gefaelle: 12, klassen: 4, wand: 0, netzKm: 11 } } } }, gruen: false, zahl: /ROT an Gefälle p95 % \(die steilste Saat\) 12 / },
                { name: "eine Saat statt acht", j: { leiter: "mensch.netz.gestalt", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 1, werte: { gefaelle: 7.2, klassen: 4, wand: 0, netzKm: 11 } } } }, gruen: false, zahl: /ROT an Umfang 1 < 8 / },
            ],
        },
    }),

    // ═════ mensch.netz.verkehr — Verkehr mit Anlass ═════
    // S1 urteilt karte2.mensch.netz.verkehr#1 (die 2-km-Route); S2 nennt pflicht.C#1 (headless, keine Akte der Sitzung) als Tafel-Zeile „fehlt“;
    // hier: die Wagen, die Ampeln und die Wege der Tage in der Stadt
    F.leiter("mensch.netz.verkehr", {
        sek: 45,
        pfad: PFAD,
        seite: { NETZ },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let N;
            try {
                N = await K.welt("return await (" + H.seite.NETZ + ")(r, T, {});");
            } catch (e) {
                N = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!N || N.fehler) throw new Error("das Netz am Messort: " + ((N && N.fehler) || "ohne Antwort"));
                return N;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (N && !N.fehler ? N.verkehr.wagenStadt + " Wagen (" + N.verkehr.faehrt + " fahren, " + N.verkehr.amSteuer + " mit Fahrer), Ampeln " + N.ampeln + ", Wege am Tag " + N.wegeTag : (N && N.fehler) || "ohne Antwort"));
            await K.schritt(3, async () => nicht(3, da().ampelTeilnehmer, 100, "10² Teilnehmer an Ampel und Übergang: die Szene trägt " + N.ampeln + " Ampeln und Übergänge, an ihnen " + N.ampelTeilnehmer + " Teilnehmer; die Stadt hat " + N.verkehr.kreuzungen + " Kreuzungen und " + N.verkehr.wagenStadt + " Wagen"));
            await K.schritt(4, async () => nicht(4, da().verkehr.wagenStadt, 1e4, "10⁴ Wagen in der Stadt (Stau von selbst): die Stadt trägt " + N.verkehr.wagenStadt + " Wagen, " + N.verkehr.faehrt + " fahren"));
            await K.schritt(5, async () => nicht(5, da().wegeTag, 1e5, "10⁵ Wege am Tag mit Anlass: die Tage der " + N.reisende + " Bewohner tragen " + N.wegeTag + " Orte mit Anlass"));
            await K.schritt(6, async () => nicht(6, da().verkehr.wagenAlle, 1e7, "10⁷ Fahrzeuge aller Moden: die Sitzung trägt " + N.verkehr.wagenAlle + " Wagen, eine Mode, " + N.bahn + " Bauten anderer Moden"));
            await K.schritt(7, async () => nicht(7, da().wegeTag, 1e9, "10⁹ Wege am Tag in 3 D, Schiffe und Flüge: die Tage der Sitzung tragen " + N.wegeTag + " Orte mit Anlass"));
            await K.schritt(8, async () => nicht(8, da().reisende, 1e10, "10¹⁰ Reisende über Epochen und Sonnensysteme: die Sitzung trägt " + N.reisende + " Bewohner in einer Welt"));
        },
        sprossen: {
            3: {
                umfang: { soll: 100, wort: "Teilnehmer an Ampel und Übergang" },
                masse: [
                    { key: "zeitluecke", wort: "Zeitlücke Median s", von: 1, bis: 3 },
                    { key: "konflikte", wort: "Konflikte", soll: 0, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "Ampel und Übergang",
            },
            4: {
                umfang: { soll: 1e4, wort: "Wagen in der Stadt" },
                masse: [
                    { key: "fundamental", wort: "Fundamentaldiagramm, Abweichung", soll: 0.25, richtung: "≤" },
                    { key: "stauwelle", wort: "Stauwelle rückwärts km/h", von: 15, bis: 20 },
                ],
                erwartet: "nicht",
                fehlt: "10⁴ Wagen",
            },
            5: {
                umfang: { soll: 1e5, wort: "Wege am Tag mit Anlass" },
                masse: [
                    { key: "ganglinie", wort: "Ganglinie r", soll: 0.8, richtung: "≥" },
                    { key: "aussteigen", wort: "verfolgte Fahrer am passenden Ort ausgestiegen", soll: 0.9, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "10⁵ Wege am Tag",
            },
            6: {
                umfang: { soll: 1e7, wort: "Fahrzeuge aller Moden" },
                masse: [
                    { key: "reisezeit", wort: "Reisezeit bei gesperrter Achse gegen den Referenzlauf, Abweichung", soll: 0.3, richtung: "≤" },
                    { key: "moden", wort: "Moden im Modal Split", soll: 1, richtung: ">", herkunft: "„Modal Split“ über „alle Moden“: ein Split trägt mehr als eine Mode — das Band selbst nennt die Karte ohne Zahl" },
                ],
                erwartet: "nicht",
                fehlt: "10⁷ Fahrzeuge",
            },
            7: { auge: { pose: "Video der Stadt im Verkehr", vorbild: "Videos realen Verkehrs (Echtheits-Probe), Kultur erkannt ≥ 80 %, verfolgtes Fahrzeug kommt an ≥ 98 %" }, erwartet: "nicht", fehlt: "10⁹ Wege am Tag" },
            8: { umfang: { soll: 1e10, wort: "Reisende" }, masse: [{ key: "anlass", wort: "Anlass erklärt", soll: 0.95, richtung: "≥" }], erwartet: "nicht", fehlt: "10¹⁰ Reisende" },
        },
        bestehend: {
            1: "karte2.mensch.netz.verkehr#1",
            2: {
                station: "pflicht.C#1",
                fehlt: "die Mechanik (Wagen am Steuer, Tag + Nacht, 10 min, 0 Berührung, 100 % am Ziel) misst pflicht.C#1 nur headless, „Wagen im Bild“ misst pflicht.C#2 an stadt-voll — keine Probe ≤ 60 s trägt 10 min",
            },
        },
        proben: {
            4: [
                { name: "ATTRAPPE: 10⁴ Wagen, der Stau steht still statt rückwärts zu wandern", j: { leiter: "mensch.netz.verkehr", adapter: KARTE, sprossen: { 4: { art: "zahl", n: 1e4, werte: { fundamental: 0.1, stauwelle: 0 } } } }, gruen: false, zahl: /ROT an Stauwelle rückwärts km\/h 0 / },
            ],
        },
    }),

    // ═════ mensch.netz.massenverkehr — Massenverkehr und dritte Dimension ═════
    // stadt-voll: die Bauten des Massenverkehrs in der Szene (Bahn, Halt, Gleis, Bahnsteig) — 0: der fehlende Leser an der Stelle, an
    // der der Verkehr einer Siedlung entsteht
    F.leiter("mensch.netz.massenverkehr", {
        sek: 45,
        pfad: PFAD,
        seite: { NETZ },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let N;
            try {
                N = await K.welt("return await (" + H.seite.NETZ + ")(r, T, {});");
            } catch (e) {
                N = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!N || N.fehler) throw new Error("das Netz am Messort: " + ((N && N.fehler) || "ohne Antwort"));
                if (N.bahn > 0) throw new Error("die Szene trägt " + N.bahn + " Bauten des Massenverkehrs — die Messung der Sprosse ist nicht gebaut");
                return N;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: Bauten des Massenverkehrs " + (N && !N.fehler ? N.bahn + " · Wagen " + N.verkehr.wagenStadt : (N && N.fehler) || "ohne Antwort"));
            const leser = [
                [1, "keine Linie, kein Halt, kein Fahrzeug des Massenverkehrs: der Verkehr einer Siedlung legt nur Wagen an Wenden an", "stamm/siedlung-verkehr.js:27"],
                [2, "keine Korridore und keine Wahl des Modus nach Last: es gibt nur den Wagen", "stamm/siedlung-verkehr.js:27"],
                [3, "kein Tunnel, kein Bahnsteig, keine Treppe einer Tiefen- oder Hochebene: der Erdbau legt nur Grund, Platte und Vorplatz", "stamm/gelaende-boden.js:851"],
                [4, "kein Liniennetz, dessen Kosten, Effizienz und Fehlertoleranz zu messen wären", "stamm/siedlung-verkehr.js:27"],
                [6, "keine Fernbahn: zwischen den Orten liegen nur Feldwege", "stamm/siedlung-ort.js:3285"],
            ];
            for (const [n, fehlt, wo] of leser)
                await K.schritt(n, async () => {
                    da();
                    K.leser(n, { fehlt, wo, n: N.bahn });
                });
            await K.schritt(5, async () => nicht(5, da().bahnGaeste, 1e6, "10⁶ Fahrgäste am Tag auf 5+ Ebenen (Shinjuku): die Szene trägt " + N.bahn + " Bauten des Massenverkehrs, an ihnen " + N.bahnGaeste + " Fahrgäste"));
            await K.schritt(7, async () => nicht(7, da().bahn, 45, "5 Bahnhöfe × 3 Saaten × 3 Epochen: die Szene trägt " + N.bahn + " Bahnhöfe in " + N.welten + " Welt"));
        },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Linie mit 2 Halten" },
                masse: [
                    { key: "fahrgaesteH", wort: "Bewohner je Stunde", soll: 10, richtung: "≥" },
                    { key: "mitfahrt", wort: "der Spieler fährt mit (1 = ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Linie, kein Halt",
                wo: "stamm/siedlung-verkehr.js:27",
            },
            2: {
                umfang: { soll: 10, wort: "Korridore" },
                masse: [
                    { key: "modusPasst", wort: "Modus passt zur Last", soll: 0.8, richtung: "≥" },
                    { key: "querA", wort: "Querbeschleunigung m/s²", soll: 1, richtung: "≤" },
                ],
                erwartet: "leser",
                fehlt: "keine Korridore, kein Modus",
                wo: "stamm/siedlung-verkehr.js:27",
            },
            3: { umfang: { soll: 1000, wort: "Fahrgäste am Tag" }, masse: [{ key: "brueche", wort: "Brüche Straße → Zug → Ziel", soll: 0, richtung: "≤" }], erwartet: "leser", fehlt: "keine Tiefen- und Hochebene", wo: "stamm/gelaende-boden.js:851" },
            4: { umfang: { soll: 1e5, wort: "Fahrgäste am Tag auf 10 Linien" }, masse: [{ key: "tero", wort: "Kosten, Effizienz, Fehlertoleranz im Band (Tero 2010), Anteil", soll: 0.8, richtung: "≥" }], erwartet: "leser", fehlt: "kein Liniennetz", wo: "stamm/siedlung-verkehr.js:27" },
            5: { auge: { pose: "Bahnsteig zur Spitzenstunde", vorbild: "Bahnsteige in Shinjuku (Fruin D–E): Bild-Probe" }, erwartet: "nicht", fehlt: "10⁶ Fahrgäste am Tag" },
            6: {
                umfang: { soll: 1e8, wort: "Fahrgäste am Tag" },
                masse: [
                    { key: "ladebilder", wort: "Ladebilder im Fernzug", soll: 0, richtung: "≤" },
                    { key: "erreichbar", wort: "Punkte erreichbar und belebt", soll: 0.95, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Fernbahn",
                wo: "stamm/siedlung-ort.js:3285",
            },
            7: { auge: { pose: "Bahnhof je Saat und Epoche", vorbild: "reale Bahnhöfe je Epoche: begehbar, belebt, echt" }, erwartet: "nicht", fehlt: "Bahnhöfe über Saaten und Epochen" },
        },
        proben: {
            1: [
                { name: "ATTRAPPE: die Linie liegt, niemand fährt mit", j: { leiter: "mensch.netz.massenverkehr", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 1, werte: { fahrgaesteH: 2, mitfahrt: 1 } } } }, gruen: false, zahl: /ROT an Bewohner je Stunde 2 / },
            ],
        },
    }),

    // ═════ mensch.netz.stoffwechsel — Stadtstoffwechsel ═════
    // stadt-voll: die Verbraucher der Szene (Laternen, Brunnen) und ihre Leitungen (0) — der fehlende Leser an der Stelle, an der der
    // Verbraucher steht; wo der Umfang fehlt (10⁶ Häuser, fremde Welten), die gemessene Zahl
    F.leiter("mensch.netz.stoffwechsel", {
        sek: 45,
        pfad: PFAD,
        seite: { NETZ },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let N;
            try {
                N = await K.welt("return await (" + H.seite.NETZ + ")(r, T, {});");
            } catch (e) {
                N = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!N || N.fehler) throw new Error("das Netz am Messort: " + ((N && N.fehler) || "ohne Antwort"));
                return N;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: Laternen " + (N && !N.fehler ? N.laternen + " · Brunnen " + N.brunnen + " · Leitungen " + N.leitungen : (N && N.fehler) || "ohne Antwort"));
            const leser = [
                [1, "die Laterne brennt ohne Leitung: keine Trennung, von der ein Licht abhinge", "stamm/siedlung-ort.js:562", "laternen"],
                [2, "der Brunnen ohne Netz: kein Wasser, Strom, Abwasser oder Müll mit Bedarf je Kopf und Bilanz", "stamm/siedlung-ort.js:663", "brunnen"],
                [4, "kein Strom, keine Pumpe, keine Ampel: kein Ausfall, der kaskadieren könnte", "stamm/siedlung-verkehr.js:27", "laternen"],
                [6, "keine Fernleitung zwischen den Orten: sie verbinden nur Feldwege", "stamm/siedlung-ort.js:3285", "laternen"],
            ];
            for (const [n, fehlt, wo, was] of leser)
                await K.schritt(n, async () => {
                    da();
                    if (N.leitungen > 0) throw new Error("die Szene trägt " + N.leitungen + " Leitungen — die Messung der Sprosse ist nicht gebaut");
                    K.leser(n, { fehlt: fehlt + " (" + N[was] + " " + (was === "brunnen" ? "Brunnen" : "Laternen") + " in der Szene, 0 Leitungen)", wo, n: N[was] });
                });
            await K.schritt(3, async () => nicht(3, da().leitungen, 1, "aufschneidbare Leitungen unter den Straßen: die Szene trägt " + N.leitungen + " Leitungen"));
            await K.schritt(5, async () => nicht(5, da().ort.steht, 1e6, "10⁶ Häuser, jedes Fenster ein Verbraucher: der größte Ort trägt " + N.ort.steht + " stehende Häuser"));
            await K.schritt(7, async () => nicht(7, da().welten, 3, "32 Saaten × 3 Welten mit fremden Stoffen: die Sitzung trägt " + N.welten + " Welt"));
        },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Netz eines Orts" },
                masse: [
                    { key: "dunkelS", wort: "abhängige Lichter dunkel nach s", soll: 1, richtung: "≤" },
                    { key: "restBrennt", wort: "der Rest brennt (Anteil)", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Leitung hinter der Laterne",
                wo: "stamm/siedlung-ort.js:562",
            },
            2: {
                umfang: { soll: 1000, wort: "Häuser an Wasser, Strom, Abwasser, Müll" },
                masse: [
                    { key: "bilanz", wort: "Bilanz, Abweichung", soll: 0.05, richtung: "≤" },
                    { key: "netzfolge", wort: "Hähne versiegen in Netzreihenfolge (Anteil)", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "kein Netz hinter dem Brunnen",
                wo: "stamm/siedlung-ort.js:663",
            },
            3: { auge: { pose: "Schnitt durch die Straße", vorbild: "Rohre in plausibler Tiefe (Prüfer); Gefälle ≥ Norm 100 %" }, erwartet: "nicht", fehlt: "aufschneidbare Leitungen" },
            4: {
                umfang: { soll: 1e5, wort: "Häuser" },
                masse: [
                    { key: "topologie", wort: "Dunkel-Reihenfolge folgt der Topologie (Anteil)", soll: 1, richtung: "≥" },
                    { key: "reisezeit", wort: "Reisezeit nach dem Ausfall ÷ vorher", soll: 1, richtung: ">" },
                ],
                erwartet: "leser",
                fehlt: "kein Strom, keine Pumpe, keine Ampel",
                wo: "stamm/siedlung-verkehr.js:27",
            },
            5: { umfang: { soll: 1e6, wort: "Häuser" }, masse: [{ key: "blackMarble", wort: "Nachtbild gegen Black Marble, Abweichung", soll: 0.2, richtung: "≤" }], erwartet: "nicht", fehlt: "10⁶ Häuser" },
            6: {
                umfang: { soll: 1, wort: "Kontinent mit Fernleitungen" },
                masse: [
                    { key: "kennedy", wort: "Steigung gegen die Kennedy-Kurve, Abweichung", soll: 0.3, richtung: "≤" },
                    { key: "fernausfall", wort: "Fernausfall vorhergesagt (Anteil)", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Fernleitung",
                wo: "stamm/siedlung-ort.js:3285",
            },
            7: { umfang: { soll: 3, wort: "Welten × 32 Saaten" }, masse: [{ key: "wachstumOhneQuelle", wort: "Wachstum ohne Quelle", soll: 0, richtung: "≤" }], erwartet: "nicht", fehlt: "3 Welten mit fremden Stoffen" },
        },
        proben: {
            1: [
                { name: "ATTRAPPE: die Leitung getrennt, die Lichter erlöschen erst nach 3 s", j: { leiter: "mensch.netz.stoffwechsel", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 1, werte: { dunkelS: 3, restBrennt: 1 } } } }, gruen: false, zahl: /ROT an abhängige Lichter dunkel nach s 3 / },
            ],
        },
    }),
];
