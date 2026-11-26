// KARTE 2 · KOSMOS — die Leitern planet.kosmos.* (vision/meisterkarte-2.json): je Leiter EINE Station — EIN Messprogramm über alle Sprossen, ihre
// Sprossen als Zwillinge derselben Probe (staffel = die Sprosse) — über DAS LEITER-GERÜST in k2-same.js (das Gesetz der Leiter,
// die Arten gemessen · umfang · leser · auge, die Wand des Wortlauts, der Selbsttest je Sprosse). Der Preis jeder Sprosse kommt
// aus dem Strom der Sitzung (richter-akte.cjs), an der dichtesten Pose, an der die Probe endet.
"use strict";
const { leiter } = require("./k2-same.js").geruest;
const { FAECHER } = require("./faecher.js");

// DER HIMMEL AN EINER ADRESSE (planet.kosmos.systeme#1, das Gesetz des Fächers, stationen/faecher.js): a.zeit ist der Tag der Welt.
// Gerufen wird der Leser des Spiels selbst (stamm/bild-himmel.js:327 `_kosmosJetzt`: die Bahnen in Stufen von HIMMEL.kosmosSchrittTage,
// welt-licht `kosmosZeit`) an der Uhr dieser Adresse, gegen die Ephemeride der eigenen Bahn im selben Augenblick (welt-licht
// `kosmosZeit` am Tag a.zeit, ohne Stufe): je Planet der Winkel zwischen Himmel und Bahn. Die Uhr der Welt kehrt danach zurück
// DER MOND (kosmos-bahn): der Leser des Spiels (stamm/bild-himmel.js `_dayNightMoonDirection` — dieselbe Richtung, die sein Körper,
// sein Licht und die Belichtung lesen) zur Uhr der Adresse, gegen die Ephemeride seiner Bahn im selben Augenblick: ein EIGENER
// Kepler-Löser über die Elemente des Gesetzes (`K.heim.system.mond` um die Heimat, die Heimat um den Stern), auf die Sonne des
// Kalenders gedreht (die Länge der Saison-Phase), in den Äquator (die Schiefe des Körpers), an den Ort (die Sternzeit aus der Sonne
// der Uhr, die Breite des Ankers) und auf den Boden (topozentrisch, der Radius des Körpers) — Matrizen, nie die Formeln des Spiels.
const HIMMEL_AN = async (r, T, a) => {
    // DIE EPHEMERIDE REIST MIT (26.11.): das Gesetz des Fächers läuft in der SEITE, dort gibt es nur, was diese Funktion selbst trägt —
    // als Nachbar im Modul warf sie an allen 1 460 Adressen „MOND_EPHEMERIDE is not defined“ (Radeon und GTX am af816566).
    const MOND_EPHEMERIDE = (K, t, phase, winkel, breite, k) => {
        const SY = K.heim.system;
        const kepler = (p) => {
            const M = p.M0 + (2 * Math.PI * t) / p.P;
            let E = M;
            for (let i = 0; i < 50; i++) { const d = (E - p.e * Math.sin(E) - M) / (1 - p.e * Math.cos(E)); E -= d; if (Math.abs(d) < 1e-15) break; }
            const xb = p.a * (Math.cos(E) - p.e), yb = p.a * Math.sqrt(1 - p.e * p.e) * Math.sin(E), c = Math.cos, s = Math.sin;
            const x1 = xb * c(p.peri) - yb * s(p.peri), y1 = (xb * s(p.peri) + yb * c(p.peri));
            return [x1 * c(p.knoten) - y1 * c(p.inkl) * s(p.knoten), y1 * s(p.inkl), x1 * s(p.knoten) + y1 * c(p.inkl) * c(p.knoten)];
        };
        const rH = kepler(SY.planeten[SY.heim]), m = kepler(SY.mond);
        const ek = (v) => [v[0], v[2], -v[1]]; // (x, z, −y): rechtshändig, der Pol der Bahnen −ŷ
        const sE = ek(rH.map((v) => -v)), mE = ek(m);
        const rz = (v, w) => [Math.cos(w) * v[0] - Math.sin(w) * v[1], Math.sin(w) * v[0] + Math.cos(w) * v[1], v[2]];
        const rx = (v, w) => [v[0], Math.cos(w) * v[1] - Math.sin(w) * v[2], Math.sin(w) * v[1] + Math.cos(w) * v[2]];
        const dreh = 2 * Math.PI * phase + (breite < 0 ? Math.PI : 0) - Math.atan2(sE[1], sE[0]);
        const sQ = rx(rz(sE, dreh), k.neigungRad), mQ = rx(rz(mE, dreh), k.neigungRad);
        const theta = (winkel - Math.PI / 2) * (k.drehsinn < 0 ? -1 : 1) + Math.atan2(sQ[1], sQ[0]);
        const q = rz(mQ, -theta), sp = Math.sin(breite), cp = Math.cos(breite);
        const dKm = Math.hypot(...m) * 149597870.7, n0 = Math.hypot(...q);
        const g = [q[1] / n0, (cp * q[0] + sp * q[2]) / n0, (sp * q[0] - cp * q[2]) / n0];
        const top = [g[0] * dKm, g[1] * dKm - k.radiusKm, g[2] * dKm], n = Math.hypot(...top);
        return top.map((v) => v / n);
    };
    const st = r.state, wm = st.worldMeta, WL = window.__weltLicht;
    if (!WL || typeof WL.kosmosZeit !== "function" || typeof r._kosmosJetzt !== "function") return { fehlt: "kein Kosmos-Gesetz (welt-licht kosmosZeit) oder kein Leser (_kosmosJetzt)" };
    if (typeof r._dayNightMoonDirection !== "function" || !r._sonnenAnker) return { fehlt: "kein Leser des Monds (stamm/bild-himmel.js `_dayNightMoonDirection`) oder kein Anker der Sonne (`_sonnenAnker`)" };
    const tag0 = wm.tag, uhr0 = st.timeOfDay, uhr = a.zeit - Math.floor(a.zeit);
    let k, mond;
    try {
        wm.tag = Math.floor(a.zeit);
        st.timeOfDay = uhr;
        k = r._kosmosJetzt();
        mond = r._dayNightMoonDirection(WL.sonnenWinkel(uhr)).toArray();
    } finally {
        if (tag0 === undefined) delete wm.tag;
        else wm.tag = tag0;
        st.timeOfDay = uhr0;
    }
    const himmel = k.zeit.planeten, bahn = WL.kosmosZeit(k.K, a.zeit).planeten;
    const winkel = (p, q) => (Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))) * 180) / Math.PI;
    const grad = himmel.map((p, i) => winkel(p.richtung, bahn[i].richtung));
    const A = r._sonnenAnker, phase = typeof st.seasonPhase === "number" ? st.seasonPhase : 0.375;
    const mondGrad = winkel(mond, MOND_EPHEMERIDE(k.K, a.zeit, phase, WL.sonnenWinkel(uhr), A.breite, A.koerper));
    return { abw: Math.max(0, mondGrad, ...grad), mond: mondGrad, planeten: himmel.length, stufe: k.zeit.t, jahrTage: k.jahrTage };
};
// DER HIMMEL EINER SAAT AN EINER ADRESSE (planet.kosmos.ereignisse#1 · galaxien#1, das Gesetz des Fächers): a.saat die Saat des Kosmos
// („kosmos-s<k>“, null die Heimat `_planetSamen`), a.zeit der Tag. Gerufen wird das Gesetz, das der Himmel liest (stamm/bild-himmel.js:335
// `_kosmosJetzt`: welt-licht kosmos → kosmosHimmel → kosmosZeit) — nie die Szene. EREIGNIS_AN sucht im Kosmos und in seiner Zeit die
// Ereignisse (Meteor, Strom, Radiant, Komet, Feuerball); fehlen sie, nennt es die Felder, die das Gesetz trägt
const EREIGNIS_AN = async (r, T, a) => {
    const WL = window.__weltLicht;
    if (!WL || typeof WL.kosmos !== "function" || typeof WL.kosmosZeit !== "function") return { fehlt: "kein Kosmos-Gesetz (welt-licht kosmos, kosmosZeit)" };
    const saat = a.saat == null ? r._planetSamen() : "kosmos-s" + a.saat, jahrTage = r._kosmosJetzt().jahrTage;
    const K = WL.kosmos(saat, { jahrTage }), Z = WL.kosmosZeit(K, a.zeit);
    const re = /meteor|schnuppe|strom|radiant|komet|comet|bolid|feuerball/i, aus = [];
    const tief = (o, p, d) => {
        if (!o || typeof o !== "object" || ArrayBuffer.isView(o) || Array.isArray(o) || o instanceof Map || d > 3) return;
        for (const k of Object.keys(o)) if (k[0] !== "_") { if (re.test(k)) aus.push(p + k); tief(o[k], p + k + ".", d + 1); }
    };
    tief(Z, "zeit.", 0);
    tief(K, "kosmos.", 0);
    if (!aus.length) return { fehlt: "welt-licht.js:2020 kosmosZeit gibt " + Object.keys(Z).join("/") + ", welt-licht.js:1616 kosmos trägt " + Object.keys(K).filter((k) => k[0] !== "_").join("/") + " — kein Meteor, kein Strom, kein Radiant" };
    return { saat, t: a.zeit, felder: aus, rate: null };
};
// GALAXIE_AN: der Himmel des bloßen Auges der Saat (welt-licht kosmosHimmel: die Richtungen der Sterne im Rahmen des Felds) — das Band
// der Heim-Galaxie (der größte Anteil der Sterne in ±10° um einen von 400 Großkreisen, gleichverteilt ≈ 0,17) — und die Ziele außerhalb
// der Heim-Galaxie, die das Gesetz trägt
const GALAXIE_AN = async (r, T, a) => {
    const WL = window.__weltLicht;
    if (!WL || typeof WL.kosmos !== "function" || typeof WL.kosmosHimmel !== "function") return { fehlt: "kein Kosmos-Gesetz (welt-licht kosmos, kosmosHimmel)" };
    const saat = a.saat == null ? r._planetSamen() : "kosmos-s" + a.saat, jahrTage = r._kosmosJetzt().jahrTage;
    const K = WL.kosmos(saat, { jahrTage }), Hm = WL.kosmosHimmel(K), d = Hm.richtung, n = Hm.n, s10 = Math.sin((10 * Math.PI) / 180);
    let band = 0;
    for (let k = 0; k < 400; k++) {
        const zc = 1 - (2 * (k + 0.5)) / 400, rr = Math.sqrt(1 - zc * zc), ph = k * 2.399963, p0 = rr * Math.cos(ph), p2 = rr * Math.sin(ph);
        let c = 0;
        for (let i = 0; i < n; i++) if (Math.abs(d[3 * i] * p0 + d[3 * i + 1] * zc + d[3 * i + 2] * p2) <= s10) c++;
        if (n && c / n > band) band = c / n;
    }
    const ziele = Object.keys(K).filter((k) => /nachbar|galaxien|gruppe|haufen|andromeda|netz/i.test(k));
    return { saat, band: Math.round(band * 1000) / 1000, sterne: n, ziele: ziele.length, galaxieN: K.galaxie ? K.galaxie.N : null, felder: Object.keys(K).filter((k) => k[0] !== "_").join("/") };
};
// BAUART_AN (planet.kosmos.kunstwelten#1): das Gesetz einer Welt des Ultiversums (a.ort, „heim“ die geladene) in seiner Normalform
// (stamm/speicher-welten.js:118 `_weltGesetz` — dieselbe, die Schwere, Himmel, Wetter, Gelände und Ort der Welt lesen) — trägt es eine
// Bauart (Zylinder, Ring, Schale, Hohlwelt) oder eine Drehung, die einen Wurf um die Coriolis-Ablenkung führte?
const BAUART_AN = async (r, T, a) => {
    const A = r.constructor;
    let G;
    try {
        G = a.ort === "heim" ? A._weltGesetz(r.state.worldMeta) : A._weltGesetz({ gesetz: A.ULTIVERSUM[a.ort] });
    } catch (e) {
        return { welt: a.ort, abgelehnt: String((e && e.message) || e).slice(0, 120) };
    }
    const felder = Object.keys(G), bau = felder.filter((k) => /bauart|zylinder|ring|schale|hohl|dreh|rotation|omega/i.test(k));
    return { welt: a.ort, felder: felder.join("/"), bau: bau.length, schwere: G.schwere, schwereArt: typeof G.schwere };
};
const LEITERN = [];

// ═══════════════════════════════════════ Perspektive kosmos ═══════════════════════════════════════
{
    // ─────────── planet.kosmos.himmelsmechanik — Himmelsmechanik: Sonne, Mond, Jahr, Zeitalter ───────────
    // S1 trägt bestehend g3.js (karte2.planet.kosmos.himmelsmechanik#1). Die Probe fährt den Tag der Welt (`worldMeta.tag`,
    // stamm/bild-himmel.js:2738) über 365 Tage und zählt die verschiedenen Mittagshöhen der EINEN Sonnenbahn (`_dayNightSunDirection`,
    // stamm/bild-himmel.js:1383), dann 30 Tage die Phase Sonne ↔ Mond an ihren Körpern (`userData.skyOffset`, stamm/bild-himmel.js:2588/2600).
    // Präzession, Neigung und Äonen: der Himmel liest keine Epoche (leser).
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.himmelsmechanik",
            sek: 40,
            mutiert: true,
            pfad: ["stamm/bild-himmel.js", "stamm/dirigent-takt.js", "stamm/dirigent-ankunft.js", "stamm/feld-leben.js", "welt-licht.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Größe des Himmels" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "sonnenhoehe_abw_grad", richtung: "≤", wert: 0.5, wortlaut: "Sonnenhöhe aus der Schattenlänge an 3 Breiten × 4 Daten gegen Meeus ±0,5°" }],
                    umfang: { verlangt: 365, einheit: "Tage mit eigener Mittagshöhe", wortlaut: "jede Breite × 365 Tage", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "terminator_abw_grad", richtung: "≤", wert: 3, wortlaut: "Terminator-Winkel ±3°" },
                        { wort: "mondaufgang_abw_min", richtung: "≤", wert: 10, wortlaut: "Mondaufgang ±10 min" },
                        { wort: "neumond_ev", richtung: "≥", wert: 2, wortlaut: "Neumond-Nacht ≥ 2 EV dunkler als Vollmond" },
                    ],
                    umfang: { verlangt: 29.53, einheit: "Tage Mondumlauf (Tage mit wechselnder Phase)", wortlaut: "1 Mond, 29,53 d", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "saros_abw_d", richtung: "≤", wert: 1, wortlaut: "Saros-Periode ±1 d" },
                        { wort: "kernschatten_abw_pct", richtung: "≤", wert: 10, wortlaut: "Kernschatten-Geschwindigkeit ±10 %" },
                    ],
                    umfang: { verlangt: 100, einheit: "Jahre mit Finsternis-Geometrie", wortlaut: "Finsternisse über 10² Jahre", feld: "umfang" },
                },
                5: { soll: [{ wort: "pol_abw_grad", richtung: "≤", wert: 1, wortlaut: "Nordhimmel bei −12 000 gegen Planetariums-Referenz, Pol ±1°" }] },
                6: {
                    soll: [
                        { wort: "neigung_abw_grad", richtung: "≤", wert: 0.1, wortlaut: "Mittagshöhe zur Sommerwende folgt der Neigung nach Laskar ±0,1°" },
                        { wort: "perihel_abw_d", richtung: "≤", wert: 2, wortlaut: "Perihel-Datum ±2 d" },
                    ],
                },
                7: {
                    soll: [
                        { wort: "tag_abw_h", richtung: "≤", wert: 0.5, wortlaut: "Erd-Saat −620 Ma: Tag 21,9 ±0,5 h" },
                        { wort: "mondscheibe_mal", richtung: "≥", wert: 1.3, wortlaut: "−3 Ga: Mondscheibe ≥ 1,3× heute" },
                    ],
                },
                8: {
                    soll: [{ wort: "anteil_pct", richtung: "≥", wert: 99, wortlaut: "1 000 Saaten × Orte × Zeiten: Sonnen-/Mondstand gegen unabhängige N-Körper-Rechnung ±1° in ≥ 99 %" }],
                    umfang: { verlangt: 1000, einheit: "Saaten", wortlaut: "1 000 Saaten × Orte × Zeiten: Sonnen-/Mondstand gegen unabhängige N-Körper-Rechnung ±1° in ≥ 99 %", feld: "richter" },
                },
            },
            lauf: async function himmelsmechanikLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state, wm = st.worldMeta, sun = st.sunMesh, moon = st.moonMesh;
                    if (!wm) throw new Error("kein worldMeta in der Welt der Sitzung");
                    const hatTag = Object.prototype.hasOwnProperty.call(wm, "tag"), tag0 = wm.tag;
                    const hoehen = new Set(), phasen = [];
                    try {
                        for (let d = 0; d < 365; d++) {
                            wm.tag = d;
                            const s = r._dayNightSunDirection(r._sonnenWinkel(0.5));
                            hoehen.add(((Math.asin(s.y) * 180) / Math.PI).toFixed(2));
                        }
                        if (sun && moon)
                            for (let d = 0; d < 30; d++) {
                                wm.tag = d;
                                r._applyDayNightToScene();
                                phasen.push((sun.userData.skyOffset.angleTo(moon.userData.skyOffset) * 180) / Math.PI);
                            }
                    } finally {
                        if (hatTag) wm.tag = tag0;
                        else delete wm.tag;
                        r._applyDayNightToScene();
                    }
                    const wechsel = phasen.filter((w) => Math.abs(w - phasen[0]) > 1).length;
                    const finster = phasen.filter((w) => w < 1.5).length;
                    return { hoehen: hoehen.size, mittag: [...hoehen][0], phasen: phasen.length, phase0: phasen.length ? +phasen[0].toFixed(2) : null, wechsel, finster, saat: wm.seed, mondR: moon && moon.geometry && moon.geometry.parameters ? moon.geometry.parameters.radius : null, abstand: r.constructor.HIMMEL.koerperAbstandM };`,
                    30
                );
                L.zeile("Himmelsmechanik der Sitzung: " + JSON.stringify(z));
                await L.je(2, async () =>
                    L.umfang(2, z.hoehen, "über 365 Tage der Welt (worldMeta.tag) steht die Mittagssonne auf " + z.hoehen + " Höhe(n) (" + z.mittag + "°): die Sonnenbahn liest nur die Uhr (welt-licht.js:711 sonnenRichtung, stamm/bild-himmel.js:1383), weder Tag noch Breite")
                );
                await L.je(3, async () => {
                    if (!z.phasen) throw new Error("Sonne oder Mond fehlt (state.sunMesh/moonMesh, stamm/dirigent-ankunft.js:339/353)");
                    L.umfang(3, z.wechsel, "über " + z.phasen + " Tage wechselt die Phase an " + z.wechsel + " Tagen: der Mond steht stets " + z.phase0 + "° von der Sonne (Vollmond, stamm/bild-himmel.js:2600, welt-licht.js:720)");
                });
                await L.je(4, async () => {
                    if (!z.phasen) throw new Error("Sonne oder Mond fehlt");
                    L.umfang(4, z.finster > 0 ? 1 : 0, z.finster + " Finsternis-Lagen (Sonne–Mond < 1,5°) in " + z.phasen + " Tagen: der Mond verlässt die Gegenstellung nie, also keine Finsternis in keinem Jahr");
                });
                await L.je(5, async () =>
                    L.leser(5, "der Sternhimmel dreht nur mit der Uhr (stamm/dirigent-takt.js:2422 starField.rotation aus timeOfDay), keine Präzession; die Reise in die Zeit (stamm/feld-leben.js:1277 zeitMa) erreicht −12 000 a, der Himmel liest sie nicht")
                );
                await L.je(6, async () =>
                    L.leser(6, "Neigung und Perihel: die Sonnenbahn kennt weder Achsneigung noch Bahn (welt-licht.js:711 sonnenRichtung, Mittagshöhe " + z.mittag + "° an jedem Tag), kein Leser einer Epoche nach Laskar")
                );
                await L.je(7, async () =>
                    L.leser(7, "die Tageslänge hängt an keiner Epoche (stamm/bild-himmel.js:2712 _uhrSetzen), die Mondscheibe ist fest (Radius " + z.mondR + " m bei " + z.abstand + " m, stamm/dirigent-ankunft.js:340, stamm/bild-himmel.js:3328) — die Reise in die Zeit (stamm/feld-leben.js:1277) ändert keins von beiden")
                );
                await L.je(8, async () => L.umfang(8, 1, "die Sitzung hält EINE Saat (" + z.saat + "), mit EINER Sonne und EINEM Mond"));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.sternhimmel — Der Sternhimmel: vom Punkt zur Galaxie ───────────
    // S1 trägt bestehend g3.js (karte2.planet.kosmos.sternhimmel#1). Die Probe liest das EINE Sternfeld (`state.starField`, InstancedMesh,
    // stamm/bild-himmel.js:315/453/471): Zahl, Größenklassen (`aMag`, :465), die Abstände der Instanzen (Kuppel ↔ Raum), den größten
    // Anteil der Sterne in ±10° um einen Großkreis (das Band; gleichverteilt ≈ 0,17), ob die Wandelsterne über 100 Tage gegen das Feld
    // wandern, und die Galaxien-Körper der Szene. Je Sprosse urteilt der Umfang an der gezählten Zahl.
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.sternhimmel",
            sek: 40,
            mutiert: true,
            pfad: ["stamm/bild-himmel.js", "stamm/dirigent-takt.js", "welt-licht.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Sterne" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "zaehlkurve_abw_pct", richtung: "≤", wert: 10, wortlaut: "Zählkurve aus dem Bild ±10 % gegen Bright-Star-Katalog" }],
                    umfang: { verlangt: 9000, einheit: "Sterne bis mag 6", wortlaut: "~9 000 Sterne bis mag 6, Planeten wandern", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "histogramm_abw_pct", richtung: "≤", wert: 10, wortlaut: "Bildpaar Bortle 1 gegen Weitwinkel-Foto: Histogramm ±10 %, Band ±5°" },
                        { wort: "band_abw_grad", richtung: "≤", wert: 5, wortlaut: "Bildpaar Bortle 1 gegen Weitwinkel-Foto: Histogramm ±10 %, Band ±5°" },
                    ],
                    umfang: { verlangt: 1, einheit: "Galaxie von innen (Band oder Galaxien-Körper)", wortlaut: "1 Galaxie von innen", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "sternbild_abw_grad", richtung: "≤", wert: 0.5, wortlaut: "aus 10 pc verschiebt sich jedes nahe Sternbild wie die Katalog-Projektion ±0,5°" }],
                    umfang: { verlangt: 1e6, einheit: "Sterne mit Ort im Raum", wortlaut: "10⁶ Sterne in 3D, reisbar", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "passend_pct", richtung: "≥", wert: 95, wortlaut: "1 000 Ziele: Spektralklasse und Umgebung passen zur galaktischen Lage ≥ 95 %" }],
                    umfang: { verlangt: 1e9, einheit: "Sterne mit Ort im Raum", wortlaut: "10⁹ Sterne, jeder ansteuerbar", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "rotation_abw_pct", richtung: "≤", wert: 10, wortlaut: "flache Rotationskurve ±10 % über 5–20 kpc" }],
                    umfang: { verlangt: 1e11, einheit: "Sterne mit Ort im Raum", wortlaut: "10¹¹ Sterne, Satelliten, Andromeda", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "tiefes_feld_abw_pct", richtung: "≤", wert: 20, wortlaut: "tiefes Feld gegen Hubble-Deep-Field: Galaxien je Bogenminute² ±20 %" }],
                    umfang: { verlangt: 1e11, einheit: "Galaxien", wortlaut: "10¹¹ Galaxien, 13,8 Ga", feld: "umfang" },
                },
            },
            lauf: async function sternhimmelLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state, sf = st.starField, A = r.constructor, wm = st.worldMeta;
                    if (!sf) throw new Error("das Sternfeld ist nicht gebaut (state.starField null, stamm/bild-himmel.js:471)");
                    const a = sf.instanceMatrix.array, n = sf.count;
                    const mag = sf.geometry.attributes.aMag ? sf.geometry.attributes.aMag.array : null;
                    let hell = 0;
                    if (mag) for (let i = 0; i < n; i++) if (mag[i] <= 6) hell++;
                    const R = [], D = [];
                    for (let i = 0; i < n; i++) {
                        const x = a[i * 16 + 12], y = a[i * 16 + 13], zz = a[i * 16 + 14], l = Math.hypot(x, y, zz) || 1;
                        R.push(l);
                        D.push([x / l, y / l, zz / l]);
                    }
                    const m = R.slice().sort((p, q) => p - q)[n >> 1];
                    const raum = R.filter((x) => Math.abs(x - m) > 1).length;
                    let band = 0;
                    const K = 400, s10 = Math.sin((10 * Math.PI) / 180);
                    for (let k = 0; k < K; k++) {
                        const zc = 1 - (2 * (k + 0.5)) / K, rr = Math.sqrt(1 - zc * zc), ph = k * 2.399963;
                        const p = [rr * Math.cos(ph), zc, rr * Math.sin(ph)];
                        let c = 0;
                        for (const d of D) if (Math.abs(d[0] * p[0] + d[1] * p[1] + d[2] * p[2]) <= s10) c++;
                        band = Math.max(band, c / n);
                    }
                    const vor = Float32Array.from(a);
                    const hatTag = !!wm && Object.prototype.hasOwnProperty.call(wm, "tag"), tag0 = wm ? wm.tag : undefined;
                    let gewandert = 0;
                    try {
                        if (wm) wm.tag = (tag0 || 0) + 100;
                        r._applyDayNightToScene();
                        for (let i = 0; i < n; i++)
                            for (let j = 12; j < 15; j++)
                                if (a[i * 16 + j] !== vor[i * 16 + j]) {
                                    gewandert++;
                                    break;
                                }
                    } finally {
                        if (wm) {
                            if (hatTag) wm.tag = tag0;
                            else delete wm.tag;
                        }
                        r._applyDayNightToScene();
                    }
                    let galax = 0;
                    st.scene.traverse((o) => {
                        if (/galax|milchstr|andromeda/i.test(o.name || "")) galax++;
                    });
                    return { n, hell, raum, kuppelM: +m.toFixed(1), band: +band.toFixed(3), gewandert, galax, wandel: r._kosmosJetzt().zeit.planeten.length };`,
                    30
                );
                L.zeile("Sternhimmel der Sitzung: " + JSON.stringify(z));
                const galaxien = z.galax > 0 || z.band >= 0.3 ? 1 : 0;
                const kuppel = "die " + z.n + " Sterne liegen auf der Kuppel (" + z.kuppelM + " m um das Auge, stamm/bild-himmel.js:453), " + z.raum + " mit Ort im Raum";
                await L.je(2, async () =>
                    L.umfang(2, z.hell, z.hell + " Sterne bis mag 6 im Feld (aMag, stamm/bild-himmel.js:465); " + z.gewandert + " von " + z.n + " Punkten wandern über 100 Tage gegen das Feld — die " + z.wandel + " Wandelsterne sind feste Punkte (stamm/bild-himmel.js:312)")
                );
                await L.je(3, async () =>
                    L.umfang(3, galaxien, "kein Milchstraßen-Band: höchstens " + z.band + " der Sterne in ±10° um einen Großkreis (gleichverteilt ≈ 0,17, ein Band ab 0,3), " + z.galax + " Galaxien-Körper in der Szene; die „Galaxy-Skybox“ zeichnet nur die Atmosphäre (stamm/bild-himmel.js:234)")
                );
                await L.je(4, async () => L.umfang(4, z.raum, kuppel + " — kein Stern ist reisbar"));
                await L.je(5, async () => L.umfang(5, z.raum, kuppel + " — kein Stern ist ansteuerbar"));
                await L.je(6, async () => L.umfang(6, z.raum, kuppel + "; keine Galaxie von außen, keine Andromeda"));
                await L.je(7, async () => L.umfang(7, galaxien, "die Welt zeigt " + galaxien + " Galaxien (Band-Anteil " + z.band + ", " + z.galax + " Galaxien-Körper)"));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.sterne — Sterne: Geburt, Leben, Tod ───────────
    // Die Probe zählt die Sterne mit Ort im Raum (Instanz-Matrizen des Sternfelds, stamm/bild-himmel.js:453) und fährt 30 Halte à 10 Tage
    // der Welt (`worldMeta.tag`), ob sich eine Größenklasse (`aMag`, :465) ändert — eine Lichtkurve. Die eigene Sonne trägt keine Epoche
    // (`e0(staerke)`, welt-licht.js:691) und eine feste Scheibe (`HIMMEL.sonneWinkelGrad`, stamm/bild-himmel.js:3328): S1/S2 leser;
    // kompakte Überreste und Generationen tragen keine Umfang-Zahl (leser, Richter unklar).
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.sterne",
            sek: 40,
            mutiert: true,
            pfad: ["stamm/bild-himmel.js", "stamm/feld-leben.js", "stamm/netz-portal.js", "welt-licht.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Sterne" }],
            sprossen: {
                1: { soll: [{ wort: "leuchtkraft_abw_pct", richtung: "≤", wert: 10, wortlaut: "Zeitsprung +5 Ga: Leuchtkraft +~50 % ±10 %, Belichtung am Boden gemessen" }] },
                2: { soll: [{ wort: "riese_grad", richtung: "≥", wert: 20, wortlaut: "Sonne als Riese füllt ≥ 20° des Himmels bei 1 AE, Himmelsfarbe kippt" }] },
                3: {
                    soll: [{ wort: "imf_ks_p", richtung: "≥", wert: 0.05, wortlaut: "Haufen-Massen folgen der IMF (KS p > 0,05)" }],
                    umfang: { verlangt: 1000, einheit: "Sterne mit Ort im Raum", wortlaut: "Geburt im Nebel, Haufen 10³ Sterne", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "lichtkurve_abw_mag", richtung: "≤", wert: 0.3, wortlaut: "Lichtkurve über 300 Tage ±0,3 mag" },
                        { wort: "ueberrest_abw_pct", richtung: "≤", wert: 20, wortlaut: "Überrest dehnt sich ±20 %" },
                    ],
                    umfang: { verlangt: 300, einheit: "Tage mit Lichtwechsel", wortlaut: "Lichtkurve über 300 Tage ±0,3 mag", feld: "richter" },
                },
                5: { soll: [{ wort: "ring_abw_pct", richtung: "≤", wert: 5, wortlaut: "Bildpaar gegen Ray-Tracing-Referenz: Einsteinring, Photonensphäre ±5 %" }] },
                6: {
                    soll: [{ wort: "metall_abw_dex", richtung: "≤", wert: 0.2, wortlaut: "Metallizität von 1 000 Zufallssternen folgt Alter und Ort ±0,2 dex" }],
                    umfang: { verlangt: 1e11, einheit: "Sterne mit Ort im Raum", wortlaut: "10¹¹ Sterne über 10¹⁰ a", feld: "umfang" },
                },
                7: { soll: [{ wort: "gestein_abw_pct", richtung: "≤", wert: 20, wortlaut: "Gesteinsplaneten-Anteil steigt mit der Metallizität ±20 %" }] },
            },
            lauf: async function sterneLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state, sf = st.starField, A = r.constructor, wm = st.worldMeta;
                    if (!sf) throw new Error("das Sternfeld ist nicht gebaut (state.starField null, stamm/bild-himmel.js:471)");
                    const a = sf.instanceMatrix.array, n = sf.count;
                    const R = [];
                    for (let i = 0; i < n; i++) R.push(Math.hypot(a[i * 16 + 12], a[i * 16 + 13], a[i * 16 + 14]));
                    const m = R.slice().sort((p, q) => p - q)[n >> 1];
                    const raum = R.filter((x) => Math.abs(x - m) > 1).length;
                    const attr = sf.geometry.attributes.aMag;
                    const mag0 = attr ? Float32Array.from(attr.array) : null;
                    const hatTag = !!wm && Object.prototype.hasOwnProperty.call(wm, "tag"), tag0 = wm ? wm.tag : undefined;
                    let halte = 0, wechsel = 0;
                    try {
                        for (let k = 1; k <= 30 && mag0; k++) {
                            if (wm) wm.tag = (tag0 || 0) + 10 * k;
                            r._applyDayNightToScene();
                            halte++;
                            const b = sf.geometry.attributes.aMag.array;
                            for (let i = 0; i < b.length; i++)
                                if (b[i] !== mag0[i]) {
                                    wechsel++;
                                    break;
                                }
                        }
                    } finally {
                        if (wm) {
                            if (hatTag) wm.tag = tag0;
                            else delete wm.tag;
                        }
                        r._applyDayNightToScene();
                    }
                    return { n, raum, halte, wechsel, sonneGrad: A.HIMMEL.sonneWinkelGrad, e0: typeof __weltLicht !== "undefined" && __weltLicht.e0 ? __weltLicht.e0.length : null };`,
                    30
                );
                L.zeile("Sterne der Sitzung: " + JSON.stringify(z));
                const kuppel = "die " + z.n + " Sterne liegen auf der Kuppel, " + z.raum + " mit Ort im Raum (stamm/bild-himmel.js:453)";
                await L.je(1, async () =>
                    L.leser(1, "die Sonne trägt kein Alter: e0(staerke) (welt-licht.js:691) ohne Epoche; die Reise in die Zeit (stamm/feld-leben.js:1278) reicht bis +1 Ga, nicht +5 Ga, und erbt den Himmel der Heimat (stamm/netz-portal.js:701)")
                );
                await L.je(2, async () =>
                    L.leser(2, "die Sonnenscheibe ist fest (HIMMEL.sonneWinkelGrad " + z.sonneGrad + "°, stamm/bild-himmel.js:3328) und der Himmel kippt nie mit der Sonne (welt-licht.js:989 himmelSicht) — kein Leser eines Riesen-Stadiums")
                );
                await L.je(3, async () => L.umfang(3, z.raum, kuppel + " — kein Nebel, kein Haufen"));
                await L.je(4, async () => {
                    if (!z.halte) throw new Error("das Sternfeld trägt keine Größenklassen (aMag fehlt, stamm/bild-himmel.js:465)");
                    L.umfang(4, 10 * z.wechsel, "in " + z.halte + " Halten à 10 Tage (" + 10 * z.halte + " Tage der Welt) ändert sich die Helligkeit an " + z.wechsel + " Halten (aMag wird einmal gesetzt, stamm/bild-himmel.js:368) — kein Stern stirbt");
                });
                await L.je(5, async () =>
                    L.leser(5, "Umfang nicht erzeugbar (der Umfang „kompakte Überreste“ trägt keine Zahl): " + kuppel + " — kein Körper mit eigener Raumkrümmung, keine Linsung im Bild (welt-licht.js:989)")
                );
                await L.je(6, async () => L.umfang(6, z.raum, kuppel + " — keine Metallizität, kein Alter je Stern"));
                await L.je(7, async () =>
                    L.leser(7, "Umfang nicht erzeugbar (der Umfang „Sterne als Generationen“ trägt keine Zahl): " + kuppel + "; kein Planet mit Gestein außer der Welt selbst (stamm/daten.js:84 ULTIVERSUM)")
                );
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.systeme — Systeme: Planeten, Monde, Ringe ───────────
    // Die Probe zählt die Himmelskörper der Szene mit eigener Richtung (`userData.skyOffset`, stamm/bild-himmel.js:2588/2600: Sonne, Mond),
    // die Planeten darunter (Körper außer Sonne und Mond) und die Saaten der Sitzung. Die Wandelsterne sind Punkte des Sternfelds ohne Bahn
    // (stamm/bild-himmel.js:312). Je Sprosse urteilt der Umfang an der gezählten Zahl; die Mondbahn über Äonen hat keinen Leser.
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.systeme",
            sek: 40,
            pfad: ["stamm/bild-himmel.js", "stamm/dirigent-ankunft.js", "stamm/feld-leben.js", "welt-licht.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Himmelskörper" }],
            sprossen: {
                1: {
                    soll: [{ wort: "ephemeride_abw_grad", richtung: "≤", wert: 0.5, wortlaut: "Planet und Mond stehen über ein Spieljahr gegen die Ephemeride der eigenen Bahn ≤ 0,5°" }],
                    umfang: { verlangt: 1, einheit: "Planeten mit eigener Bahn", wortlaut: "1 Stern, 1 Planet, 1 Mond", feld: "umfang" },
                },
                2: {
                    soll: [{ wort: "gleich_pct", richtung: "≥", wert: 95, wortlaut: "1 000 Saaten: über 10⁹ a dieselben Planeten am Himmel in ≥ 95 %" }],
                    umfang: { verlangt: 3, einheit: "Planeten im System", wortlaut: "1 System, 3–12 Planeten", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "roche_pct", richtung: "≥", wert: 100, wortlaut: "Ringe nur innerhalb der Roche-Grenze (100 %)" },
                        { wort: "resonanz_pct", richtung: "≥", wert: 10, wortlaut: "Resonanzketten in ≥ 10 % der Riesen-Systeme" },
                    ],
                    umfang: { verlangt: 10, einheit: "Monde je Riesenplanet", wortlaut: "10–100 Monde je Riese, Ringe", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "ks_p", richtung: "≥", wert: 0.05, wortlaut: "KS-Test Masse und Periode gegen das Exoplaneten-Archiv nach Beobachtungs-Bias p > 0,05" }],
                    umfang: { verlangt: 1000, einheit: "Systeme", wortlaut: "10³ Systeme", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "mehrfach_abw_pct", richtung: "≤", wert: 10, wortlaut: "angetroffener Mehrfach-Anteil je Spektralklasse gegen Duchêne & Kraus ±10 %" }],
                    umfang: { verlangt: 1e6, einheit: "Systeme", wortlaut: "10⁶ Systeme — in EINER Galaxie anfliegbar", feld: "umfang" },
                },
                6: { soll: [{ wort: "mondbahn_abw_pct", richtung: "≤", wert: 20, wortlaut: "Mondbahn weitet sich nach Gezeitenrechnung ±20 %" }] },
                7: {
                    soll: [
                        { wort: "halt_pct", richtung: "≥", wert: 95, wortlaut: "1 000 Zufallssterne angeflogen: das System hält die Prüfungen der Sprossen 2–6 in ≥ 95 %" },
                        { wort: "chao1", richtung: "≥", wert: 1e4, wortlaut: "effektive Zahl der System-Typen (Chao1 aus den Flügen) ≥ 10⁴" },
                    ],
                    umfang: { verlangt: 1e11, einheit: "Systeme", wortlaut: "10¹¹ Systeme, keines gespeichert", feld: "umfang" },
                },
            },
            seite: { FAECHER, HIMMEL_AN },
            lauf: async function systemeLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state, koerper = [];
                    st.scene.traverse((o) => {
                        if (o.userData && o.userData.skyOffset) koerper.push(o.name || o.type);
                    });
                    const planeten = koerper.filter((n) => n !== (st.sunMesh && st.sunMesh.name) && n !== (st.moonMesh && st.moonMesh.name)).length;
                    const monde = st.moonMesh ? 1 : 0;
                    return { koerper, planeten, monde, saat: st.worldMeta && st.worldMeta.seed, wandel: r._kosmosJetzt().zeit.planeten.map((p) => p.art) };`,
                    30
                );
                L.zeile("Systeme der Sitzung: " + JSON.stringify(z));
                const sys = "die Welt trägt EIN System (Saat " + z.saat + "): Körper " + z.koerper.join(", ") + ", " + z.planeten + " Planeten mit eigener Bahn — die Wandelsterne " + JSON.stringify(z.wandel) + " sind Punkte des Sternfelds (stamm/bild-himmel.js:312)";
                // S1 ÜBER DEN FÄCHER (stationen/faecher.js): ein Spieljahr, je Tag kurz vor der nächsten Stufe des Himmels (der Ort der
                // größten Abweichung) und dazwischen je Vierteltag (die Uhr dreht den Mond über den Himmel), der Leser des Spiels gegen die
                // Ephemeride — die Planeten (welt-licht kosmosZeit am Augenblick) und der Mond auf seiner eigenen Bahn (kosmos-bahn:
                // welt-licht KOSMOS.mond · kosmosZeit.mond · mondRichtung, gegen MOND_EPHEMERIDE)
                await L.je(1, async () => {
                    const jahr = (await L.ev("return r._kosmosJetzt().jahrTage;", 10)) || 365;
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.HIMMEL_AN, export: "welt-licht.js kosmosZeit (Kepler, kBahn; der Mond `mond`) · mondRichtung", leser: "stamm/bild-himmel.js `_kosmosJetzt` · `_dayNightMoonDirection`" },
                        adressen: { zeiten: Array.from({ length: Math.round(jahr) }, (_, d) => [d + 0.249, d + 0.499, d + 0.749, d + 0.999]).flat() },
                        ms: Math.max(4000, Math.floor((L.rest() - 6) * 1000)),
                        masse: { ephemeride_abw_grad: { wie: "max", feld: "abw" }, mond_abw_grad: { wie: "max", feld: "mond" }, planeten: { wie: "min", feld: "planeten" } },
                        schlecht: { feld: "abw", richtung: "max" },
                        pose: (a) => "Himmel bei Nacht am Tag " + a.zeit + " (worldMeta.tag + Uhr), Blick zum Körper der größten Abweichung",
                        ungemessen: ["Mondphase je Woche im Bildpaar (am Gerät: die Scheibe trägt die Phase, Lommel–Seeliger, stamm/dirigent-ankunft.js)"],
                    });
                    L.zeile("Systeme S1: " + R.akte.slice(0, 400));
                    if (R.fehlt || !R.gemessen) return L.leser(1, (R.fehlt || "kein Wert des Gesetzes") + " · " + R.akte, 0);
                    L.gemessen(1, { ephemeride_abw_grad: +R.werte.ephemeride_abw_grad.toFixed(4) }, {
                        erzeugt: R.werte.planeten,
                        welt: { gezaehlt: z.koerper.length },
                        taeter: "Himmel gegen Ephemeride über " + R.gemessen + " Adressen max " + (Math.round(R.werte.ephemeride_abw_grad * 1e4) / 1e4) + "° (der Mond " +
                            (Math.round(R.werte.mond_abw_grad * 1e4) / 1e4) + "°; " + R.werte.planeten + " Planeten mit eigener Bahn) · " + R.akte,
                    });
                });
                await L.je(2, async () => L.umfang(2, z.planeten, sys));
                await L.je(3, async () => L.umfang(3, 0, "kein Riesenplanet: " + z.planeten + " Planeten, also 0 Monde je Riese (der EINE Mond der Welt kreist um keinen Riesen)"));
                await L.je(4, async () => L.umfang(4, 1, sys));
                await L.je(5, async () => L.umfang(5, 1, sys + "; kein Flug zu einem Stern"));
                await L.je(6, async () =>
                    L.leser(6, "die Mondbahn ist eine feste Kepler-Bahn (welt-licht KOSMOS.mond: 384 400 km, 27,3217 d, kosmos-bahn) ohne Gezeiten: die Halbachse hängt an keiner Epoche, die Reise in die Zeit (stamm/feld-leben.js:1277) rückt sie nicht")
                );
                await L.je(7, async () => L.umfang(7, 1, sys));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.welten — Welten: Heimat, Fremde, Schwere ───────────
    // S1 bestehend g3.js. S2 GEMESSEN an der Mess-Wiese: die Schwere im Gesetz der Welt (`state.gravity` → worldMeta.gesetz,
    // stamm/dirigent-kern.js:882; Leser stamm/koerper-bewegung.js:922 leibFall) auf 0,1 · 1 · 3 g, je Stufe der EINE Spieler-Schritt in FIXED_DT
    // (`replayRun`, stamm/dirigent-takt.js:1331, Spur koerper-core.js:7844): Fall aus 10 m gegen √(2d/g), Sprunghöhe × g; das Gesetz kehrt
    // byte-gleich zurück; Fahrzeug und Wurf misst der Lauf nicht (❌ beim Namen). S3–S6 zählen das Gesetz der Welten.
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.welten",
            sek: 50,
            mutiert: true,
            pfad: ["stamm/dirigent-takt.js", "koerper-core.js", "stamm/koerper-bewegung.js", "stamm/koerper-frei.js", "stamm/gelaende-chunks.js", "stamm/daten.js", "stamm/speicher-welten.js", "stamm/bild-himmel.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Welten" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [
                        { wort: "fall_leib_abw_pct", richtung: "≤", wert: 2, wortlaut: "Fallzeit aus 10 m = √(20/g) ±2 % für Leib UND Fahrzeug UND Wurf" },
                        { wort: "fall_fahrzeug_abw_pct", richtung: "≤", wert: 2, wortlaut: "Fallzeit aus 10 m = √(20/g) ±2 % für Leib UND Fahrzeug UND Wurf" },
                        { wort: "fall_wurf_abw_pct", richtung: "≤", wert: 2, wortlaut: "Fallzeit aus 10 m = √(20/g) ±2 % für Leib UND Fahrzeug UND Wurf" },
                        { wort: "sprung_abw_pct", richtung: "≤", wert: 5, wortlaut: "Sprunghöhe ∝ 1/g ±5 %" },
                    ],
                    umfang: { verlangt: 3, einheit: "g (größte gefahrene Schwere-Stufe)", wortlaut: "jede Welt g 0,1–3", feld: "umfang" },
                    welt: [
                        { wort: "fall_m", ab: 9, was: "kleinste Fallhöhe der Stufen über dem Boden (m)" },
                        { wort: "g_stufen", ab: 3, was: "Schwere-Stufen mit Landung" },
                    ],
                },
                3: { soll: [{ wort: "tag_abw_pct", richtung: "≤", wert: 1, wortlaut: "Tageslänge im Bild = Rotation ±1 %" }] },
                4: {
                    soll: [
                        { wort: "typwechsel_pct", richtung: "≥", wert: 90, wortlaut: "Abstand des Monds ändern → Typ wechselt wie vorhergesagt in ≥ 90 %" },
                        { wort: "verwechselt_pct", richtung: "≥", wert: 40, wortlaut: "Blindtest gegen Sondenfoto ≥ 40 % verwechselt" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Welten", wortlaut: "10³ Welten: Bauart aus der Lage", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "schatten_abw_grad", richtung: "≤", wert: 1, wortlaut: "zwei Schatten im Winkel der Sonnen ±1°" },
                        { wort: "polartag_abw_pct", richtung: "≤", wert: 2, wortlaut: "98° Neigung: Polartag ein halbes Jahr ±2 %" },
                    ],
                    umfang: { verlangt: 2, einheit: "Sonnen mit Schatten", wortlaut: "zwei Schatten im Winkel der Sonnen ±1°", feld: "richter" },
                },
                6: {
                    soll: [
                        { wort: "horizont_abw_grad", richtung: "≤", wert: 0.1, wortlaut: "1 000 Welten: Horizont-Senkung aus 10 km = acos(R/(R+h)) ±0,1°" },
                        { wort: "abstand_pct", richtung: "≥", wert: 90, wortlaut: "Bild-Abstand je Paar größer als Erde–Mars in ≥ 90 %" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Welten mit Radius", wortlaut: "10⁶–10¹¹ Welten im vollen Radius", feld: "umfang" },
                },
            },
            lauf: async function weltenLauf(H, P, L) {
                // DIE ZÄHLUNG (billig): die Welten des Ultiversums, ihr Gesetz, die Sonnen mit Schatten
                const z = await L.ev(
                    `const st = r.state, A = r.constructor, U = A.ULTIVERSUM, welten = Object.keys(U);
                    const radius = welten.filter((k) => Object.keys(U[k] || {}).some((f) => /radius/i.test(f))).length;
                    let sonnen = 0;
                    st.scene.traverse((o) => {
                        if (o.isDirectionalLight && o.castShadow) sonnen++;
                    });
                    return { welten, radius, sonnen, gesetz: Object.keys(A._weltGesetz(st.worldMeta)) };`,
                    30
                );
                L.zeile("Welten der Sitzung: " + JSON.stringify(z));
                await L.je(3, async () =>
                    L.leser(3, "die Tageslänge ist die EINE Uhr der Welt (stamm/bild-himmel.js:2712 _uhrSetzen), das Gesetz der Welt trägt keine Rotation (stamm/speicher-welten.js:88: " + z.gesetz.join(", ") + ") — keine gebundene Welt, keine Welt mit 4-h-Tag")
                );
                await L.je(4, async () => L.umfang(4, z.welten.length, "das Ultiversum trägt " + z.welten.length + " Welten (" + z.welten.join(", ") + ", stamm/daten.js:84), keine Bauart aus der Lage"));
                await L.je(5, async () => L.umfang(5, z.sonnen, "die Welt wirft " + z.sonnen + " Sonnen-Schatten (Richtlicht mit Schatten), EINE Sonne (welt-licht.js:711)"));
                await L.je(6, async () => L.umfang(6, z.radius, z.radius + " von " + z.welten.length + " Welten tragen einen Radius im Gesetz (stamm/speicher-welten.js:88) — das Gelände ist eben"));
                // S2 · Fall und Sprung am Leib der Welt unter 0,1 · 1 · 3 g (der Spieler-Schritt der Welt, Spur je Takt)
                await L.je(2, async () => {
                    await L.ort("wiese", "ego");
                    if (L.rest() < 12) throw new Error("die Frist trägt die Fall-Läufe nicht mehr (Rest " + Math.round(L.rest()) + " s)");
                    const R = await L.ev(
                        `const st = r.state, pm = st.playerMesh, A = r.constructor;
                        if (!pm || !st.playerVel || typeof r.replayRun !== "function") throw new Error("kein Leib oder kein replayRun (stamm/dirigent-takt.js:1331)");
                        // die Schwere IST das Gesetz der Welt (state.gravity schreibt worldMeta.gesetz, stamm/dirigent-kern.js:882,
                        // stamm/speicher-welten.js:124): zurück kommt das Gesetz selbst, byte-gleich
                        const wm = st.worldMeta, hatG = Object.prototype.hasOwnProperty.call(wm, "gesetz"), gesetz0 = wm.gesetz;
                        const g0 = st.gravity, snap = r._replaySnapshotState();
                        // der Schritt der Sim des Spiels (FIXED_DT, stamm/koerper-bewegung.js:2623, gelesen stamm/dirigent-takt.js:1195) — dieselbe Diskretisierung, die der Spieler erlebt
                        const fuss = A.PLAYER_FOOT_OFFSET, gE = Math.abs(A.WELT_GESETZ_ERDE.schwere), dt = A.FIXED_DT;
                        if (!(dt > 0)) throw new Error("AnazhRealm.FIXED_DT fehlt (stamm/koerper-bewegung.js:2623)");
                        const boden = r._voxelSurfaceY(snap.x, snap.z);
                        const out = [];
                        try {
                            for (const k of [0.1, 1, 3]) {
                                const g = gE * k;
                                st.gravity = -g;
                                const leer = { dt, yaw: snap.yaw, vor: 0, quer: 0, sprint: false, sprung: false, rutsch: false };
                                const nF = Math.ceil((1.4 * Math.sqrt(20 / g)) / dt) + 20;
                                const fall = { start: { x: snap.x, y: boden + 10 + fuss, z: snap.z, vx: 0, vy: 0, vz: 0, fieldVy: 0, yaw: snap.yaw }, frames: Array.from({ length: nF }, () => leer), spur: [], boden };
                                const ende = r.replayRun(fall);
                                if (!ende) throw new Error("replayRun gab nichts zurück");
                                const nS = Math.ceil((1 + 10 / g) / dt);
                                const sprung = { start: Object.assign({}, ende, { vx: 0, vy: 0, vz: 0, fieldVy: 0 }), frames: Array.from({ length: nS }, (_, i) => Object.assign({}, leer, { sprung: i >= 10 && i < 30 })), spur: [], boden };
                                r.replayRun(sprung);
                                out.push({ k, g, fallH: fall.spur.map((q) => +q[1].toFixed(4)), sprungH: sprung.spur.map((q) => +q[1].toFixed(4)) });
                            }
                        } finally {
                            if (hatG) wm.gesetz = gesetz0;
                            else delete wm.gesetz;
                            pm.position.set(snap.x, snap.y, snap.z);
                            st.playerVel.setValue(snap.vx, snap.vy, snap.vz);
                            st._fieldVy = snap.fieldVy;
                            st.yaw = snap.yaw;
                        }
                        return { dt, boden, g0, gE, out };`,
                        Math.max(8, Math.floor(L.rest()) - 3)
                    );
                    let fallMax = 0, fallWo = "", dropMin = Infinity, stufen = 0;
                    const hoch = {};
                    for (const o of R.out) {
                        const F = o.fallH;
                        if (F.length < 3) throw new Error("g " + o.k + ": die Spur des Falls ist leer");
                        const hEnd = F[F.length - 1];
                        const i = F.findIndex((h) => h <= hEnd + 0.02);
                        if (i < 2) throw new Error("g " + o.k + ": kein Fall (Höhe " + F[0] + " → " + hEnd + " m)");
                        // die Zeile j steht nach dem Schritt j+1: Zeile i−1 bei i·dt; der Rest bis zum Boden mit der Fahrt aus der Höhen-Differenz
                        const hp = F[i - 1] - hEnd, s = (F[i - 2] - F[i - 1]) / R.dt;
                        const tau = (-s + Math.sqrt(s * s + 2 * o.g * Math.max(hp, 0))) / o.g;
                        const t = i * R.dt + tau, drop = 10 - hEnd, soll = Math.sqrt((2 * drop) / o.g);
                        const abw = Math.abs(t / soll - 1) * 100;
                        dropMin = Math.min(dropMin, drop);
                        stufen++;
                        if (abw >= fallMax) (fallMax = abw), (fallWo = "g " + o.k + "×: Fall " + t.toFixed(3) + " s gegen √(2·" + drop.toFixed(2) + "/" + o.g.toFixed(2) + ") = " + soll.toFixed(3) + " s");
                        const S = o.sprungH, g0h = S.slice(0, 10).reduce((a, b) => a + b, 0) / Math.max(1, Math.min(10, S.length));
                        hoch[o.k] = { h: Math.max(...S) - g0h, g: o.g };
                    }
                    if (!hoch[1] || !(hoch[1].h > 0.05)) throw new Error("der Sprung unter 1 g hob nicht ab (Höhe " + (hoch[1] ? hoch[1].h.toFixed(3) : "—") + " m)");
                    let sprungMax = 0, sprungWo = "";
                    for (const k of [0.1, 3]) {
                        if (!hoch[k]) continue;
                        const v = Math.abs((hoch[k].h * hoch[k].g) / (hoch[1].h * hoch[1].g) - 1) * 100;
                        if (v >= sprungMax) (sprungMax = v), (sprungWo = "g " + k + "×: Sprunghöhe " + hoch[k].h.toFixed(3) + " m gegen " + ((hoch[1].h * hoch[1].g) / hoch[k].g).toFixed(3) + " m aus 1/g");
                    }
                    L.gemessen(
                        2,
                        { fall_leib_abw_pct: +fallMax.toFixed(2), sprung_abw_pct: +sprungMax.toFixed(2) },
                        {
                            erzeugt: Math.max(...R.out.map((o) => o.k)),
                            welt: { fall_m: +dropMin.toFixed(3), g_stufen: stufen },
                            taeter:
                                (fallMax >= sprungMax ? fallWo : sprungWo) +
                                "; Fahrzeug und Wurf ungemessen: der Lauf fährt keinen Fall eines Gefährts (stamm/koerper-fahrt.js) und keinen Freikörper (stamm/koerper-frei.js:534 liest state.gravity)",
                            beleg: R.out.map((o) => ({ k: o.k, fallN: o.fallH.length, sprungN: o.sprungH.length, sprungH: hoch[o.k] ? +hoch[o.k].h.toFixed(4) : null })),
                        }
                    );
                });
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.ereignisse — Ereignisse am Himmel: Meteore, Kometen, Polarlicht ───────────
    // Die Probe zählt in der Szene die Körper der Himmels-Ereignisse beim Namen (Meteor, Schnuppe, Komet, Polarlicht) und die Welten des
    // Ultiversums (stamm/daten.js:84). Der Himmel zeichnet Rayleigh, Mie und Wolken (welt-licht.js:989 himmelSicht), kein Ereignis: die
    // Umfänge mit Zahl urteilen am Gezählten, Kometen, Polarlicht und Feuerball tragen keine Umfang-Zahl (leser, Richter unklar).
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.ereignisse",
            sek: 40,
            pfad: ["welt-licht.js", "stamm/bild-himmel.js", "stamm/daten.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Ereignisse" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "rate_je_h_min", richtung: "≥", wert: 5, wortlaut: "5–10 je Stunde am dunklen Himmel" },
                        { wort: "rate_je_h_max", richtung: "≤", wert: 10, wortlaut: "5–10 je Stunde am dunklen Himmel" },
                        { wort: "spur_abw_pct", richtung: "≤", wert: 30, wortlaut: "Spurlängen gegen Meteor-Kamera-Netze ±30 %" },
                    ],
                    umfang: { verlangt: 5, einheit: "Meteore je Stunde", wortlaut: "5–10 je Stunde am dunklen Himmel", feld: "richter" },
                },
                2: {
                    soll: [
                        { wort: "datum_abw_d", richtung: "≤", wert: 1, wortlaut: "Erd-Saat: Maximum an festem Datum ±1 d, ~100/h, ein Radiant ±2°" },
                        { wort: "radiant_abw_grad", richtung: "≤", wert: 2, wortlaut: "Erd-Saat: Maximum an festem Datum ±1 d, ~100/h, ein Radiant ±2°" },
                    ],
                    umfang: { verlangt: 100, einheit: "Meteore je Stunde im Strom", wortlaut: "Erd-Saat: Maximum an festem Datum ±1 d, ~100/h, ein Radiant ±2°", feld: "richter" },
                },
                3: {
                    soll: [
                        { wort: "schweif_abw_grad", richtung: "≤", wert: 5, wortlaut: "Schweif antisolar ±5°" },
                        { wort: "wiederkehr_abw_pct", richtung: "≤", wert: 1, wortlaut: "Wiederkehr nach der Bahnperiode ±1 %" },
                    ],
                },
                4: {
                    soll: [
                        { wort: "oval_abw_grad", richtung: "≤", wert: 3, wortlaut: "Oval bei 65–70° ±3°" },
                        { wort: "kp_r", richtung: "≥", wert: 0.7, wortlaut: "Häufigkeit über 11 a r ≥ 0,7 gegen Kp" },
                    ],
                },
                5: {
                    soll: [
                        { wort: "streufeld_pct", richtung: "≥", wert: 90, wortlaut: "Fundorte im Streufeld längs der Bahn ≥ 90 %" },
                        { wort: "fallrate_faktor", richtung: "≤", wert: 2, wortlaut: "Fallrate je Masse gegen Erd-Statistik ±Faktor 2" },
                    ],
                },
                6: {
                    soll: [{ wort: "rang", richtung: "≥", wert: 0.8, wortlaut: "1 000 Welten: Meteorrate gegen Kleinkörper-Dichte Rang ≥ 0,8" }],
                    umfang: { verlangt: 1000, einheit: "Welten", wortlaut: "1 000 Welten: Meteorrate gegen Kleinkörper-Dichte Rang ≥ 0,8", feld: "richter" },
                },
            },
            seite: { FAECHER, EREIGNIS_AN },
            lauf: async function ereignisseLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state, je = {};
                    st.scene.traverse((o) => {
                        const n = o.name || "";
                        if (/meteor|schnuppe|komet|comet|polar|aurora|feuerball/i.test(n)) je[n] = (je[n] || 0) + 1;
                    });
                    return { ereignisse: Object.values(je).reduce((a, b) => a + b, 0), namen: Object.keys(je), welten: Object.keys(r.constructor.ULTIVERSUM) };`,
                    30
                );
                L.zeile("Ereignisse der Sitzung: " + JSON.stringify(z));
                const himmel = "die Szene trägt " + z.ereignisse + " Ereignis-Körper (" + (z.namen.join(", ") || "keinen") + "); der Himmel zeichnet Rayleigh, Mie und Wolken (welt-licht.js:989 himmelSicht)";
                // S1 ÜBER DEN FÄCHER (stationen/faecher.js): 20 Saaten des Kosmos und die Heimat × 12 Tage des Jahrs — das Gesetz des Himmels
                // (welt-licht kosmos · kosmosZeit, gelesen von stamm/bild-himmel.js:335 _kosmosJetzt) trägt Ereignisse oder nennt, was fehlt
                await L.je(1, async () => {
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.EREIGNIS_AN, export: "welt-licht.js:1616 kosmos · welt-licht.js:2020 kosmosZeit", leser: "stamm/bild-himmel.js:335 _kosmosJetzt" },
                        adressen: { saaten: Array.from({ length: 20 }, (_, i) => i), zeiten: Array.from({ length: 12 }, (_, i) => i * 30 + 0.95), dazu: [{ saat: null, ort: null, zeit: 0.95 }] },
                        ms: Math.max(3000, Math.min(8000, Math.floor((L.rest() - 8) * 1000))),
                        masse: { adressen: { wie: "anzahl", feld: "t" }, felder: { wie: (v) => new Set([].concat(...v)).size, feld: "felder" }, rate: { wie: "max", feld: "rate" } },
                        schlecht: { feld: "t", richtung: "min" },
                        pose: (a) => "Ego an der Mess-Wiese, Nacht am Tag " + a.zeit + ", Blick in den Zenit (Saat " + (a.saat == null ? "der Welt" : "kosmos-s" + a.saat) + ")",
                        ungemessen: ["die Spurlängen im Bild gegen die Meteor-Kamera-Netze (am Gerät)"],
                    });
                    L.zeile("Ereignisse S1: " + R.akte.slice(0, 400));
                    if (R.fehlt || !R.gemessen) return L.leser(1, (R.fehlt || "kein Wert des Gesetzes") + " · " + R.akte, 0);
                    L.gemessen(1, { rate_je_h_min: R.werte.rate, rate_je_h_max: R.werte.rate, spur_abw_pct: null }, { erzeugt: R.werte.rate, welt: { gezaehlt: R.werte.felder }, taeter: "welt-licht.js:2020 kosmosZeit (Felder ohne Rate) · " + R.akte });
                });
                await L.je(2, async () => L.umfang(2, z.ereignisse, himmel + " — kein Strom, kein Radiant"));
                await L.je(3, async () => L.leser(3, "Umfang nicht erzeugbar (der Umfang „periodische Kometen“ trägt keine Zahl): " + himmel + " — kein Körper mit Bahnperiode"));
                await L.je(4, async () => L.leser(4, "Umfang nicht erzeugbar (der Umfang „Polarlicht aus Sonne × Feld“ trägt keine Zahl): " + himmel + " — kein Magnetfeld, keine Emission bei 557,7 nm"));
                await L.je(5, async () => L.leser(5, "Umfang nicht erzeugbar (der Umfang „Feuerball und Meteoritenfall“ trägt keine Zahl): " + himmel + " — kein Fall, kein Streufeld im Gelände"));
                await L.je(6, async () => L.umfang(6, z.welten.length, "das Ultiversum trägt " + z.welten.length + " Welten (" + z.welten.join(", ") + ", stamm/daten.js:84), keine mit Kleinkörper-Dichte"));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.eigengesetz — Welten mit eigenem Gesetz ───────────
    // Die Probe liest das Gesetz jeder Welt des Ultiversums (stamm/daten.js:84 ULTIVERSUM, Normalform stamm/speicher-welten.js:88) und
    // zählt je Welt die Konstanten (Zahlen-Felder), die vom Erd-Gesetz abweichen, Felder der Chemie und der Geometrie. Die Schwere wirkt
    // (Leser stamm/koerper-bewegung.js:922, stamm/koerper-frei.js:534), aber kein Leser misst ein Gesetz aus dem Bild: S1 leser, die
    // Zehnerpotenzen urteilen am Gezählten, die andere Geometrie trägt keine Umfang-Zahl (leser, Richter unklar).
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.eigengesetz",
            sek: 40,
            pfad: ["stamm/daten.js", "stamm/speicher-welten.js", "stamm/koerper-bewegung.js", "stamm/koerper-frei.js", "stamm/netz-portal.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Welten mit eigenem Gesetz" }],
            sprossen: {
                1: { soll: [{ wort: "gesetz_abw_pct", richtung: "≤", wert: 5, wortlaut: "Messwerte aus dem Bild folgen dem Gesetz der Welt ±5 % und weichen vom Erd-Gesetz ab" }] },
                2: {
                    soll: [
                        { wort: "ursache_rang", richtung: "≥", wert: 0.7, wortlaut: "der Leser sagt aus Ego-Bildern die geänderte Konstante voraus, Rang ≥ 0,7" },
                        { wort: "gegenlauf_pct", richtung: "≥", wert: 80, wortlaut: "Gegenlauf: Konstante zurück → das Merkmal ist weg ≥ 80 %" },
                    ],
                    umfang: { verlangt: 10, einheit: "Welten mit ≥ 3 anderen Konstanten", wortlaut: "10 Welten, je 3 Konstanten anders", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "phasen_pct", richtung: "≥", wert: 90, wortlaut: "Phasengrenzen im Bild (was schmilzt, was regnet, was gefriert) gegen das Diagramm der Welt richtig ≥ 90 %" }],
                    umfang: { verlangt: 100, einheit: "Welten mit eigener Chemie", wortlaut: "10² Welten mit anderer Chemie (Lösungsmittel, Phasen, Bindung)", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "skalen_rang", richtung: "≥", wert: 0.7, wortlaut: "Skalengesetze aus Bildern (Bein-Querschnitt, Gangtempo, Flug) folgen den Konstanten der Welt, Rang ≥ 0,7" }],
                    umfang: { verlangt: 1000, einheit: "Welten mit eigenem Gesetz", wortlaut: "10³ Welten mit Leben unter dem eigenen Gesetz", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "schleife_abw_pct", richtung: "≤", wert: 5, wortlaut: "Schleifen-Probe: Winkelsumme, Rückkehr-Ort und Uhren-Abgleich zweier Wege gegen die Geometrie der Welt ±5 %" },
                        { wort: "naehte", richtung: "≤", wert: 0, wortlaut: "0 Nähte" },
                    ],
                },
                6: {
                    soll: [
                        { wort: "vorhersage_pct", richtung: "≥", wert: 70, wortlaut: "blinde Spieler sagen nach 30 min Versuchen den Ausgang eines neuen Versuchs voraus ≥ 70 %" },
                        { wort: "neuheit_pct", richtung: "≥", wert: 50, wortlaut: "Neuheit gegen den Korpus bekannter Welten (R10) bei ≥ 50 %" },
                    ],
                    umfang: { verlangt: 1e4, einheit: "Welten mit eigenem Gesetz", wortlaut: "10⁴ Welten, deren Gesetz der Spieler nicht kennt", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "ursache_rang", richtung: "≥", wert: 0.7, wortlaut: "1 000 Welten: Fremdwelt-Probe ganz (Ursache Rang ≥ 0,7, Gegenlauf ≥ 80 %, Neuheit ≥ 30 %)" },
                        { wort: "gegenlauf_pct", richtung: "≥", wert: 80, wortlaut: "1 000 Welten: Fremdwelt-Probe ganz (Ursache Rang ≥ 0,7, Gegenlauf ≥ 80 %, Neuheit ≥ 30 %)" },
                        { wort: "neuheit_pct", richtung: "≥", wert: 30, wortlaut: "1 000 Welten: Fremdwelt-Probe ganz (Ursache Rang ≥ 0,7, Gegenlauf ≥ 80 %, Neuheit ≥ 30 %)" },
                        { wort: "widerspruch", richtung: "≤", wert: 0, wortlaut: "0 Widerspruch zwischen zwei Versuchen derselben Welt" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Welten mit eigenem Gesetz", wortlaut: "1 000 Welten: Fremdwelt-Probe ganz (Ursache Rang ≥ 0,7, Gegenlauf ≥ 80 %, Neuheit ≥ 30 %)", feld: "richter" },
                },
            },
            lauf: async function eigengesetzLauf(H, P, L) {
                const z = await L.ev(
                    `const A = r.constructor, U = A.ULTIVERSUM, erde = U.erde || A.WELT_GESETZ_ERDE;
                    const flach = (o, p, out) => {
                        for (const k of Object.keys(o || {})) {
                            const v = o[k];
                            if (v && typeof v === "object" && !Array.isArray(v)) flach(v, p + k + ".", out);
                            else out[p + k] = v;
                        }
                        return out;
                    };
                    const E = flach(erde, "", {});
                    const je = {};
                    for (const w of Object.keys(U)) {
                        if (w === "erde" || U[w] === erde) continue;
                        const F = flach(U[w], "", {});
                        const anders = Object.keys(F).filter((k) => JSON.stringify(F[k]) !== JSON.stringify(E[k]));
                        je[w] = { anders, konstanten: anders.filter((k) => typeof F[k] === "number"), chemie: Object.keys(F).filter((k) => /stoff|chemie|loesung|phase/i.test(k)), geometrie: Object.keys(F).filter((k) => /geometrie|kruemm|metrik|radius/i.test(k)) };
                    }
                    return { welten: Object.keys(U), fremd: je, felder: Object.keys(E) };`,
                    30
                );
                L.zeile("Gesetze der Sitzung: " + JSON.stringify(z));
                const F = Object.values(z.fremd);
                const eigen = F.filter((w) => w.anders.length > 0).length;
                const drei = F.filter((w) => w.konstanten.length >= 3).length;
                const chemie = F.filter((w) => w.chemie.length > 0).length;
                const was = Object.entries(z.fremd).map(([k, w]) => k + ": " + w.anders.join("/") + " anders (Konstanten " + (w.konstanten.join("/") || "keine") + ")").join("; ");
                await L.je(1, async () => {
                    if (eigen < 1) return L.umfang(1, eigen, "keine Welt weicht vom Erd-Gesetz ab (stamm/daten.js:84)");
                    L.leser(1, "kein Leser misst ein Gesetz aus dem Bild (Fall, Wurf, Pendel): die Schwere der Welt wirkt im Takt (stamm/koerper-bewegung.js:922 leibFall, stamm/koerper-frei.js:534) und reist mit der Welt (stamm/netz-portal.js:699), gemessen wird sie nirgends im Bild — " + was, eigen);
                });
                await L.je(2, async () => L.umfang(2, drei, drei + " Welten mit ≥ 3 anderen Konstanten — " + was + " (Felder des Gesetzes: " + z.felder.join(", ") + ", stamm/speicher-welten.js:88)"));
                await L.je(3, async () => L.umfang(3, chemie, chemie + " Welten mit eigener Chemie: das Gesetz der Welt trägt kein Feld für Stoffe, Lösungsmittel oder Phasen (stamm/speicher-welten.js:88)"));
                await L.je(4, async () => L.umfang(4, eigen, eigen + " Welt(en) mit eigenem Gesetz im Ultiversum (" + z.welten.join(", ") + ")"));
                await L.je(5, async () =>
                    L.leser(5, "Umfang nicht erzeugbar (der Umfang „Welten mit anderer Geometrie“ trägt keine Zahl): das Gesetz trägt kein Feld der Geometrie von Raum oder Zeit (stamm/speicher-welten.js:88, Felder " + z.felder.join(", ") + ") — jede Welt ist euklidisch und eben")
                );
                await L.je(6, async () => L.umfang(6, eigen, eigen + " Welt(en) mit fremdem Gesetz — " + was));
                await L.je(7, async () => L.umfang(7, eigen, eigen + " Welt(en) mit fremdem Gesetz, EINE Saat der Sitzung — " + was));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.kunstwelten — Gebaute Welten: Zylinder, Ring, Schale ───────────
    // Die Probe liest das Gesetz jeder Welt des Ultiversums (stamm/daten.js:84) und zählt die Welten, deren Gesetz eine Bauart trägt
    // (Zylinder, Ring, Schale, Hohlwelt, Dreh-Schwere) — die Normalform kennt nur schwere, himmel, wetter, gelaende, ort
    // (stamm/speicher-welten.js:88). Die Umfänge mit Zahl urteilen am Gezählten (km bzw. Welten), S2 ist ein Bildpaar, sobald eine Hohlwelt
    // steht; Bauart-Messung und Kultur der Bewohner tragen keine Umfang-Zahl (leser, Richter unklar).
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.kunstwelten",
            sek: 40,
            pfad: ["stamm/daten.js", "stamm/speicher-welten.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte gebaute Welten" }],
            sprossen: {
                1: {
                    soll: [{ wort: "coriolis_abw_pct", richtung: "≤", wert: 10, wortlaut: "Wurf-Versuch: die Bahn weicht um die Coriolis-Ablenkung ab ±10 %" }],
                    umfang: { verlangt: 10, einheit: "km Drehzylinder", wortlaut: "EIN Drehzylinder, 10 km", feld: "umfang" },
                },
                2: {
                    auge: { pose: "Boden der Hohlwelt, Blick in den Zenit", vorbild: "Rechen-Referenz des Lands gegenüber unter Dreh-Schwere (Flussläufe, Wolkenzug)" },
                    umfang: { verlangt: 1000, einheit: "km Hohlwelt oder Zylinder", wortlaut: "Hohlwelt oder Zylinder 10³ km mit Land, Meer, Wetter", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "bogen_abw_grad", richtung: "≤", wert: 0.5, wortlaut: "Bogen-Winkel am Himmel = Geometrie ±0,5°" },
                        { wort: "tag_abw_pct", richtung: "≤", wert: 1, wortlaut: "Tageslänge = Blendenfolge ±1 %" },
                    ],
                    umfang: { verlangt: 1e8, einheit: "km Ringwelt-Umfang", wortlaut: "Ringwelt, 10⁸ km Umfang", feld: "umfang" },
                },
                4: { soll: [{ wort: "bauart_abw_pct", richtung: "≤", wert: 5, wortlaut: "je Bauart 3 Messungen des Spielers (Schwere, Tag, Horizont) gegen die Bauart ±5 %" }] },
                5: { soll: [{ wort: "kultur_rang", richtung: "≥", wert: 0.7, wortlaut: "Kultur der Bewohner gegen die Bauart: Ursachen-Probe Rang ≥ 0,7" }] },
                6: {
                    soll: [
                        { wort: "bauart_rang", richtung: "≥", wert: 0.7, wortlaut: "Fremdwelt-Probe (R10): Bauart aus Stern und Technik vorhergesagt Rang ≥ 0,7" },
                        { wort: "neuheit_pct", richtung: "≥", wert: 30, wortlaut: "Neuheit ≥ 30 %" },
                    ],
                    umfang: { verlangt: 1000, einheit: "gebaute Welten", wortlaut: "10³ gebaute Welten aus Saaten, jede von einer anderen Zivilisation", feld: "umfang" },
                },
            },
            seite: { FAECHER, BAUART_AN },
            lauf: async function kunstweltenLauf(H, P, L) {
                const z = await L.ev(
                    `const A = r.constructor, U = A.ULTIVERSUM, bau = [];
                    for (const w of Object.keys(U)) {
                        const felder = JSON.stringify(Object.keys(U[w] || {}));
                        if (/bauart|zylinder|ring|schale|hohl|dreh/i.test(felder)) bau.push(w);
                    }
                    return { welten: Object.keys(U), bau, felder: Object.keys(A._weltGesetz(r.state.worldMeta)) };`,
                    30
                );
                L.zeile("Gebaute Welten der Sitzung: " + JSON.stringify(z));
                const was = z.bau.length + " von " + z.welten.length + " Welten (" + z.welten.join(", ") + ", stamm/daten.js:84) tragen eine Bauart; das Gesetz kennt " + z.felder.join(", ") + " (stamm/speicher-welten.js:88)";
                // trägt eine Welt eine Bauart, fehlt der Leser ihrer Größe in km; sonst ist die gezählte Größe 0 km
                const stufe = (nr, art) =>
                    L.je(nr, async () => {
                        if (z.bau.length) return L.leser(nr, "eine Welt trägt eine Bauart (" + z.bau.join(", ") + "), kein Leser nennt ihre Größe in km (stamm/speicher-welten.js:88)");
                        L.umfang(nr, z.bau.length, "0 km " + art + ": " + was);
                    });
                // S1 ÜBER DEN FÄCHER: das Gesetz jeder Welt des Ultiversums und der geladenen in der Normalform, die die Welt liest — eine
                // Bauart oder eine Drehung, die den Wurf ablenkte, oder beim Namen, was das Gesetz trägt
                await L.je(1, async () => {
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.BAUART_AN, export: "stamm/speicher-welten.js:118 _weltGesetz (die Normalform)", leser: "stamm/koerper-bewegung.js:922 leibFall (schwere) · stamm/gelaende-boden.js:855 (ort)" },
                        adressen: { orte: z.welten, dazu: [{ saat: null, ort: "heim", zeit: null }] },
                        ms: 3000,
                        masse: { welten: { wie: "anzahl", feld: "welt" }, bau: { wie: "summe", feld: "bau" }, felder: { wie: "verschieden", feld: "felder" }, skalar: { wie: "anzahl", feld: "welt", nur: (a, w) => w.schwereArt === "number" }, abgelehnt: { wie: "anzahl", feld: "abgelehnt", nur: (a, w) => !!w.abgelehnt } },
                        schlecht: { feld: "bau", richtung: "min" },
                        pose: (a) => "Ego an der Mess-Wiese der Welt " + a.ort + ", Wurf nach Osten",
                        ungemessen: ["der Wurf-Versuch selbst (die Bahn eines Körpers unter Drehung): ohne Drehung im Gesetz ist die Ablenkung 0"],
                    });
                    L.zeile("Kunstwelten S1: " + R.akte.slice(0, 400));
                    if (R.werte.bau > 0) return L.leser(1, "eine Welt trägt eine Bauart, kein Leser nennt ihre Größe in km und ihre Drehung (stamm/speicher-welten.js:118) · " + R.akte, 0);
                    L.leser(1, "stamm/speicher-welten.js:118 _weltGesetz trägt in " + R.werte.welten + " Welten nur " + (R.je[0] ? R.je[0].w.felder : "?") + " — keine Bauart, keine Drehung: die Schwere ist ein Betrag längs −y (" + R.werte.skalar + " von " + R.werte.welten + "), 0 km Drehzylinder, kein Wurf weicht um Coriolis ab · " + R.akte, 0);
                });
                await stufe(2, "Hohlwelt oder Zylinder");
                await stufe(3, "Ringwelt");
                await L.je(4, async () => L.leser(4, "Umfang nicht erzeugbar (der Umfang „Schale um einen Stern, Scheibe, Schwarm“ trägt keine Zahl): " + was));
                await L.je(5, async () => L.leser(5, "Umfang nicht erzeugbar (der Umfang „gebaute Welten mit Geschichte“ trägt keine Zahl): " + was + "; keine Bau-Schicht im Gelände"));
                await L.je(6, async () => L.umfang(6, z.bau.length, was));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── planet.kosmos.galaxien — Galaxien: Nachbarn, Haufen, das Netz, die Zeit ───────────
    // Die Probe zählt die Galaxien, die die Welt zeigt: Galaxien-Körper der Szene beim Namen und das Band des Sternfelds (der größte Anteil
    // der Sterne in ±10° um einen Großkreis, gleichverteilt ≈ 0,17; stamm/bild-himmel.js:453). Die Umfänge mit Zahl urteilen am Gezählten;
    // Nachbargalaxie, erstes Licht und ferne Zukunft tragen keine Umfang-Zahl, die die Wand liest (leser, Richter unklar); S7 ist ein Bildpaar,
    // sobald die Zukunft erreichbar ist.
    LEITERN.push(
        leiter({
            leiter: "planet.kosmos.galaxien",
            sek: 40,
            pfad: ["stamm/bild-himmel.js", "stamm/feld-leben.js", "welt-licht.js", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Galaxien" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "heimat_abw_pct", richtung: "≤", wert: 5, wortlaut: "am Ziel steht die Heimatgalaxie am Himmel in der richtigen Richtung und Größe ±5 %" },
                        { wort: "afc_pct", richtung: "≤", wert: 80, wortlaut: "Bildpaar Anflug gegen Teleskop-Aufnahme (2AFC ≤ 80 %)" },
                    ],
                },
                2: {
                    soll: [{ wort: "typ_abw_pct", richtung: "≤", wert: 20, wortlaut: "Typ-Anteile der angeflogenen gegen Durchmusterung ±20 %" }],
                    umfang: { verlangt: 100, einheit: "Galaxien", wortlaut: "10² Galaxien, Typen aus ihrer Geschichte", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "galaxien_im_flug", richtung: "≥", wert: 1e4, wortlaut: "10⁴ Galaxien: Gruppen und Haufen", feld: "umfang" }],
                    umfang: { verlangt: 1e4, einheit: "Galaxien", wortlaut: "10⁴ Galaxien: Gruppen und Haufen", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "landungen", richtung: "≥", wert: 20, wortlaut: "20 Zufallsgalaxien: Landung auf einem Planeten dort" },
                        { wort: "leerraum_min_mpc", richtung: "≥", wert: 10, wortlaut: "Größe der Leerräume im Band 10–100 Mpc" },
                        { wort: "leerraum_max_mpc", richtung: "≤", wert: 100, wortlaut: "Größe der Leerräume im Band 10–100 Mpc" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Galaxien", wortlaut: "das Netz: 10⁶ Galaxien, Fäden und Leerräume", feld: "umfang" },
                },
                5: { soll: [{ wort: "himmel_abw_pct", richtung: "≤", wert: 10, wortlaut: "Himmelsbild gegen Rechen-Referenz (Sternzahl, Farbe, Temperatur des Himmels ±10 %)" }] },
                6: {
                    soll: [{ wort: "frueh_ohne_fels_pct", richtung: "≥", wert: 95, wortlaut: "frühe Halte ohne Felswelten ≥ 95 %" }],
                    umfang: { verlangt: 1e11, einheit: "Galaxien", wortlaut: "10¹¹ Galaxien über 13,8 Ga, keine gespeichert", feld: "umfang" },
                },
                7: { auge: { pose: "Halt +5 Ga, Blick zur Nachbargalaxie", vorbild: "Rechen-Referenz der Verschmelzung Milchstraße–Andromeda" } },
            },
            seite: { FAECHER, GALAXIE_AN },
            lauf: async function galaxienLauf(H, P, L) {
                // S1 ÜBER DEN FÄCHER: der Himmel jeder Saat des Kosmos (welt-licht kosmosHimmel, das Gesetz hinter dem Sternfeld) — das Band
                // der Heim-Galaxie und die Ziele außerhalb ihrer, die das Gesetz trägt
                await L.je(1, async () => {
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.GALAXIE_AN, export: "welt-licht.js:1616 kosmos · welt-licht.js:1929 kosmosHimmel", leser: "stamm/bild-himmel.js:335 _kosmosJetzt (das Sternfeld stamm/bild-himmel.js:453)" },
                        adressen: { saaten: Array.from({ length: 12 }, (_, i) => i), dazu: [{ saat: null, ort: null, zeit: null }] },
                        ms: Math.max(3000, Math.min(10000, Math.floor((L.rest() - 8) * 1000))),
                        masse: { saaten: { wie: "anzahl", feld: "saat" }, bandMin: { wie: "min", feld: "band" }, bandMax: { wie: "max", feld: "band" }, ziele: { wie: "summe", feld: "ziele" }, sterne: { wie: "min", feld: "sterne" }, felder: { wie: "erste", feld: "felder" } },
                        schlecht: { feld: "band", richtung: "min" },
                        pose: (a) => "Nacht an der Mess-Wiese, Blick auf das Band der Heim-Galaxie (Saat " + (a.saat == null ? "der Welt" : "kosmos-s" + a.saat) + ")",
                        ungemessen: ["das Bildpaar Anflug gegen die Teleskop-Aufnahme (2AFC, am Gerät)"],
                    });
                    L.zeile("Galaxien S1: " + R.akte.slice(0, 400));
                    if (R.fehlt || !R.gemessen) return L.leser(1, (R.fehlt || "kein Wert des Gesetzes") + " · " + R.akte, 0);
                    if (!(R.werte.ziele > 0))
                        return L.leser(1, "welt-licht.js:1616 kosmos trägt EINE Galaxie (" + R.werte.felder + ") — keine Nachbargalaxie, kein Ziel außerhalb der Heim-Scheibe; das Band der Heimat " + R.werte.bandMin + "–" + R.werte.bandMax + " über " + R.werte.saaten + " Saaten (gleichverteilt ≈ 0,17) · " + R.akte, 0);
                    L.leser(1, "das Gesetz trägt " + R.werte.ziele + " Ziele, kein Leser fliegt hin und misst die Heimat am Himmel (stamm/bild-himmel.js:335) · " + R.akte, R.werte.ziele);
                });
                const z = await L.ev(
                    `const st = r.state, sf = st.starField;
                    let galax = 0;
                    st.scene.traverse((o) => {
                        if (/galax|milchstr|andromeda|nebel/i.test(o.name || "")) galax++;
                    });
                    let band = null, n = 0;
                    if (sf) {
                        const a = sf.instanceMatrix.array, D = [];
                        n = sf.count;
                        for (let i = 0; i < n; i++) {
                            const x = a[i * 16 + 12], y = a[i * 16 + 13], zz = a[i * 16 + 14], l = Math.hypot(x, y, zz) || 1;
                            D.push([x / l, y / l, zz / l]);
                        }
                        band = 0;
                        const K = 400, s10 = Math.sin((10 * Math.PI) / 180);
                        for (let k = 0; k < K; k++) {
                            const zc = 1 - (2 * (k + 0.5)) / K, rr = Math.sqrt(1 - zc * zc), ph = k * 2.399963;
                            const p = [rr * Math.cos(ph), zc, rr * Math.sin(ph)];
                            let c = 0;
                            for (const d of D) if (Math.abs(d[0] * p[0] + d[1] * p[1] + d[2] * p[2]) <= s10) c++;
                            band = Math.max(band, c / n);
                        }
                    }
                    return { galax, band: band === null ? null : +band.toFixed(3), n };`,
                    30
                );
                L.zeile("Galaxien der Sitzung: " + JSON.stringify(z));
                if (z.band === null) throw new Error("das Sternfeld ist nicht gebaut (state.starField null, stamm/bild-himmel.js:471)");
                const galaxien = z.galax > 0 || z.band >= 0.3 ? 1 : 0;
                const was = "die Welt zeigt " + galaxien + " Galaxien: " + z.galax + " Galaxien-Körper in der Szene, das Sternfeld (" + z.n + " Punkte) ohne Band (höchstens " + z.band + " in ±10° um einen Großkreis, gleichverteilt ≈ 0,17)";
                await L.je(2, async () => L.umfang(2, galaxien, was));
                await L.je(3, async () => L.umfang(3, galaxien, was));
                await L.je(4, async () => L.umfang(4, galaxien, was));
                await L.je(5, async () =>
                    L.leser(5, "Umfang nicht erzeugbar (der Umfang „Zeitreise bis zum ersten Licht“ trägt keine Zahl): die Reise in die Zeit (stamm/feld-leben.js:1277 zeitMa) reicht bis −4 Ga, nicht bis −13,8 Ga, und der Himmel liest sie nicht — " + was)
                );
                await L.je(6, async () => L.umfang(6, galaxien, was));
                await L.je(7, async () =>
                    L.leser(7, "Umfang nicht erzeugbar (der Umfang „die ferne Zukunft des Alls“ trägt keine Zahl): die Reise in die Zeit (stamm/feld-leben.js:1277) reicht bis +1 Ga, nicht +5 Ga — " + was)
                );
                L.preisPose("wiese", "ego");
            },
        })
    );
}

module.exports = LEITERN.flat();
