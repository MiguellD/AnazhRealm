// DIE RICHTER-STATIONEN DER PERSPEKTIVE wirtschaft (Meisterkarte 2, Kapitel mensch; die Fabrik ist k2-mensch.js, ihr Kopf das Gesetz):
// je Leiter EINE Probe am Messort stadt-voll (295 Häuser, 1092 Bewohner). Gemessen wird am ERGEBNIS der Welt: die Bewohner an ihrem
// Werk um 10 und um 2 Uhr (derselbe Leser wie mensch.K2#2, kreatur-mensch.cjs `anStation`: gezeichnete Leiber ≤ 1,5 m vom Werk —
// hier je Rolle über die ganze Stadt), die Haltung, die die Welt ihnen gibt, die Wagen der Stadt mit ihren Fahrern und Fahrten, die
// Mühlen der Architektur im Wind und in der Flaute, die Bestände der Welt über sieben geraffte Tage. Was die Welt nicht trägt, urteilt
// die Probe beim Namen: „Umfang nicht erzeugbar“ mit dem gemessenen Umfang, „fehlender Leser“ mit der Stelle im Spiel-Baum. Die
// Seiten-Funktionen sehen nichts aus diesem Modul (sie reisen als Text).
"use strict";

const { FAECHER } = require("./faecher.js");
const PROBE = "[linse-gpu] amd/rdna-3 (Probe)";
const STADT_PFAD = ["stamm/siedlung-bewohner.js", "stamm/siedlung-verkehr.js", "stamm/siedlung-wege.js", "fachwerk-core.js", "koerper-core.js"];

// DER STAND DER TECHNIK AN EINER ADRESSE (mensch.wirtschaft.technik#1, das Gesetz des Fächers, stationen/faecher.js): der Leser ruft das
// Gesetz des Kerns beim Namen und rechnet nichts nach — an der Saat a.saat der Plan des DORF ({seed, nH, epoche: siedlungsEpoche(seed)})
// vor `technikImBild` (Techniken im Bild, die der Stand der Saat nicht trägt: `ohneVor`), sein Stand, der Graph (Techniken mit
// Vorgänger); an der Adresse a.ort = { ox, oz } der Plan der Stadt am Messort, wie die Welt ihn gebaut hat (`technik` des Plans). Trägt
// der Kern das Gesetz nicht (main vor front-technik), steht `fehlt`. Vorher lief die Schleife der Saaten in dieser Funktion selbst
const TECHNIK_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore;
    if (!FC || typeof FC.technikImBild !== "function" || !FC.TECHNIK) return { fehlt: "der Kern trägt kein Technik-Gesetz (fachwerk technikImBild fehlt) — kein Stand im Plan" };
    const G = FC.TECHNIK.graph, mitVor = Object.keys(G).filter((k) => G[k].vor.length).length;
    if (a.saat != null) {
        const D = FC.DORF({ seed: a.saat, nH: mit.nH, epoche: FC.siedlungsEpoche(a.saat) });
        if (!D.technik) return { fehlt: "der Plan der Saat " + a.saat + " trägt keinen Technik-Stand" };
        const B = FC.technikImBild({ technik: D.technik, slots: D.houses });
        return { mitVor, ohneVor: B.ohneVor, ohne: B.ohne, imBild: B.imBild, stand: D.technik.stand.join(",") };
    }
    let S = null, d = Infinity;
    for (const q of (r._bewohnerSiedlungen || new Map()).values()) {
        const e = Math.hypot(q.ox - a.ort.ox, q.oz - a.ort.oz);
        if (q && q.plan && e < d) [S, d] = [q, e];
    }
    if (!(S && S.plan.technik)) return { fehlt: S ? "der Plan der Stadt trägt keinen Technik-Stand" : "keine Siedlung am Messort" };
    const B = FC.technikImBild(S.plan);
    return { mitVor, ohneVor: B.ohneVor, ohne: B.ohne, welt: { ohneVor: B.ohneVor, ohne: B.ohne, stand: S.plan.technik.stand.length, ohneTechnik: S.plan.technik.fehlt, epoche: S.plan.technik.epoche } };
};
// DER FÄCHER DER TECHNIK (technik#1): die vier Dinge der Bauart — das Gesetz, die Adressen (20 Saaten + die Stadt am Messort), das
// Prädikat (die Verdichtung; die Schwellen stehen an der Sprosse), die schlechteste Adresse. Der Leser des Spiels: stamm/siedlung-ort.js:308
// bestellt den Plan beim Faden (export-settlement → fachwerk-core exportSettlement → DORF), die Epoche der Zelle aus siedlungsEpoche (:2007)
const technikFaecher = (ort, nH) => ({
    gesetz: { export: "fachwerk-core.js:5183 DORF + :13942 technikImBild", leser: "stamm/siedlung-ort.js:308" },
    adressen: { saaten: 20, dazu: [{ ort }] },
    mit: { nH },
    masse: {
        mitVor: { wie: "max", feld: "mitVor" },
        ohneVor: { wie: "summe", feld: "ohneVor" },
        ohne: { wie: "zaehle", feld: "ohne" },
        imBild: { wie: "zaehle", feld: "imBild", nur: "saat" },
        staende: { wie: "verschieden", feld: "stand", nur: "saat" },
        saaten: { wie: "anzahl", nur: "saat" },
        welt: { wie: "erste", feld: "welt" },
    },
    schlecht: { feld: "ohneVor", richtung: "max" },
});

// DER ZENSUS DER STADT (jede Leiter der Perspektive): warten, bis die Siedlung am Messort ihre Bewohner trägt und nichts mehr offen
// ist (`__gebautNach`, wie g2 dorfZaehlung), dann je Plan die Rollen der Häuser, die Bewohner mit Werk, Beruf und Rolle, die Händler,
// die Stände und Märkte, die Wagen (mit Fahrer, ihre gezählten Fahrten, ob einer den Plan verlässt), die Laternen, die Jahre der
// Pläne, die Schmieden und die Mühlen (Architektur mit Rad oder Segel, ohne die Wagen) im Ort, die Bestände des Spielers
const STADT = async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const offen = () => {
        const o = typeof r._weltOffen === "function" ? r._weltOffen() : {};
        return !o.leute && !o.leiber;
    };
    const alle = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan);
    await window.__gebautNach("die Stadt am Messort (Zensus wirtschaft)", {
        fertig: () => alle().some((S) => Array.isArray(S.liste) && S.liste.length > 0) && offen(),
    });
    const SL = alle().sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    if (!SL.length) throw new Error("keine Siedlung mit Plan am Messort");
    const plus = (o, k, n) => (o[k] = (o[k] || 0) + (n == null ? 1 : n));
    const imPlan = (S, x, z, saum) => {
        const w = S.plan.welt;
        if (!w) return Math.hypot(x - S.ox, z - S.oz) < 300;
        const lx = x - S.ox, lz = z - S.oz;
        return lx >= w.x0 - saum && lx <= w.x1 + saum && lz >= w.z0 - saum && lz <= w.z1 + saum;
    };
    const Z = {
        siedlungen: SL.length, bewohner: 0, mitWerk: 0, berufe: {}, rollen: {}, slotRollen: {}, haeuser: 0, haendler: 0, staende: 0,
        maerkte: 0, wagen: 0, fahrer: 0, fahrten: 0, fernWagen: 0, laternen: 0, lichtOrte: 0, jahre: [], schmieden: 0, schmiede: null,
        muehlen: 0, inventar: {}, nah: { ox: SL[0].ox, oz: SL[0].oz, name: SL[0].plan.name || null },
    };
    for (const S of SL) {
        const P = S.plan;
        if (Number.isFinite(P.jahr)) Z.jahre.push(P.jahr);
        for (const sl of P.slots || []) {
            Z.haeuser++;
            const ro = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            plus(Z.slotRollen, ro);
            if (/schmied/i.test(ro)) {
                Z.schmieden++;
                if (!Z.schmiede) Z.schmiede = { x: S.ox + sl.x, z: S.oz + sl.z, phi: sl.phi || 0 };
            }
        }
        for (const b of Array.isArray(S.liste) ? S.liste : []) {
            Z.bewohner++;
            plus(Z.berufe, String(b.beruf));
            plus(Z.rollen, String(b.rolle));
            if (b.orte && b.orte.werk) Z.mitWerk++;
            if (/haendler/i.test(String(b.rolle) + " " + String(b.beruf))) Z.haendler++;
        }
        const st = (P.staende || []).length;
        Z.staende += st;
        if (st > 0) Z.maerkte++;
        const lat = (P.laternen || []).length;
        Z.laternen += lat;
        if (lat > 0) Z.lichtOrte++;
        for (const W of (S.verkehr && S.verkehr.wagen) || []) {
            Z.wagen++;
            if (Array.isArray(W.fahrer) && W.fahrer.length) Z.fahrer++;
            if (Number.isFinite(W.ziele)) Z.fahrten += W.ziele;
            const p = W.entry && W.entry.position;
            if (p && !imPlan(S, p.x, p.z, 5)) Z.fernWagen++;
        }
    }
    for (const e of s.architectures || []) {
        if (!e || e._verkehrWagen || !e.mesh || !e.mesh.userData) continue;
        const idle = e.mesh.userData._idleMotion;
        if (!Array.isArray(idle) || !idle.some((x) => x && (x.role === "rad" || x.role === "segel"))) continue;
        const p = e.mesh.position;
        if (SL.some((S) => imPlan(S, p.x, p.z, 30))) Z.muehlen++;
    }
    for (const x of (s.player && s.player.inventory) || []) if (x && x.kind === "material") plus(Z.inventar, String(x.material), x.count || 0);
    return Z;
};

// DIE BEWOHNER AM WERK (beruf; der Leser von mensch.K2#2, kreatur-mensch.cjs `anStation` — gezeichnete Leiber ≤ 1,5 m vom Werk um
// 10 und um 2 Uhr — über JEDE Rolle der Stadt statt der Schmiede): die Uhr springt wie dort (`uhrAuf`: über die Gegen-Stunde h + 12,
// `_uhrSetzen` regler, der Takt der Leute ohne Zeit `_bewohnerWerkTakt(Infinity)` + `_tickBewohner(0)`, bis keiner mehr ankommt),
// dann zwei Takte des Spiels; gezählt je Rolle: wer um 10 sein Werk im Soll hat (`_bewohnerSoll`, draußen), wer um 10 an ihm steht,
// wer um 2 — und die Haltung, die die Welt dem Stehenden gibt (`b.gemuet.haltung`, koerper `tagesHaltung`). Danach 10 Uhr, der
// Spieler 9 m vor der Mitte der Rolle mit den meisten am Werk
const BERUF = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()]
        .filter((x) => x && x.plan && Array.isArray(x.liste) && x.liste.length)
        .sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z))[0];
    if (!S) throw new Error("keine Siedlung mit Bewohnern am Messort");
    const liste = S.liste.filter((b) => b && b.orte && b.orte.werk);
    if (!liste.length) throw new Error("kein Bewohner mit Werk in der Siedlung am Messort");
    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
    const auf = async (h) => {
        for (const t of [h + 12, h]) (r._uhrSetzen((t % 24) / 24, "regler"), leute(0));
        let k = 0;
        for (; k < 600 && S.liste.some((b) => b.ankunft); k++) leute(0);
        await window.__seitenTakt();
        await window.__seitenTakt();
        return k;
    };
    const gez = (g) => !!g && (g.visible || (g.userData && g.userData._satz === true) || r._kzBesitztFeld(g));
    const am = (b) => {
        const g = b.leib;
        if (!gez(g) || b.drinnen) return false;
        return Math.hypot(g.position.x - b.orte.werk.x, g.position.z - b.orte.werk.z) < 1.5;
    };
    const per = {};
    const takte = [await auf(10)];
    for (const b of liste) {
        const k = String(b.rolle);
        const e = per[k] || (per[k] = { soll: 0, am10: 0, am2: 0, x: 0, z: 0, haltungen: [] });
        const sl = r._bewohnerSoll(b, 10);
        if (sl && sl.ziel === b.orte.werk && !sl.drinnen) e.soll++;
        if (!am(b)) continue;
        e.am10++;
        e.x += b.leib.position.x;
        e.z += b.leib.position.z;
        const h = b.gemuet && b.gemuet.haltung != null ? String(b.gemuet.haltung) : "keine";
        if (e.haltungen.indexOf(h) < 0) e.haltungen.push(h);
    }
    takte.push(await auf(2));
    for (const b of liste) if (am(b)) per[String(b.rolle)].am2++;
    takte.push(await auf(10));
    const R = Object.entries(per);
    const haltungen = [...new Set(R.flatMap(([, e]) => e.haltungen))];
    const top = R.filter(([, e]) => e.am10 > 0).sort((a, b) => b[1].am10 - a[1].am10)[0];
    const aus = {
        mitWerk: liste.length,
        rollen: R.length,
        soll10: R.reduce((a, [, e]) => a + e.soll, 0),
        am10: R.reduce((a, [, e]) => a + e.am10, 0),
        am2: R.reduce((a, [, e]) => a + e.am2, 0),
        rollenAm: R.filter(([, e]) => e.am10 > 0).length,
        rollenTag: R.filter(([, e]) => e.am10 > 0 && e.am2 === 0).length,
        haltungen,
        je: Object.fromEntries(R.map(([k, e]) => [k, [e.soll, e.am10, e.am2]])),
        takte,
        pose: null,
    };
    if (top) {
        const cx = top[1].x / top[1].am10, cz = top[1].z / top[1].am10;
        const h = (x, z) => r.getTerrainHeightAt(x, z);
        aus.pose = { rolle: top[0], px: +cx.toFixed(2), py: +(h(cx, cz + 9) + 1.7).toFixed(2), pz: +(cz + 9).toFixed(2), lx: +cx.toFixed(2), ly: +(h(cx, cz) + 1).toFixed(2), lz: +cz.toFixed(2) };
        pm.set(cx, h(cx, cz + 9) + A.PLAYER_FOOT_OFFSET, cz + 9);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
    }
    return aus;
};

// DIE MÜHLE IM WIND (energie S2): die erste Architektur im Ort mit Rad oder Segel (ohne die Wagen der Stadt) — ihre Drehung je
// Sekunde der Bild-Uhr (Winkel des Teils über 30 Takte des Spiels, `_bildZeit`) bei klarem Wetter (Flaute) und im Sturm, das Wetter
// nur über `__wetterSetzen`; der Wind am Ort (`_windAt` staerke) beweist, dass das Wetter wechselte. Danach klar
const MUEHLE = async (r, T, arg) => {
    const s = r.state;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()].filter((x) => x && x.plan);
    const imOrt = (p) =>
        S.some((Q) => {
            const w = Q.plan.welt;
            if (!w) return Math.hypot(p.x - Q.ox, p.z - Q.oz) < 300;
            const lx = p.x - Q.ox, lz = p.z - Q.oz;
            return lx >= w.x0 - 30 && lx <= w.x1 + 30 && lz >= w.z0 - 30 && lz <= w.z1 + 30;
        });
    const M = (s.architectures || []).filter((e) => {
        if (!e || e._verkehrWagen || !e.mesh || !e.mesh.userData) return false;
        const idle = e.mesh.userData._idleMotion;
        return Array.isArray(idle) && idle.some((x) => x && (x.role === "rad" || x.role === "segel")) && imOrt(e.mesh.position);
    });
    if (!M.length) return { muehlen: 0 };
    const e = M[0];
    const idle = e.mesh.userData._idleMotion;
    const i = idle.findIndex((x) => x && (x.role === "rad" || x.role === "segel"));
    const c = e.mesh.children[i];
    if (!c) throw new Error("die Mühle trägt kein Teil an der Stelle ihrer Rolle " + idle[i].role);
    const p = e.mesh.position;
    const dreh = async () => {
        for (let k = 0; k < 3; k++) await window.__seitenTakt();
        const q = c.quaternion.clone();
        const t0 = r._bildZeit;
        let w = 0;
        for (let k = 0; k < 30; k++) {
            await window.__seitenTakt();
            w += c.quaternion.angleTo(q);
            q.copy(c.quaternion);
        }
        const dt = r._bildZeit - t0;
        // die Bühne kann die Bild-Uhr halten (ausgabe-aufnahme `uhrHalten`): dann dreht kein Rad, und die Messung wäre die Uhr, nie der Wind
        if (!(dt > 0)) throw new Error("die Bild-Uhr steht über 30 Takte (gehalten?) — die Drehung der Mühle ist nicht messbar");
        return { rad: +(w / dt).toFixed(4), wind: +r._windAt(p.x, p.z, r._bildZeit).staerke.toFixed(4) };
    };
    let flaute, sturm;
    try {
        window.__wetterSetzen("sunny");
        flaute = await dreh();
        window.__wetterSetzen("stormy");
        sturm = await dreh();
    } finally {
        window.__wetterSetzen("sunny");
    }
    if (!(sturm.wind > flaute.wind)) throw new Error("das Wetter änderte den Wind an der Mühle nicht (" + flaute.wind + " → " + sturm.wind + ")");
    return {
        muehlen: M.length,
        rolle: idle[i].role,
        flauteDreh: flaute.rad,
        sturmDreh: sturm.rad,
        drehVerhaeltnis: flaute.rad > 0 ? +(sturm.rad / flaute.rad).toFixed(3) : null,
        windFlaute: flaute.wind,
        windSturm: sturm.wind,
    };
};

// STEHT DIE PROBE SCHON AM ORT? (markt S1 · handel S1, 22.11.): die Sitzung stellt jede Probe vor ihrem Deckel an ihren Messort
// (punkte.cjs probeOrt liest `K.messort("stadt-voll")` aus dem Befehl); ein zweites `/umstellen` derselben Stadt geht über den Anlauf
// (400, 400) und die Gründung neu und kostete an der Radeon 42 und 52 s von 54 (Zweig front-wirtschaft d157e52f, zweimal gemessen) —
// die Probe stellt nur um, wo keine Stadt mit Bewohnern und Ständen um den Spieler steht (200 m um ihre Mitte)
const AM_ORT = async (r, T, arg) => {
    const pm = r.state.playerMesh.position;
    return [...(r._bewohnerSiedlungen || new Map()).values()].some(
        (S) => S && S.plan && Array.isArray(S.liste) && S.liste.length > 0 && (S.plan.staende || []).length > 0 && Math.hypot(S.ox - pm.x, S.oz - pm.z) < 200
    );
};

// DER TAUSCH AM STAND (markt S1, Spieler ↔ Bewohner, nur was er hat; der Leser des Spiels: `_bestandTausch` an der Taste des Verbs E,
// der Bestand der Stände aus `_bestandAnlegen`, sein Gesetz koerper `bestandAm`). „vor“: der Spieler tritt 1,6 m vor den nächsten Stand,
// dessen Händler an ihm steht (sonst die Uhr auf 10, dann 14 Uhr, wie BERUF), trägt er keinen Stoff außer der Ware des Stands, legt
// die Probe EINEN Stein in sein Inventar; der Halter wird als Abzug gemerkt. Die Taste drückt die Probe (echte Eingabe). „nach“: der
// Tausch ist die Änderung des Stands gegen DENSELBEN Halter ohne Tausch zur selben Stunde (der Abzug, `bestandAm` rein) — der Verbrauch
// der Sekunde dazwischen zählt nie als Tausch; der Gegenlauf: die größte Füllung eines Stands über 24 h ohne Lieferung (ein Stand
// stellt nichts her). Fehlt ein Leser im Spiel, sagt „vor“ welcher.
const TAUSCH = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const KC = window.__koerperCore;
    const pm = s.playerMesh.position;
    const fehlt = [];
    if (!KC || typeof KC.bestandAm !== "function") fehlt.push("koerper-core bestandAm");
    if (typeof r._bestandTausch !== "function") fehlt.push("_bestandTausch");
    if (typeof r._bestandAnlegen !== "function") fehlt.push("_bestandAnlegen");
    if (fehlt.length) return { leser: fehlt.join(", ") };
    const staende = () => [...(r._bewohnerSiedlungen || new Map()).values()].flatMap((S) => (Array.isArray(S.liste) ? S.liste : []).filter((b) => b && b.bestand && b.bestand.art === "stand"));
    const zahl = (m) => ((s.player && s.player.inventory) || []).reduce((a, x) => a + (x && x.kind === "material" && x.material === m ? x.count || 0 : 0), 0);
    if (arg.schritt === "nach") {
        const M = window.__k2Tausch;
        if (!M) throw new Error("kein Tausch vorbereitet");
        delete window.__k2Tausch;
        const h = r._weltStunde();
        const H = M.b.bestand;
        const ohneTausch = KC.bestandAm(M.abzug, h, M.ware);
        const ist = KC.bestandAm(H, h, M.ware);
        let fuellung = -Infinity;
        for (const b of staende()) {
            const a = KC.bestandAm(b.bestand, h, b.bestand.ware);
            for (let t = 0.5; t <= 24; t += 0.5) fuellung = Math.max(fuellung, KC.bestandAm(b.bestand, h + t, b.bestand.ware) - a);
        }
        return {
            sinkt: +(ist - ohneTausch).toFixed(6),
            ohneHerstellung: Number.isFinite(fuellung) ? +fuellung.toFixed(6) : null,
            ware: M.ware,
            gabe: M.gabe,
            invWare: [M.invWare, zahl(M.ware)],
            invGabe: [M.invGabe, zahl(M.gabe)],
            gabeAmStand: KC.bestandAm(H, h, M.gabe),
            staende: staende().length,
        };
    }
    const alle = staende();
    if (!alle.length) return { n: 0, staende: 0 };
    const da = (b) => b.leib && !b.drinnen && Math.hypot(b.leib.position.x - b.orte.werk.x, b.leib.position.z - b.orte.werk.z) < 1.5;
    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
    let wer = null;
    for (const uhr of [null, 10, 14]) {
        if (uhr != null) {
            for (const t of [uhr + 12, uhr]) (r._uhrSetzen((t % 24) / 24, "regler"), leute(0));
            for (let k = 0; k < 600 && alle.some((b) => b.ankunft); k++) leute(0);
            await window.__seitenTakt();
            await window.__seitenTakt();
        }
        wer = alle.filter(da).sort((a, b) => Math.hypot(a.orte.werk.x - pm.x, a.orte.werk.z - pm.z) - Math.hypot(b.orte.werk.x - pm.x, b.orte.werk.z - pm.z))[0];
        if (wer) break;
    }
    if (!wer) return { n: 0, staende: alle.length, keinerDa: true };
    const w = wer.orte.werk;
    const x = w.x + Math.sin(w.blick) * 1.6, z = w.z + Math.cos(w.blick) * 1.6;
    pm.set(x, r._bodenSichtAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
    if (s._fixedSimPos) s._fixedSimPos.copy(pm);
    const ware = wer.bestand.ware;
    const inv = (s.player && s.player.inventory) || [];
    if (!inv.some((i) => i && i.kind === "material" && i.material !== ware && (i.count || 0) >= 1)) r.addMaterialToInventory(ware === "stein" ? "holz" : "stein", 1);
    const gabe = inv.find((i) => i && i.kind === "material" && i.material !== ware && (i.count || 0) >= 1).material;
    const h = r._weltStunde();
    window.__k2Tausch = { b: wer, ware, gabe, abzug: JSON.parse(JSON.stringify(wer.bestand)), invWare: zahl(ware), invGabe: zahl(gabe) };
    return { n: 1, staende: alle.length, ware, gabe, vorher: KC.bestandAm(wer.bestand, h, ware), h: +h.toFixed(3) };
};

// DIE LIEFERUNG (handel S1, eine Ware auf einem Weg mit Fahrer; die Leser des Spiels: die Lieferung `_verkehrLieferung` ·
// `_verkehrLieferAn` an der Ankunft des Wagens, sein Bild `_verkehrLadung`, das Gesetz koerper `bestandAnkunft`). Zuerst der Gegenlauf:
// die Welt-Uhr springt einen Tag (die Kalender-Zeit der Welt, je Tag `tagS` der Uhr), zwei Takte — in ihnen kommt kein Wagen an —, dann
// `standLeer` der Anteil der Stände, die ohne Lieferung leer stehen (die Kisten der nahen Stände zählt der Beleg). Nach dem Sprung
// steigen die Fahrer neu ein (die Ankunft: f(Same, t), ihr Same legt sie auf ein Stück ihrer Lieferung); die Stadt fährt im echten
// Loop, bis ein Wagen mit Fahrer geladen und einer leer fährt und eine Lieferung am Stand ankam: Umfang die geladen fahrenden,
// `beladen` die Kisten im Bild des geladenen weniger die des leeren (das Bildpaar). Fehlt ein Leser im Spiel, sagt die Probe welcher.
const LIEFERUNG = async (r, T, arg) => {
    const s = r.state;
    const KC = window.__koerperCore;
    const fehlt = [];
    if (!KC || typeof KC.bestandAnkunft !== "function") fehlt.push("koerper-core bestandAnkunft");
    if (typeof r._verkehrLieferung !== "function") fehlt.push("_verkehrLieferung");
    if (typeof r._verkehrLadung !== "function") fehlt.push("_verkehrLadung");
    if (fehlt.length) return { leser: fehlt.join(", ") };
    const SL = [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && Array.isArray(S.liste) && S.verkehr);
    const wagen = SL.flatMap((S) => S.verkehr.wagen.filter((W) => W.lieferung && W.bestand));
    const staende = SL.flatMap((S) => S.liste.filter((b) => b && b.bestand && b.bestand.art === "stand"));
    const geliefert = () => SL.reduce((a, S) => a + ((S.verkehr.zahl && S.verkehr.zahl.ladung && S.verkehr.zahl.ladung.amStand) || 0), 0);
    // die Kisten im Bild des Wagens (die Gruppe `_verkehrLadung`: je angefangene Kiste ein sichtbares Kind; die Gruppe selbst folgt der Stufe)
    const kisten = (W) => (W.ladungBild ? W.ladungBild.children.filter((c) => c.visible).length : 0);
    const aus = { wagen: wagen.length, staende: staende.length, mitFahrer: wagen.filter((W) => Array.isArray(W.fahrer) && W.fahrer.length).length };
    if (arg.schritt === "ladung") {
        // die Ladung: die Stadt fährt (seit dem Tag), bis ein Wagen mit Fahrer an seinem Werk geladen hat
        const M = window.__k2Lieferung;
        delete window.__k2Lieferung;
        if (!M) throw new Error("kein Tag vorbereitet");
        const vor = new Map(M.vor);
        const gleich = wagen.filter((W) => vor.has(W));
        Object.assign(aus, M.aus, { wagenNachUmstellen: gleich.length });
        // auf dem Weg mit Fahrer: der Wagen fährt, sein Fahrer sitzt am Steuer; geladen trägt er ≥ 1 seiner Ware, leer keine
        const amWeg = (W) => W.zustand === "faehrt" && W.b && W.b.amSteuer;
        const last = (W) => KC.bestandAm(W.bestand, r._weltStunde(), W.bestand.ware);
        const geladen = () => gleich.filter((W) => amWeg(W) && last(W) >= 1);
        const leerAmWeg = () => gleich.filter((W) => amWeg(W) && last(W) < 1);
        // die Stadt fährt im echten Loop (die Werkbank hält ihn zwischen den Befehlen an — er läuft, solange die Probe wartet, und
        // steht danach wieder, wie er stand: lief er, zählten die Takte des Spiels in 300 ms weiter)
        const takte = () => (r._weltStand ? r._weltStand.takte : -1);
        const k0 = takte();
        await window.sleep(300);
        const lief = takte() !== k0;
        if (!lief) window.__loop(true);
        const z0 = SL.map((S) => ({ ...(S.verkehr.zahl && S.verkehr.zahl.ladung) }));
        const g1 = geliefert();
        const t0 = performance.now();
        try {
            // bis ein Wagen mit Fahrer geladen und einer leer auf dem Weg ist (das Bildpaar) und eine Lieferung am Stand ankam
            while (!(geladen().length && leerAmWeg().length && geliefert() > g1) && performance.now() - t0 < arg.ms) await window.sleep(250);
        } finally {
            if (!lief) window.__loop(false);
        }
        aus.wartenS = +((performance.now() - M.t) / 1000).toFixed(1);
        // der Beleg der Fahrt: lief der Loop, die Takte, die Ankünfte und die Ware an Werk und Stand in der Wartezeit, Werk und Stand
        // an EINER Wende (dort läge die Ware nie auf einem Weg), die Uhr
        const dz = (k) => SL.reduce((a, S, i) => a + (S.verkehr.zahl.ladung[k] - (z0[i][k] || 0)), 0);
        aus.fahrt = { loop: lief ? "lief" : "an", takte: takte() - k0, amWerk: dz("amWerk"), amStand: dz("amStand"), geladen: dz("geladen"), abgeladen: dz("abgeladen"), eineWende: gleich.filter((W) => W.lieferung.werkKi === W.lieferung.standKi).length, uhr: +Number(s.timeOfDay).toFixed(3) };
        const G = geladen();
        const L0 = leerAmWeg();
        aus.leer = L0.length;
        if (!G.length) return Object.assign(aus, { n: 0, beladen: 0 });
        // das Bildpaar: der geladene und der leere Wagen mit Fahrer, je der erste im Blick (seine Kisten gezeichnet), sonst der erste
        const imBlick = (A) => A.find((W) => W.ladungBild && W.ladungBild.visible) || A[0];
        const W1 = imBlick(G);
        aus.n = G.length;
        aus.ware = W1.bestand.ware;
        aus.last = +last(W1).toFixed(3);
        aus.kistenLeer = L0.length ? kisten(imBlick(L0)) : null;
        aus.kistenBeladen = kisten(W1);
        aus.gezeichnet = !!(W1.ladungBild && W1.ladungBild.visible);
        aus.beladen = aus.kistenLeer == null ? 0 : aus.kistenBeladen - aus.kistenLeer;
        return aus;
    }
    if (!wagen.length || !staende.length) return Object.assign(aus, { n: 0 });
    // der Gegenlauf: ein Tag ohne Lieferung
    const h0 = r._weltStunde();
    aus.uhrVor = +Number(s.timeOfDay).toFixed(3);
    aus.vollVor = staende.filter((b) => KC.bestandAm(b.bestand, h0, b.bestand.ware) >= 1).length;
    const g0 = geliefert();
    const K = r._kalender();
    // der Tag springt auf dem Weg des Spiels (`_weltUhrNimm`, die Uhr eines geladenen Stands, eines Mitspielers): ein Sprung der
    // Welt-Uhr — wer seinen Tag aus der Uhr liest, stellt sich neu (die Fahrer steigen aus, ihre nächste Fahrt ist f(Same, t))
    if (typeof r._weltUhrNimm !== "function") return Object.assign(aus, { leser: "_weltUhrNimm" });
    for (let i = 0; i < 4 && r._weltStunde() - h0 < 24; i++) r._weltUhrNimm(s.spielZeit + K.tagS * (24 - (r._weltStunde() - h0)) / 24 + 1e-3);
    await window.__seitenTakt();
    await window.__seitenTakt();
    const h1 = r._weltStunde();
    aus.tagH = +(h1 - h0).toFixed(3);
    aus.uhrNach = +Number(s.timeOfDay).toFixed(3);
    aus.geliefertImTag = geliefert() - g0;
    const leer = staende.filter((b) => KC.bestandAm(b.bestand, h1, b.bestand.ware) < 1e-9);
    aus.standLeer = aus.geliefertImTag === 0 && aus.tagH >= 24 ? +(leer.length / staende.length).toFixed(4) : 0;
    // das Bild der Stände folgt im Takt des Spiels (`_bestandBildTakt`, je Sekunde der Bild-Uhr) — die Probe ruft ihn jetzt
    for (const S of SL) if (typeof r._bestandBildTakt === "function") (S.bestandTakt = null), r._bestandBildTakt(S);
    aus.kistenAmStand = staende.filter((b) => b.bestandBild && b.bestandBild.visible).length;
    // der Stand jedes Wagens nach dem Tag (Kisten im Bild, Ladung): die Ladung misst „ladung“, nachdem die Stadt fuhr
    window.__k2Lieferung = { aus: { ...aus }, t: performance.now(), vor: wagen.map((W) => [W, { k: kisten(W), n: KC.bestandAm(W.bestand, h1, W.bestand.ware) }]) };
    return Object.assign(aus, { n: 1 });
};

// DER STROM DER WAREN ÜBER SIEBEN TAGE (stoffstrom S2): die Bestände, die die Welt trägt (das Inventar des Spielers — kein Bewohner,
// kein Stand, kein Haus trägt einen), vorher; dann sieben Tage gerafft (die Welt-Uhr `spielZeit` je einen Pegel-Tag, je zwei Takte
// des Spiels), nachher: je Ware, was hineinfloss und was hinausging
const STROM7 = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const bestand = () => {
        const o = {};
        for (const x of (s.player && s.player.inventory) || []) if (x && x.kind === "material") o[x.material] = (o[x.material] || 0) + (x.count || 0);
        return o;
    };
    // je Tag die Bestände: eine Ware ist im Strom, wenn sich ihr Bestand an einem Tag bewegt; hinein und hinaus summieren die Tage
    const h0 = typeof r._weltStunde === "function" ? r._weltStunde() : null;
    const tage = [bestand()];
    for (let d = 0; d < 7; d++) {
        s.spielZeit += r._kalender().tagS;
        await window.__seitenTakt();
        await window.__seitenTakt();
        tage.push(bestand());
    }
    const h1 = typeof r._weltStunde === "function" ? r._weltStunde() : null;
    let hinein = 0, hinaus = 0;
    const imStrom = new Set();
    for (let d = 1; d < tage.length; d++)
        for (const k of new Set([...Object.keys(tage[d - 1]), ...Object.keys(tage[d])])) {
            const x = (tage[d][k] || 0) - (tage[d - 1][k] || 0);
            if (!x) continue;
            imStrom.add(k);
            if (x > 0) hinein += x;
            else hinaus -= x;
        }
    return { arten: Object.keys(tage[7]).length, waren: imStrom.size, hinein, hinaus, tage: h0 != null && h1 != null ? +((h1 - h0) / 24).toFixed(3) : null };
};

module.exports = (F) => [
    // ───────── DER STOFFSTROM: Erz → Barren → Werkzeug, die Waren über die Zeit ─────────
    F.leiter("mensch.wirtschaft.stoffstrom", {
        sek: 45,
        mutiert: true,
        pfad: [...STADT_PFAD, "stamm/feld-leben.js", "stamm/dirigent-takt.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("STADT");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Stadt: " + zf);
                return Z;
            };
            const arten = () => Object.keys(z().inventar).length;
            H.zeile("Stadt: " + (Z ? Z.bewohner + " Bewohner, " + Z.haeuser + " Häuser, " + Z.schmieden + " Schmieden, Bestände des Spielers " + Object.keys(Z.inventar).length + " Arten" : "kein Zensus (" + zf + ")"));
            await K.schritt(1, async () => K.leser(1, { n: z().schmieden, fehlt: "keine Kette Erz → Barren → Werkzeug: die Esse wärmt den gehaltenen Stahl, sie schmilzt kein Erz und gibt keinen Barren — keine Halde, kein Barren am Ofen (" + z().schmieden + " Schmieden in der Stadt)", wo: "stamm/feld-leben.js:2499" }));
            await K.schritt(3, async () => K.nicht(3, { n: arten(), fehlt: "10² Waren mit Warenkorb je Geologie (20 Saaten): die Welt trägt " + arten() + " Warenarten, alle im Inventar des Spielers — kein Bewohner, kein Stand, kein Haus hat einen Bestand" }));
            await K.schritt(4, async () => {
                if (arten() < 1000) return K.nicht(4, { n: arten(), fehlt: "10³ Waren in der Werkstatt: " + arten() + " Warenarten in der Welt, " + z().schmieden + " Schmieden ohne Werkstück" });
                const w = z().schmiede;
                const b = await K.bild(4, { px: w.x + 6, py: "+1.7", pz: w.z + 6, lx: w.x, ly: "+1.2", lz: w.z });
                K.auge(4, { bild: b.datei, pose: "6 m diagonal vor der ersten Schmiede, Ego 1,7 m", mass: arten() + " Warenarten" });
            });
            await K.schritt(5, async () => K.nicht(5, { n: arten(), fehlt: "10⁴ Waren mit Kette bis zum Gestein (Gussteil, Chip): " + arten() + " Warenarten, keine Kette" }));
            await K.schritt(6, async () => K.nicht(6, { n: arten(), fehlt: "10⁷ Warenformen über 10 Epochen × 100 Saaten: " + arten() + " Warenarten einer Saat, Jahre der Pläne " + z().jahre.join("/") }));
            await K.schritt(7, async () => K.nicht(7, { n: arten(), fehlt: "10⁹ Waren über Sonnensysteme, ≥ 10³ im Blick: " + arten() + " Warenarten" }));
            // S2 zuletzt: die sieben gerafften Tage (die Sitzung stellt danach den Grund)
            await K.schritt(2, async () => {
                const w = await ruf("STROM7");
                H.zeile("sieben Tage (" + w.tage + " gemessen): " + w.waren + " Waren bewegt, hinein " + w.hinein + ", hinaus " + w.hinaus);
                if (w.waren < 10) return K.nicht(2, { n: w.waren, fehlt: "10 Waren im Strom: über " + w.tage + " geraffte Tage änderte sich der Bestand von " + w.waren + " Waren (" + w.arten + " Arten, alle beim Spieler; kein Bewohner, Stand oder Haus hält einen Bestand)" });
                K.zahl(2, { n: w.waren, werte: { bilanz: (w.hinein - w.hinaus) / Math.max(1, w.hinein + w.hinaus) }, beleg: w.tage + " Tage, hinein " + w.hinein + ", hinaus " + w.hinaus, taeter: null });
            });
        },
        seite: { STADT, STROM7 },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Kette Erz → Barren → Werkzeug" }, masse: [{ key: "halde", wort: "Halde kleiner im Zeitraffer (ja = 1)", soll: 1, richtung: "≥" }, { key: "barren", wort: "Barren am Ofen", soll: 1, richtung: "≥" }, { key: "werkzeug", wort: "Werkzeug in der Hand", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "keine Schmelze, kein Barren", wo: "stamm/feld-leben.js:2499" },
            2: { umfang: { soll: 10, wort: "Waren im Strom über 7 Tage" }, masse: [{ key: "bilanz", wort: "hinein − hinaus über 7 Tage (relativ)", soll: 0, tol: 0.1 }], erwartet: "nicht", fehlt: "keine Ware fließt" },
            3: { umfang: { soll: 100, wort: "Waren" }, masse: [{ key: "geologie", wort: "Warenkorb passt zur Geologie (20 Saaten)", soll: 0.9, richtung: "≥" }, { key: "H", wort: "Kettentiefe H", soll: 10, richtung: "≥" }], erwartet: "nicht", fehlt: "10² Waren" },
            4: { auge: { pose: "6 m diagonal vor der ersten Schmiede, Ego 1,7 m", vorbild: "Foto einer realen Werkstatt (Schmiede mit Werkstücken, Halde und Ofen): „echt“ ≥ 70 % im Blindpaar; Kettentiefe H ≥ 10²" }, erwartet: "nicht", fehlt: "10³ Waren" },
            5: { umfang: { soll: 1e4, wort: "Waren mit Kette bis Gestein" }, masse: [{ key: "kette", wort: "Kette bis Gestein an 50 Waren", soll: 1, richtung: "≥" }, { key: "H", wort: "Kettentiefe H", soll: 1000, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁴ Waren" },
            6: { auge: { pose: "Ego 1,7 m am Markt je Saat und Epoche", vorbild: "Warenkörbe realer Epochen (Inventare, Museumsbestände) an 100 Saaten × 10 Epochen: plausibel ≥ 95 %" }, erwartet: "nicht", fehlt: "10⁷ Warenformen" },
            7: { umfang: { soll: 1e9, wort: "Waren über Sonnensysteme" }, masse: [{ key: "imBlick", wort: "Waren im Blick, je Kette abrufbar", soll: 1000, richtung: "≥" }, { key: "H", wort: "Kettentiefe H", soll: 1e5, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁹ Waren" },
        },
        proben: {
            2: [{ name: "ATTRAPPE: zehn Waren fließen hinein, ein Drittel geht nie hinaus (der Bestand wächst aus dem Nichts)", j: { leiter: "mensch.wirtschaft.stoffstrom", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 10, werte: { bilanz: 0.3 } } } }, gruen: false, zahl: /ROT an hinein − hinaus über 7 Tage \(relativ\) 0\.3 / }],
        },
    }),

    // ───────── DER BERUF: Bewohner an ihrem Werk (derselbe Leser wie mensch.K2#2, über jede Rolle) ─────────
    F.leiter("mensch.wirtschaft.beruf", {
        sek: 60,
        mutiert: true,
        pfad: [...STADT_PFAD, "stamm/bild-himmel.js", "stamm/kreatur-verhalten.js", "scripts/lib/kreatur-mensch.cjs"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let B = null, bf = "";
            try {
                B = await ruf("BERUF");
                H.zeile("Werk: " + B.mitWerk + " Bewohner mit Werk in " + B.rollen + " Rollen; 10 Uhr " + B.am10 + " am Werk (Soll " + B.soll10 + "), 2 Uhr " + B.am2 + "; Rollen am Werk " + B.rollenAm + ", davon um 2 leer " + B.rollenTag + "; Haltungen " + B.haltungen.join("/") + " (Takte " + B.takte.join("/") + ")");
            } catch (e) {
                bf = String((e && e.message) || e).slice(0, 200);
            }
            const b = () => {
                if (!B) throw new Error("keine Messung am Werk: " + bf);
                return B;
            };
            const passt = () => (b().soll10 > 0 ? +(b().am10 / b().soll10).toFixed(3) : 0);
            const je = () => Object.entries(b().je).map(([k, v]) => k + " " + v.join("/")).join(", ");
            await K.schritt(3, async () => K.nicht(3, { n: b().rollenTag, fehlt: "10² Berufe mit Lehrling, Meister und Kette: " + b().rollenTag + " Rollen um 10 am Werk und um 2 fort (je Rolle Soll/10 Uhr/2 Uhr: " + je() + ") — kein Werkstück, das sich nach 2 h ändert, keine Ware am nächsten Glied" }));
            await K.schritt(4, async () => K.nicht(4, { n: b().rollenTag, fehlt: "10³ Berufe als Bündel von Umwandlungen: " + b().rollenTag + " Rollen; am Werk passen um 10 Uhr " + b().am10 + " von " + b().soll10 + " (" + passt() + ") — keine Umwandlung, keine Epoche je Beruf" }));
            await K.schritt(5, async () => K.nicht(5, { n: b().rollenTag, fehlt: "10⁴ Berufe über Epochen: " + b().rollenTag + " Rollen einer Liste des Codes (fachwerk/koerper TAGES_GESETZ), keine jenseits der Liste" }));
            await K.schritt(6, async () => K.nicht(6, { n: b().am10, fehlt: "10⁷ Arbeitende in einer Stadt, ≥ 10⁵ sichtbar: um 10 Uhr " + b().am10 + " am Werk (" + b().mitWerk + " mit Werk)" }));
            await K.schritt(7, async () => K.nicht(7, { n: b().am10, fehlt: "10⁸ Arbeitende je Stadt, ≥ 10⁶ sichtbar: " + b().am10 + " am Werk" }));
            // S2 zuletzt (S1 urteilt mensch.K2#2): der Spieler steht 9 m vor der Rolle mit den meisten am Werk, 10 Uhr
            await K.schritt(2, async () => {
                const n = b().haltungen.filter((h) => h !== "keine").length;
                if (n < 10) return K.nicht(2, { n, fehlt: "10 Berufe mit Handlung: am Werk tragen " + b().am10 + " Bewohner aus " + b().rollenAm + " Rollen " + n + " Handlung(en) (" + b().haltungen.join("/") + ") — die Haltung folgt dem Akt des Tags, nicht dem Beruf (koerper tagesHaltung)" });
                const p = b().pose;
                const bild = await K.bild(2, { px: p.px, py: p.py, pz: p.pz, lx: p.lx, ly: p.ly, lz: p.lz });
                K.auge(2, { bild: bild.datei, pose: "9 m südlich der Mitte der Rolle " + p.rolle + " am Werk um 10 Uhr, Ego 1,7 m", mass: n + " Handlungen am Werk" });
            });
        },
        seite: { BERUF },
        bestehend: { 1: "mensch.K2#2" },
        sprossen: {
            2: { auge: { pose: "9 m südlich der Mitte der Rolle mit den meisten am Werk, 10 Uhr, Ego 1,7 m", vorbild: "Fotos realer Berufe bei der Arbeit (Schmied, Bäcker, Händler, Weber …): Beruf aus 1 Bild benannt ≥ 80 % an 10 Berufen" }, erwartet: "nicht", fehlt: "10 Berufe mit eigener Handlung" },
            3: { umfang: { soll: 100, wort: "Berufe mit Lehrling, Meister, Kette" }, masse: [{ key: "veraendert", wort: "Werkstück nach 2 h verändert", soll: 0.9, richtung: "≥" }, { key: "glied", wort: "Ware am nächsten Glied", soll: 0.9, richtung: "≥" }], erwartet: "nicht", fehlt: "10² Berufe mit Kette" },
            4: { umfang: { soll: 1000, wort: "Berufe als Bündel von Umwandlungen" }, masse: [{ key: "passt", wort: "Stichproben passen zu Werk, Uhr, Epoche (1000)", soll: 0.95, richtung: "≥" }], erwartet: "nicht", fehlt: "10³ Berufe" },
            5: { umfang: { soll: 1e4, wort: "Berufe über Epochen" }, masse: [{ key: "anachron", wort: "Anachronismen", soll: 0.01, richtung: "≤" }, { key: "ohneListe", wort: "Berufe in keiner Liste des Codes", soll: 0.2, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁴ Berufe" },
            6: { umfang: { soll: 1e7, wort: "Arbeitende in einer Stadt" }, masse: [{ key: "sichtbar", wort: "Arbeitende sichtbar", soll: 1e5, richtung: "≥" }, { key: "rueckkehr", wort: "Rückkehr nach 1 h", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁷ Arbeitende" },
            7: { umfang: { soll: 1e8, wort: "Arbeitende je Stadt" }, masse: [{ key: "sichtbar", wort: "Arbeitende sichtbar", soll: 1e6, richtung: "≥" }, { key: "passtOrt", wort: "Berufe passen zum Ort", soll: 0.95, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁸ Arbeitende" },
        },
        proben: {
            6: [{ name: "ATTRAPPE: die Arbeitenden stehen sichtbar, nach 1 h kehrt nur ein Teil zurück", j: { leiter: "mensch.wirtschaft.beruf", adapter: PROBE, sprossen: { 6: { art: "zahl", n: 1e7, werte: { sichtbar: 2e5, rueckkehr: 0.7 } } } }, gruen: false, zahl: /ROT an Rückkehr nach 1 h 0\.7 / }],
        },
    }),

    // ───────── DER MARKT: Tausch, Preis, Münze ─────────
    // DER MESSORT IM UMFANG (k2-mensch.js K.messort, 23.11.): S1 „Tausch Spieler ↔ Bewohner“ (Klasse Ort, Preis „P · Markt“) braucht EINEN
    // Stand mit seinem Händler — der Markt der Stadt (91 Häuser im Plan, die Reihen der Stände fachwerk-core.js `marktstand`), nie die volle
    // Stadt (1 365 Bewohner, 5 Stände: der Preis maß 538,3 MB gehalten am 13-fachen Umfang)
    F.leiter("mensch.wirtschaft.markt", {
        sek: 60,
        mutiert: true,
        pfad: [...STADT_PFAD, "stamm/bau-vorlagen.js"],
        messe: async (H, K) => {
            if (!(await K.welt("return await (" + H.seite.AM_ORT + ")(r, T, {});", 10000))) await K.messort("stadt");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("STADT");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Stadt: " + zf);
                return Z;
            };
            H.zeile("Markt: " + (Z ? Z.maerkte + " Markt/Märkte, " + Z.staende + " Stände, " + Z.haendler + " Händler unter " + Z.bewohner + " Bewohnern" : "kein Zensus (" + zf + ")"));
            await K.schritt(2, async () => K.leser(2, { n: z().staende, fehlt: "kein Preis: der Stand ist Gestalt (Plane und Waren als Teile), er trägt weder Preis noch Bestand — keine Missernte hebt das Brot (" + z().staende + " Stände)", wo: "stamm/bau-vorlagen.js:1128" }));
            await K.schritt(3, async () => K.nicht(3, { n: z().maerkte, fehlt: "10 Märkte mit Münze: " + z().maerkte + " Markt in " + z().siedlungen + " Siedlung(en), keine Münze, kein Wegkosten-Preis" }));
            await K.schritt(4, async () => K.nicht(4, { n: z().maerkte, fehlt: "10³ Märkte mit Kredit und Bank: " + z().maerkte + " Markt, keine Bank" }));
            await K.schritt(5, async () => {
                if (z().maerkte < 1e5) return K.nicht(5, { n: z().maerkte, fehlt: "10⁵ Märkte mit Börse und Krise im Straßenbild: " + z().maerkte + " Markt" });
                const b = await K.bild(5, { px: z().nah.ox, py: "+1.7", pz: z().nah.oz + 20, lx: z().nah.ox, ly: "+1.5", lz: z().nah.oz });
                K.auge(5, { bild: b.datei, pose: "20 m südlich der Mitte der Stadt, Ego 1,7 m", mass: z().maerkte + " Märkte" });
            });
            await K.schritt(6, async () => K.nicht(6, { n: z().maerkte, fehlt: "10⁷ Märkte über Sonnensysteme: " + z().maerkte + " Markt einer Welt" }));
            // S1 zuletzt: der Tausch an der Taste E (die echte Eingabe der Sitzung), gemessen am Bestand des Stands
            await K.schritt(1, async () => {
                const v = await ruf("TAUSCH", { schritt: "vor" });
                if (v.leser) return K.leser(1, { n: z().haendler, fehlt: "kein Tausch: der Bewohner trägt keinen Bestand (es fehlt im Spiel: " + v.leser + ") — " + z().haendler + " Händler, nichts sinkt, nichts füllt sich aus Herstellung", wo: "stamm/siedlung-bewohner.js:887" });
                if (!v.n) return K.zahl(1, { n: 0, werte: {}, beleg: v.staende + " Stände", taeter: v.staende ? "kein Händler an seinem Stand (jetzt, 10 und 14 Uhr)" : "kein Stand mit Bestand in der Stadt" });
                if (!H.page) await H.verbinde();
                await H.page.keyboard.press("KeyE");
                await H.schlaf(300);
                const w = await ruf("TAUSCH", { schritt: "nach" });
                const getauscht = w.invWare[1] - w.invWare[0] === 1 && w.invGabe[0] - w.invGabe[1] === 1;
                H.zeile("Tausch: 1 " + w.gabe + " gegen 1 " + w.ware + " — Stand " + v.vorher + " → Änderung " + w.sinkt + ", Inventar " + w.ware + " " + w.invWare.join("→") + ", " + w.gabe + " " + w.invGabe.join("→") + ", größte Füllung ohne Herstellung in 24 h " + w.ohneHerstellung);
                K.zahl(1, {
                    n: getauscht ? 1 : 0,
                    werte: { sinkt: w.sinkt, ohneHerstellung: w.ohneHerstellung },
                    beleg: w.ware + " am Stand " + v.vorher + ", Inventar " + w.ware + " " + w.invWare.join("→") + ", " + w.gabe + " " + w.invGabe.join("→") + " (am Stand " + w.gabeAmStand + "), " + w.staende + " Stände",
                    taeter: getauscht ? null : "die Taste E tauschte nicht (Inventar " + w.ware + " " + w.invWare.join("→") + ", " + w.gabe + " " + w.invGabe.join("→") + ")",
                });
            });
        },
        seite: { STADT, TAUSCH, AM_ORT },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Tausch Spieler ↔ Bewohner" }, masse: [{ key: "sinkt", wort: "Änderung des Bestands des Bewohners beim Tausch", soll: 0, richtung: "<" }, { key: "ohneHerstellung", wort: "Gegenlauf: Füllung ohne Herstellung", soll: 0, richtung: "≤" }], erwartet: "leser", fehlt: "kein Bestand der Bewohner", wo: "stamm/siedlung-bewohner.js:887" },
            2: { umfang: { soll: 10, wort: "Waren an einem Markt" }, masse: [{ key: "brotPlus", wort: "Brotpreis 3 Tage nach Missernte (relativ)", soll: 0.3, richtung: "≥" }, { key: "nachErnte", wort: "Änderung des Brotpreises nach der Ernte", soll: 0, richtung: "<" }], erwartet: "leser", fehlt: "kein Preis am Stand", wo: "stamm/bau-vorlagen.js:1128" },
            3: { umfang: { soll: 10, wort: "Märkte mit Münze" }, masse: [{ key: "r", wort: "Preis ↔ Wegkosten (r)", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "10 Märkte" },
            4: { umfang: { soll: 1000, wort: "Märkte mit Kredit und Bank" }, masse: [{ key: "spanneTage", wort: "Tage, bis die Spanne sich halbiert", soll: 30, richtung: "≤" }], erwartet: "nicht", fehlt: "10³ Märkte" },
            5: { auge: { pose: "20 m südlich der Mitte der Stadt, Ego 1,7 m", vorbild: "Fotos realer Krisen im Straßenbild (Schlangen, geschlossene Läden; 1929, 2008) an 20 Saaten: erkannt ≥ 80 %, Renditen mit fetten Rändern ≥ 80 %" }, erwartet: "nicht", fehlt: "10⁵ Märkte mit Börse" },
            6: { umfang: { soll: 1e7, wort: "Märkte über Sonnensysteme" }, masse: [{ key: "transport", wort: "Abweichung Preisunterschied ↔ Transport", soll: 0.2, richtung: "≤" }], erwartet: "nicht", fehlt: "10⁷ Märkte" },
        },
        proben: {
            1: [
                { name: "die Radeon am Zweig front-wirtschaft: 1 Stein gegen 1 Kraut, der Stand 24 → 23, kein Stand füllt sich ohne Herstellung", j: { leiter: "mensch.wirtschaft.markt", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { sinkt: -1, ohneHerstellung: 0 } } } }, gruen: true },
                { name: "TÄTER: der Tausch ohne Abzug (der Händler gibt und behält)", j: { leiter: "mensch.wirtschaft.markt", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { sinkt: 0, ohneHerstellung: 0 } } } }, gruen: false, zahl: /ROT an Änderung des Bestands des Bewohners beim Tausch 0 / },
                { name: "TÄTER: der Tausch erzeugt Ware (der Stand wächst beim Tausch)", j: { leiter: "mensch.wirtschaft.markt", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { sinkt: 1, ohneHerstellung: 0 } } } }, gruen: false, zahl: /ROT an Änderung des Bestands des Bewohners beim Tausch 1 / },
                { name: "TÄTER: der Stand füllt sich ohne Herstellung (+6 in 24 h)", j: { leiter: "mensch.wirtschaft.markt", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { sinkt: -1, ohneHerstellung: 6 } } } }, gruen: false, zahl: /ROT an Gegenlauf: Füllung ohne Herstellung 6 / },
                { name: "TÄTER: die Taste E tauscht nicht (Umfang 0)", j: { leiter: "mensch.wirtschaft.markt", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 0, werte: { sinkt: 0, ohneHerstellung: 0 }, taeter: "die Taste E tauschte nicht" } } }, gruen: false, zahl: /ROT an Umfang 0 .*Täter: die Taste E tauschte nicht/ },
                { name: "main 1e204f83: der Bewohner trägt keinen Bestand", j: { leiter: "mensch.wirtschaft.markt", adapter: PROBE, sprossen: { 1: { art: "leser", fehlt: "kein Tausch: der Bewohner trägt keinen Bestand (es fehlt im Spiel: koerper-core bestandAm, _bestandTausch, _bestandAnlegen)", wo: "stamm/siedlung-bewohner.js:887", n: 5 } } }, gruen: false, zahl: /fehlender Leser: kein Tausch: .*_bestandTausch/ },
            ],
            3: [{ name: "ATTRAPPE: zehn Märkte mit Münze, der Preis folgt keinem Weg (r 0,1)", j: { leiter: "mensch.wirtschaft.markt", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 10, werte: { r: 0.1 } } } }, gruen: false, zahl: /ROT an Preis ↔ Wegkosten \(r\) 0\.1 / }],
        },
    }),

    // ───────── DER HANDEL: Ware auf dem Weg ─────────
    F.leiter("mensch.wirtschaft.handel", {
        sek: 60,
        mutiert: true,
        pfad: [...STADT_PFAD],
        messe: async (H, K) => {
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            // DER TAG VOR DEM UMSTELLEN (S1): die Sitzung stellte die Probe schon an ihren Messort (punkte.cjs probeOrt) — der Tag ohne
            // Lieferung springt hier, und die Stadt fährt, während die Probe selbst umstellt (an der Radeon ~40 s): die Werke sind voll,
            // die Wagen laden. Steht die Welt noch nicht am Ort, springt der Tag nach dem Umstellen
            let tag = null;
            try {
                tag = await ruf("LIEFERUNG", { schritt: "tag" });
            } catch (e) {
                tag = null;
            }
            if (!(await K.welt("return await (" + H.seite.AM_ORT + ")(r, T, {});", 10000))) await K.messort("stadt-voll");
            let Z = null, zf = "";
            try {
                Z = await ruf("STADT");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Stadt: " + zf);
                return Z;
            };
            const hafen = () => Object.entries(z().slotRollen).filter(([k]) => /hafen|kai|werft|pier/i.test(k)).reduce((a, [, v]) => a + v, 0);
            H.zeile("Verkehr: " + (Z ? Z.wagen + " Wagen, " + Z.fahrer + " mit Fahrer, " + Z.fahrten + " gezählte Fahrten, aus dem Plan " + Z.fernWagen : "kein Zensus (" + zf + ")"));
            await K.schritt(2, async () => K.nicht(2, { n: z().fernWagen, fehlt: "10 Routen zwischen Orten: " + z().fernWagen + " der " + z().wagen + " Wagen außerhalb ihres Plans — die Wagen fahren zwischen den Wenden EINER Stadt (" + z().siedlungen + " Siedlung(en))" }));
            await K.schritt(3, async () => K.nicht(3, { n: hafen(), fehlt: "10² Routen mit Hafen: " + hafen() + " Häfen im Plan, kein Schiff" }));
            await K.schritt(4, async () => K.nicht(4, { n: z().siedlungen, fehlt: "10³ Knoten mit Pässen und Zöllen: " + z().siedlungen + " Siedlung(en) am Messort" }));
            await K.schritt(5, async () => K.nicht(5, { n: z().fernWagen, fehlt: "10⁵ Routen mit Containern, ≥ 10⁴ Frachtbewegungen: " + z().fahrten + " gezählte Fahrten ohne Fracht, " + z().fernWagen + " Routen aus der Stadt" }));
            await K.schritt(6, async () => K.nicht(6, { n: hafen(), fehlt: "Welthandel auf Seewegen: " + hafen() + " Häfen, keine Seewege" }));
            await K.schritt(7, async () => K.nicht(7, { n: 0, fehlt: "Handel über Sonnensysteme (Startfenster, Hohmann): kein Raumflug" }));
            // S1 zuletzt: der Tag ohne Lieferung (vor dem Umstellen gesprungen), dann die Stadt im echten Loop bis zur ersten Ladung am Werk
            await K.schritt(1, async () => {
                if (!tag || (!tag.leser && !tag.n)) tag = await ruf("LIEFERUNG", { schritt: "tag" });
                const l = tag.leser || !tag.n ? tag : await ruf("LIEFERUNG", { schritt: "ladung", ms: Math.max(3000, Math.floor((H.rest() - 6) * 1000)) });
                if (l.leser) return K.leser(1, { n: z().fahrer, fehlt: "keine Ladung: der Wagen fährt mit Fahrer (" + z().fahrer + " von " + z().wagen + ", " + z().fahrten + " Fahrten), sein Satz trägt keine Ware (es fehlt im Spiel: " + l.leser + "), kein Stand wartet auf eine Lieferung", wo: "stamm/siedlung-verkehr.js:384" });
                const beleg = l.wagen + " Wagen mit Lieferung (" + l.mitFahrer + " mit Fahrer), " + l.staende + " Stände, voll vor dem Tag " + l.vollVor + ", Tag " + l.tagH + " h, geliefert im Tag " + l.geliefertImTag + ", Kisten am Stand danach " + l.kistenAmStand +
                    (l.wartenS != null ? ", gewartet " + l.wartenS + " s" : "") + (l.ware ? ", " + l.n + " fahren geladen, " + l.leer + " leer, " + l.last + " " + l.ware + " im ersten, Kisten leer " + l.kistenLeer + " ↔ beladen " + l.kistenBeladen + (l.gezeichnet ? " (gezeichnet)" : " (nicht im Blick)") : "") +
                    (l.fahrt ? ", in der Fahrt am Werk " + l.fahrt.amWerk + " (+" + l.fahrt.geladen + "), am Stand " + l.fahrt.amStand + " (−" + l.fahrt.abgeladen + ")" : "");
                H.zeile("Lieferung: " + beleg + " · Uhr " + l.uhrVor + " → " + l.uhrNach + " · Fahrt " + JSON.stringify(l.fahrt || null));
                K.zahl(1, {
                    n: l.n || 0,
                    werte: { beladen: l.beladen, standLeer: l.standLeer },
                    beleg,
                    taeter: !l.wagen ? "kein Wagen mit Lieferung" : l.n ? null : (l.fahrt && l.fahrt.eineWende ? "Werk und Stand an EINER Wende bei " + l.fahrt.eineWende + " von " + l.wagen + " Wagen (geladen " + l.fahrt.geladen + ", im selben Halt abgeladen) — " : "") + "kein Wagen mit Fahrer lud binnen " + l.wartenS + " s an seinem Werk",
                });
            });
        },
        seite: { STADT, LIEFERUNG, AM_ORT },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Ware auf einem Weg mit Fahrer" }, masse: [{ key: "beladen", wort: "Wagen beladen ↔ leer im Bildpaar", soll: 1, richtung: "≥" }, { key: "standLeer", wort: "Gegenlauf: Stand leer binnen Tagesfrist ohne Lieferung", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "der Wagen trägt keine Ware", wo: "stamm/siedlung-verkehr.js:384" },
            2: { umfang: { soll: 10, wort: "Routen zwischen Orten" }, masse: [{ key: "teurer", wort: "Route teurer als die billigste (ORBIS)", soll: 0.1, richtung: "≤" }], erwartet: "nicht", fehlt: "keine Route zwischen Orten" },
            3: { umfang: { soll: 100, wort: "Routen mit Hafen" }, masse: [{ key: "hafenLage", wort: "Hafenlage plausibel", soll: 1, richtung: "≥" }, { key: "beladen", wort: "Schiffe beladen", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Hafen" },
            4: { umfang: { soll: 1000, wort: "Knoten mit Pässen und Zöllen" }, masse: [{ key: "r", wort: "Dichte ↔ Gravitationsmodell (r)", soll: 0.7, richtung: "≥" }, { key: "sperre", wort: "Hafen-Sperre leert ferne Regale in Reihenfolge", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10³ Knoten" },
            5: { umfang: { soll: 1e5, wort: "Routen mit Containern" }, masse: [{ key: "fracht", wort: "Frachtbewegungen", soll: 1e4, richtung: "≥" }, { key: "reserve", wort: "Verhalten nach Reserven bei 3 Tagen Sperre", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁵ Routen" },
            6: { umfang: { soll: 1, wort: "Welthandel eines Planeten" }, masse: [{ key: "seeweg", wort: "Abweichung Seeweg ↔ kürzeste Passage", soll: 0.1, richtung: "≤" }], erwartet: "nicht", fehlt: "kein Welthandel" },
            7: { umfang: { soll: 1, wort: "Handel über Sonnensysteme" }, masse: [{ key: "hohmann", wort: "Abweichung Start ↔ Hohmann-Fenster", soll: 0.05, richtung: "≤" }], erwartet: "nicht", fehlt: "kein Raumflug" },
        },
        proben: {
            1: [
                { name: "die Radeon am Zweig front-wirtschaft a7541a05: 9 von 21 fahren geladen, Kisten leer 0 ↔ beladen 3, 5 von 5 Ständen leer nach einem Tag ohne Lieferung", j: { leiter: "mensch.wirtschaft.handel", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 9, werte: { beladen: 3, standLeer: 1 } } } }, gruen: true },
                { name: "TÄTER: der Wagen fährt ohne Ladung (Kisten 0 → 0)", j: { leiter: "mensch.wirtschaft.handel", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { beladen: 0, standLeer: 1 } } } }, gruen: false, zahl: /ROT an Wagen beladen ↔ leer im Bildpaar 0 / },
                { name: "TÄTER: der Stand füllt sich ohne Lieferung (1 von 5 leer)", j: { leiter: "mensch.wirtschaft.handel", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { beladen: 2, standLeer: 0.2 } } } }, gruen: false, zahl: /ROT an Gegenlauf: Stand leer binnen Tagesfrist ohne Lieferung 0.2 / },
                { name: "TÄTER: kein Wagen mit Fahrer lädt (Umfang 0)", j: { leiter: "mensch.wirtschaft.handel", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 0, werte: { beladen: 0, standLeer: 1 }, taeter: "kein Wagen mit Fahrer lud binnen 20 s an seinem Werk" } } }, gruen: false, zahl: /ROT an Umfang 0 .*Täter: kein Wagen mit Fahrer lud/ },
                { name: "TÄTER: Werk und Stand an einer Wende (front-wirtschaft d157e52f, Radeon: 14 von 21, geladen 5, 0 gefahren)", j: { leiter: "mensch.wirtschaft.handel", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 0, werte: { beladen: 0, standLeer: 1 }, taeter: "Werk und Stand an EINER Wende bei 14 von 21 Wagen (geladen 5, im selben Halt abgeladen) — kein Wagen mit Fahrer lud binnen 48.3 s an seinem Werk" } } }, gruen: false, zahl: /ROT an Umfang 0 .*Täter: Werk und Stand an EINER Wende bei 14 von 21/ },
                { name: "main 1e204f83: der Wagen trägt keine Ware", j: { leiter: "mensch.wirtschaft.handel", adapter: PROBE, sprossen: { 1: { art: "leser", fehlt: "keine Ladung: der Wagen fährt mit Fahrer (21 von 21), sein Satz trägt keine Ware (es fehlt im Spiel: koerper-core bestandAnkunft, _verkehrLieferung, _verkehrLadung)", wo: "stamm/siedlung-verkehr.js:384", n: 21 } } }, gruen: false, zahl: /fehlender Leser: keine Ladung: .*_verkehrLieferung/ },
            ],
            2: [{ name: "ATTRAPPE: zehn Routen, die eine geht den Umweg (35 % teurer)", j: { leiter: "mensch.wirtschaft.handel", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 10, werte: { teurer: 0.35 } } } }, gruen: false, zahl: /ROT an Route teurer als die billigste \(ORBIS\) 0\.35 / }],
        },
    }),

    // ───────── DIE TECHNIK: Voraussetzung, Pfad, Epoche ─────────
    // DER DECKEL IST OFFEN (22.11.): in der warmen Welt der Runde ungemessen — die einzige Zahl ist die kalte eigene Welt der Radeon
    // (Ankunft am Messort stadt-voll 101,1 s, die Station danach 0,1 s: der Zensus der Stadt und technikImBild über 20 Saaten). Darum
    // trägt sie kein eigenes `sek`: es gilt die Vorgabe des Kapitels (SEK_VORGABE 45 s in k2-mensch.js), bis die Eich-Tafel aus ihren Grün-Läufen schreibt
    // DER MESSORT IM UMFANG (k2-mensch.js K.messort, 23.11.): S1 „10 Techniken mit Voraussetzung“ (Klasse Ort) — 20 Saaten im Gesetz und der
    // Plan EINER Stadt im Bild: die Stadt (91 Häuser im Plan), deren Bauten die Techniken zeigen (das Dorf, 13 Fachwerk-Häuser, zeigt kaum
    // eine); die volle Stadt maß den Preis am 13-fachen Umfang (600,3 MB gehalten)
    F.leiter("mensch.wirtschaft.technik", {
        pfad: [...STADT_PFAD, "schmiede-core.js"],
        messe: async (H, K) => {
            await K.messort("stadt");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("STADT");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Stadt: " + zf);
                return Z;
            };
            const epochen = () => new Set(z().jahre.map((j) => Math.round(j / 50))).size;
            const dinge = () => Object.keys(z().slotRollen).length;
            const jahre = () => z().jahre.join("/") || "keins";
            H.zeile("Technik: " + (Z ? "Jahre der Pläne " + jahre() + ", " + dinge() + " Bauformen" : "kein Zensus (" + zf + ")"));
            await K.schritt(2, async () => K.nicht(2, { n: 0, fehlt: "10² Techniken in ≥ 5 Pfaden (50 Saaten): die Welt trägt keine Technik, nur das Jahr des Plans (" + jahre() + ")" }));
            await K.schritt(3, async () => K.nicht(3, { n: dinge(), fehlt: "10³ Techniken als sichtbare Dinge: " + dinge() + " Bauformen der Häuser, keine hängt an einem Pfad" }));
            await K.schritt(4, async () => K.nicht(4, { n: 0, fehlt: "10⁴ Techniken bis Dampf, Elektrik, Chemie mit Ausbreitung: keine Technik, keine Front" }));
            await K.schritt(5, async () => K.nicht(5, { n: 0, fehlt: "Halbleiter in ≥ 10 Pfaden mit lückenloser Kette: keine Kette" }));
            await K.schritt(6, async () => {
                if (epochen() < 10) return K.nicht(6, { n: epochen(), fehlt: "10 Epochen eines Orts: der Ort trägt " + epochen() + " Epoche(n) (Jahre " + jahre() + ")" });
                const b = await K.bild(6, { px: z().nah.ox, py: "+1.7", pz: z().nah.oz + 20, lx: z().nah.ox, ly: "+1.5", lz: z().nah.oz });
                K.auge(6, { bild: b.datei, pose: "20 m südlich der Mitte der Stadt, Ego 1,7 m", mass: epochen() + " Epochen" });
            });
            await K.schritt(7, async () => K.nicht(7, { n: 0, fehlt: "fremde Chemie in ≥ 10 Pfaden jenseits unserer: keine Technik, keine fremde Stoffwelt" }));
            // S1: der Stand der Technik über den FÄCHER (stationen/faecher.js): 20 Saaten und die Stadt am Messort als Adressen, je Adresse
            // ein Ruf des Gesetzes des Kerns (TECHNIK_AN) in der EINEN warmen Welt; die Akte nennt Gesetz, Leser und die schlechteste Adresse
            await K.schritt(1, async () => {
                const f = H.seite.TECHNIK_FAECHER({ ox: z().nah.ox, oz: z().nah.oz }, 60);
                f.gesetz.fn = H.seite.TECHNIK_AN;
                f.ms = ms() - 3000;
                const R = await H.seite.FAECHER(K.welt, f);
                const t = R.werte;
                H.zeile("Technik S1: " + R.akte.slice(0, 400));
                if (R.fehlt) return K.leser(1, R.fehltAn[0].saat != null ? { fehlt: R.fehlt, wo: "fachwerk-core.js technikImBild" } : { fehlt: "die Stadt am Messort: " + R.fehlt, wo: "fachwerk-core.js DORF technik" });
                const ohne = Object.keys(t.ohne).map((k) => k + " " + t.ohne[k]).join(", ");
                return K.zahl(1, {
                    n: t.mitVor,
                    werte: { ohneVor: t.ohneVor, staende: t.staende },
                    beleg: t.saaten + " Saaten + die Stadt am Messort (" + (t.welt.epoche || "ohne Epoche") + ", ohne " + t.welt.ohneTechnik.join("/") + "); im Bild " + JSON.stringify(t.imBild) + " · " + R.akte,
                    ...(t.ohneVor || t.staende < 2 ? { taeter: (ohne ? "Technik ohne Vorgänger im Bild: " + ohne : "") + (t.staende < 2 ? " jede Saat derselbe Stand" : "") } : {}),
                });
            });
        },
        seite: { STADT, TECHNIK_AN, FAECHER, TECHNIK_FAECHER: technikFaecher },
        sprossen: {
            1: {
                umfang: { soll: 10, wort: "Techniken mit Voraussetzung" },
                masse: [
                    { key: "ohneVor", wort: "Techniken ohne Voraussetzung im Bild (20 Saaten)", soll: 0, richtung: "≤" },
                    { key: "staende", wort: "verschiedene Stände (20 Saaten)", soll: 2, richtung: "≥", herkunft: "„Technik wächst aus Voraussetzungen“: hängt der Stand an Stoff und Ort, tragen 20 Saaten nicht alle denselben — ein Stand für jede Saat ist eine Liste" },
                ],
                erwartet: "zahl",
            },
            2: { umfang: { soll: 100, wort: "Techniken in ≥ 5 Pfaden" }, masse: [{ key: "pfade", wort: "plausible Pfadfolgen (50 Saaten)", soll: 5, richtung: "≥" }, { key: "streuung", wort: "Streuung der Erfindungsjahre", soll: 0.1, richtung: "≥" }], erwartet: "nicht", fehlt: "10² Techniken" },
            3: { umfang: { soll: 1000, wort: "Techniken als sichtbare Dinge" }, masse: [{ key: "passt", wort: "Artefakte passen zum Pfad", soll: 0.8, richtung: "≥" }, { key: "H", wort: "Kettentiefe H", soll: 10, richtung: "≥" }], erwartet: "nicht", fehlt: "10³ Techniken" },
            4: { umfang: { soll: 1e4, wort: "Techniken bis Dampf, Elektrik, Chemie" }, masse: [{ key: "r", wort: "Ausbreitung ↔ Handelsdichte (r)", soll: 0.6, richtung: "≥" }, { key: "front", wort: "Front km/Jahr", von: 0.3, bis: 3 }, { key: "mehrfach", wort: "mehrfach erfunden", soll: 0.6, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁴ Techniken" },
            5: { umfang: { soll: 10, wort: "Pfade zum Halbleiter" }, masse: [{ key: "kette", wort: "Pfade mit lückenloser Kette", soll: 10, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Halbleiter" },
            6: { auge: { pose: "20 m südlich der Mitte der Stadt, Ego 1,7 m, je Epoche", vorbild: "Bildreihe eines realen Orts über 10 Epochen (Stadtansichten): Ort wiedererkannt ≥ 80 %, 0 Werkzeuge ohne Vorgänger" }, erwartet: "nicht", fehlt: "10 Epochen eines Orts" },
            7: { auge: { pose: "Ego 1,7 m je fremder Welt", vorbild: "Panel: „folgt aus Stoffen“ ≥ 80 % UND „nicht unsere Geschichte“ ≥ 80 % an ≥ 10 Pfaden" }, erwartet: "nicht", fehlt: "fremde Chemie" },
        },
        proben: {
            1: [
                { name: "Technik ohne Vorgänger im Bild (drei Kuppeln ohne Kupfer)", j: { leiter: "mensch.wirtschaft.technik", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 11, werte: { ohneVor: 3, staende: 4 }, taeter: "Technik ohne Vorgänger im Bild: kupfer 3" } } }, gruen: false, zahl: /ROT an Techniken ohne Voraussetzung im Bild \(20 Saaten\) 3 / },
                { name: "jede Saat derselbe Stand", j: { leiter: "mensch.wirtschaft.technik", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 11, werte: { ohneVor: 0, staende: 1 }, taeter: " jede Saat derselbe Stand" } } }, gruen: false, zahl: /ROT an verschiedene Stände \(20 Saaten\) 1 / },
                { name: "der Leser von main: kein Stand im Plan", j: { leiter: "mensch.wirtschaft.technik", adapter: PROBE, sprossen: { 1: { art: "leser", fehlt: "der Kern trägt kein Technik-Gesetz (fachwerk technikImBild fehlt) — kein Stand im Plan", wo: "fachwerk-core.js technikImBild" } } }, gruen: false },
            ],
            4: [{ name: "ATTRAPPE: die Front springt (30 km/Jahr) — Ausbreitung ohne Weg", j: { leiter: "mensch.wirtschaft.technik", adapter: PROBE, sprossen: { 4: { art: "zahl", n: 1e4, werte: { r: 0.7, front: 30, mehrfach: 0.7 } } } }, gruen: false, zahl: /ROT an Front km\/Jahr 30 / }],
        },
    }),

    // ───────── DIE ENERGIE: Feuer, Wind, Kohle, Strom ─────────
    F.leiter("mensch.wirtschaft.energie", {
        sek: 45,
        mutiert: true,
        pfad: [...STADT_PFAD, "stamm/feld-leben.js", "stamm/koerper-leib.js", "stamm/vegetation-baum.js", "stamm/stoff-material.js", "scripts/lib/ausgabe-aufnahme.cjs"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("STADT");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Stadt: " + zf);
                return Z;
            };
            const kraft = () => Object.entries(z().slotRollen).filter(([k]) => /kraftwerk|zeche|dampf|umspann/i.test(k)).reduce((a, [, v]) => a + v, 0);
            H.zeile("Energie: " + (Z ? Z.schmieden + " Schmieden, " + Z.muehlen + " Mühlen im Ort, " + Z.laternen + " Laternen, Kraftwerke " + kraft() : "kein Zensus (" + zf + ")"));
            await K.schritt(1, async () => K.leser(1, { n: z().schmieden, fehlt: "kein Brennstoff: das Feuer der Esse ist eine Konstante (feuerK 1573 K), es frisst kein Holz, und keine Schmelze gibt einen Barren (" + z().schmieden + " Schmieden)", wo: "stamm/feld-leben.js:3121" }));
            await K.schritt(3, async () => K.nicht(3, { n: kraft(), fehlt: "Kohle und Dampf mit Übergang: " + kraft() + " Zechen/Dampfwerke im Plan, keine Energie je Arbeitendem" }));
            await K.schritt(4, async () => K.nicht(4, { n: kraft(), fehlt: "Strom mit Kraftwerk: " + kraft() + " Kraftwerke — die " + z().laternen + " Laternen hängen an keinem Netz, kein Werk an einer Leitung" }));
            await K.schritt(5, async () => {
                if (z().lichtOrte < 1e3) return K.nicht(5, { n: z().lichtOrte, fehlt: "das Nachtbild eines Planeten: " + z().lichtOrte + " beleuchtete Siedlung(en) am Messort, kein Orbit" });
                const b = await K.bild(5, { px: z().nah.ox, py: "+2000", pz: z().nah.oz, lx: z().nah.ox + 1, ly: "+0", lz: z().nah.oz });
                K.auge(5, { bild: b.datei, pose: "2 km über der Stadt bei Nacht", mass: z().lichtOrte + " beleuchtete Orte" });
            });
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "20 Saaten über Sonnensysteme: die Sitzung trägt eine Saat, eine Welt" }));
            // S2 zuletzt: Wind und Flaute an der Mühle (die Sitzung stellt danach das Wetter zurück)
            await K.schritt(2, async () => {
                const m = await ruf("MUEHLE");
                if (!(m.muehlen >= 1)) return K.nicht(2, { n: 0, fehlt: "eine Mühle im Ort: keine Architektur mit Rad oder Segel in der Stadt (" + z().haeuser + " Häuser, Rollen " + Object.keys(z().slotRollen).length + ") — kein Mehl" });
                H.zeile("Mühle (" + m.rolle + "): Flaute " + m.flauteDreh + " rad/s bei Wind " + m.windFlaute + ", Sturm " + m.sturmDreh + " rad/s bei Wind " + m.windSturm);
                K.zahl(2, {
                    n: m.muehlen,
                    werte: { flauteDreh: m.flauteDreh, windDreh: m.sturmDreh, mehl: null },
                    beleg: m.muehlen + " Mühle(n), Wind " + m.windFlaute + " → " + m.windSturm + ", Drehung Sturm ÷ Flaute " + m.drehVerhaeltnis,
                    taeter: m.flauteDreh > 0 ? "das Rad dreht ohne Wind (stamm/koerper-leib.js _animateCompoundMotion: rad t·0,7)" : !(m.sturmDreh > 0) ? "die Mühle steht im Wind" : "kein Mehl im Ort (kein Bestand der Mühle)",
                });
            });
        },
        seite: { STADT, MUEHLE },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Feuer mit Brennstoff (Schmelze)" }, masse: [{ key: "holz", wort: "Änderung des Holzstapels je Schmelze", soll: 0, richtung: "<" }, { key: "ohneHolz", wort: "Gegenlauf: Barren ohne Holz", soll: 0, richtung: "≤" }], erwartet: "leser", fehlt: "kein Brennstoff", wo: "stamm/feld-leben.js:3121" },
            2: { umfang: { soll: 1, wort: "Mühle im Ort" }, masse: [{ key: "flauteDreh", wort: "Drehung der Mühle in der Flaute (rad/s)", soll: 0, richtung: "≤" }, { key: "windDreh", wort: "Drehung der Mühle im Wind (rad/s)", soll: 0, richtung: ">" }, { key: "mehl", wort: "Änderung des Mehls im Ort nach der Flaute", soll: 0, richtung: "<" }], erwartet: "nicht", fehlt: "keine Mühle im Ort" },
            3: { umfang: { soll: 1, wort: "Übergang Kohle und Dampf" }, masse: [{ key: "strom", wort: "Energie je Arbeitendem über den Übergang (Faktor)", soll: 10, richtung: "≥" }], erwartet: "nicht", fehlt: "keine Kohle, kein Dampf" },
            4: { umfang: { soll: 1, wort: "Kraftwerk mit Netz" }, masse: [{ key: "dunkel", wort: "Viertel dunkel nach Kraftwerk aus (ja = 1)", soll: 1, richtung: "≥" }, { key: "werkeStehen", wort: "Werke stehen nach Kraftwerk aus (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Kraftwerk" },
            5: { auge: { pose: "2 km über der Stadt bei Nacht, Orbit je Planet", vorbild: "Nachtbild der Erde (NASA Black Marble): „wirklich“ ≥ 70 % im Blindpaar" }, erwartet: "nicht", fehlt: "kein Planet bei Nacht" },
            6: { umfang: { soll: 20, wort: "Saaten über Sonnensysteme" }, masse: [{ key: "r", wort: "besiedelte Zone ↔ Energie (r)", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "20 Saaten" },
        },
        proben: {
            2: [{ name: "ATTRAPPE: das Rad dreht in Flaute und Sturm gleich (der Leerlauf t·0,7)", j: { leiter: "mensch.wirtschaft.energie", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 1, werte: { flauteDreh: 0.7, windDreh: 0.7, mehl: -2 } } } }, gruen: false, zahl: /ROT an Drehung der Mühle in der Flaute \(rad\/s\) 0\.7 / }],
        },
    }),
];
