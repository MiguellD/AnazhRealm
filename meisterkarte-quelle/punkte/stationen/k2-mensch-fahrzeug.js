// DIE PERSPEKTIVE fahrzeug DES KAPITELS mensch (Meisterkarte 2): fünf Leitern, je Leiter EINE Probe in der warmen Welt der
// Sitzung (k2-mensch.js, die Fabrik). Gemessen wird am ERGEBNIS der Welt: die Werke der Szene je Medium, die Fahr-Rezepte des
// EINEN Kerns (`__vehicleCore`, exportDrive — dieselbe Ableitung, aus der jeder Wagen der Welt fährt, stamm/gelaende-kollision.js
// `_fahrzeugGesetzFor`), ein gesetzter Wagen unter Vollgas in zwei Bauplänen (Lage und Tempo über die Takte), die Reihe der
// Epochen im Bild, der Verkehr der Stadt über die Takte (`S.verkehr.wagen`, `S.verkehr.zahl`, stamm/siedlung-verkehr.js) und die
// Sätze des Spielers durch den EINEN Parser. Wo die Welt den Umfang nicht stellt, misst die Probe ihn und urteilt „nicht“.
"use strict";

// DER ZENSUS DER FAHRZEUGE UND MASCHINEN (Seite der Welt)
const zensusFahr = async (r, T, arg) => {
    const s = r.state;
    const VC = window.__vehicleCore;
    const pm = s.playerMesh.position;
    const A = s.architectures || [];
    const typen = {};
    for (const e of A) if (e && typeof e.type === "string") typen[e.type] = (typen[e.type] || 0) + 1;
    const zaehle = (re) => Object.keys(typen).filter((t) => re.test(t)).reduce((a, t) => a + typen[t], 0);
    const medien = {
        land: zaehle(/^fahrzeug_/),
        wasser: zaehle(/boot|schiff|floss|floß|segler|kahn|kogge|dschunke|dhau/i),
        schiene: zaehle(/lok_|lokomotive|waggon|schiene|eisenbahn/i),
        luft: zaehle(/flugzeug|gleiter|ballon|luftschiff|flieger/i),
        tief: zaehle(/tauchboot|u_boot|uboot/i),
        raum: zaehle(/rakete|raumschiff|orbiter|raumkapsel/i),
    };
    const rezepte = [];
    if (VC && VC.PRESETS)
        for (const k of Object.keys(VC.PRESETS)) {
            const pre = VC.PRESETS[k];
            if (!pre || pre.kind !== "vehicle") continue;
            let d = null;
            try {
                d = VC.exportDrive(Object.assign({}, pre.s, pre.fx));
            } catch (_e) {}
            rezepte.push({ k, m: d ? +(+d.mass).toFixed(3) : null, v: d ? +(+d.vmax).toFixed(2) : null });
        }
    const wagen = [];
    let nah = null;
    for (const S of (r._bewohnerSiedlungen || new Map()).values())
        for (const W of (S && S.verkehr && S.verkehr.wagen) || []) {
            wagen.push({ typ: W.typ, steuer: !!(W.b && W.b.amSteuer), faehrt: W.zustand === "faehrt" });
            const e = W.entry;
            if (e && e.position) {
                const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                if (!nah || d < nah.d) nah = { d, x: e.position.x, y: e.position.y, z: e.position.z };
            }
        }
    const posen = {};
    if (nah) {
        const dx = pm.x - nah.x;
        const dz = pm.z - nah.z;
        const dl = Math.hypot(dx, dz) || 1;
        const cx = nah.x + (dx / dl) * 12;
        const cz = nah.z + (dz / dl) * 12;
        posen.strasse = { px: cx, py: r.getTerrainHeightAt(cx, cz) + 2, pz: cz, lx: nah.x, ly: nah.y + 0.8, lz: nah.z };
    }
    return {
        medien,
        fahrzeugTypen: Object.keys(typen).filter((t) => /^fahrzeug_/.test(t)),
        rezepte,
        physik: new Set(rezepte.map((x) => x.m + "/" + x.v)).size,
        wagen: wagen.length,
        amSteuer: wagen.filter((w) => w.steuer).length,
        faehrt: wagen.filter((w) => w.faehrt).length,
        wagenTypen: [...new Set(wagen.map((w) => w.typ))],
        epochen: VC && Array.isArray(VC.EPOCHE_GESETZ) ? VC.EPOCHE_GESETZ.map((x) => x.id) : [],
        kulturen: VC && VC.CULTURES ? Object.keys(VC.CULTURES).length : 0,
        g: VC && VC.FAHR ? VC.FAHR.G : null,
        strecken: zaehle(/rennstrecke|strecke_/i),
        wettkampf: zaehle(/rennbahn|regatta|wettkampf/i),
        fremd: zaehle(/fremd|alien|xeno/i),
        werke: {
            brunnen: zaehle(/brunnen/i),
            quelle: zaehle(/muehle|mühle|wasserrad|windrad|schoepfrad/i),
            fabrik: zaehle(/fabrik|kraftwerk/i),
            werft: zaehle(/werft|raumhafen/i),
            ketten: A.filter((e) => e && (e.produktion || e.kette)).length,
        },
        posen,
    };
};

// DER WERKSTATT-WAGEN UNTER VOLLGAS (Seite der Welt): der GT des Kerns zweimal gesetzt — sein Bauplan und derselbe mit größtem
// Radstand, Spur und Dach (die Masse des Kerns: Länge × Spur × Dach, vehicle-core carPhys) —, aufgesessen, eingeschwungen, dann
// `arg.takte` Takte zu 1/60 s mit gehaltenem Gas (die Verb-Tafel); gemessen die Masse des Fahr-Gesetzes am Werk
// (`_fahrzeugGesetzFor`), das Tempo des Spielers im Sattel und der Weg.
const formTempo = async (r, T, arg) => {
    const s = r.state;
    const VC = window.__vehicleCore;
    const pm = s.playerMesh.position;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    if (!VC || !VC.PRESETS || !VC.PRESETS.gt) return { n: 0, fehler: "kein Rezept gt im Fahrzeug-Kern" };
    const x0 = pm.x;
    const z0 = pm.z;
    let t = performance.now();
    const tick = (n) => {
        for (let i = 0; i < n; i++) {
            t += 1000 / 60;
            try {
                r._gameLoopTick(t);
            } catch (_e) {}
        }
    };
    const halte = (vor) => {
        const g = s.verbTafel && s.verbTafel.gehalten;
        if (!g) return;
        for (const k of ["vor", "links", "zurueck", "rechts", "sprint", "jump"]) g[k] = false;
        g.vor = !!vor;
    };
    const stelle = () => {
        pm.set(x0, hh(x0, z0) + 1.2, z0);
        if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
    };
    const VAR = [
        { name: "leicht", ov: null },
        { name: "schwer", ov: { radstand: 3.4, spur: 1.9, dach: 1.75 } },
    ];
    const laeufe = [];
    for (const v of VAR) {
        stelle();
        tick(4);
        const e = r.spawnArchitecture("fahrzeug_gt", { x: x0, y: hh(x0, z0) + 0.5, z: z0 }, Object.assign({ silent: true, precise: true, rotationY: 0 }, v.ov ? { studioOv: v.ov } : {}));
        if (!e) {
            laeufe.push({ name: v.name, fehler: "das Werk stand nicht" });
            continue;
        }
        try {
            await window.__gebautNach(e);
        } catch (_e) {}
        const g = r._fahrzeugGesetzFor(e);
        const masse = g && g.drive ? g.drive.mass : null;
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) {
            laeufe.push({ name: v.name, masse, fehler: "aufsitzen" });
            try {
                r.removeArchitecture(e);
            } catch (_e) {}
            continue;
        }
        halte(false);
        tick(12);
        const p0 = { x: pm.x, z: pm.z };
        halte(true);
        tick(arg.takte || 360);
        const v1 = Math.hypot(s.playerVel.x(), s.playerVel.z());
        const weg = Math.hypot(pm.x - p0.x, pm.z - p0.z);
        halte(false);
        try {
            r.dismountArchitecture();
        } catch (_e) {}
        try {
            r.removeArchitecture(e);
        } catch (_e) {}
        laeufe.push({ name: v.name, masse, v: +v1.toFixed(3), weg: +weg.toFixed(2) });
    }
    stelle();
    tick(4);
    const [L, S] = laeufe;
    const ok = L && S && Number.isFinite(L.v) && Number.isFinite(S.v) && L.v > 0;
    return { n: ok ? 1 : 0, laeufe, masseQ: ok && L.masse ? S.masse / L.masse : null, tempoQ: ok ? S.v / L.v : null };
};

// DIE REIHE DER EPOCHEN (Seite der Welt): je Stufe der Zeit-Achse des Kerns (EPOCHE_GESETZ) eine Limousine mit dem Stempel
// `epoche`, quer 12 m vor dem Spieler in einer Reihe zu 5,5 m; `weg` räumt die Reihe wieder ab.
const epochenReihe = async (r, T, arg) => {
    const s = r.state;
    const VC = window.__vehicleCore;
    const pm = s.playerMesh.position;
    const R = (window.__k2Reihe = window.__k2Reihe || []);
    if (arg.weg) {
        for (const e of R.splice(0)) {
            try {
                r.removeArchitecture(e);
            } catch (_e) {}
        }
        return { weg: true };
    }
    const E = VC && Array.isArray(VC.EPOCHE_GESETZ) ? VC.EPOCHE_GESETZ : [];
    const yaw = s.yaw || 0;
    const v = { x: Math.sin(yaw), z: Math.cos(yaw) }; // die EINE Vorwärts-Richtung (stamm/koerper-bewegung.js:1645 _blickVorn)
    const q = { x: -v.z, z: v.x };
    const ids = [];
    for (let i = 0; i < E.length; i++) {
        const o = (i - (E.length - 1) / 2) * 5.5;
        const x = pm.x + v.x * 12 + q.x * o;
        const z = pm.z + v.z * 12 + q.z * o;
        const e = r.spawnArchitecture("fahrzeug_limousine", { x, y: r.getTerrainHeightAt(x, z) + 0.5, z }, { silent: true, precise: true, rotationY: Math.atan2(q.x, q.z) - Math.PI / 2, studioOv: { epoche: i } });
        if (!e) continue;
        R.push(e);
        ids.push(E[i].id);
    }
    for (const e of R)
        try {
            await window.__gebautNach(e);
        } catch (_e) {}
    const cx = pm.x + v.x * 12;
    const cz = pm.z + v.z * 12;
    return { n: ids.length, soll: E.length, ids, pose: { px: pm.x - v.x * 2, py: pm.y + 2.2, pz: pm.z - v.z * 2, lx: cx, ly: r.getTerrainHeightAt(cx, cz) + 0.9, lz: cz } };
};

// DER VERKEHR EINER SPIELSTUNDE (Seite der Welt): die Welt rafft die Zeit — ihr Tag dauert 60 min Spielzeit
// (`DAY_LENGTH_DEFAULT_MINUTES`, stamm/daten.js:159), eine Stunde ihrer Uhr `_bewohnerStundeSek()` = 150 s
// (stamm/siedlung-bewohner.js:2422), und jeder Takt trägt höchstens `TAKT_DECKEL_S` (stamm/dirigent-takt.js:2699). Die Probe
// taktet Bündel ohne Pause zu `TAKT_DECKEL_S`, bis der VERKEHR eine Spielstunde rechnete: gezählt wird nur die Spielzeit der
// Takte, in denen der Kilometer-Zähler der Wagen (`zahl.km`) wuchs (ein Zwischen-Takt ohne Bild rechnet keinen Verkehr,
// stamm/dirigent-takt.js:86). Je Takt je Wagen, ob er fährt, sein Tempo, die Zeitlücke zum Vorderen (`W.vorder`); vorher ↔
// nachher die Stöße (`zahl.stoss`: Wagen, Leib, Bau), die Steckenbleiber ohne Anlass (`zahl.fest`) und der Weg je Wagen.
const verkehrLauf = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const V = A.VERKEHR;
    const SS = [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.verkehr && Array.isArray(S.verkehr.wagen) && S.verkehr.wagen.length);
    const WW = SS.flatMap((S) => S.verkehr.wagen);
    if (!WW.length) return { n: 0, wagen: 0, fehler: "kein Verkehr am Messort" };
    const stoss = () =>
        SS.reduce((a, S) => {
            const st = (S.verkehr.zahl && S.verkehr.zahl.stoss) || {};
            return a + (st.wagen || 0) + (st.leib || 0) + (st.bau || 0);
        }, 0);
    const fest = () => SS.reduce((a, S) => a + ((S.verkehr.zahl && S.verkehr.zahl.fest) || 0), 0);
    const km = () => SS.reduce((a, S) => a + ((S.verkehr.zahl && S.verkehr.zahl.km) || 0), 0);
    const stundeS = r._bewohnerStundeSek();
    const schrittMs = A.TAKT_DECKEL_S * 1000;
    const s0 = stoss();
    const f0 = fest();
    const z0 = s.spielZeit;
    const weg0 = WW.map((W) => W.weg || 0);
    const fahrS = WW.map(() => 0);
    const luecken = [];
    let steuerMax = 0;
    let takte = 0;
    let fehler = 0;
    let verkehrS = 0;
    let uhr = performance.now();
    const wand0 = performance.now();
    const ende = wand0 + (arg.ms || 20000);
    while (verkehrS < stundeS && performance.now() < ende) {
        for (let k = 0; k < 5 && verkehrS < stundeS; k++) {
            const sz = s.spielZeit;
            const k0 = km();
            uhr += schrittMs;
            try {
                r._gameLoopTick(uhr);
            } catch (_e) {
                fehler++;
            }
            takte++;
            const dt = s.spielZeit - sz;
            const lief = km() > k0;
            if (lief) verkehrS += dt;
            let steuer = 0;
            for (let i = 0; i < WW.length; i++) {
                const W = WW[i];
                if (W.b && W.b.amSteuer) steuer++;
                const fz = W.entry && W.entry._fahr;
                if (!lief || W.zustand !== "faehrt" || !fz) continue;
                fahrS[i] += dt;
                const v = fz.speed;
                const o = W.vorder;
                if (o && v > 2 && o.gap > 0 && o.gap < V.folgeM && o.v > 1) luecken.push(o.gap / v);
            }
            if (steuer > steuerMax) steuerMax = steuer;
        }
        await window.sleep();
    }
    const wandS = (performance.now() - wand0) / 1000;
    const weg = WW.reduce((a, W, i) => a + Math.max(0, (W.weg || 0) - weg0[i]), 0);
    const zeit = fahrS.reduce((a, x) => a + x, 0);
    luecken.sort((a, b) => a - b);
    const mitte = luecken.length ? luecken[Math.floor(luecken.length / 2)] : null;
    return {
        n: steuerMax,
        wagen: WW.length,
        fahrer: WW.reduce((a, W) => a + ((W.fahrer && W.fahrer.length) || 1), 0),
        kollisionen: stoss() - s0,
        stillstand: fest() - f0,
        reisetempo: zeit > 0 ? weg / zeit / V.tempoMs : 0,
        zeitluecke: mitte,
        luecken: luecken.length,
        stunden: +(verkehrS / stundeS).toFixed(3),
        stundeS,
        verkehrS: +verkehrS.toFixed(1),
        spielS: +(s.spielZeit - z0).toFixed(1),
        wandS: +wandS.toFixed(1),
        msJeTakt: takte ? +((wandS * 1000) / takte).toFixed(1) : null,
        takte,
        fehler,
        wegM: Math.round(weg),
    };
};

// DIE SÄTZE DES SPIELERS → FAHRZEUG (Seite der Welt): jeder Satz durch `parseChatToDsl`; gezählt, wessen Programm einen Bau-Op
// trägt, der ein Fahrzeug nennt.
const saetzeFahr = async (r, T, arg) => {
    const baut = (p) => Array.isArray(p) && ((typeof p[0] === "string" && /^spawn_/.test(p[0])) || p.some(baut));
    const ja = [];
    for (const t of arg.saetze || []) {
        let p = null;
        try {
            p = r.parseChatToDsl(t);
        } catch (_e) {}
        if (p && baut(p.program) && /fahrzeug|wagen|vehicle|boot|karren/i.test(JSON.stringify(p.program))) ja.push(t);
    }
    return { n: ja.length, von: (arg.saetze || []).length, ja: ja.slice(0, 8) };
};

const PFAD = ["vehicle-core.js", "stamm/koerper-*.js", "stamm/siedlung-*.js", "stamm/gelaende-kollision.js"];
const PROBE = "[linse-gpu] amd/rdna-3 (Probe)";

module.exports = (F) => [
    // ── mensch.fahrzeug.medium — die Medien der Fahrt. S1 urteilt die bestehende Brems-Kette; S2–S8 der Umfang an der Welt gezählt:
    // die Fahr-Rezepte mit eigener Physik, die Werke je Medium, das EINE g des Kerns.
    F.leiter("mensch.fahrzeug.medium", {
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
            if (z) H.zeile("Zensus: Medien " + JSON.stringify(z.medien) + " · Rezepte " + JSON.stringify(z.rezepte).slice(0, 240) + " · g " + z.g);
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().physik, fehlt: "20 Saaten bis 130 km/h mit eigener Physik: die Welt trägt " + da().physik + " Fahr-Rezepte (je Typ EINE Physik, die Saat eines Wagens ändert sie nicht) und keine Spurrinne" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().medien.wasser, fehlt: "Wasser: kein Floß, Boot oder Segler steht in der Welt" }));
            await K.schritt(4, async () => K.nicht(4, { n: (da().medien.schiene > 0 ? 1 : 0) + (da().medien.luft > 0 ? 1 : 0), fehlt: "Schiene und Luft: Schienen-Werke " + da().medien.schiene + " · Luft-Werke " + da().medien.luft }));
            await K.schritt(5, async () => K.nicht(5, { n: da().medien.tief, fehlt: "Tiefsee, Verformung, Untergang: kein Tauch-Werk, kein Wagen verformt sich" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().medien.raum, fehlt: "Raum, Orbit, Mond: kein Raum-Werk steht in der Welt" }));
            await K.schritt(7, async () => K.leser(7, { n: da().g === 9.8 ? 1 : 0, fehlt: "kein Planet trägt sein g und ρ: der Fahr-Kern liest die Konstante FAHR.G = " + da().g, wo: "vehicle-core.js:3080" }));
            await K.schritt(8, async () => K.nicht(8, { n: da().medien.raum, fehlt: "zwischen Sonnensystemen: kein Raum-Werk, keine Uhr an Bord neben der Uhr daheim" }));
        },
        seite: { ZENSUS: zensusFahr },
        sprossen: {
            2: {
                umfang: { soll: 20, wort: "Saaten bis 130 km/h mit eigener Physik" },
                masse: [
                    { key: "imBand", wort: "Anteil der Saaten mit Bremsweg 100 → 0 in 30–50 m", soll: 1, richtung: "≥" },
                    {
                        key: "imBand50",
                        wort: "Anteil der Saaten mit Bremsweg 50 → 0 in 7,5–12,5 m",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„∝ v²“: das Band 30–50 m bei 100 km/h mal (50/100)² = 0,25 ergibt 7,5–12,5 m bei 50 km/h",
                    },
                    { key: "rinne", wort: "Spurrinne nach 10 Durchfahrten in m", soll: 0, richtung: ">" },
                ],
                erwartet: "nicht",
                fehlt: "20 Saaten mit eigener Physik: die Welt trägt sechs Fahr-Rezepte",
            },
            3: {
                umfang: { soll: 1, wort: "Wasserfahrzeug (Floß bis Segler)" },
                masse: [
                    { key: "wende", wort: "Wende in Grad", von: 80, bis: 100 },
                    { key: "hoehe", wort: "Höhe gegen den Wind in m", soll: 0, richtung: ">" },
                    { key: "rollQ", wort: "Rollperiode ÷ Formel", soll: 1, tol: 0.15 },
                ],
                erwartet: "nicht",
                fehlt: "kein Wasserfahrzeug in der Welt",
            },
            4: {
                umfang: { soll: 2, wort: "Medien Schiene und Luft" },
                masse: [
                    { key: "zug2", wort: "Zug fährt an 2 % an (1 ja)", soll: 1, richtung: "≥" },
                    { key: "zug4", wort: "Zug fährt an 4 % an (0 nein)", soll: 0, richtung: "≤" },
                    { key: "ueberziehQ", wort: "Überziehtempo ÷ Formel", soll: 1, tol: 0.1 },
                ],
                erwartet: "nicht",
                fehlt: "kein Schienen- und kein Luft-Werk in der Welt",
            },
            5: {
                umfang: { soll: 1, wort: "Tiefsee-Werk mit Verformung und Untergang" },
                masse: [
                    { key: "crashImBand", wort: "Anteil der Crashs mit Tiefe im Band realer Tests", soll: 1, richtung: "≥" },
                    {
                        key: "sinkImFall",
                        wort: "Anteil der Untergänge mit Sinkdauer in der Spanne der Quellen des dokumentierten Falls",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„gegen dokumentierten Fall“: die Spanne seiner Quellen ist das Band, wie dem Crash „im Band realer Tests“",
                    },
                ],
                erwartet: "nicht",
                fehlt: "kein Tauch-Werk, keine Verformung aus der Stoff-Zeile",
            },
            6: {
                umfang: { soll: 1, wort: "Raum-Werk (Boden → Orbit → Mond)" },
                masse: [{ key: "keplerQ", wort: "Orbit-Periode ÷ Kepler", soll: 1, tol: 0.01 }],
                erwartet: "nicht",
                fehlt: "kein Raum-Werk in der Welt",
            },
            7: {
                umfang: { soll: 100, wort: "Saaten fremder Welten (g, ρ, Meer)" },
                masse: [{ key: "skalierung", wort: "Anteil der Saaten mit korrekter Skalierung in g und ρ", soll: 0.95, richtung: "≥" }],
                erwartet: "leser",
                fehlt: "kein Planet trägt sein g: der Fahr-Kern liest die Konstante FAHR.G 9,8",
                wo: "vehicle-core.js:3080",
            },
            8: {
                umfang: { soll: 1, wort: "Fahrzeug zwischen Sonnensystemen" },
                masse: [{ key: "lorentzQ", wort: "Uhren-Abweichung ÷ Lorentz-Faktor bei 0,9 c", soll: 1, tol: 0.01 }],
                erwartet: "nicht",
                fehlt: "kein Raum-Werk, keine Bord-Uhr",
            },
        },
        bestehend: { 1: "karte2.mensch.fahrzeug.medium#1" },
        proben: {
            2: [
                {
                    name: "ATTRAPPE: 20 Saaten bremsen im Band, der Boden bleibt glatt (Spurrinne 0)",
                    j: { leiter: "mensch.fahrzeug.medium", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 20, werte: { imBand: 1, imBand50: 1, rinne: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Spurrinne nach 10 Durchfahrten in m 0 verfehlt/,
                },
                {
                    name: "der Bremsweg wächst linear mit v (50 → 0 in 15–25 m, die Hälfte von 100 → 0)",
                    j: { leiter: "mensch.fahrzeug.medium", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 20, werte: { imBand: 1, imBand50: 0, rinne: 0.05 } } } },
                    gruen: false,
                    zahl: /ROT an Anteil der Saaten mit Bremsweg 50 → 0 in 7,5–12,5 m 0 verfehlt/,
                },
            ],
            4: [
                {
                    name: "der Zug fährt jede Steigung an (4 % ja)",
                    j: { leiter: "mensch.fahrzeug.medium", adapter: PROBE, sprossen: { 4: { art: "zahl", n: 2, werte: { zug2: 1, zug4: 1, ueberziehQ: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Zug fährt an 4 % an/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.form — die Form bestimmt die Fahrt. S1 der Werkstatt-Wagen in zwei Bauplänen unter Vollgas auf der Wiese
    // (Masse am Werk, Tempo im Sattel); S2–S6 der Umfang gezählt (Rezepte, Hüllen, Sätze, Kulturen, Epochen).
    F.leiter("mensch.fahrzeug.form", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "stamm/feld-sprache.js"],
        messe: async (H, K) => {
            await K.messort("wiese");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().rezepte.length, fehlt: "50 Baupläne an Land: der Fahrzeug-Kern trägt " + da().rezepte.length + " Rezepte (" + da().rezepte.map((x) => x.k).join(", ") + ")" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().medien.wasser + da().medien.luft, fehlt: "Rumpf, Segel, Flügel aus Teilen: kein Floß und kein Gleiter steht in der Welt" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().kulturen, fehlt: "10³ Kultur-Saaten: der Kern trägt " + da().kulturen + " Kulturen (eingefrorene Marken-Vektoren)" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "Technik-Evolution über 500 Jahre: die Epochen sind eine feste Tafel (" + da().epochen.join(" · ") + "), keine Auslese durch Gebrauch" }));
            await K.schritt(4, async () => {
                const verb = ["baue", "bau mir", "mach mir", "erschaffe", "stell mir"];
                const ding = ["einen wagen", "ein auto", "einen karren", "ein boot", "ein floß", "einen schlitten", "eine kutsche", "ein fahrrad", "einen zug", "einen gleiter",
                    "ein flugzeug", "einen lastwagen", "einen rennwagen", "einen traktor", "ein segelboot", "eine rakete", "einen bus", "ein motorrad", "einen ochsenkarren", "eine sänfte"];
                const saetze = verb.flatMap((v) => ding.map((d) => v + " " + d));
                const o = await K.welt("return await (" + H.seite.SAETZE + ")(r, T, " + JSON.stringify({ saetze }) + ");");
                H.zeile("Sätze → Fahrzeug: " + o.n + "/" + o.von);
                K.nicht(4, { n: o.n, fehlt: "10² Sätze → Fahrzeug: der Parser trägt " + o.n + " von " + o.von + " Fahrzeug-Sätzen" });
            });
            await K.schritt(1, async () => {
                const o = await K.welt("return await (" + H.seite.FORM + ")(r, T, " + JSON.stringify({ takte: 360 }) + ");", 50000);
                H.zeile("Werkstatt-Wagen: " + JSON.stringify(o).slice(0, 300));
                const [L, S] = o.laeufe || [];
                K.zahl(1, {
                    n: o.n,
                    werte: { masseQ: o.masseQ, tempoQ: o.tempoQ },
                    beleg: L && S ? "leicht Masse " + L.masse + " · " + L.v + " m/s · " + L.weg + " m; schwer Masse " + S.masse + " · " + S.v + " m/s · " + S.weg + " m nach 6 s Vollgas" : o.fehler || JSON.stringify(o.laeufe),
                    taeter: o.tempoQ != null && o.tempoQ >= 1 ? "carPhys: die Leistung je Masse ist fest (P.leistung kW/t, vehicle-core.js:3412) — die schwere Form zieht gleich" : null,
                });
            });
        },
        seite: { ZENSUS: zensusFahr, FORM: formTempo, SAETZE: saetzeFahr },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Werkstatt-Wagen, in zwei Bauplänen gefahren" },
                masse: [
                    { key: "masseQ", wort: "Masse schwer ÷ leicht", soll: 1, richtung: ">" },
                    { key: "tempoQ", wort: "Tempo nach 6 s Vollgas schwer ÷ leicht", soll: 1, richtung: "<" },
                ],
            },
            2: {
                umfang: { soll: 50, wort: "Baupläne an Land" },
                masse: [{ key: "kippQ", wort: "Kippgrenze ÷ statische Formel", soll: 1, tol: 0.15 }],
                erwartet: "nicht",
                fehlt: "50 Baupläne an Land: der Kern trägt sechs Rezepte",
            },
            3: {
                umfang: { soll: 2, wort: "Werke mit gebauter Hülle (Floß, Gleiter)", herkunft: "der Richter nennt zwei Werke aus Teilen: das Floß (sinkt/schwimmt) und den Gleiter (fällt/fliegt)" },
                masse: [
                    { key: "flossQ", wort: "Floß: Grenze sinkt ↔ schwimmt ÷ Formel", soll: 1, tol: 0.15 },
                    { key: "gleiterQ", wort: "Gleiter: Grenze fällt ↔ fliegt ÷ Formel", soll: 1, tol: 0.15 },
                ],
                erwartet: "nicht",
                fehlt: "kein Floß und kein Gleiter aus Teilen",
            },
            4: {
                umfang: { soll: 100, wort: "Sätze → Fahrzeug" },
                masse: [{ key: "aufgabe", wort: "Anteil der Fahrzeuge, die ihre Aufgabe im Spiel erfüllen", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "der Parser baut aus keinem Satz ein Fahrzeug",
            },
            5: {
                umfang: { soll: 1000, wort: "Kultur-Saaten" },
                masse: [
                    { key: "physik", wort: "Anteil, der den Physik-Test besteht", soll: 0.95, richtung: "≥" },
                    { key: "ohneMetall", wort: "Anteil ohne Metall, wo die Kultur kein Metall kennt", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "10³ Kultur-Saaten: der Kern trägt eine Handvoll Marken",
            },
            6: {
                auge: { pose: "Messort wiese: die Ahnen-Reihe nach 500 Jahren Zeitraffer, 12 m vor dem Spieler", vorbild: "Ahnenreihen realer Fahrzeuge (Museum: Kutsche → Benz Patent-Motorwagen → Limousine)" },
                erwartet: "nicht",
                fehlt: "Technik-Evolution über 500 Jahre: die Epochen sind eine feste Tafel",
            },
        },
        proben: {
            1: [
                {
                    name: "die schwere Form zieht gleich (Tempo 1,00 bei Masse 1,9×)",
                    j: { leiter: "mensch.fahrzeug.form", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { masseQ: 1.9, tempoQ: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Tempo nach 6 s Vollgas schwer ÷ leicht 1 verfehlt/,
                },
                {
                    name: "ATTRAPPE: der Stempel trug keine Masse (zwei gleiche Wagen, Tempo durch das Gelände verschieden)",
                    j: { leiter: "mensch.fahrzeug.form", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { masseQ: 1, tempoQ: 0.9 } } } },
                    gruen: false,
                    zahl: /ROT an Masse schwer ÷ leicht 1 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.gestalt — die Gestalt im Bild. S1 die Straße mit den Wagen der Stadt (≥ 5 Gattungen gezählt), S2 die Reihe
    // der Epochen des Kerns 12 m vor dem Spieler; S3–S6 der Umfang gezählt.
    F.leiter("mensch.fahrzeug.gestalt", {
        sek: 60,
        mutiert: true,
        pfad: PFAD,
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Fahrzeug-Typen " + JSON.stringify(z.fahrzeugTypen) + " · Wagen " + z.wagen + " · Epochen " + z.epochen.join(","));
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            const medien = () => Object.keys(da().medien).filter((k) => ["land", "wasser", "schiene"].includes(k) && da().medien[k] > 0).length;
            await K.schritt(3, async () => K.nicht(3, { n: medien(), fehlt: "10³ Saaten in Land, Wasser, Schiene: die Welt trägt " + medien() + " Medium (Land), " + da().fahrzeugTypen.length + " Fahrzeug-Typen" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().wagen, fehlt: "10² Wagen einer Straße: die Stadt trägt " + da().wagen + " Wagen" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().fremd, fehlt: "fremde Evolutionen: kein Fahrzeug eines fremden Leibs" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fremd, fehlt: "10⁴ Planeten-Saaten: die Welt trägt einen Planeten ohne fremde Zivilisation" }));
            await K.schritt(2, async () => {
                const o = await K.welt("return await (" + H.seite.REIHE + ")(r, T, {});", 45000);
                H.zeile("Reihe der Epochen: " + o.n + "/" + o.soll + " " + (o.ids || []).join(", "));
                try {
                    if (o.n < o.soll || o.n < 6) return K.nicht(2, { n: o.n, fehlt: "Land −5000 bis 2150: die Reihe trägt " + o.n + " von " + o.soll + " Stufen" });
                    const b = await K.bild(2, o.pose);
                    K.auge(2, { bild: b.datei, pose: "stadt-voll: 2 m hinter dem Spieler, 2,2 m hoch, Blick auf die Reihe der Epochen 12 m vor ihm", mass: o.n + " Stufen: " + o.ids.join(" · ") });
                } finally {
                    await K.welt("return await (" + H.seite.REIHE + ")(r, T, " + JSON.stringify({ weg: true }) + ");");
                }
            });
            await K.schritt(1, async () => {
                const w = da();
                const n = w.fahrzeugTypen.length;
                if (n < 5) return K.nicht(1, { n, fehlt: "5 Gattungen: die Welt trägt " + n + " Fahrzeug-Typen (" + w.fahrzeugTypen.join(", ") + ")" });
                if (!w.posen.strasse) throw new Error("kein Wagen am Messort");
                const b = await K.bild(1, w.posen.strasse);
                K.auge(1, { bild: b.datei, pose: "stadt-voll: 12 m vor dem nächsten Wagen der Stadt, 2 m über Grund", mass: n + " Fahrzeug-Typen, " + w.wagen + " Wagen" });
            });
        },
        seite: { ZENSUS: zensusFahr, REIHE: epochenReihe },
        sprossen: {
            1: {
                auge: { pose: "Messort stadt-voll: 12 m vor dem nächsten Wagen der Stadt in Richtung des Spielers, 2 m über Grund, Blick auf den Wagen", vorbild: "Fotos realer Straßen mit Wagen fünf Gattungen (Kleinwagen, Limousine, SUV, Lieferwagen, Sportwagen): ≥ 90 % als Gattung erkannt" },
                erwartet: "nicht",
                fehlt: "5 Gattungen: die Welt trägt weniger Fahrzeug-Typen",
            },
            2: {
                auge: { pose: "Messort stadt-voll: 2 m hinter dem Spieler, 2,2 m hoch, Blick auf die Reihe der sechs Epochen 12 m vor ihm (5,5 m Abstand)", vorbild: "Museumsfotos je Epoche: Schleife, Ochsenkarren, Kutsche, Motorwagen, Limousine, Zukunftsstudie (Silhouette IoU ≥ 0,7, Epoche ± 1 Jh.)" },
            },
            3: { auge: { pose: "Messort stadt-voll: 10³ Saaten in Reihe", vorbild: "Fotos von Dschunke, Kogge, Dhau und Wagen aller Kulturen" }, erwartet: "nicht", fehlt: "10³ Saaten in Land, Wasser, Schiene: die Welt trägt ein Medium" },
            4: { auge: { pose: "Messort stadt-voll: die Straße mit 10² Wagen", vorbild: "Fotos einer realen Straße mit gealterten, beladenen, verbeulten Wagen (Alter ± 10 J)" }, erwartet: "nicht", fehlt: "10² Wagen einer Straße: die Stadt trägt 20" },
            5: { auge: { pose: "Fahrzeuge fremder Leiber an fester Pose", vorbild: "„nicht von der Erde“ und „passt zum Leib“ im Panel (Fremdwelt-Probe R10)" }, erwartet: "nicht", fehlt: "fremde Evolutionen: kein fremder Leib baut Fahrzeuge" },
            6: { auge: { pose: "je Zivilisation eine Reihe ihrer Fahrzeuge", vorbild: "Formensprachen: zwischen ≥ 95 % unterscheidbar, innerhalb Familie ≥ 80 % (Fremdwelt-Probe R10)" }, erwartet: "nicht", fehlt: "10⁴ Planeten-Saaten: ein Planet" },
        },
        proben: {
            2: [
                {
                    name: "die Reihe stand nicht im Bild (kein Schuss) — UNGEMESSEN, nie ein Augen-Urteil",
                    j: { leiter: "mensch.fahrzeug.gestalt", adapter: PROBE, sprossen: { 2: { art: "auge", bild: "", pose: "Reihe der Epochen" } } },
                    gruen: false,
                    zahl: /keine Messung der Sprosse$/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.lenker — wer fährt. S1 der Verkehr der Stadt über die Takte (am Steuer, Stöße, Zeitlücke, Reisetempo,
    // Steckenbleiber, Spielzeit); S2–S6 der Umfang gezählt.
    F.leiter("mensch.fahrzeug.lenker", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(3, async () => K.nicht(3, { n: da().strecken, fehlt: "Rennfahrer auf 20 Strecken: die Welt trägt keine Rennstrecke" }));
            await K.schritt(4, async () => K.nicht(4, { n: (da().medien.wasser > 0 ? 1 : 0) + (da().medien.luft > 0 ? 1 : 0), fehlt: "Kapitän und Pilot: kein Wasser- und kein Luftfahrzeug mit Lenker" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().wettkampf, fehlt: "Sport mit Gefährt: kein Wettkampf, kein Feld, kein Windschatten" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fremd, fehlt: "fremde Lenker in fremden Medien: kein fremder Leib am Steuer" }));
            await K.schritt(2, async () => K.nicht(2, { n: da().wagen, fehlt: "10² Fahrer mit Charakter: die Stadt trägt " + da().wagen + " Wagen, ihr Stil ist EINER (VERKEHR.stil)" }));
            await K.schritt(1, async () => {
                const ms = Math.max(5000, (H.rest() - 6) * 1000);
                const o = await K.welt("return await (" + H.seite.VERKEHR + ")(r, T, " + JSON.stringify({ ms }) + ");", ms + 20000);
                H.zeile("Verkehr: " + JSON.stringify(o).slice(0, 360));
                // die Spielstunde nicht erreicht: der Deckel der Probe schnitt den Lauf — kein Urteil über die Welt, UNGEMESSEN beim Namen
                if (!(o.stunden >= 1)) throw new Error("eine Spielstunde Verkehr nicht erreicht: " + o.verkehrS + " von " + o.stundeS + " s in " + o.takte + " Takten, " + o.wandS + " s Wand (" + o.msJeTakt + " ms je Takt)" + (o.fehler ? " · " + o.fehler : ""));
                K.zahl(1, {
                    n: o.n,
                    werte: { kollisionen: o.kollisionen, zeitluecke: o.zeitluecke, reisetempo: o.reisetempo, stillstand: o.stillstand, stunden: o.stunden },
                    beleg: o.wagen + " Wagen, " + o.takte + " Takte, " + o.verkehrS + " s Verkehr (Spielstunde " + o.stundeS + " s), " + o.wegM + " m gefahren, " + o.luecken + " Folge-Proben, " + o.msJeTakt + " ms je Takt",
                    taeter: o.kollisionen > 0 || o.stillstand > 0 || !(o.reisetempo >= 0.8) || !(o.zeitluecke >= 1 && o.zeitluecke <= 3) ? "die Fahrer des Verkehrs (stamm/siedlung-verkehr.js: Folgen, Bremsen, Spur)" : null,
                });
            });
        },
        seite: { ZENSUS: zensusFahr, VERKEHR: verkehrLauf },
        sprossen: {
            1: {
                umfang: { soll: 10, wort: "Fahrer am Steuer auf den Wegen" },
                masse: [
                    { key: "kollisionen", wort: "Kollisionen (Wagen, Leib, Bau)", soll: 0, richtung: "≤" },
                    { key: "zeitluecke", wort: "Zeitlücke zum Vorderen im Median in s", von: 1, bis: 3 },
                    { key: "reisetempo", wort: "Reisetempo ÷ erlaubtes", soll: 0.8, richtung: "≥" },
                    { key: "stillstand", wort: "Stillstände ohne Anlass", soll: 0, richtung: "≤" },
                    {
                        key: "stunden",
                        wort: "Spielstunden Verkehr der Messung",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„1 h“: eine Stunde der Welt-Uhr, `_bewohnerStundeSek()` = 60 min Tag ÷ 24 = 150 s Spielzeit (stamm/siedlung-bewohner.js:2422)",
                    },
                ],
            },
            2: {
                umfang: { soll: 100, wort: "Fahrer mit Charakter" },
                masse: [
                    {
                        key: "tempoAuc",
                        wort: "Tempo vorsichtig ↔ eilig trennbar (AUC)",
                        soll: 0.5,
                        richtung: ">",
                        herkunft: "„trennbar“: besser als der Zufall — AUC 0,5 heißt ununterscheidbar (wie 50 % im Zwei-Wege-Zwang, R11)",
                    },
                    { key: "zeitluecke", wort: "Zeitlücke zum Vorderen im Median in s", von: 1, bis: 3 },
                ],
                erwartet: "nicht",
                fehlt: "10² Fahrer mit Charakter: die Stadt trägt 20 Wagen mit EINEM Stil",
            },
            3: {
                umfang: { soll: 20, wort: "Rennstrecken mit Rennfahrer" },
                masse: [{ key: "umlaufQ", wort: "bester Umlauf ÷ Optimum", soll: 1.05, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "keine Rennstrecke in der Welt",
            },
            4: {
                umfang: { soll: 2, wort: "Kapitän und Pilot (Wasser- und Luftfahrzeug mit Lenker)", herkunft: "die Aufzählung „Kapitän und Pilot“ zählt zwei Lenker: einen zu Wasser, einen in der Luft" },
                masse: [
                    { key: "regattaRang", wort: "Regatta: Rang folgt Können (Spearman r)", soll: 0, richtung: ">" },
                    { key: "landung", wort: "Landungen bei 15 kn Seitenwind gelungen", soll: 0.95, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Wasser- und kein Luftfahrzeug",
            },
            5: {
                umfang: { soll: 1, wort: "Wettkampf mit Gefährt" },
                masse: [
                    { key: "windschatten", wort: "Windschatten und Überholen treten auf (1 ja)", soll: 1, richtung: "≥" },
                    { key: "siegerQ", wort: "Siegerzeit je km ÷ Rekordklasse", soll: 1, tol: 0.15 },
                    { key: "gegenlauf", wort: "Gegenlauf ohne Windschatten: das Feld zieht sich auseinander (1 ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Wettkampf mit Gefährt",
            },
            6: {
                umfang: { soll: 100, wort: "fremde Lenker in fremden Medien" },
                masse: [{ key: "optimumQ", wort: "Lauf ÷ Optimum", soll: 1.1, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "kein fremder Lenker",
            },
        },
        proben: {
            1: [
                {
                    name: "ATTRAPPE: 0 Kollisionen, weil keiner fuhr (Reisetempo 0)",
                    j: { leiter: "mensch.fahrzeug.lenker", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 20, werte: { kollisionen: 0, zeitluecke: 2, reisetempo: 0, stillstand: 0, stunden: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Reisetempo ÷ erlaubtes 0 verfehlt/,
                },
                {
                    name: "Kolonne Stoßstange an Stoßstange (Zeitlücke 0,4 s)",
                    j: { leiter: "mensch.fahrzeug.lenker", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 20, werte: { kollisionen: 0, zeitluecke: 0.4, reisetempo: 0.9, stillstand: 0, stunden: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Zeitlücke zum Vorderen im Median in s 0\.4 verfehlt/,
                },
                {
                    name: "der Lauf einer Minute statt einer Spielstunde (0,4 h)",
                    j: { leiter: "mensch.fahrzeug.lenker", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 20, werte: { kollisionen: 0, zeitluecke: 1.8, reisetempo: 0.9, stillstand: 0, stunden: 0.4 } } } },
                    gruen: false,
                    zahl: /ROT an Spielstunden Verkehr der Messung 0\.4 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.maschine — Kraft, die arbeitet. S1 die Haspel des Ziehbrunnens (gezählt am Dorf), S2–S6 die Maschinen der
    // Welt gezählt.
    F.leiter("mensch.fahrzeug.maschine", {
        sek: 45,
        pfad: [...PFAD, "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Werke " + JSON.stringify(z.werke));
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z.werke;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().quelle, fehlt: "50 Maschinen-Saaten mit Quelle: keine Mühle und kein Wasserrad steht in der Welt (das Rad eines Werks dreht im Leerlauf ohne Quelle, stamm/koerper-leib.js:3106)" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().ketten, fehlt: "Werkstatt-Kette Rohstoff → Fahrzeug: kein Werk trägt eine Fertigung" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().fabrik, fehlt: "Fabrik, Industriestadt: kein Fabrik- und kein Kraftwerks-Bau" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().werft, fehlt: "Industrie eines Planeten: keine Werft, kein Raumhafen" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fabrik > 0 ? 1 : 0, fehlt: "Industrie über Sonnensysteme: die Welt trägt EIN Sonnensystem, " + da().fabrik + " Fabrik-Bauten in ihm" }));
            await K.schritt(1, async () => K.leser(1, { n: da().brunnen, fehlt: "die Haspel des Ziehbrunnens ist Gestalt: kein Verb dreht die Kurbel, der Eimer hängt an der Fülle (" + da().brunnen + " Brunnen am Ort)", wo: "fachwerk-core.js:7462" }));
        },
        seite: { ZENSUS: zensusFahr },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Werkzeug mit Wirkung (Haspel am Ziehbrunnen)" },
                masse: [
                    { key: "hub", wort: "Hub des Eimers je Kurbel-Umdrehung in m", soll: 0, richtung: ">" },
                    { key: "folgt", wort: "Rang-r Kurbelweg ↔ Hub über die Umdrehungen", soll: 0, richtung: ">" },
                ],
                erwartet: "leser",
                fehlt: "die Haspel ist Gestalt: kein Verb dreht die Kurbel, der Eimer hängt an der Fülle",
                wo: "fachwerk-core.js:7462",
            },
            2: {
                umfang: { soll: 50, wort: "Maschinen-Saaten mit Quelle (Mühle, Wasserrad)" },
                masse: [{ key: "nurBeiQuelle", wort: "Anteil der Maschinen, die nur bei Quelle arbeiten", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Mühle und kein Wasserrad in der Welt",
            },
            3: {
                umfang: { soll: 1, wort: "Werkstatt-Kette Rohstoff → Fahrzeug" },
                masse: [{ key: "dauerMin", wort: "Wagen aus Holz, Eisen, Leder in min", soll: 10, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "kein Werk trägt eine Fertigung",
            },
            4: {
                auge: { pose: "Messort stadt: die Fabrik von der Straße, 30 m", vorbild: "Fabrikfoto einer realen Industriestadt um 1900 (Riemen, Welle, Band), dazu der Gegenlauf Kraftwerk aus" },
                erwartet: "nicht",
                fehlt: "Fabrik, Industriestadt: kein Fabrik-Bau",
            },
            5: {
                umfang: { soll: 1, wort: "Werft oder Raumhafen" },
                masse: [{ key: "erzKette", wort: "Raumschiff aus gesehen abgebautem Erz (1 ja)", soll: 1, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Werft, kein Raumhafen",
            },
            6: {
                umfang: { soll: 2, wort: "Sonnensysteme mit Industrie", herkunft: "„über Sonnensysteme“: die Industrie reicht über mehr als ein System, der Plural verlangt mindestens zwei" },
                masse: [{ key: "rang", wort: "Nachtseite ↔ Energie- und Rohstoffkarte (Rang r)", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "ein Sonnensystem ohne Industrie",
            },
        },
        proben: {
            2: [
                {
                    name: "ATTRAPPE: 50 Mühlen drehen auch bei Flaute (das Rad im Leerlauf)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 50, werte: { nurBeiQuelle: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Anteil der Maschinen, die nur bei Quelle arbeiten 0 verfehlt/,
                },
            ],
            1: [
                {
                    name: "ATTRAPPE: die Kurbel dreht, der Eimer hängt an der Fülle (Hub 0)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { hub: 0, folgt: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Hub des Eimers je Kurbel-Umdrehung in m 0 verfehlt/,
                },
                {
                    name: "der Eimer steigt mit der Uhr, nicht mit der Kurbel (r −0,2)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { hub: 0.3, folgt: -0.2 } } } },
                    gruen: false,
                    zahl: /ROT an Rang-r Kurbelweg ↔ Hub über die Umdrehungen -0\.2 verfehlt/,
                },
            ],
        },
    }),
];
