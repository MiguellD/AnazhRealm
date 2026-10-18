// 1810 B5 Finder: die Lieferungen vor dem ersten Weltbild aus roh/<lauf>.json (Instrument lieferung-patch.cjs).
//   node auswertung-b5.cjs <roh-ordner> [lauf …]   → je Lauf eine Zeile + Lieferungs-Kette, Summen je Klasse; schreibt auswertung-b5.json
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const nur = process.argv.slice(3);
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : NaN;
};
const s1 = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
const BAUM = new Set(["eiche", "fichte", "tanne", "birke", "weide", "mammut", "buche", "karst", "strauch", "totholz"]);
const FELS = new Set(["findling", "basalt", "sediment", "zacken", "geroell", "kristalle"]);
const STREU = new Set(["gras", "blume", "farn", "gestruepp", "totstamm", "pilz", "moos"]);
const TIER = new Set(["deer", "wolf", "fox", "bear"]);
const WAGEN = new Set(["gt", "supersport", "limousine", "kompakt_fwd", "suv"]);
function klasse(key) {
    // key: "<type>#<preset>|<gestalt>|<lod>[|ov:…][|V]"
    const [typ, rest] = key.split("#");
    if (typ !== "build-asset") return "Dorf-Export";
    const [preset, , lodS] = rest.split("|");
    const lod = Number(lodS);
    if (/\|V$/.test(key)) return "Vorrat";
    if (preset === "mensch") return "Leib";
    if (TIER.has(preset)) return "Tier";
    if (BAUM.has(preset)) return lod === 1 && !/ov:/.test(rest) ? "Karte(L1)" : "Baum";
    if (FELS.has(preset)) return "Fels";
    if (STREU.has(preset)) return "Streu";
    return "Haus/Tor";
}
const zeilen = [];
const laeufe = fs
    .readdirSync(D)
    .filter((x) => /\.json$/.test(x) && !/auswertung/.test(x))
    .map((x) => x.replace(/\.json$/, ""))
    .filter((n) => !nur.length || nur.includes(n))
    .sort();
for (const N of laeufe) {
    const j = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8"));
    if (!j.lf) continue;
    const WB = j.weltbildDa;
    const LF = j.lf;
    const pr = (j.proben || []).filter((p) => Array.isArray(p.lk));
    // je Term: erste und letzte Probe, die ihn trägt (vor dem Bild)
    const term = {};
    for (const p of pr) {
        if (WB && p.t > WB) break;
        for (const l of p.lk) {
            const t = l.split(":")[0];
            const z = term[t] || (term[t] = { ab: p.t, bis: p.t, max: 0 });
            z.bis = p.t;
            z.max = Math.max(z.max, parseInt(l.split(":")[1], 10) || 0);
        }
    }
    // die Lücke endet mit der nächsten Probe ohne sie
    for (const [t, z] of Object.entries(term)) {
        const nach = pr.find((p) => p.t > z.bis);
        z.ende = nach ? nach.t : null;
    }
    const leibEnde = term.leib ? term.leib.ende : null;
    const seele = (LF.seele || [])[0] || null;
    // die Lieferungen: Einreihen → Senden → Ankunft → Satz
    const sendeVon = new Map(LF.s.map((x) => [x[0], x]));
    const anVon = new Map(LF.an.map((x) => [x[1], x]));
    const erfVon = new Map(LF.erf.map((x) => [x[0], x]));
    const satzVon = new Map();
    for (const [t, k] of LF.satz) if (!satzVon.has(k)) satzVon.set(k, t);
    const L = LF.q.map((q, id) => {
        const [tq, key, d, blick, warteLen, pend, nachBild] = q;
        const s = sendeVon.get(id);
        const an = s ? anVon.get(s[2]) : null;
        const erf = erfVon.get(id);
        const kk = key.split("#")[1];
        const satz = satzVon.has(kk) ? satzVon.get(kk) : null;
        const bahn = s ? (/w(\d+)_/.exec(s[2]) ? "w" + /w(\d+)_/.exec(s[2])[1] : "w0") : null;
        return {
            id,
            key,
            kl: klasse(key),
            tq,
            d,
            blick,
            warteLen,
            pend,
            nachBild,
            ts: s ? s[1] : null,
            req: s ? s[2] : null,
            bahn,
            tan: an ? an[0] : null,
            platte: an ? an[3] : null,
            teile: an ? an[4] : null,
            atlas: an ? an[6] : null,
            fein: an && Array.isArray(an[7]) ? an[7] : null,
            terf: erf ? erf[1] : null,
            tsatz: satz != null && satz >= tq ? satz : null,
        };
    });
    // der Worker-Bau je Bahn: Start = max(Senden, Ankunft des Vorgängers derselben Bahn)
    const bahnen = {};
    for (const x of L) if (x.ts != null && x.tan != null) (bahnen[x.bahn] || (bahnen[x.bahn] = [])).push(x);
    for (const b of Object.values(bahnen)) {
        b.sort((a, c) => a.tan - c.tan);
        let vor = 0;
        for (const x of b) {
            x.bau = x.tan - Math.max(x.ts, vor);
            vor = x.tan;
        }
    }
    const vorBild = L.filter((x) => x.tq < WB && !x.nachBild);
    const imBlick = vorBild.filter((x) => x.blick === 1 && x.kl !== "Vorrat");
    const sum = (a, f) => a.reduce((s, x) => s + (Number.isFinite(f(x)) ? f(x) : 0), 0);
    const jeKlasse = {};
    for (const x of vorBild) {
        const z = jeKlasse[x.kl] || (jeKlasse[x.kl] = { n: 0, blick: 0, platte: 0, bau: 0, letzteAn: 0, letzterSatz: 0, schlange: [], werk: [], satz: [], fWarte: [], fBau: [], fLatenz: [], fBauSum: 0 });
        z.n++;
        if (x.blick) z.blick++;
        if (x.platte) z.platte++;
        if (Number.isFinite(x.bau)) z.bau += x.bau;
        if (x.tan != null && x.tan < WB) z.letzteAn = Math.max(z.letzteAn, x.tan);
        if (x.tsatz != null && x.tsatz < WB) z.letzterSatz = Math.max(z.letzterSatz, x.tsatz);
        if (x.ts != null) z.schlange.push(x.ts - x.tq);
        if (x.tan != null && x.ts != null) z.werk.push(x.tan - x.ts);
        if (x.tsatz != null && x.tan != null) z.satz.push(x.tsatz - x.tan);
        if (x.fein && x.ts != null) {
            const [ein, st, en] = x.fein;
            if (st) { z.fWarte.push(st - ein); z.fBau.push(en - st); z.fBauSum += en - st; } else z.fWarte.push(en - ein);
            z.fLatenz.push(x.tan - en);
        }
    }
    for (const z of Object.values(jeKlasse)) {
        z.schlangeMed = Math.round(med(z.schlange));
        z.werkMed = Math.round(med(z.werk));
        z.satzMed = Math.round(med(z.satz));
        z.fWarteMed = Math.round(med(z.fWarte));
        z.fBauMed = Math.round(med(z.fBau));
        z.fBauSum = Math.round(z.fBauSum);
        z.fLatenzMed = Math.round(med(z.fLatenz));
        z.fLatenzMax = z.fLatenz.length ? Math.round(Math.max(...z.fLatenz)) : NaN;
        delete z.fWarte;
        delete z.fBau;
        delete z.fLatenz;
        z.bau = Math.round(z.bau);
        delete z.schlange;
        delete z.werk;
        delete z.satz;
    }
    // die Bahnen bis zum Bild: Bau-Summe und Leerlauf
    const bahnBild = {};
    for (const [b, xs] of Object.entries(bahnen)) {
        const bis = xs.filter((x) => x.tan <= WB);
        bahnBild[b] = { n: bis.length, bauMs: Math.round(sum(bis, (x) => x.bau)), ersteSend: Math.min(...xs.map((x) => x.ts)) };
    }
    // die Bild-Takte
    const ticks = LF.tick || [];
    const dt = ticks.slice(1).map((t, i) => t - ticks[i]);
    const gruppen = (LF.grp || []).filter((g) => g[0] < WB);
    zeilen.push({
        lauf: N,
        zweit: !!j.zweit,
        version: j.version,
        weltbild: WB,
        leib: leibEnde,
        seele,
        buch: j.buchDa,
        auftrag: j.auftrag,
        atlas: LF.atlas,
        terme: term,
        takte: ticks.length,
        taktMed: Math.round(med(dt)),
        lieferungenVorBild: vorBild.length,
        imBlick: imBlick.length,
        platteTreffer: vorBild.filter((x) => x.platte).length,
        angekommenVorBild: vorBild.filter((x) => x.tan != null && x.tan < WB).length,
        gruppenBauMs: Math.round(sum(gruppen, (g) => g[1])),
        gruppenN: gruppen.length,
        ofenMs: Math.round(sum((LF.ofen || []).filter((o) => o[0] < WB), (o) => o[1])),
        jeKlasse,
        bahnBild,
        bild: j.bild ? { dc: j.bild.dc, dreiecke: j.bild.dreiecke } : null,
        kette: imBlick
            .filter((x) => x.tsatz != null || x.tan != null)
            .sort((a, b) => (b.tsatz || b.tan) - (a.tsatz || a.tan))
            .slice(0, 12)
            .map((x) => ({ key: x.key, kl: x.kl, d: x.d, tq: x.tq, ts: x.ts, tan: x.tan, tsatz: x.tsatz, bahn: x.bahn, bau: x.bau, platte: x.platte, fein: x.fein })),
        leibKette: L.filter((x) => x.kl === "Leib").map((x) => ({ key: x.key.replace(/ov:[^|]+/, "ov"), tq: x.tq, ts: x.ts, tan: x.tan, terf: x.terf, bahn: x.bahn, bau: x.bau, platte: x.platte, warteLen: x.warteLen, fein: x.fein })),
        dorfKette: L.filter((x) => x.kl === "Dorf-Export").map((x) => ({ tq: x.tq, ts: x.ts, tan: x.tan, bahn: x.bahn, fein: x.fein })),
    });
}
for (const z of zeilen) {
    const T = z.terme;
    const e = (t) => (T[t] ? s1(T[t].ende) : "–");
    console.log(
        `${z.lauf}${z.zweit ? " (zweit)" : ""} V${z.version}: Weltbild ${s1(z.weltbild)} · Leib ${s1(z.leib)} (Seele ${z.seele ? s1(z.seele[0]) + " +" + z.seele[1] + " ms" : "–"}) · Buch ${s1(z.buch)} · Atlas ${s1(z.atlas)} | Ende je Lücke: boden ${e("boden")} · horizont ${e("horizont")} · bauten ${e("bauten")} (max ${T.bauten ? T.bauten.max : 0}) · dorf ${e("dorf")} · pflanzung ${e("pflanzung")} · streu ${e("streu")} · karten ${e("karten")} (max ${T.karten ? T.karten.max : 0}) | Takte ${z.takte} (Median ${z.taktMed} ms) | Lieferungen vor Bild ${z.lieferungenVorBild} (im Blick ${z.imBlick}, Platte ${z.platteTreffer}, angekommen ${z.angekommenVorBild}) · Gruppen-Bau ${z.gruppenN}× ${z.gruppenBauMs} ms · Ofen ${z.ofenMs} ms`
    );
    for (const [k, v] of Object.entries(z.jeKlasse).sort((a, b) => b[1].n - a[1].n))
        console.log(
            `    ${k.padEnd(10)} n ${String(v.n).padStart(3)} · Blick ${String(v.blick).padStart(3)} · Platte ${String(v.platte).padStart(3)} · Median ms: Host-Schlange ${v.schlangeMed} · Faden-Warte ${v.fWarteMed} · Studio-Bau ${v.fBauMed} (Σ ${v.fBauSum}) · Haupt-Faden-Latenz ${v.fLatenzMed} (max ${v.fLatenzMax}) · Satz ${v.satzMed} · letzte Ankunft ${s1(v.letzteAn)} · letzter Satz ${s1(v.letzterSatz)}`
        );
    console.log("    Bahnen bis Bild: " + Object.entries(z.bahnBild).map(([b, v]) => `${b} ${v.n}× Bau ${v.bauMs} ms ab ${s1(v.ersteSend)}`).join(" · "));
    const fz = (x) => (x.fein ? ` [Faden: ein ${s1(x.fein[0])} Studio ${s1(x.fein[1])} fertig ${s1(x.fein[2])}]` : "");
    console.log("    Leib: " + z.leibKette.map((x) => `${x.key} Auftrag ${s1(x.tq)} → gesendet ${s1(x.ts)} (${x.bahn}) → an ${s1(x.tan)}${fz(x)} Platte ${x.platte}`).join(" | "));
    console.log("    Dorf-Export: " + z.dorfKette.map((x) => `Auftrag ${s1(x.tq)} → gesendet ${s1(x.ts)} (${x.bahn}) → an ${s1(x.tan)}`).join(" | "));
    console.log("    letzte Sätze im Blick: " + z.kette.slice(0, 6).map((x) => `${x.key.split("#")[1].replace(/ov:[^|]+/, "ov")} [${x.kl}, ${x.d} m] q${s1(x.tq)} s${s1(x.ts)} an${s1(x.tan)} satz${s1(x.tsatz)}`).join(" | "));
}
fs.writeFileSync(path.join(D, "auswertung-b5.json"), JSON.stringify(zeilen, null, 1));
