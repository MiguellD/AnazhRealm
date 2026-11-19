// DIE PERSPEKTIVE bau DES KAPITELS mensch (Meisterkarte 2): vier Leitern, je Leiter EINE Probe in der warmen Welt der Sitzung
// (k2-mensch.js, die Fabrik). Gemessen wird am ERGEBNIS der Welt: die stehenden Häuser je Slot eines Orts (`_bewohnerSiedlungen`
// → `S.plan.slots` × `state.architectures`, derselbe Schlüssel `seed@x,z` wie die Bewohner-Liste, stamm/siedlung-bewohner.js:598),
// ihre Rollen (das Los trägt seine Funktion, stamm/siedlung-ort.js:481 — fachwerk STADT_GRAMMATIK), die Bewohner und ihre Berufe,
// das Bild an fester Pose, ein gesetztes Haus über eine Spielstunde, und die Sätze des Spielers durch den EINEN Parser
// (`parseChatToDsl`, stamm/feld-sprache.js:545). Wo die Welt den Umfang nicht stellt, misst die Probe ihn und urteilt „nicht“.
"use strict";

// DER ZENSUS DER BAUTEN (Seite der Welt): je Ort die stehenden Häuser seines Plans mit Rolle, Tür und Richtung aus dem Haus,
// die Bewohner und ihre Berufe, die Typen der Bauten — und die festen Posen der Bilder, aus dem nächsten Ort abgeleitet.
const zensusBau = async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const A = s.architectures || [];
    const steht = new Map();
    for (const e of A) if (e && Number.isFinite(e.seed)) steht.set((e.seed >>> 0) + "@" + Math.round(e.position.x) + "," + Math.round(e.position.z), e);
    const typen = {};
    let haeuser = 0;
    for (const e of A) {
        if (!e || typeof e.type !== "string") continue;
        typen[e.type] = (typen[e.type] || 0) + 1;
        if (e.tuer) haeuser++;
    }
    const zaehle = (re) => Object.keys(typen).filter((t) => re.test(t)).reduce((a, t) => a + typen[t], 0);
    const rollen = {};
    const berufe = {};
    let bewohner = 0;
    const orte = [];
    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
        if (!S || !S.plan || !Array.isArray(S.plan.slots)) continue;
        const O = { name: S.plan.name || "?", staedtisch: !!S.plan.staedtisch, d: Math.hypot(S.ox - pm.x, S.oz - pm.z), rollen: {}, haeuser: [], bewohner: 0, berufe: {} };
        for (const sl of S.plan.slots) {
            const wx = S.ox + sl.x;
            const wz = S.oz + sl.z;
            const e = steht.get((sl.seed >>> 0) + "@" + Math.round(wx) + "," + Math.round(wz));
            if (!e) continue;
            const rolle = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            O.rollen[rolle] = (O.rollen[rolle] || 0) + 1;
            rollen[rolle] = (rollen[rolle] || 0) + 1;
            const c = Math.cos(sl.phi || 0);
            const sn = Math.sin(sl.phi || 0);
            const tu = sl.tuer || { x: 0, z: 0 };
            const tx = wx + tu.x * c + tu.z * sn;
            const tz = wz - tu.x * sn + tu.z * c;
            const mx = sl.obb ? S.ox + sl.obb.cx : wx;
            const mz = sl.obb ? S.oz + sl.obb.cz : wz;
            const ul = Math.hypot(tx - mx, tz - mz) || 1;
            O.haeuser.push({ rolle, typ: e.type, x: wx, z: wz, y: e.position.y, tx, tz, ux: (tx - mx) / ul, uz: (tz - mz) / ul, tuer: !!e.tuer });
        }
        for (const b of Array.isArray(S.liste) ? S.liste : []) {
            O.bewohner++;
            bewohner++;
            const k = String(b.beruf || "?");
            O.berufe[k] = (O.berufe[k] || 0) + 1;
            berufe[k] = (berufe[k] || 0) + 1;
        }
        if (O.haeuser.length) orte.push(O);
    }
    orte.sort((a, b) => a.d - b.d);
    const nah = orte[0] || null;
    const posen = {};
    const auf = (x, z, dy) => hh(x, z) + dy;
    if (nah) {
        const mx = nah.haeuser.reduce((a, h) => a + h.x, 0) / nah.haeuser.length;
        const mz = nah.haeuser.reduce((a, h) => a + h.z, 0) / nah.haeuser.length;
        const my = hh(mx, mz);
        const dx = pm.x - mx;
        const dz = pm.z - mz;
        const dl = Math.hypot(dx, dz) || 1;
        posen.dorf30 = { px: mx + 21.2, py: my + 18, pz: mz + 21.2, lx: mx, ly: my + 2, lz: mz };
        posen.dorf100 = { px: mx + (dx / dl) * 100, py: auf(mx + (dx / dl) * 100, mz + (dz / dl) * 100, 12), pz: mz + (dz / dl) * 100, lx: mx, ly: my + 3, lz: mz };
        const w = nah.haeuser.find((h) => h.tuer && h.rolle === "wohnhaus") || nah.haeuser.find((h) => h.tuer);
        if (w) posen.haus10 = { px: w.tx + w.ux * 10, py: auf(w.tx + w.ux * 10, w.tz + w.uz * 10, 1.7), pz: w.tz + w.uz * 10, lx: w.x, ly: w.y + 2.5, lz: w.z, typ: w.typ };
        const ARB = /gasthaus|werkstatt|schmiede|backhaus|kaufhaus|kontor|zunfthaus|gerberei|speicher|rathaus/;
        const i = orte.flatMap((o) => o.haeuser).find((h) => h.tuer && ARB.test(h.rolle));
        if (i) posen.innen = { px: i.tx - i.ux * 1.6, py: i.y + 1.4, pz: i.tz - i.uz * 1.6, lx: i.tx - i.ux * 7, ly: i.y + 1.2, lz: i.tz - i.uz * 7, rolle: i.rolle, typ: i.typ };
    }
    const werk = orte.reduce((a, o) => a + o.haeuser.filter((h) => h.tuer && h.rolle !== "wohnhaus" && h.rolle !== "scheune").length, 0);
    const kurz = (o) => ({ name: o.name, staedtisch: o.staedtisch, d: Math.round(o.d), haeuser: o.haeuser.length, rollen: o.rollen, bewohner: o.bewohner, berufe: o.berufe });
    return {
        saat: s.worldMeta && s.worldMeta.seed != null ? 1 : 0,
        bauten: A.length,
        haeuser,
        typen: Object.keys(typen).length,
        rollen,
        funktionen: Object.keys(rollen).length,
        werk,
        orte: orte.map(kurz),
        staedte: orte.filter((o) => o.staedtisch).length,
        nah: nah ? kurz(nah) : null,
        bewohner,
        berufe,
        bauBeruf: Object.keys(berufe).filter((k) => /bau|zimmer|maurer|dachdeck/i.test(k)).reduce((a, k) => a + berufe[k], 0),
        ingenieur: { bruecke: zaehle(/bruecke|brücke|steg/i), damm: zaehle(/damm/i), hafen: zaehle(/hafen|bootshaus/i) + (rollen.bootshaus || 0), aquaedukt: zaehle(/aquaed|aquäd/i) },
        gross: { stadion: zaehle(/stadion|arena/i), bahnhof: zaehle(/bahnhof/i), fabrik: zaehle(/fabrik/i), kathedrale: zaehle(/kathedrale|dom_/i) },
        mega: zaehle(/arkolog|raumhafen|liftfuss|weltraumlift/i),
        fremd: zaehle(/fremd|alien|xeno/i),
        baustellen: A.filter((e) => e && (e.baustelle || e.bauPhase)).length,
        posen,
    };
};

// DAS SPIELER-HAUS ÜBER EINE SPIELSTUNDE (Seite der Welt): ein Haus des nächsten Orts (sein Typ, seine Tür) am Rand des Orts
// gesetzt, dann Takte zu `TAKT_DECKEL_S` ohne Pause, bis die Welt eine Stunde ihrer Uhr lebte (`_bewohnerStundeSek()` = 60 min
// Tag ÷ 24 = 150 s Spielzeit, stamm/siedlung-bewohner.js:2422) oder `arg.ms` Wanduhr um sind — gezählt, wer danach dort wohnt
// (Heim = die Saat des Hauses, die Tür das Haus), ob ihr Beruf die Rolle des Hauses trägt, und das Trampelpfad-Feld vor der Tür
// (`_pfadFeldAt`, stamm/siedlung-wege.js:1616) vorher ↔ nachher.
const spielerHaus = async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const SS = [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan && Array.isArray(S.plan.slots));
    SS.sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    const S = SS[0];
    if (!S) return { n: 0, fehler: "kein Ort mit Plan am Messort" };
    const vorlage = (s.architectures || []).find((e) => e && e.tuer && /^haus_/.test(e.type || "") && Math.hypot(e.position.x - S.ox, e.position.z - S.oz) < 250);
    if (!vorlage) return { n: 0, fehler: "kein Haus mit Tür im Ort als Vorlage" };
    let R = 0;
    for (const sl of S.plan.slots) R = Math.max(R, Math.hypot(sl.x, sl.z));
    const a0 = Math.atan2(pm.z - S.oz, pm.x - S.ox);
    let e = null;
    let x = 0;
    let z = 0;
    let ry = 0;
    const SAAT = 4242001;
    for (let k = 0; k < 8 && !e; k++) {
        const a = a0 + (k * Math.PI) / 4;
        x = S.ox + Math.cos(a) * (R + 20);
        z = S.oz + Math.sin(a) * (R + 20);
        ry = Math.atan2(S.ox - x, S.oz - z);
        e = r.spawnArchitecture(vorlage.type, { x, y: hh(x, z) + 0.5, z }, { seed: SAAT + k, rotationY: ry, silent: true, tuer: vorlage.tuer });
    }
    if (!e) return { n: 0, fehler: "spawnArchitecture setzte das Haus " + vorlage.type + " an keinem von 8 Orten am Rand" };
    const saat = e.seed >>> 0;
    const tu = e.tuer || { x: 0, z: 0, w: 1 };
    const c = Math.cos(e.rotationY || 0);
    const sn = Math.sin(e.rotationY || 0);
    const lx = (tu.x || 0) + (tu.w || 0) / 2;
    const tx = e.position.x + lx * c + (tu.z || 0) * sn;
    const tz = e.position.z - lx * sn + (tu.z || 0) * c;
    const spur = () => {
        let m = 0;
        for (let q = 0; q < 12; q++) {
            const w = (q * Math.PI) / 6;
            for (const d of [1, 2, 3]) {
                const px = tx + Math.cos(w) * d;
                const pz = tz + Math.sin(w) * d;
                const v = r._pfadFeldAt(px, pz, hh(px, pz));
                if (Number.isFinite(v) && v > m) m = v;
            }
        }
        return m;
    };
    const wohnt = () => {
        const L = [];
        for (const S2 of SS) for (const b of Array.isArray(S2.liste) ? S2.liste : []) if (b && (b.heim === saat || (b.orte && b.orte.tuer && b.orte.tuer.haus === e))) L.push(b);
        return L;
    };
    const p0 = spur();
    const b0 = wohnt().length;
    const z0 = s.spielZeit;
    const stundeS = r._bewohnerStundeSek();
    const schrittMs = r.constructor.TAKT_DECKEL_S * 1000;
    let uhr = performance.now();
    const wand0 = performance.now();
    const ende = wand0 + (arg.ms || 15000);
    let takte = 0;
    let fehler = 0;
    while (s.spielZeit - z0 < stundeS && performance.now() < ende) {
        for (let k = 0; k < 5 && s.spielZeit - z0 < stundeS; k++) {
            uhr += schrittMs;
            try {
                r._gameLoopTick(uhr);
            } catch (_e) {
                fehler++;
            }
            takte++;
        }
        await window.sleep();
    }
    const L = wohnt();
    const rolle = (S.plan.slots.find((sl) => (sl.seed >>> 0) === (vorlage.seed >>> 0)) || {}).rolle || "wohnhaus";
    const aus = {
        n: 1,
        typ: e.type,
        x: Math.round(x),
        z: Math.round(z),
        bewohner: L.length,
        vorher: b0,
        einrichtung: L.length ? L.filter((b) => b.beruf === rolle || (rolle === "wohnhaus" && b.rolle === "wohnhaus")).length / L.length : 0,
        abnutzung: +(spur() - p0).toFixed(4),
        stunde: +((s.spielZeit - z0) / stundeS).toFixed(3),
        stundeS,
        wandS: +((performance.now() - wand0) / 1000).toFixed(1),
        takte,
        fehler,
    };
    try {
        r.removeArchitecture(e);
    } catch (_e) {}
    return aus;
};

// DIE SÄTZE DES SPIELERS (Seite der Welt): jeder Satz durch den EINEN Parser (`parseChatToDsl`); gezählt, wessen Programm einen
// Bau-Op trägt (`spawn_…`, verschachtelt gesucht). `lauf`: das Programm des letzten tragenden Satzes läuft (`dslRun`).
const saetzeBau = async (r, T, arg) => {
    const baut = (p) => Array.isArray(p) && ((typeof p[0] === "string" && /^spawn_/.test(p[0])) || p.some(baut));
    const ja = [];
    const nein = [];
    let letzt = null;
    for (const t of arg.saetze || []) {
        let p = null;
        try {
            p = r.parseChatToDsl(t);
        } catch (_e) {}
        if (p && baut(p.program)) {
            ja.push(t);
            letzt = p;
        } else nein.push(t);
    }
    let lauf = null;
    if (arg.lauf && letzt && ja.length >= arg.lauf) {
        try {
            lauf = r.dslRun(letzt.program, { source: "human" });
            lauf = lauf && lauf.outcome ? String(lauf.outcome).slice(0, 80) : "gelaufen";
        } catch (e) {
            lauf = "warf: " + String(e && e.message).slice(0, 80);
        }
    }
    const pm = r.state.playerMesh.position;
    return { n: ja.length, von: (arg.saetze || []).length, ja: ja.slice(0, 12), nein: nein.slice(0, 6), lauf, pose: { px: pm.x, py: pm.y + 1.7, pz: pm.z, lx: pm.x + Math.sin(r.state.yaw || 0) * 8, ly: pm.y + 1, lz: pm.z + Math.cos(r.state.yaw || 0) * 8 } };
};

const PFAD = ["stamm/siedlung-*.js", "stamm/gelaende-boden.js", "fachwerk-core.js"];
const PROBE = "[linse-gpu] amd/rdna-3 (Probe)";

module.exports = (F) => [
    // ── mensch.bau.bedarf — welche Funktionen eine Siedlung baut. S1 am Dorf (das Bild für den Blind-Richter), S3–S6 der Zensus der
    // vollsten Welt (stadt-voll): Ingenieurbau, Großbau, Megastruktur, fremder Bau — gezählt, nie angenommen.
    F.leiter("mensch.bau.bedarf", {
        sek: 60,
        pfad: PFAD,
        messe: async (H, K) => {
            const Z = async () => {
                try {
                    return await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
                } catch (e) {
                    H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
                    return null;
                }
            };
            await K.messort("stadt-voll");
            const z = await Z();
            if (z) H.zeile("Zensus stadt-voll: Häuser " + z.haeuser + " · Orte " + z.orte.length + " · Funktionen " + z.funktionen + " " + JSON.stringify(z.rollen).slice(0, 300));
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(3, async () => {
                const w = da();
                const ing = w.ingenieur;
                K.nicht(3, { n: w.saat, fehlt: "10² Saaten in einer Probe: die Sitzung trägt EINE Welt-Saat; ihr Ingenieurbau Brücke " + ing.bruecke + " · Damm " + ing.damm + " · Hafen " + ing.hafen + " · Aquädukt " + ing.aquaedukt });
            });
            await K.schritt(4, async () => {
                const w = da();
                const g = w.gross;
                K.nicht(4, { n: w.staedte, fehlt: "32 Städte mit Großbau: die Welt trägt " + w.staedte + " Stadt, Stadion " + g.stadion + " · Bahnhof " + g.bahnhof + " · Fabrik " + g.fabrik + " · Kathedrale " + g.kathedrale });
            });
            await K.schritt(5, async () => {
                const w = da();
                if (w.mega < 3) K.nicht(5, { n: w.mega, fehlt: "keine Megastruktur: Arkologie, Raumhafen, Liftfuß stehen nicht in der Welt (" + w.typen + " Bau-Typen)" });
                else K.leser(5, { n: w.mega, fehlt: "die Mutation des Bedarfs hat keinen Schreiber in der Probe", wo: "fachwerk-core.js:4318" });
            });
            await K.schritt(6, async () => {
                const w = da();
                K.nicht(6, { n: w.fremd, fehlt: "100 fremde Großbauten: die Welt trägt keinen Bau eines fremden Planeten" });
            });
            await K.messort("dorf");
            const d = await Z();
            await K.schritt(1, async () => {
                if (!d || !d.nah) throw new Error("kein Ort am Messort dorf");
                const f = Object.keys(d.nah.rollen);
                if (f.length < 4) return K.nicht(1, { n: f.length, fehlt: "4 Funktionen im Dorf: der Ort trägt " + f.join(", ") });
                const p = d.posen.dorf30;
                const b = await K.bild(1, p);
                K.auge(1, { bild: b.datei, pose: "dorf: die Mitte des nächsten Orts aus 30 m (21,2/18/21,2 m versetzt), Blick 2 m über Grund", mass: "Funktionen " + f.length + " (" + f.join(", ") + ") an " + d.nah.haeuser + " Häusern" });
            });
        },
        seite: { ZENSUS: zensusBau },
        sprossen: {
            1: {
                auge: {
                    pose: "Messort dorf: die Mitte des nächsten Orts aus 30 m schräg oben (18 m), Blick auf die Mitte 2 m über Grund",
                    vorbild: "Luftbild eines realen Haufendorfs gleicher Kultur mit Kirche, Gasthaus, Schmiede und Wohnhäusern (Schwarzwald, Freilichtmuseum Vogtsbauernhof): 50 Bauten blind nach Funktion",
                },
            },
            3: {
                auge: { pose: "Messort stadt-voll: die nächste Flussquerung, 30 m flussab, Blick auf die Querung", vorbild: "reale Flussquerungen je Lage: Steinbrücke, Furt, Damm, Hafen (Steinerne Brücke Regensburg, Pont du Gard)" },
                erwartet: "nicht",
                fehlt: "10² Saaten in einer Probe: die Sitzung trägt eine Welt-Saat",
            },
            4: {
                auge: { pose: "Messort stadt-voll: der Großbau der Stadt aus 60 m, Blick auf seine Mitte", vorbild: "Stadion, Bahnhof, Fabrik und Kathedrale an 32 realen Städten, Größe je Einwohner (Zensus und Stadion-Register)" },
                erwartet: "nicht",
                fehlt: "32 Städte mit Großbau: die Welt trägt eine Stadt und keinen Stadion-, Bahnhof- oder Fabrik-Bau",
            },
            5: {
                umfang: { soll: 3, wort: "Megastruktur-Typen (Arkologie, Raumhafen, Liftfuß)", herkunft: "die Aufzählung „Arkologie, Raumhafen, Liftfuß“ zählt drei Typen der Megastruktur" },
                masse: [{ key: "gesetzrichtig", wort: "Mutation Bedarf ändert Großbauten gesetzrichtig", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Megastruktur steht in der Welt",
            },
            6: {
                auge: { pose: "Messort stadt-voll: ein fremder Großbau aus 40 m", vorbild: "100 fremde Großbauten mit benannter Funktion (Fremdwelt-Probe R10)" },
                erwartet: "nicht",
                fehlt: "fremde Planeten: die Welt trägt keinen fremden Großbau",
            },
        },
        unklar: {
            2: "Die Koordination legt einen Zensus-Korpus der Bau-Funktionen realer Städte der Epoche als Tafel ab (Häuserbuch einer Stadt um 1500, z. B. Nürnberg), dann misst die Station die Häufigkeit je Rolle an stadt-voll (≥ 20 Funktionen) und urteilt Spearman ≥ 0,7 gegen ihn.",
        },
        proben: {
            5: [
                {
                    name: "ATTRAPPE: drei Megastrukturen gezählt, die Mutation des Bedarfs ändert keinen Großbau",
                    j: { leiter: "mensch.bau.bedarf", adapter: PROBE, sprossen: { 5: { art: "zahl", n: 3, werte: { gesetzrichtig: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Mutation Bedarf ändert Großbauten gesetzrichtig 0 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.bau.huelle — die Hülle der Häuser im Bild. S1/S2 am Dorf (10 m vor der Tür, 100 m vor dem Ort), S3–S6 der Umfang an
    // der vollsten Stadt gezählt (Häuser mit Tür).
    F.leiter("mensch.bau.huelle", {
        sek: 60,
        pfad: PFAD,
        messe: async (H, K) => {
            const Z = async () => {
                try {
                    return await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
                } catch (e) {
                    H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
                    return null;
                }
            };
            await K.messort("stadt-voll");
            const z = await Z();
            if (z) H.zeile("Zensus stadt-voll: Häuser mit Tür " + z.haeuser + " · Bauten " + z.bauten + " · Typen " + z.typen);
            const bis = [[3, 1000, "10³ Bauten"], [4, 10000, "10⁴ Bauten im Blick, Tag und Nacht"], [5, 10000000, "10⁷ Bauten bis zum Horizont"]];
            for (const [n, soll, wort] of bis)
                await K.schritt(n, async () => {
                    if (!z) throw new Error("kein Zensus der Welt");
                    K.nicht(n, { n: z.haeuser, fehlt: wort + ": die vollste Stadt trägt " + z.haeuser + " Häuser (Soll " + soll + ")" });
                });
            await K.schritt(6, async () => {
                if (!z) throw new Error("kein Zensus der Welt");
                K.nicht(6, { n: z.fremd, fehlt: "jedes Bauwerk jedes Planeten: die Welt trägt keinen Bau eines anderen Planeten" });
            });
            await K.messort("dorf");
            const d = await Z();
            await K.schritt(2, async () => {
                if (!d || !d.nah) throw new Error("kein Ort am Messort dorf");
                if (d.nah.haeuser < 10) return K.nicht(2, { n: d.nah.haeuser, fehlt: "10 Häuser eines Orts: der Ort am Messort dorf trägt " + d.nah.haeuser });
                const b = await K.bild(2, d.posen.dorf100);
                K.auge(2, { bild: b.datei, pose: "dorf: 100 m vor der Ortsmitte in Richtung des Spielers, 12 m über Grund", mass: d.nah.haeuser + " Häuser im Ort" });
            });
            await K.schritt(1, async () => {
                if (!d || !d.posen || !d.posen.haus10) throw new Error("kein Haus mit Tür am Messort dorf");
                const b = await K.bild(1, d.posen.haus10);
                K.auge(1, { bild: b.datei, pose: "dorf: 10 m vor der Tür von " + d.posen.haus10.typ + ", Auge 1,7 m, Blick auf die Hausmitte", mass: "1 Haus " + d.posen.haus10.typ });
            });
        },
        seite: { ZENSUS: zensusBau },
        sprossen: {
            1: {
                auge: {
                    pose: "Messort dorf: 10 m vor der Tür des ersten Wohnhauses des nächsten Orts, Auge 1,7 m über Grund, Blick auf die Hausmitte 2,5 m hoch",
                    vorbild: "Foto eines Hauses derselben Kultur bei 10 m (alemannisches Fachwerkhaus, Freilichtmuseum Vogtsbauernhof): Paarvergleich, „Foto“ ≥ 5 %",
                },
            },
            2: {
                auge: {
                    pose: "Messort dorf: 100 m von der Ortsmitte in Richtung des Spielers, 12 m über Grund, Blick auf die Mitte",
                    vorbild: "Fotos eines realen Fachwerkdorfs bei 10 m und 100 m (Freudenberg, Siegerland): „Foto“ ≥ 15 %, kein Pop im Gang",
                },
            },
            3: { auge: { pose: "Messort stadt-voll: der Markt bei 1, 10 und 100 m", vorbild: "Fotos realer Altstadt-Plätze mit Ornament, Gesims, Läden, Schildern bei 1/10/100 m" }, erwartet: "nicht", fehlt: "10³ Bauten: die vollste Stadt trägt 295 Häuser" },
            4: { auge: { pose: "Messort stadt-voll bei Nacht: die Stadt aus 200 m, 40 m hoch", vorbild: "Nachtfoto einer realen Altstadt mit erleuchteten Fenstern und reale Zählreihen erleuchteter Fenster je Uhrzeit" }, erwartet: "nicht", fehlt: "10⁴ Bauten im Blick: die vollste Stadt trägt 295 Häuser" },
            5: { auge: { pose: "Messort gipfel-blick: die Dachlandschaft bis zum Horizont", vorbild: "Luftfoto einer Dachlandschaft bis zum Horizont (Paris von Montmartre)" }, erwartet: "nicht", fehlt: "10⁷ Bauten bis zum Horizont: die Welt trägt einige hundert" },
            6: { auge: { pose: "1 000 Stichproben je Bauwerk an fester Pose", vorbild: "1 000 Fotos realer Bauwerke (2AFC ≈ 50 %)" }, erwartet: "nicht", fehlt: "jedes Bauwerk jedes Planeten: die Welt trägt einen Planeten" },
        },
        proben: {
            1: [
                {
                    name: "das Bild fehlt (die Pose schoss nichts) — UNGEMESSEN, nie ein Augen-Urteil",
                    j: { leiter: "mensch.bau.huelle", adapter: PROBE, sprossen: { 1: { art: "auge", bild: "", pose: "10 m vor der Tür" } } },
                    gruen: false,
                    zahl: /keine Messung der Sprosse$/,
                },
            ],
        },
    }),

    // ── mensch.bau.innen — die Räume hinter der Fassade. S1/S2 urteilen bestehende Stationen; S3 das Bild in der Tür eines Werk-Baus
    // der vollsten Stadt (≥ 10² Werk-Bauten gezählt), S4–S7 der Umfang gezählt.
    F.leiter("mensch.bau.innen", {
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
            if (z) H.zeile("Zensus stadt-voll: Häuser mit Tür " + z.haeuser + " · Werk-Bauten " + z.werk + " " + JSON.stringify(z.rollen).slice(0, 300));
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(4, async () => {
                const w = da();
                if (w.haeuser < 10000) return K.nicht(4, { n: w.haeuser, fehlt: "10⁴ Bauten: die vollste Stadt trägt " + w.haeuser + " Häuser" });
                K.leser(4, { n: w.haeuser, fehlt: "der Raum hinter einem Fenster hat keinen Leser der Probe", wo: "fachwerk-core.js:1786" });
            });
            await K.schritt(5, async () => K.nicht(5, { n: da().haeuser, fehlt: "10⁶ Bauten mit 100 Etagen: die vollste Stadt trägt " + da().haeuser + " Häuser" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().haeuser, fehlt: "≥ 10⁹ Bauten, 10¹⁰ Räume: die vollste Stadt trägt " + da().haeuser + " Häuser" }));
            await K.schritt(7, async () => K.nicht(7, { n: da().fremd, fehlt: "Bauten fremder Leiber: jeder Bau der Welt ist für den Menschen gebaut" }));
            await K.schritt(3, async () => {
                const w = da();
                if (w.werk < 100) return K.nicht(3, { n: w.werk, fehlt: "10² Werk-Bauten (Werkstatt, Laden, Schenke): die vollste Stadt trägt " + w.werk });
                if (!w.posen.innen) throw new Error("kein Werk-Bau mit Tür");
                const b = await K.bild(3, w.posen.innen);
                K.auge(3, { bild: b.datei, pose: "stadt-voll: in der Tür von " + w.posen.innen.rolle + " (" + w.posen.innen.typ + "), Auge 1,4 m, Blick 7 m ins Haus", mass: w.werk + " Werk-Bauten" });
            });
        },
        seite: { ZENSUS: zensusBau },
        sprossen: {
            3: {
                auge: {
                    pose: "Messort stadt-voll: in der Tür des ersten Werk-Baus (Gasthaus, Werkstatt, Laden), Auge 1,4 m über seinem Grund, Blick 7 m ins Haus",
                    vorbild: "Fotos realer Innenräume einer Werkstatt, eines Ladens, einer Schenke (Freilichtmuseum Hessenpark): 200 Räume blind klassifiziert",
                },
            },
            4: {
                umfang: { soll: 10000, wort: "Bauten" },
                masse: [{ key: "fensterRaum", wort: "Fenster mit Raum und Zugang dahinter", soll: 0.99, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "10⁴ Bauten: die vollste Stadt trägt 295 Häuser",
            },
            5: { auge: { pose: "Messort hochhaus-dach: der Raum je Etage vom Dach zum Keller", vorbild: "Fotos realer Wohnungen je Beruf, Stand und Epoche" }, erwartet: "nicht", fehlt: "10⁶ Bauten mit 100 Etagen: die Welt trägt einige hundert Häuser" },
            6: { auge: { pose: "1 000 Räume an fester Pose je Raum", vorbild: "1 000 Räume, vom Architekten gewertet (bewohnbar, kulturtreu)" }, erwartet: "nicht", fehlt: "≥ 10⁹ Bauten: die Welt trägt einige hundert Häuser" },
            7: { auge: { pose: "100 Räume fremder Leiber an fester Pose", vorbild: "Räume fremder Leiber, Körpergröße und Gang daraus gelesen (Fremdwelt-Probe R10)" }, erwartet: "nicht", fehlt: "Bauten fremder Leiber: jeder Bau ist für den Menschen gebaut" },
        },
        bestehend: { 1: "karte2.mensch.bau.innen#1", 2: "siedlung.K1#2" },
        proben: {
            4: [
                {
                    name: "ATTRAPPE Fassade: 10⁴ Bauten, hinter 2 % der Fenster kein Raum",
                    j: { leiter: "mensch.bau.innen", adapter: PROBE, sprossen: { 4: { art: "zahl", n: 10000, werte: { fensterRaum: 0.98 } } } },
                    gruen: false,
                    zahl: /ROT an Fenster mit Raum und Zugang dahinter 0\.98 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.bau.bauen — Bauen als Vorgang. S1 urteilt die bestehende Station (Labor ↔ Welt); S2 die Baustelle der Bewohner (der
    // Zug setzt jedes Haus ganz), S3 ein gesetztes Haus über eine Spielstunde, S5 die Sätze des Spielers durch den Parser.
    F.leiter("mensch.bau.bauen", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "stamm/feld-sprache.js", "stamm/feld-leben.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
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
            await K.schritt(2, async () => {
                const w = da();
                K.leser(2, { n: w.baustellen, fehlt: "keine Baustelle: der Zug setzt jedes Haus ganz (spawnArchitecture), kein Bau trägt Aushub, Gerüst, Rohbau, Dach; Bewohner mit Bau-Beruf " + w.bauBeruf, wo: "stamm/siedlung-ort.js:517" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: da().baustellen, fehlt: "Umbau über 50 Jahre: die Stadt baut sich nicht um, kein Bau trägt eine Baustelle" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fremd, fehlt: "fremde Leiber auf fremden Welten: die Welt trägt keine fremde Baustelle" }));
            await K.schritt(5, async () => {
                const was = ["dorf", "tempel", "damm", "wasserfall"];
                const saetze = [
                    ...was.map((w) => "baue " + w + " hier"),
                    "bau mir ein haus", "baue ein haus hier", "baue ein fachwerkhaus am weg", "errichte eine kapelle am hang", "baue eine brücke über den bach",
                    "bau einen brunnen auf den platz", "baue eine scheune neben den hof", "stell eine bank an den weg", "baue einen turm auf den hügel", "baue eine mühle an den fluss",
                    "mach mir eine hütte im wald", "baue eine mauer um das dorf", "baue einen stall für die pferde", "setz ein tor an den eingang", "baue eine schmiede am markt",
                    "baue ein gasthaus an die kreuzung", "baue eine kirche in die mitte", "baue einen steg ins wasser", "baue einen zaun um den garten", "baue eine laterne an die tür",
                    "baue eine treppe den hang hinauf", "bau ein baumhaus", "baue einen hafen am see", "baue eine burg auf den felsen", "baue einen markt mit ständen",
                    "baue ein rathaus am platz", "baue einen speicher für korn", "baue eine bäckerei", "baue ein badehaus", "baue eine werkstatt für den zimmermann",
                    "baue einen spielplatz", "baue eine arena", "baue eine rennstrecke", "baue einen leuchtturm an die küste", "baue ein zelt",
                    "baue einen pavillon im park", "baue einen wachturm am tor", "baue eine schule", "baue eine bibliothek", "baue ein theater",
                    "baue eine windmühle auf das feld", "baue eine zisterne", "baue ein aquädukt", "baue einen kanal", "baue eine stadtmauer",
                    "baue ein kloster auf den berg",
                ];
                const o = await K.welt("return await (" + H.seite.SAETZE + ")(r, T, " + JSON.stringify({ saetze, lauf: 50 }) + ");");
                H.zeile("Sätze → Bau: " + o.n + "/" + o.von + " · tragend " + JSON.stringify(o.ja).slice(0, 240));
                if (o.n < 50) return K.nicht(5, { n: o.n, fehlt: "50 Sätze → Bau: der Parser trägt " + o.n + " von " + o.von + " Bau-Sätzen (" + o.ja.join(" · ").slice(0, 160) + ")" });
                const b = await K.bild(5, o.pose);
                K.auge(5, { bild: b.datei, pose: "dorf: 8 m vor dem Spieler, wo der 50. Satz baute", mass: o.n + "/" + o.von + " Sätze bauen, Lauf " + o.lauf });
            });
            await K.schritt(3, async () => {
                const ms = Math.max(4000, (H.rest() - 6) * 1000);
                const o = await K.welt("return await (" + H.seite.HAUS + ")(r, T, " + JSON.stringify({ ms }) + ");", ms + 20000);
                H.zeile("Spieler-Haus: " + JSON.stringify(o).slice(0, 300));
                // die Spielstunde nicht erreicht: der Deckel der Probe schnitt den Lauf — kein Urteil über die Welt, UNGEMESSEN beim Namen
                if (o.n && !(o.stunde >= 1)) throw new Error("eine Spielstunde nach dem Bau nicht erreicht: " + o.stunde + " h in " + o.takte + " Takten, " + o.wandS + " s Wand" + (o.fehler ? " · " + o.fehler : ""));
                K.zahl(3, {
                    n: o.n,
                    werte: { bewohner: o.bewohner, einrichtung: o.einrichtung, abnutzung: o.abnutzung, stunde: o.stunde },
                    beleg: o.typ ? o.typ + " bei " + o.x + "/" + o.z + ", " + o.takte + " Takte, " + o.stunde + " Spielstunden (" + o.stundeS + " s je Stunde), " + o.wandS + " s Wand" : o.fehler,
                    taeter: o.bewohner > 0 ? null : "die Bewohner-Liste liest nur die Slots des Plans (stamm/siedlung-bewohner.js:762): ein gesetztes Haus bekommt keinen Bewohner",
                });
            });
        },
        seite: { ZENSUS: zensusBau, HAUS: spielerHaus, SAETZE: saetzeBau },
        sprossen: {
            2: {
                umfang: { soll: 10, wort: "Baustellen der Bewohner" },
                masse: [{ key: "geordnet", wort: "Bauphasen richtig geordnet", soll: 0.9, richtung: "≥" }],
                erwartet: "leser",
                fehlt: "keine Baustelle: der Zug setzt jedes Haus ganz",
                wo: "stamm/siedlung-ort.js:517",
            },
            3: {
                umfang: { soll: 1, wort: "Spieler-Haus in der Welt" },
                masse: [
                    { key: "bewohner", wort: "Bewohner im Spieler-Haus nach 1 h", soll: 1, richtung: "≥" },
                    { key: "einrichtung", wort: "Anteil der Bewohner, deren Beruf die Rolle des Hauses trägt", soll: 1, richtung: "≥" },
                    { key: "abnutzung", wort: "Trampelpfad vor der Tür (Zuwachs des Pfad-Felds)", soll: 0, richtung: ">" },
                    {
                        key: "stunde",
                        wort: "Spielstunden seit dem Bau",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„nach 1 h“: eine Stunde der Welt-Uhr, `_bewohnerStundeSek()` = 60 min Tag ÷ 24 = 150 s Spielzeit (stamm/siedlung-bewohner.js:2422)",
                    },
                ],
            },
            4: { auge: { pose: "Messort stadt: dieselbe Gasse im Jahr 0 und +50", vorbild: "Fotos realer Baustellen je Epoche: Kran, Gerüst, Schalung (Stadtarchiv-Reihen)" }, erwartet: "nicht", fehlt: "Umbau über 50 Jahre: die Stadt baut sich nicht um" },
            5: {
                auge: { pose: "Messort dorf: 8 m vor dem Spieler, wo der 50. Satz baut, Auge 1,7 m, Blick auf den Bau", vorbild: "50 gesprochene Bau-Sätze mit dem Gemeinten, im Panel „das Gemeinte“ und „passend“ ≥ 80 %" },
                erwartet: "nicht",
                fehlt: "50 Sätze → Bau: der Parser trägt vier Bau-Sätze",
            },
            6: {
                umfang: { soll: 10, wort: "fremde Baustellen fremder Leiber" },
                masse: [
                    { key: "phasen", wort: "Phasen geordnet", soll: 0.8, richtung: "≥" },
                    { key: "traegt", wort: "Anteil der Bauten, die tragen", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "fremde Leiber auf fremden Welten: keine fremde Baustelle",
            },
        },
        bestehend: { 1: "karte2.mensch.bau.bauen#1" },
        proben: {
            3: [
                {
                    name: "das Haus steht, niemand zieht ein (Bewohner 0) — ROT am Bewohner",
                    j: { leiter: "mensch.bau.bauen", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 1, werte: { bewohner: 0, einrichtung: 0, abnutzung: 0.2, stunde: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Bewohner im Spieler-Haus nach 1 h 0 verfehlt/,
                },
                {
                    name: "eine Minute statt einer Spielstunde (0,4 h)",
                    j: { leiter: "mensch.bau.bauen", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 1, werte: { bewohner: 3, einrichtung: 1, abnutzung: 0.2, stunde: 0.4 } } } },
                    gruen: false,
                    zahl: /ROT an Spielstunden seit dem Bau 0\.4 verfehlt/,
                },
                {
                    name: "Bewohner ohne Spur: die Tür bleibt unbetreten (Abnutzung 0)",
                    j: { leiter: "mensch.bau.bauen", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 1, werte: { bewohner: 3, einrichtung: 1, abnutzung: 0, stunde: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Trampelpfad vor der Tür/,
                },
            ],
        },
    }),
];
