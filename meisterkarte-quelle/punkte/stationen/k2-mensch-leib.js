// DIE RICHTER DER PERSPEKTIVE leib (Meisterkarte 2, Kapitel mensch): sechs Leitern, 38 Sprossen — je Leiter EINE Probe in der warmen
// Welt der Sitzung, die alle ihre Sprossen am ERGEBNIS der Welt misst: die Leiber der Bewohner (`r._bewohnerSiedlungen`: Gestalt,
// Höhe, Bau, Farben, Tracht, Alter, Akt, Gemüt, Lage), der Kopf des Spielers im Bild (werkbank /bild --gesicht --klasse, die Züge
// gegen KOPF_SOLL) und sein Stoff in Bewegung (die gehäuteten Ecken von Haut und Tuch je Pose, der Löser `tuchTakt` im Takt).
// Wo die Welt den Umfang nicht stellt, zählt die Probe, was sie trägt, und urteilt „Umfang nicht erzeugbar“ (ROT, nie ein Skip);
// wo ein Prüfer richtet, schießt sie das Bild an fester Pose (auge, nie GRÜN ohne das Urteil am Gerät).
"use strict";

const { FAECHER } = require("./faecher.js");

// ───────────────────────── DIE SEITE DER WELT (als Text an K.welt; nichts aus dem Modul) ─────────────────────────

// DER ZENSUS DER LEIBER: je Bewohner mit Leib sein Maß (Höhe aus dem Genom: kh 0,215 = 1,72 m, stamm/koerper-leib.js:40; Schulter,
// Tiefe, Bein, Arm aus Breite, Tiefe und Bau seines Skeletts, koerper-core BAU_GESETZ), Farben, Tracht, Alter (Dial 0..1 = 18–80 J.),
// Beruf, Akt, Haltung und Lage. Die Gestalt-Distanz zweier Leiber ist die größte Maß-Differenz (m), wenn sie dieselbe Gestalt ihrer
// Siedlung tragen (sonst verschieden: ein anderer Guss), in Bildpunkten an der Kamera der Sitzung (Höhe der Leinwand, fov, Abstand
// des ferneren). Dazu die Posen der Augen-Sprossen, abgeleitet aus den nächsten Bewohnern draußen.
const ZENSUS = async (r, T, arg) => {
    const o = arg || {};
    const st = r.state;
    const cam = st.camera;
    const cp = cam.position;
    const can = st.renderer && st.renderer.domElement;
    const hPx = (can && can.height) || 1080;
    const tanH = Math.tan(((cam.fov || 60) * Math.PI) / 360);
    const pxJeM = (d) => hPx / (2 * Math.max(0.5, d) * tanH);
    const Sm = r._bewohnerSiedlungen;
    const siedl = Sm && typeof Sm.values === "function" ? Array.from(Sm.values()) : [];
    const name = (x) => (x == null ? "?" : typeof x === "object" ? String(x.id || x.name || x.key || JSON.stringify(x).slice(0, 60)) : String(x));
    const alle = [];
    for (const S of siedl)
        for (const b of S.liste || []) {
            const g = b.leib;
            const gen = b.genom;
            if (!g || !g.position || !gen) continue;
            const h = 8 * gen.kh;
            const s = b.groesse || 1;
            const bau = b.bau || {};
            const p = g.position;
            const K = (S.plan && S.plan.kleidung) || {};
            alle.push({
                S: S.key,
                g: b.gestalt,
                h,
                br: 0.45 * s * (b.breite || 1),
                ti: 0.25 * s * (b.tiefe || 1),
                bein: 0.026 * h * (bau.bauBein || 0),
                arm: 0.027 * h * (bau.bauArm || 0),
                sch: 0.048 * 0.45 * s * (bau.bauSchulter || 0),
                garnitur: [S.key, K.top, K.bottom, K.shoes, (b.farben || {}).topColor, (b.farben || {}).bottomColor, (b.farben || {}).shoeColor].join("|"),
                alterJ: 18 + 62 * (gen.alter || 0),
                beruf: b.beruf || b.rolle || null,
                akt: b.akt || null,
                haltung: (b.gemuet && b.gemuet.haltung) || null,
                drin: !!(b.drinnen || (g.userData && g.userData._drinnen)),
                last: !!(b.last || b.traegt || b.wunde || b.verletzt || b.narbe),
                x: p.x,
                y: p.y,
                z: p.z,
                blick: g.rotation ? g.rotation.y : 0,
                d: Math.hypot(p.x - cp.x, p.y - cp.y, p.z - cp.z),
                gk: [gen.sex, gen.kh, gen.build, gen.muscle, gen.headRatio, gen.alter, gen.auge, gen.mund, gen.braue, gen.haaransatz, gen.schnitt, gen.skinTone, gen.hairColor].join("|"),
            });
        }
    const dm = (a, c) =>
        a.S !== c.S || a.g !== c.g ? Infinity : Math.max(Math.abs(a.h - c.h), Math.abs(a.br - c.br), Math.abs(a.ti - c.ti), Math.abs(a.bein - c.bein), Math.abs(a.arm - c.arm), Math.abs(a.sch - c.sch));
    const draussen = alle.filter((a) => !a.drin).sort((a, c) => a.d - c.d);
    const nah = draussen.slice(0, o.nah || 100);
    let paareNah = 0;
    let minPx = Infinity;
    for (let i = 0; i < nah.length; i++)
        for (let j = i + 1; j < nah.length; j++) {
            const px = dm(nah[i], nah[j]) * pxJeM(Math.max(nah[i].d, nah[j].d));
            if (px < minPx) minPx = px;
            if (px < 1) paareNah++;
        }
    const zehn = nah.slice(0, 10);
    let paare10 = 0;
    for (let i = 0; i < zehn.length; i++) for (let j = i + 1; j < zehn.length; j++) if (dm(zehn[i], zehn[j]) * pxJeM(Math.max(zehn[i].d, zehn[j].d)) < 1) paare10++;
    let klone30 = 0;
    const k30 = pxJeM(30);
    for (let i = 0; i < alle.length; i++) for (let j = i + 1; j < alle.length; j++) if (dm(alle[i], alle[j]) * k30 < 1) klone30++;
    const paareGleich = (key) => {
        const m = new Map();
        for (const a of alle) m.set(a[key], (m.get(a[key]) || 0) + 1);
        let n = 0;
        for (const k of m.values()) n += (k * (k - 1)) / 2;
        return n;
    };
    const zaehle = (L, key) => {
        const m = {};
        for (const a of L) m[a[key] || "—"] = (m[a[key] || "—"] || 0) + 1;
        return m;
    };
    const plaene = siedl.map((S) => {
        const P = S.plan || {};
        const K = P.kleidung || {};
        const jahr = P.schnitt && Number.isFinite(P.schnitt.jahr) ? P.schnitt.jahr : P.jahr;
        return { key: S.key, n: (S.liste || []).length, jahr, region: name(P.region), schnitt: [K.top, K.bottom, K.shoes].join("/"), farben: (K.farben || []).length };
    });
    const uniq = (L) => Array.from(new Set(L.filter((x) => x != null && x !== "")));
    const alter = alle.map((a) => a.alterJ);
    // DIE POSEN (feste Regel, im Text der Sprosse genannt): A der nächste Bewohner draußen, c die Mitte der zehn nächsten
    const posen = {};
    if (zehn.length) {
        const A = zehn[0];
        const cx = zehn.reduce((s, a) => s + a.x, 0) / zehn.length;
        const cz = zehn.reduce((s, a) => s + a.z, 0) / zehn.length;
        let ux = cx - A.x;
        let uz = cz - A.z;
        const ul = Math.hypot(ux, uz);
        const fx = Math.sin(A.blick);
        const fz = Math.cos(A.blick);
        if (ul < 0.3) [ux, uz] = [-fx, -fz];
        else [ux, uz] = [ux / ul, uz / ul];
        const kopf = A.y + 0.93 * A.h;
        posen.zehn = { px: A.x - 2 * ux, py: A.y + 1.6, pz: A.z - 2 * uz, lx: cx, ly: A.y + 1.2, lz: cz };
        posen.gesicht = { px: A.x + 2 * fx, py: kopf, pz: A.z + 2 * fz, lx: A.x, ly: kopf, lz: A.z };
        posen.leib = { px: A.x + 3 * fx, py: A.y + 1.5, pz: A.z + 3 * fz, lx: A.x, ly: A.y + 0.9, lz: A.z };
        const mx = nah.reduce((s, a) => s + a.x, 0) / nah.length;
        const my = nah.reduce((s, a) => s + a.y, 0) / nah.length;
        const mz = nah.reduce((s, a) => s + a.z, 0) / nah.length;
        posen.ueber = { px: mx, py: my + 10, pz: mz + 17.3, lx: mx, ly: my + 1, lz: mz };
        posen.A = { x: A.x, y: A.y, z: A.z, h: A.h, beruf: A.beruf, akt: A.akt, haltung: A.haltung, alterJ: A.alterJ };
    }
    return {
        n: alle.length,
        draussen: draussen.length,
        siedlungen: plaene,
        cam: { x: cp.x, y: cp.y, z: cp.z, fov: cam.fov, hPx },
        nahN: nah.length,
        paareNah,
        minPx: Number.isFinite(minPx) ? minPx : null,
        gestaltenNah: uniq(nah.map((a) => a.S + ":" + a.g)).length,
        gestalten10: uniq(zehn.map((a) => a.S + ":" + a.g)).length,
        paare10,
        klone30,
        garniturPaare: paareGleich("garnitur"),
        genomPaare: paareGleich("gk"),
        alterJ: alter.length ? [Math.min(...alter), Math.max(...alter)] : null,
        berufe: uniq(alle.map((a) => a.beruf)),
        berufe100: uniq(nah.map((a) => a.beruf)),
        akte: zaehle(alle, "akt"),
        akt10: zaehle(zehn, "akt"),
        haltung10: zaehle(zehn, "haltung"),
        treff: alle.filter((a) => a.akt === "treff").length,
        last: alle.filter((a) => a.last).length,
        schnitte: uniq(plaene.map((p) => p.schnitt)),
        schnitte100: uniq(nah.map((a) => a.garnitur.split("|").slice(1, 4).join("/"))).length,
        regionen: uniq(plaene.map((p) => p.region)),
        epochen: uniq(plaene.map((p) => (Number.isFinite(p.jahr) ? Math.floor(p.jahr / 100) : null))),
        posen,
    };
};

// DIE PRÄGUNG DES SPIELERS AUS EINEM SAMEN (der EINE Schreiber `_praegungSetzen`, stamm/netz-portal.js:1487): die Dials seines Genoms
// (`_dialsAusGenom(_rollHumanoidGenome(same))` mit Haar, Alter und Gesicht wie `_bewohnerGestalten`, stamm/siedlung-bewohner.js:303),
// der Avatar gießt neu; die Antwort trägt den Abdruck des Gusses (Ecken aller Teile : Höhe in mm), damit ein Same, der nichts gießt,
// beim Namen fällt. `zurueck`: die Prägung von vor der Probe (oder keine) und der Guss aus ihr.
const PRAEGEN = async (r, T, arg) => {
    const R = typeof AnazhRealm !== "undefined" && AnazhRealm.KOERPER_HOST_RECIPE ? AnazhRealm.KOERPER_HOST_RECIPE : "mensch";
    const ov = r._ensureWorkshopState().studioOv;
    const abdruck = () => {
        const pm = r.state.playerMesh;
        if (!pm) return null;
        let n = 0;
        pm.traverse((x) => {
            if (x.isMesh && x.geometry && x.geometry.attributes && x.geometry.attributes.position) n += x.geometry.attributes.position.count;
        });
        const bb = new T.Box3().setFromObject(pm);
        return n + ":" + Math.round((bb.max.y - bb.min.y) * 1000);
    };
    if (!window.__k2Praegung) window.__k2Praegung = { da: Object.prototype.hasOwnProperty.call(ov, R), v: ov[R] };
    const vor = abdruck();
    if (arg && arg.zurueck) {
        const a = window.__k2Praegung;
        window.__k2Praegung = null;
        if (a.da) r._praegungSetzen("koerper", R, a.v);
        else {
            delete ov[R];
            r.applyPlayerSoul((r.state.player && r.state.player.soul) || "human");
        }
        return { abdruck: abdruck(), zurueck: true };
    }
    const gen = r._rollHumanoidGenome(String(arg.same));
    const d = Object.assign(r._dialsAusGenom(gen), {
        hairStyle: gen.schnitt,
        hairLen: gen.haarLaenge,
        hairVol: gen.haarFuelle,
        age: gen.alter,
        auge: gen.auge,
        mund: gen.mund,
        braue: gen.braue,
        haaransatz: gen.haaransatz,
    });
    r._praegungSetzen("koerper", R, d);
    let jetzt = abdruck();
    for (let i = 0; i < 30 && jetzt === vor; i++) {
        await new Promise((ok) => setTimeout(ok, 100));
        await window.__seitenTakt();
        jetzt = abdruck();
    }
    return { abdruck: jetzt, vor, neu: jetzt !== vor, hoeheM: +(8 * gen.kh).toFixed(3) };
};

// DER STOFF IN BEWEGUNG (leib.stoff S1 + S2): der Spieler geht (8 Posen) und läuft (8 Posen) im Takt des Spiels (60 Hz, die Verb-Tafel
// `gehalten`: vor, sprint); je Pose die gehäuteten Ecken (`applyBoneTransform` × Welt-Matrix) seiner Haut (`__seh` haut, `__klasse`
// haut) und seines Tuchs (`__seh` stoff — die Positionen schreibt der Löser `tuchTakt`). DER DURCHSTICH: eine Haut-Ecke, deren nächste
// Tuch-Ecke (≤ 2,5 cm) sie auf der Außenseite des Tuchs findet (> 1 mm entlang der gehäuteten Tuch-Normale, seitlich < 1 cm) — die
// Außenseite liest die erste Pose (die Mehrheit der Paare liegt innen). DIE REIHE (reihe): je Takt des Laufs die 24 Tuch-Ecken, die am
// weitesten von ihrer starren Lage (`__tuchVorlage`, dieselben Gewichte) abweichen, gegen eben diese starre Lage — der Verzug ist der
// Versatz (Bilder), an dem ihre Bewegung relativ zum Leib am besten der starren folgt.
const STOFF = async (r, T, arg) => {
    const o = arg || {};
    const st = r.state;
    const pm = st.playerMesh;
    if (!pm || typeof r._gameLoopTick !== "function") return { fehlt: "kein Spieler-Leib" };
    const halt = st.verbTafel.gehalten;
    let uhr = performance.now();
    const takt = () => r._gameLoopTick((uhr += 1000 / 60));
    const matrizen = () => {
        if (typeof r._leibMatrix === "function") r._leibMatrix(pm);
        pm.updateMatrixWorld(true);
    };
    const v = new T.Vector3();
    const q = new T.Vector3();
    const posiert = (m, pa, i, out) => {
        out.fromBufferAttribute(pa, i);
        m.applyBoneTransform(i, out);
        return out.applyMatrix4(m.matrixWorld);
    };
    const benutzt = (m) => {
        const g = m.geometry;
        const n = g.attributes.position.count;
        if (!g.index) return Array.from({ length: n }, (_, i) => i);
        const s = new Uint8Array(n);
        const ix = g.index.array;
        for (let k = 0; k < ix.length; k++) s[ix[k]] = 1;
        const a = [];
        for (let i = 0; i < n; i++) if (s[i]) a.push(i);
        return a;
    };
    const Z = 0.025;
    const zelle = (x, y, z) => Math.floor(x / Z) + "," + Math.floor(y / Z) + "," + Math.floor(z / Z);
    let teile = null;
    let kand = null;
    let vz = 0;
    const posen = [];
    const messen = () => {
        matrizen();
        const sx = [];
        const sm = [];
        const si = [];
        const gitter = new Map();
        teile.stoff.forEach((m, mi) => {
            const pa = m.geometry.attributes.position;
            for (let i = 0; i < pa.count; i++) {
                posiert(m, pa, i, v);
                const e = sm.length;
                sx.push(v.x, v.y, v.z);
                sm.push(mi);
                si.push(i);
                const k = zelle(v.x, v.y, v.z);
                const L = gitter.get(k);
                if (L) L.push(e);
                else gitter.set(k, [e]);
            }
        });
        const naechste = (x, y, z) => {
            let best = -1;
            let bd = Z * Z;
            const cx = Math.floor(x / Z), cy = Math.floor(y / Z), cz = Math.floor(z / Z);
            for (let a = -1; a <= 1; a++)
                for (let b = -1; b <= 1; b++)
                    for (let c = -1; c <= 1; c++) {
                        const L = gitter.get(cx + a + "," + (cy + b) + "," + (cz + c));
                        if (!L) continue;
                        for (const e of L) {
                            const dx = sx[3 * e] - x, dy = sx[3 * e + 1] - y, dz = sx[3 * e + 2] - z;
                            const d2 = dx * dx + dy * dy + dz * dz;
                            if (d2 < bd) [bd, best] = [d2, e];
                        }
                    }
            return best;
        };
        const erste = kand === null;
        if (erste) {
            kand = [];
            teile.haut.forEach((m, hi) => {
                const pa = m.geometry.attributes.position;
                for (const i of benutzt(m)) {
                    posiert(m, pa, i, v);
                    if (naechste(v.x, v.y, v.z) >= 0) kand.push([hi, i]);
                }
            });
        }
        const dns = [];
        for (const [hi, i] of kand) {
            const m = teile.haut[hi];
            posiert(m, m.geometry.attributes.position, i, v);
            const e = naechste(v.x, v.y, v.z);
            if (e < 0) continue;
            const ms = teile.stoff[sm[e]];
            const pa = ms.geometry.attributes.position;
            const na = ms.geometry.attributes.normal;
            if (!na) continue;
            q.fromBufferAttribute(pa, si[e]);
            q.x += 0.01 * na.getX(si[e]);
            q.y += 0.01 * na.getY(si[e]);
            q.z += 0.01 * na.getZ(si[e]);
            ms.applyBoneTransform(si[e], q);
            q.applyMatrix4(ms.matrixWorld);
            const nx = q.x - sx[3 * e], ny = q.y - sx[3 * e + 1], nz = q.z - sx[3 * e + 2];
            const nl = Math.hypot(nx, ny, nz) || 1;
            const dx = v.x - sx[3 * e], dy = v.y - sx[3 * e + 1], dz = v.z - sx[3 * e + 2];
            const dn = (dx * nx + dy * ny + dz * nz) / nl;
            const lat2 = dx * dx + dy * dy + dz * dz - dn * dn;
            dns.push([dn, lat2]);
        }
        if (erste) vz = dns.filter((x) => x[0] > 0).length > dns.filter((x) => x[0] < 0).length ? -1 : 1;
        const durch = dns.filter((x) => vz * x[0] > 0.001 && x[1] < 1e-4).length;
        posen.push({ durch, paare: dns.length });
        return durch;
    };
    // die Reihe: die starre Lage einer Tuch-Ecke (ihre Vorlage mit denselben Gewichten) und ihre Lage aus dem Löser, relativ zum Leib
    const reihe = [];
    const reiheWahl = () => {
        matrizen();
        const L = [];
        teile.stoff.forEach((m) => {
            const vor = m.userData.__tuchVorlage;
            if (!vor || !vor.attributes || !vor.attributes.position) return;
            const pa = m.geometry.attributes.position;
            for (let i = 0; i < pa.count; i += 3) {
                posiert(m, pa, i, v);
                posiert(m, vor.attributes.position, i, q);
                L.push({ m, i, dev: v.distanceTo(q) });
            }
        });
        L.sort((a, b) => b.dev - a.dev);
        for (const x of L.slice(0, 24)) reihe.push({ m: x.m, i: x.i, dev: x.dev, a: [], s: [] });
    };
    const reiheTakt = () => {
        matrizen();
        const p = pm.position;
        for (const x of reihe) {
            posiert(x.m, x.m.geometry.attributes.position, x.i, v);
            posiert(x.m, x.m.userData.__tuchVorlage.attributes.position, x.i, q);
            x.a.push([v.x - p.x, v.z - p.z]);
            x.s.push([q.x - p.x, q.z - p.z]);
        }
    };
    let durch = 0;
    try {
        halt.vor = true;
        halt.sprint = false;
        for (let i = 0; i < 20; i++) takt();
        const G = pm.userData && pm.userData._gelenk;
        const wurzel = (G && (G.istFern ? G.fern : G.nah)) || pm;
        teile = { haut: [], stoff: [] };
        wurzel.traverse((n) => {
            if (!n.isSkinnedMesh) return;
            if (n.userData.__seh === "haut" && n.userData.__klasse === "haut") teile.haut.push(n);
            else if (n.userData.__seh === "stoff") teile.stoff.push(n);
        });
        if (!teile.haut.length || !teile.stoff.length) return { fehlt: "Haut " + teile.haut.length + " · Stoff " + teile.stoff.length + " Teile am Leib", posen: 0 };
        for (let k = 0; k < 8; k++) {
            for (let i = 0; i < 4; i++) takt();
            durch += messen();
        }
        if (o.reihe) reiheWahl();
        halt.sprint = true;
        for (let k = 0; k < 8; k++) {
            for (let i = 0; i < 4; i++) {
                takt();
                if (o.reihe) reiheTakt();
            }
            durch += messen();
        }
    } finally {
        halt.vor = false;
        halt.sprint = false;
    }
    let verzug = null;
    let devCm = null;
    if (o.reihe && reihe.length && reihe[0].a.length > 10) {
        let best = 0;
        let bestS = -Infinity;
        for (let L = 0; L <= 8; L++) {
            let s = 0;
            for (const x of reihe)
                for (let t = 1; t + L < x.a.length; t++) {
                    const sx = x.s[t][0] - x.s[t - 1][0], sz = x.s[t][1] - x.s[t - 1][1];
                    const ax = x.a[t + L][0] - x.a[t + L - 1][0], az = x.a[t + L][1] - x.a[t + L - 1][1];
                    s += sx * ax + sz * az;
                }
            if (s > bestS) [bestS, best] = [s, L];
        }
        verzug = +((best * 1000) / 60).toFixed(1);
        devCm = +((100 * reihe.reduce((s, x) => s + x.dev, 0)) / reihe.length).toFixed(2);
    }
    return {
        posen: posen.length,
        durch,
        paare: kand ? kand.length : 0,
        hautTeile: teile.haut.length,
        stoffTeile: teile.stoff.length,
        tuch: !!pm.userData._tuch,
        vorlage: teile.stoff.some((m) => !!m.userData.__tuchVorlage),
        reihe: o.reihe ? { verzugMs: verzug, devCm, ecken: reihe.length, durch: posen.slice(8).reduce((s, x) => s + x.durch, 0) } : null,
    };
};

const WETTER = async (r, T, arg) => window.__wetterSetzen(arg.wort);

// DIE LEIBER EINER SAAT AM GESETZ (Meta-Gesetz M4, stationen/faecher.js; pm-faecher-mensch 24.11.): je Adresse a.saat der Plan der
// Saat (fachwerk-core.js:5182 DORF, die Epoche der Zelle aus siedlungsEpoche :4494, das Jahr seines Schnitts wie der Export), daraus
// mit.n Bewohner gleich über die Leute seiner Häuser verteilt (Same „Plan:Haus:Person“, Epoche { jahr, rang, n } wie `_bewohnerListe`,
// stamm/siedlung-bewohner.js:1083) und die EINEN Gesetze ihres Leibs: die Gestalten der Siedlung (`_bewohnerGestalten` :452) und das
// Genom jedes Bewohners mit Gestalt, Rest, Bau und Farben (`_bewohnerGenome` :557). Je Bewohner, was sein NAHER Leib zeigt: die Form
// seiner Gestalt (Geschlecht, Bau, Muskel, ALTER, Haar-Schnitt, Gesicht — G.dK, der Guss der Nah-Wahl, :580 und :607), darauf seine
// Höhe, Breite, Tiefe, seine Knochen (`bau`) und seine Farben; dazu seine eigenen Jahre und was sein Satz an Ersatzglied trägt. Je Saat
// die Paare der Leiber: die Gestalt-Distanz (m, die Konvention des ZENSUS oben) in Bildpunkten auf mit.dM Meter (Leinwand mit.hPx,
// fov mit.fov), ein ZWILLING = dieselbe Gestalt, unter 1 px und dieselben fünf Farben. Die Ton-Zeilen, die die Gesetze belegen, gibt
// die Funktion zurück. Ohne Realm (der Kern allein, r = null) fehlen die Methoden: { fehlt }.
const LEIBER_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore;
    const KC = globalThis.__koerperCore;
    if (!r || typeof r._bewohnerGestalten !== "function" || typeof r._bewohnerGenome !== "function")
        return { fehlt: "kein Realm: Gestalt und Genom der Bewohner rechnen die Methoden des Spiels (stamm/siedlung-bewohner.js _bewohnerGestalten, _bewohnerGenome)" };
    if (!FC || typeof FC.DORF !== "function" || typeof FC.leuteVon !== "function" || !KC || !KC.BAU_GESETZ || !KC.MOTION)
        return { fehlt: "der Kern trägt keinen Plan (fachwerk DORF, leuteVon) oder keinen Leib (koerper BAU_GESETZ, MOTION)" };
    const o = mit || {};
    const D = FC.DORF({ seed: a.saat, nH: o.nH, epoche: FC.siedlungsEpoche(a.saat) });
    const jahr = D.schnitt && Number.isFinite(D.schnitt.jahr) ? D.schnitt.jahr : D.jahr;
    const plan = Object.assign({}, D, { jahr });
    const leute = [];
    plan.houses.forEach((hp, si) => {
        const n = FC.leuteVon(hp);
        for (let k = 0; k < n; k++) leute.push([si, k, n]);
    });
    const N = Math.min(o.n || 10, leute.length);
    const liste = [];
    for (let i = 0; i < N; i++) {
        const [si, k, n] = leute[Math.floor(((i + 0.5) * leute.length) / N)];
        liste.push({ seed: (plan.seed >>> 0) + ":" + si + ":" + k, epoche: { jahr, rang: k, n } });
    }
    const S = { key: "faecher:" + a.saat, plan, liste, gestalten: null, raum: null };
    try {
        S.gestalten = r._bewohnerGestalten(S);
        r._bewohnerGenome(S);
    } finally {
        for (const b of liste) if (b.tonZeilen) r._tonZeileFrei(b.tonZeilen[0]);
        for (const G of S.gestalten || []) if (G.tonZeile) r._tonZeileFrei(G.tonZeile);
        if (S.raum && S.raum.tonZeile) r._tonZeileFrei(S.raum.tonZeile);
    }
    const ERSATZ = /prothes|ersatz|amput|implant|kunstglied|stumpf/i;
    const zehn = (x) => Math.round(x * 10) / 10;
    const L = liste.map((b) => {
        const gen = b.genom;
        const G = S.gestalten[b.gestalt];
        const h = 8 * gen.kh;
        const s = b.groesse || 1;
        const bau = b.bau || {};
        const F = b.farben || {};
        const ersatz = [b, gen, bau, b.koennen || {}].reduce((n, x) => n + Object.keys(x).filter((k) => ERSATZ.test(k)).length, 0);
        return {
            g: b.gestalt,
            J: zehn(gen.jahre),
            JG: zehn(G.gen.jahre),
            h,
            br: 0.45 * s * (b.breite || 1),
            ti: 0.25 * s * (b.tiefe || 1),
            bein: 0.026 * h * (bau.bauBein || 0),
            arm: 0.027 * h * (bau.bauArm || 0),
            sch: 0.048 * 0.45 * s * (bau.bauSchulter || 0),
            f: [F.skinTone, F.hairColor, F.topColor, F.bottomColor, F.shoeColor],
            haar: G.ov.hairStyle,
            ersatz,
        };
    });
    const pxJeM = (o.hPx || 720) / (2 * (o.dM || 2) * Math.tan(((o.fov || 60) * Math.PI) / 360));
    let paareG = 0, formGleich = 0, zwillinge = 0, kopfGleich = 0, minPx = null, paar = null;
    for (let i = 0; i < L.length; i++)
        for (let j = i + 1; j < L.length; j++) {
            const p = L[i], q = L[j];
            if (p.g !== q.g) continue;
            paareG++;
            const px = pxJeM * Math.max(Math.abs(p.h - q.h), Math.abs(p.br - q.br), Math.abs(p.ti - q.ti), Math.abs(p.bein - q.bein), Math.abs(p.arm - q.arm), Math.abs(p.sch - q.sch));
            const farbe = p.f.filter((x, k) => x !== q.f[k]).length;
            // DER KOPF-ZWILLING: dieselbe Gestalt (Gesicht, Haarschnitt) mit derselben Haut und demselben Haar — der Kopf auf 2 m gleich
            if (p.f[0] === q.f[0] && p.f[1] === q.f[1]) kopfGleich++;
            if (minPx == null || px < minPx) [minPx, paar] = [px, [i, j, farbe]];
            if (px < 1) {
                if (farbe) formGleich++;
                else zwillinge++;
            }
        }
    // DIE SEITEN DES LEIBS: Achsen des Baus mit eigener Seite (koerper-core.js:1634 BAU_GESETZ) und die größte Ungleichheit links ↔
    // rechts der Haltungs-Profile (:80 MOTION; das Z-Paar der Hüfte gespiegelt)
    const SEITEN = [["armL", "armR", 1], ["armLX", "armRX", 1], ["armLZ", "armRZ", 1], ["elbowL", "elbowR", 1], ["hipLX", "hipRX", 1], ["hipLZ", "hipRZ", -1], ["kneeL", "kneeR", 1]];
    let asym = 0;
    for (const P of Object.values(KC.MOTION)) for (const [l, rr, v] of SEITEN) asym = Math.max(asym, Math.abs((P[l] || 0) - v * (P[rr] || 0)));
    const K = plan.kleidung || {};
    const ep = Object.keys(FC.EPOCHEN || {}).filter((k) => {
        const t = FC.EPOCHEN[k].tracht || {};
        return t.top === K.top && t.bottom === K.bottom && t.shoes === K.shoes && JSON.stringify(t.farben) === JSON.stringify(K.farben);
    });
    return {
        saat: a.saat,
        jahr,
        region: typeof plan.region === "object" ? String(plan.region && (plan.region.id || plan.region.name)) : String(plan.region),
        epoche: ep.join("|") || null,
        // das Fenster der Epoche, deren Tracht der Plan trägt (fachwerk-core.js:4272 EPOCHEN: jahr … jahr + spanne)
        fenster: ep.length ? [FC.EPOCHEN[ep[0]].jahr, FC.EPOCHEN[ep[0]].jahr + FC.EPOCHEN[ep[0]].spanne] : null,
        abseits: ep.length ? Math.max(0, FC.EPOCHEN[ep[0]].jahr - jahr, jahr - FC.EPOCHEN[ep[0]].jahr - FC.EPOCHEN[ep[0]].spanne) : null,
        schnitt: [K.top, K.bottom, K.shoes].join("/"),
        farben: (K.farben || []).slice(),
        n: L.length,
        gestaltenN: new Set(L.map((x) => x.g)).size,
        gestaltJ: S.gestalten.map((G) => zehn(G.gen.jahre)),
        leute: L.map((x) => ({ g: x.g, J: x.J, JG: x.JG, h: +x.h.toFixed(3), f: x.f, haar: x.haar, ersatz: x.ersatz })),
        paareG,
        minPx: minPx == null ? null : +minPx.toFixed(2),
        paar,
        formGleich,
        zwillinge,
        kopfGleich,
        ersatz: L.filter((x) => x.ersatz > 0).length,
        // der Erwachsene, dessen Leib am weitesten neben seinem Alter steht (J., die Jahre seiner Gestalt gegen seine eigenen)
        alterDaneben: zehn(Math.max(0, ...L.filter((x) => x.J >= 18).map((x) => Math.abs(x.JG - x.J)))),
        seitig: KC.BAU_GESETZ.achsen.filter((x) => /(L|R|links|rechts)$/.test(x.achse)).length,
        asym: +asym.toFixed(4),
    };
};

// DIE HALTUNG NACH AKT UND GEMÜT AM GESETZ (pm-faecher-mensch 24.11.): je Adresse a.ort = ein Akt des Tags (koerper-core.js:5677
// tagesPlan), a.zeit = ein Anlass im Gedächtnis seines Leibs (die Einträge, die die Welt schreibt: stamm/siedlung-bewohner.js:2421
// `gewalt` des Zeugen, „geschlagen“ und „gefuettert“ der Kreatur-Gesetze, „spoken“ des Gesprächs; „ohne“ = der Gegenlauf, kein
// Anlass) und je Rolle (mit.rollen, sonst „wohnhaus“ und jede Rolle des Tags, koerper TAGES_GESETZ) der Name, den sein naher Leib
// steht und geht: das Gemüt `_bewohnerGemuet` (:2725 — die Haltung des Akts, koerper `tagesHaltung` :5484, und die erinnerte Furcht)
// durch die EINE Wahl `_koerperMotionName` (stamm/koerper-leib.js:3096, der Leser `_koerperMotionProfile` :3091). Dazu je Name sein
// Vektor der Haltung (koerper-core.js:80 MOTION: die Stellung von Kopf, Rumpf, Armen, Hüfte, Knie in rad — Atem, Wiegen, Takt und
// Augen sind Bewegung, keine Haltung) und die Achsen der Profile, die das Gesicht bewegen (Iris, Lid — und eine Miene: Mund, Braue).
const HALTUNG_AN = async (r, T, a, mit) => {
    const KC = globalThis.__koerperCore;
    if (!r || typeof r._bewohnerGemuet !== "function" || typeof r._koerperMotionName !== "function")
        return { fehlt: "kein Realm: Haltung und Gemüt des Bewohners wählen die Methoden des Spiels (stamm/siedlung-bewohner.js _bewohnerGemuet, stamm/koerper-leib.js _koerperMotionName)" };
    if (!KC || !KC.MOTION || !KC.TAGES_GESETZ) return { fehlt: "der Kern trägt kein MOTION oder TAGES_GESETZ (koerper-core)" };
    const rollen = (mit && mit.rollen) || ["wohnhaus", ...Object.keys(KC.TAGES_GESETZ.rollen)];
    const anlass = a.zeit && a.zeit !== "ohne" ? a.zeit : null;
    const je = {};
    for (const rolle of rollen) {
        const b = { akt: a.ort, rolle, gemuet: null, leib: { userData: { memory: anlass ? [{ type: anlass }] : [] } } };
        const g = r._bewohnerGemuet(b);
        je[rolle] = { stand: r._koerperMotionName(false, g), geht: r._koerperMotionName(true, g), sorrow: g.sorrow, chaos: g.chaos, joy: g.joy || 0 };
    }
    const BEWEGUNG = /breath|sway|freq|kpMul|iris|blink/;
    const achsen = Array.from(new Set(Object.values(KC.MOTION).flatMap((P) => Object.keys(P)))).filter((k) => !BEWEGUNG.test(k));
    const profil = {};
    for (const x of Object.values(je)) for (const n of [x.stand, x.geht]) if (KC.MOTION[n]) profil[n] = achsen.map((k) => KC.MOTION[n][k] || 0);
    const alle = Array.from(new Set(Object.values(KC.MOTION).flatMap((P) => Object.keys(P))));
    return {
        akt: a.ort,
        anlass: anlass || "ohne",
        je,
        stand: Array.from(new Set(Object.values(je).map((x) => x.stand))),
        geht: Array.from(new Set(Object.values(je).map((x) => x.geht))),
        profil,
        gesicht: alle.filter((k) => /iris|blink|lid|mund|mouth|lip|brow|braue|smile|lach|wange|miene/i.test(k)),
        miene: alle.filter((k) => /mund|mouth|lip|brow|braue|smile|lach|wange|miene/i.test(k)).length,
        // ein Gefühl ohne Anlass (der Gegenlauf bricht an dieser Adresse): der Bewohner ohne Rolle steht in Freude, Trauer, Zorn
        // oder Furcht, obwohl sein Gedächtnis leer ist
        ohneAnlassGefuehl: !anlass && ["joy", "sad", "angry", "fear"].includes((je.wohnhaus || {}).stand) ? 1 : 0,
    };
};

const PFAD = ["stamm/siedlung-bewohner.js", "stamm/koerper-leib.js", "koerper-core.js", "fachwerk-core.js"];
const KARTE = "[linse-gpu] amd/rdna-3 (Probe)";
// die eigene Mutante einer Augen-Leiter: ein Augen-Ergebnis ohne Bild zählt nie (UNGEMESSEN beim Namen)
const ohneBild = (id, n) => [{ name: "auge ohne Bild — keine Messung", j: { leiter: id, adapter: KARTE, sprossen: { [n]: { art: "auge", bild: "", pose: "Probe" } } }, gruen: false, zahl: /keine Messung der Sprosse$/ }];

module.exports = (F) => [
    // ═══ EIN LEIB JE MENSCH: der Zensus der Leiber an der vollen Stadt (295 Häuser, 1092 Bewohner, Third am Markt) ═══
    F.leiter("mensch.leib.verschieden", {
        sek: 45,
        pfad: PFAD,
        seite: { ZENSUS, FAECHER, LEIBER_AN },
        messe: async (H, K) => {
            const welt = (name, arg, ms) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms);
            K.sicht = "third";
            await K.messort("stadt-voll");
            const z = await welt("ZENSUS", { nah: 100 }, 40000);
            H.zeile("Zensus: " + z.n + " Bewohner · " + z.draussen + " draußen · " + z.siedlungen.length + " Siedlungen · Paare < 1 px " + z.paareNah + " unter den " + z.nahN + " nächsten · Klone ab 30 m " + z.klone30 + " · gleiche Genome " + z.genomPaare);
            await K.schritt(2, async () =>
                K.zahl(2, {
                    n: z.nahN,
                    werte: { paare: z.paareNah },
                    beleg: "kleinste Gestalt-Distanz " + (z.minPx == null ? "—" : (+z.minPx).toFixed(2)) + " px (Leinwand " + z.cam.hPx + " px, fov " + z.cam.fov + "°) · " + z.gestaltenNah + " Gestalten unter den " + z.nahN,
                    taeter: z.paareNah > 0 ? "die Gestalten der Siedlung (stamm/siedlung-bewohner.js _bewohnerGenome: 8 je Siedlung, Rest ±restMax)" : null,
                })
            );
            await K.schritt(4, async () => {
                if (z.n >= 10000) return K.zahl(4, { n: z.n, werte: { klone: z.klone30 } });
                K.nicht(4, { n: z.n, fehlt: "10⁴ Silhouetten: die Welt trägt " + z.n + " Bewohner (stadt-voll); Klon-Paare ab 30 m unter ihnen " + z.klone30 });
            });
            await K.schritt(5, async () => K.nicht(5, { n: z.n, fehlt: "keine Megastadt: " + z.n + " Bewohner (Soll 10⁵–10⁶), keine Stunde Spielzeit im Deckel" }));
            await K.schritt(6, async () => K.nicht(6, { n: z.regionen.length, fehlt: "kein Kontinent: " + z.n + " Bewohner in " + z.regionen.length + " Region(en) (Soll 10⁷, N = 200 Orte)" }));
            await K.schritt(7, async () => K.nicht(7, { n: z.n, fehlt: "kein Planet über Generationen: " + z.n + " Leiber (Soll 10⁹–10¹⁰); gleiche Genome unter ihnen " + z.genomPaare }));
            await K.schritt(3, async () => {
                if (z.n < 1000) return K.nicht(3, { n: z.n, fehlt: "10³ eigene Leiber in einer Stadt: die Welt trägt " + z.n });
                const b = await K.bild(3, z.posen.ueber, { wahl: 0 });
                K.auge(3, { bild: b.datei, pose: "stadt-voll Third: Mitte der 100 nächsten Bewohner, Kamera 10 m hoch und 17,3 m südlich, Blick auf die Mitte", mass: z.n + " Bewohner in der Stadt · " + z.gestaltenNah + " Gestalten unter den 100 nächsten" });
            });
            // S1 AM GESETZ (der Fächer, stationen/faecher.js): 20 Saaten × 10 Leiber (LEIBER_AN) — je Paar derselben Gestalt der Abstand
            // ihrer nahen Leiber auf 2 m (720 px, fov 60°: 1 px = 3,2 mm); ein ZWILLING trägt dieselbe Gestalt, unter 1 px und dieselben
            // fünf Farben. Zwillinge im Gesetz → „Umfang nicht erzeugbar“; sonst die Zahl-Hälfte am Bild, das Panel urteilt
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.LEIBER_AN, export: "stamm/siedlung-bewohner.js:452 _bewohnerGestalten + :557 _bewohnerGenome", leser: "stamm/siedlung-bewohner.js:607" },
                    adressen: { saaten: 20 },
                    mit: { nH: 60, n: 10, hPx: 720, fov: 60, dM: 2 },
                    masse: {
                        leiber: { wie: "summe", feld: "n" },
                        paare: { wie: (v, aus) => aus.reduce((s, x) => s + (x.w.n * (x.w.n - 1)) / 2, 0) },
                        gleicheGestalt: { wie: "summe", feld: "paareG" },
                        minPx: { wie: "min", feld: "minPx" },
                        formGleich: { wie: "summe", feld: "formGleich" },
                        zwillinge: { wie: "summe", feld: "zwillinge" },
                        kopfGleich: { wie: "summe", feld: "kopfGleich" },
                        saatenMitGleich: { wie: (v, aus) => aus.filter((x) => x.w.paareG > 0).length },
                    },
                    schlecht: { feld: "minPx", richtung: "min" },
                    pose: (a, w) => "Saat " + a.saat + ": das Paar " + w.paar[0] + "↔" + w.paar[1] + " der zehn, dieselbe Gestalt, " + w.minPx + " px auf 2 m, " + w.paar[2] + " von 5 Farben verschieden",
                    ungemessen: ["das Bild der zehn auf 2 m (Prüfer findet 0 gleiche Paare): ungemessen bis zum Gerät (die Bildpflicht braucht die Karte und das Panel)"],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Verschieden S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W));
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "10 unterscheidbare Leiber: " + R.fehlt });
                if (W.zwillinge > 0)
                    return K.nicht(1, { n: W.zwillinge, fehlt: "10 nah unterscheidbare Leiber: " + W.zwillinge + " Zwillinge (dieselbe Gestalt, < 1 px auf 2 m, dieselben Farben) unter " + W.paare + " Paaren an " + R.gemessen + " Saaten (stamm/siedlung-bewohner.js:557)" });
                const b = await K.bild(1, z.posen.zehn, { wahl: 0 });
                K.auge(1, {
                    bild: b.datei,
                    pose: "stadt-voll am Markt: 2 m hinter dem nächsten Bewohner draußen, Augenhöhe 1,6 m, Blick auf die Mitte der zehn nächsten",
                    mass:
                        "Fächer " + R.gemessen + " Saaten × 10: Zwillinge " + W.zwillinge + ", kleinster Abstand " + W.minPx + " px auf 2 m; dasselbe Gesicht und derselbe Haarschnitt (eine Gestalt) " + W.gleicheGestalt + " von " + W.paare + " Paaren in " + W.saatenMitGleich +
                        " Saaten, dazu Haut und Haar gleich " + W.kopfGleich + " · am Ort: Gestalten unter den 10 nächsten " + z.gestalten10 + ", Paare < 1 px " + z.paare10,
                });
            });
        },
        sprossen: {
            1: { auge: { pose: "stadt-voll am Markt, 2 m hinter dem nächsten Bewohner, Blick auf die Mitte der zehn nächsten", vorbild: "Foto von 10 Passanten auf einem Marktplatz aus 2 m: keine zwei gleich (Prüfer findet 0 gleiche Paare)" } },
            2: { umfang: { soll: 100, wort: "Bewohner im Third gezählt" }, masse: [{ key: "paare", wort: "Paare unter 1 px Gestalt-Distanz", soll: 0, richtung: "≤" }] },
            3: { auge: { pose: "stadt-voll: Markt aus 20 m (10 m hoch, 17,3 m südlich der Mitte der 100 nächsten)", vorbild: "Wiedererkennung einer gezeigten Person unter 100 auf einem realen Platz-Foto (Prüfer ≥ 90 %)" } },
            4: {
                umfang: { soll: 10000, wort: "Silhouetten im Bild" },
                masse: [{ key: "klone", wort: "Klon-Paare ab 30 m", soll: 0, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "die Welt trägt höchstens 1092 Bewohner (stadt-voll), 10⁴ Silhouetten nicht",
            },
            5: { auge: { pose: "keine: die Megastadt fehlt", vorbild: "Wiedererkennung nach 1 h an Gesicht, Gang, Tracht (≥ 95 %, Gang allein ≥ 60 % aus 10)" }, erwartet: "nicht", fehlt: "keine Megastadt mit 10⁵–10⁶ Bewohnern" },
            6: { auge: { pose: "keine: der Kontinent fehlt", vorbild: "Gesichter realer Regionen (Prüfer ordnet Gesicht ↔ Region ≥ 2× Basisrate)" }, erwartet: "nicht", fehlt: "kein Kontinent mit 10⁷ Bewohnern, N = 200 Orte" },
            7: {
                umfang: { soll: 1000, wort: "Zufallssamen weltweit über Generationen" },
                masse: [{ key: "kollision", wort: "Kollisionen", soll: 0, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "kein Planet mit 10⁹–10¹⁰ Leibern über Generationen",
            },
        },
        proben: {
            2: [{ name: "drei Klon-Paare unter den 100 — ROT am Maß", j: { leiter: "mensch.leib.verschieden", adapter: KARTE, sprossen: { 2: { art: "zahl", n: 100, werte: { paare: 3 } } } }, gruen: false, zahl: /ROT an Paare unter 1 px Gestalt-Distanz 3 verfehlt ≤ 0/ }],
        },
    }),

    // ═══ DAS GESICHT NAH: der Kopf des Spielers an zehn Samen (das Werkzeug der Tafel mensch-kopf), die Bewohner auf 2 m im Dorf ═══
    F.leiter("mensch.leib.gesicht", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "stamm/netz-portal.js", "foundry-core.js", "scripts/lib/abnahme-urteil.cjs", "scripts/lib/gesicht-proben.cjs"],
        seite: { ZENSUS, PRAEGEN },
        messe: async (H, K) => {
            const welt = (name, arg, ms) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms);
            K.sicht = "third";
            await K.messort("dorf");
            const z = await welt("ZENSUS", { nah: 10 }, 30000);
            H.zeile("Zensus dorf: " + z.n + " Bewohner · Alter " + JSON.stringify(z.alterJ) + " J. · im Gespräch (treff) " + z.treff);
            await K.schritt(3, async () => {
                const a = z.alterJ || [0, 0];
                if (z.n >= 100 && a[0] <= 1 && a[1] >= 99) {
                    const b = await K.bild(3, z.posen.gesicht, { wahl: 0 });
                    return K.auge(3, { bild: b.datei, pose: "dorf: 2 m vor dem Gesicht des nächsten Bewohners", mass: "Alter " + a[0].toFixed(0) + "–" + a[1].toFixed(0) + " J." });
                }
                K.nicht(3, { n: z.n, fehlt: "Alter nur " + a[0].toFixed(0) + "–" + a[1].toFixed(0) + " J. (Genom alter 0,05–0,5 im Dial 18–80 J.), kein Säugling, kein Greis; " + z.n + " Gesichter am Ort" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: z.treff, fehlt: "10³ Gesichter im Gespräch: " + z.treff + " im Akt treff (von " + z.n + "), kein Mienenspiel (Freude, Furcht, Schmerz, Ekel)" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.n, fehlt: "10⁴ Gesichter in jedem Licht: die Welt trägt höchstens 1092 Bewohner, am Ort " + z.n }));
            await K.schritt(6, async () => K.nicht(6, { n: z.n, fehlt: "jeder Mensch und jedes denkende Wesen: " + z.n + " Menschen-Gesichter am Ort, keine fremde Art mit Gesicht" }));
            await K.schritt(2, async () => {
                if (!z.posen.gesicht) return K.nicht(2, { n: 0, fehlt: "kein Bewohner draußen am Dorf" });
                const b = await K.bild(2, z.posen.gesicht, { wahl: 0 });
                K.auge(2, { bild: b.datei, pose: "dorf Third: 2 m vor dem Gesicht des nächsten Bewohners draußen, auf Kopfhöhe (0,93 × Höhe), Blick auf den Kopf", mass: z.draussen + " Bewohner draußen am Ort · der Nächste " + JSON.stringify(z.posen.A || {}) });
            });
            await K.messort("wiese");
            await K.schritt(1, async () => {
                const band = await K.welt("const S = window.__koerperCore.KOPF_SOLL; return { augeFrei: S.augeFrei, lippeL: S.lippeL, lippeA: S.lippeA, hoehleL: S.hoehleL, hoehleA: S.hoehleA, haarDeckung: S.haarDeckung };");
                const zuege = Object.keys(band);
                const abdruecke = [];
                const zeilen = [];
                let n = 0;
                let rot = 0;
                try {
                    for (let i = 0; i < 10 && H.rest() > 9; i++) {
                        const g = await welt("PRAEGEN", { same: "k2-gesicht:" + i }, 20000);
                        const datei = String(H.AUS).replace(/\.json$/i, "") + "-S1-" + i + ".png";
                        const begleit = [datei, datei.replace(/\.png$/i, "-rot.png")].map((f) => f.replace(/\.png$/i, "") + ".abnahme.json");
                        for (const f of begleit) H.fs.rmSync(f, { force: true });
                        try {
                            await H.wb("/bild", { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0, gesicht: 0.7, wahl: 0, spieler: true, klasse: "^spieler:kopf/", datei, w: 1280, h: 720 }, 40000);
                        } catch (e) {
                            zeilen.push(i + " Bild: " + String((e && e.message) || e).slice(0, 80));
                        }
                        const f = begleit.find((x) => H.fs.existsSync(x));
                        const ge = f ? (JSON.parse(H.fs.readFileSync(f, "utf8")).klasse || {}).gesicht : null;
                        if (!ge) {
                            zeilen.push(i + ": kein Gesicht im Begleit-JSON");
                            continue;
                        }
                        n++;
                        abdruecke.push(g.abdruck);
                        const aus = zuege.filter((k) => !(typeof ge[k] === "number" && ge[k] >= band[k][0] && ge[k] <= band[k][1]));
                        if (aus.length) rot++;
                        zeilen.push(i + " (" + g.hoeheM + " m): " + (aus.length ? aus.map((k) => k + " " + ge[k]).join(", ") : "im Band"));
                    }
                } finally {
                    await welt("PRAEGEN", { zurueck: true }, 20000);
                }
                // der Umfang zählt jeden Samen EINMAL: zehn Bilder desselben Gusses sind ein Same (die Attrappe fällt am Umfang)
                const eigen = new Set(abdruecke).size;
                K.zahl(1, {
                    n: eigen,
                    werte: { rot },
                    beleg: n + " Köpfe gemessen, " + eigen + " eigene Güsse · " + zeilen.join(" · "),
                    taeter: rot ? "der Kopf des Mensch-Gusses (koerper-core.js KOPF_SOLL, foundry-core.js Gesicht)" : eigen < n ? "die Prägung gießt nicht neu (stamm/netz-portal.js _praegungSetzen)" : null,
                });
            });
        },
        sprossen: {
            1: {
                umfang: { soll: 10, wort: "Samen am Kopf gemessen, je eigener Guss (wiese Third, Gesicht 0,7 m)" },
                masse: [{ key: "rot", wort: "Samen mit einem Zug außerhalb KOPF_SOLL", soll: 0, richtung: "≤" }],
            },
            2: { auge: { pose: "dorf Third: 2 m vor dem Gesicht des nächsten Bewohners, auf Kopfhöhe", vorbild: "Porträtfoto gleicher Beleuchtung aus 2 m (Prüfer „lebt“ ≥ 50 %)" } },
            3: { auge: { pose: "dorf: 2 m vor dem Gesicht des nächsten Bewohners", vorbild: "Porträts 0–100 Jahre aller Populationen (Altersschätzung, Fehler ≤ 5 J.)" }, erwartet: "nicht", fehlt: "Alter der Bewohner nur ~21–49 J., 0–100 J. nicht" },
            4: { auge: { pose: "keine: kein Gespräch mit Mienenspiel", vorbild: "Fotos der Basis-Emotionen (Ekman), Prüfer ≥ 80 %" }, erwartet: "nicht", fehlt: "10³ Gesichter im Gespräch und unter Last" },
            5: { auge: { pose: "keine: 10⁴ Gesichter fehlen", vorbild: "Porträtfotos je Licht (Mittag, Kerze, Neon, Regen)" }, erwartet: "nicht", fehlt: "10⁴ Gesichter in jedem Licht" },
            6: { auge: { pose: "keine: Ego 0,5 m an jedem denkenden Wesen", vorbild: "Porträtfoto (Blindtest 50 ± 5 %), fremde Arten: Fremdwelt-Probe R10" }, erwartet: "nicht", fehlt: "jeder Mensch und jedes denkende Wesen" },
        },
        proben: {
            1: [
                { name: "zehn Samen, drei aus dem Band — ROT am Kopf", j: { leiter: "mensch.leib.gesicht", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 10, werte: { rot: 3 } } } }, gruen: false, zahl: /ROT an Samen mit einem Zug außerhalb KOPF_SOLL 3 / },
                { name: "die Attrappe: zehn Bilder desselben Gusses = ein Same", j: { leiter: "mensch.leib.gesicht", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 1, werte: { rot: 0 } } } }, gruen: false, zahl: /ROT an Umfang 1 < 10 / },
            ],
        },
    }),

    // ═══ TRACHT UND GESICHT DER MENGE: der Schnitt der Epoche je Siedlung, die Garnituren der vollen Stadt ═══
    F.leiter("mensch.leib.tracht", {
        sek: 45,
        pfad: PFAD,
        seite: { ZENSUS, FAECHER, LEIBER_AN },
        messe: async (H, K) => {
            const welt = (name, arg, ms) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms);
            K.sicht = "third";
            await K.messort("stadt-voll");
            const z = await welt("ZENSUS", { nah: 100 }, 40000);
            const plan = z.siedlungen.map((s) => s.key + " " + s.jahr + " " + s.schnitt + " (" + s.farben + " Farben, " + s.n + " Leute)").join(" · ");
            H.zeile("Tracht: " + plan + " · Schnitte " + z.schnitte.length + " · gleiche Garnituren " + z.garniturPaare);
            await K.schritt(2, async () => {
                if (z.schnitte.length >= 10) {
                    const b = await K.bild(2, z.posen.ueber, { wahl: 0 });
                    return K.auge(2, { bild: b.datei, pose: "stadt-voll: Markt aus 20 m", mass: "Schnitte " + z.schnitte.join(" · ") });
                }
                K.nicht(2, { n: z.schnitte.length, fehlt: "10 Silhouetten-Familien: die Welt zeigt " + z.schnitte.length + " Schnitt(e) (" + z.schnitte.join(" · ") + "), je Siedlung EINER" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: z.siedlungen.length, fehlt: "10³ Gesellschaften: " + z.siedlungen.length + " Siedlung(en) in " + z.regionen.length + " Region(en), keine Lage nach Klima" }));
            await K.schritt(5, async () => {
                if (z.n >= 10000) return K.zahl(5, { n: z.n, werte: { gleich: z.garniturPaare } });
                K.nicht(5, { n: z.n, fehlt: "10⁴ Personen: die Welt trägt " + z.n + "; gleiche Garnituren (Schnitt + Farben) unter ihnen " + z.garniturPaare + " Paare, keine Mode-Front" });
            });
            await K.schritt(6, async () => K.nicht(6, { n: z.epochen.length, fehlt: "jede Epoche × Kultur: am Ort " + z.epochen.length + " Jahrhundert(e) × " + z.regionen.length + " Region(en) (Soll N = 100 Orte × Jahre)" }));
            await K.schritt(7, async () => K.nicht(7, { n: 0, fehlt: "keine Welt ohne Erd-Kultur: 0 Stile ohne Erd-Vorbild (die Trachten des Fachwerks sind Erd-Epochen)" }));
            await K.schritt(3, async () => {
                const b = await K.bild(3, z.posen.ueber, { wahl: 0 });
                K.auge(3, { bild: b.datei, pose: "stadt-voll: Markt aus 20 m (10 m hoch, 17,3 m südlich der Mitte der 100 nächsten)", mass: "Rollen unter den 100 nächsten: " + z.berufe100.length + " (" + z.berufe100.join(", ") + ") · Schnitte unter ihnen " + z.schnitte100 });
            });
            // S1 AM GESETZ (der Fächer): 20 Saaten (LEIBER_AN) — je Saat ihr Jahr, die Tracht ihres Plans (Schnitt und Farben, fachwerk
            // `kleidung` aus EPOCHEN[epocheBei]) und das Fenster der Epoche dieser Tracht. DIE DECKE DES PRÜFERS: wer Schnitt und Farben
            // jeder Tracht kennt und je Tracht das beste Jahrhundert rät (das dichteste Fenster von 200 J. ihrer Saaten), trifft höchstens
            // diesen Anteil ± 1 Jh. — unter 0,7 trägt die Tracht des Gesetzes die Epoche nicht, kein Panel hebt das
            await K.schritt(1, async () => {
                const decke = (sig) => (v, aus) => {
                    const g = {};
                    for (const x of aus) (g[sig(x.w)] = g[sig(x.w)] || []).push(x.w.jahr);
                    let t = 0;
                    for (const J of Object.values(g)) t += Math.max(...J.map((c) => J.filter((y) => y >= c && y <= c + 200).length));
                    return aus.length ? t / aus.length : null;
                };
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.LEIBER_AN, export: "fachwerk-core.js:5295 EPOCHEN[epocheBei].tracht (:4272, :4945) → stamm/siedlung-bewohner.js:452 _bewohnerGestalten", leser: "stamm/siedlung-bewohner.js:458" },
                    adressen: { saaten: 20 },
                    mit: { nH: 60, n: 10 },
                    masse: {
                        decke: { wie: decke((w) => w.schnitt + "|" + w.farben.join(",")) },
                        deckeSchnitt: { wie: decke((w) => w.schnitt) },
                        schnitte: { wie: "verschieden", feld: "schnitt" },
                        paletten: { wie: "verschieden", feld: "farben" },
                        epochen: { wie: "verschieden", feld: "epoche" },
                        abseits: { wie: (v, aus) => aus.filter((x) => x.w.abseits > 100).length },
                        abseitsMax: { wie: "max", feld: "abseits" },
                    },
                    schlecht: { feld: "abseits", richtung: "max" },
                    pose: (a, w) => "Saat " + a.saat + " (" + w.region + ", Jahr " + w.jahr + ") in der Tracht „" + w.epoche + "“ " + w.fenster.join("–") + ": " + w.abseits + " J. außerhalb ihrer Epoche",
                    ungemessen: ["die 20 Bilder der Plätze (Prüfer ordnet Epoche ± 1 Jh.): ungemessen bis zum Gerät (die Bildpflicht braucht die Karte und das Panel)"],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Tracht S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W) + " · " + R.je.map((x) => x.w.saat + ":" + x.w.jahr + ":" + x.w.epoche).join(" "));
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "die Epoche wählt Schnitt und Farbe: " + R.fehlt });
                if (W.decke < 0.7)
                    return K.nicht(1, {
                        n: Math.round(W.decke * R.gemessen),
                        fehlt: "Epoche ± 1 Jh. aus der Tracht: die Decke eines Prüfers, der jede Tracht kennt, ist " + W.decke.toFixed(2) + " (Soll ≥ 0,7) an " + R.gemessen + " Saaten — " + W.abseits + " tragen die Tracht einer Epoche > 100 J. fern (bis " + W.abseitsMax + " J.; fachwerk-core.js:4945 epocheBei: die erste der Achse ist der Boden)",
                    });
                const b = await K.bild(1, z.posen.zehn, { wahl: 0 });
                K.auge(1, { bild: b.datei, pose: "stadt-voll am Markt: 2 m hinter dem nächsten Bewohner, Blick auf die Mitte der zehn nächsten", mass: "Decke " + W.decke.toFixed(2) + " (Schnitt allein " + W.deckeSchnitt.toFixed(2) + "), " + W.schnitte + " Schnitte, " + W.paletten + " Paletten an " + R.gemessen + " Saaten · " + plan });
            });
        },
        sprossen: {
            1: {
                auge: { pose: "stadt-voll am Markt, 2 m hinter dem nächsten Bewohner", vorbild: "historische Platz-Bilder je Epoche (20 Saaten: Prüfer ordnet Epoche ± 1 Jh. ≥ 0,7)" },
                erwartet: "nicht",
                fehlt: "die Tracht trägt die Epoche nicht: Decke des Prüfers 0,65 an 20 Saaten, 10 in der Tracht einer Epoche > 100 J. fern (fachwerk epocheBei)",
            },
            2: { auge: { pose: "stadt-voll: Markt aus 20 m", vorbild: "Trachten realer Regionen (Rock, Mantel, Tunika, Kimono, Sari, Kopfbedeckung; Zuordnung ≥ 60 %)" }, erwartet: "nicht", fehlt: "je Siedlung EIN Schnitt, keine 10 Silhouetten-Familien" },
            3: { auge: { pose: "stadt-voll: Markt aus 20 m (10 m hoch, 17,3 m südlich)", vorbild: "Marktszene mit Bauer, Händler, Adel, Soldat, Priester (Stand-Rateaufgabe ≥ 70 %)" } },
            4: { auge: { pose: "keine: 10³ Gesellschaften fehlen", vorbild: "Trachtenatlas / Ethnographic Atlas (plausibel ≥ 0,9)" }, erwartet: "nicht", fehlt: "10³ Gesellschaften" },
            5: {
                umfang: { soll: 10000, wort: "Personen" },
                masse: [{ key: "gleich", wort: "identische Garnituren (Paare)", soll: 0, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "die Welt trägt höchstens 1092 Bewohner, 10⁴ nicht; keine Mode über Handelswege",
            },
            6: { auge: { pose: "keine: N = 100 Orte × Jahre fehlen", vorbild: "Trachten jeder Epoche × Kultur der Erde (Blind-Zuordnung ≥ 0,7)" }, erwartet: "nicht", fehlt: "jede Epoche × Kultur der Erde" },
            7: { auge: { pose: "keine: Welten ohne Erd-Kultur fehlen", vorbild: "kohärente Fremd-Kulturen ohne Erd-Vorbild (≥ 20 Stile, Person → Volk ≥ 0,8)" }, erwartet: "nicht", fehlt: "Zukünfte und fremde Völker" },
        },
        proben: {
            5: [{ name: "10⁴ Personen mit 12 gleichen Garnituren — ROT am Maß", j: { leiter: "mensch.leib.tracht", adapter: KARTE, sprossen: { 5: { art: "zahl", n: 10000, werte: { gleich: 12 } } } }, gruen: false, zahl: /ROT an identische Garnituren \(Paare\) 12 / }],
        },
    }),

    // ═══ STOFF IN BEWEGUNG: das Regen-Paar am Bewohner im Dorf, dann der Spieler an der Mess-Wiese (16 Posen × 10 Samen, Lauf-Reihe) ═══
    F.leiter("mensch.leib.stoff", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "stamm/koerper-fahrt.js", "stamm/netz-portal.js", "foundry-core.js", "scripts/lib/ausgabe-aufnahme.cjs"],
        seite: { ZENSUS, PRAEGEN, STOFF, WETTER },
        messe: async (H, K) => {
            const welt = (name, arg, ms) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms);
            K.sicht = "third";
            await K.messort("dorf");
            const z = await welt("ZENSUS", { nah: 10 }, 30000);
            await K.schritt(3, async () => K.nicht(3, { n: Math.min(z.draussen, 4), fehlt: "10 Nahe mit Lagen: die Nah-Wahl trägt 4 Leiber, je Kleid-Zone EIN Stoff um seine Dicke über der Haut (kein Hemd unter Mantel unter Umhang)" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.draussen, fehlt: "10³–10⁴ Stoffe im Bild: am Ort " + z.draussen + " Bewohner draußen (die Welt höchstens 1092)" }));
            await K.schritt(6, async () => K.nicht(6, { n: z.n, fehlt: "kein Stadion mit 10⁵: am Ort " + z.n + " Bewohner" }));
            await K.schritt(4, async () => {
                if (!z.posen.leib) return K.nicht(4, { n: 0, fehlt: "kein Bewohner draußen am Dorf" });
                const vor = await K.bild(4, z.posen.leib, { wahl: 0 });
                let nach = "—";
                try {
                    const w = await welt("WETTER", { wort: "rainy" });
                    const datei = String(H.AUS).replace(/\.json$/i, "") + "-S4-regen.png";
                    const a = await H.wb("/bild", Object.assign({ datei, w: 1280, h: 720, wahl: 0 }, z.posen.leib), 60000).catch((e) => ({ fehler: String(e.message || e) }));
                    nach = [datei, datei.replace(/\.png$/i, "-rot.png")].find((f) => H.fs.existsSync(f)) || "kein Bild (" + String(a && a.fehler).slice(0, 60) + ")";
                    nach = H.path.basename(nach) + " (Wetter " + w + ")";
                } finally {
                    await welt("WETTER", { wort: "sunny" });
                }
                K.auge(4, { bild: vor.datei, pose: "dorf Third: 3 m vor dem nächsten Bewohner draußen, 1,5 m hoch, Blick auf seine Mitte (0,9 m)", mass: "Paar: trocken " + H.path.basename(vor.datei) + " · Regen " + nach + " · " + JSON.stringify(z.posen.A || {}) });
            });
            await K.messort("wiese");
            const reihe = { n: 0 };
            await K.schritt(1, async () => {
                let posen = 0;
                let durch = 0;
                let alle = 0;
                const abdruecke = [];
                const zeilen = [];
                try {
                    for (let i = 0; i < 10 && H.rest() > 8; i++) {
                        const g = await welt("PRAEGEN", { same: "k2-stoff:" + i }, 20000);
                        const s = await welt("STOFF", { reihe: i === 0 }, 30000);
                        if (s.fehlt) {
                            zeilen.push(i + ": " + s.fehlt);
                            continue;
                        }
                        // der Umfang zählt die Posen jedes Samens EINMAL: ein Guss, der schon gemessen ist, trägt keine Posen bei
                        if (!abdruecke.includes(g.abdruck)) posen += s.posen;
                        alle += s.posen;
                        durch += s.durch;
                        abdruecke.push(g.abdruck);
                        zeilen.push(i + " (" + g.hoeheM + " m, " + s.paare + " Paare Haut↔Tuch): " + s.durch);
                        if (s.reihe) Object.assign(reihe, s.reihe, { n: s.tuch && s.vorlage ? 1 : 0, tuch: s.tuch, vorlage: s.vorlage });
                    }
                } finally {
                    await welt("PRAEGEN", { zurueck: true }, 20000);
                }
                K.zahl(1, {
                    n: posen,
                    werte: { durch },
                    beleg: alle + " Posen an " + abdruecke.length + " Samen, " + new Set(abdruecke).size + " eigene Güsse · " + zeilen.join(" · "),
                    taeter: durch ? "das Tuch über der Haut (koerper-core.js tuchTakt · foundry-core.js Stoff aus der Haut)" : posen < alle ? "die Prägung gießt nicht neu (stamm/netz-portal.js _praegungSetzen)" : null,
                });
            });
            await K.schritt(2, async () => {
                if (reihe.verzugMs === undefined) throw new Error("die Lauf-Reihe des ersten Samens fehlt");
                K.zahl(2, {
                    n: reihe.n,
                    werte: { verzug: reihe.verzugMs == null ? 0 : reihe.verzugMs, durch: reihe.durch },
                    beleg: "Tuch im Takt " + reihe.tuch + " · Vorlage " + reihe.vorlage + " · " + reihe.ecken + " Saum-Ecken · Abweichung von der starren Lage " + reihe.devCm + " cm",
                    taeter: !(reihe.verzugMs > 0) ? "der Löser des Tuchs (koerper-core.js tuchTakt: ruht das Tuch, trägt es seine Abweichung starr)" : null,
                });
            });
        },
        sprossen: {
            1: {
                umfang: {
                    soll: 160,
                    wort: "Posen × Samen gemessen, je eigener Guss (8 Gehen + 8 Lauf je Same, 10 Samen)",
                    herkunft: "der Richter „16 Posen × 10 Samen“: 16 · 10 = 160 Posen, jeder Same ein eigener Guss",
                },
                masse: [{ key: "durch", wort: "Durchstiche der Haut durch den Stoff", soll: 0, richtung: "≤" }],
            },
            2: {
                umfang: { soll: 1, wort: "Spieler mit Tuch im Takt (Löser und Vorlage)" },
                masse: [
                    { key: "verzug", wort: "Verzug des Saums (ms)", soll: 0, richtung: ">" },
                    { key: "durch", wort: "Durchdringungen in der Lauf-Reihe", soll: 0, richtung: "≤" },
                ],
            },
            3: { auge: { pose: "keine: zehn Nahe mit Lagen fehlen", vorbild: "Video Hemd unter Mantel unter Umhang im Wind (Prüfer „echt“ ≥ 60 %)" }, erwartet: "nicht", fehlt: "10 Nahe mit Lagen (Nah-Wahl 4 Leiber, eine Lage je Zone)" },
            4: { auge: { pose: "dorf Third: 3 m vor dem nächsten Bewohner, 1,5 m hoch", vorbild: "Fotopaar trocken/nass derselben Kleidung; Verschleiß Bauer ↔ Adel (≥ 80 %)" } },
            5: { auge: { pose: "keine: 10³–10⁴ Stoffe im Bild fehlen", vorbild: "Video eines vollen Platzes im Wind (Verwechslung ≥ 40 %)" }, erwartet: "nicht", fehlt: "10³–10⁴ Stoffe im Bild" },
            6: { auge: { pose: "keine: das Stadion fehlt", vorbild: "Filmaufnahme eines Stadions (Blindtest 50 ± 5 %)" }, erwartet: "nicht", fehlt: "10⁵ im Stadion" },
        },
        proben: {
            1: [
                { name: "160 Posen, 7 Durchstiche — ROT am Stoff", j: { leiter: "mensch.leib.stoff", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 160, werte: { durch: 7 } } } }, gruen: false, zahl: /ROT an Durchstiche der Haut durch den Stoff 7 / },
                { name: "die Attrappe: zehnmal derselbe Guss = 16 Posen", j: { leiter: "mensch.leib.stoff", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 16, werte: { durch: 0 } } } }, gruen: false, zahl: /ROT an Umfang 16 < 160 / },
            ],
            2: [{ name: "das starre Tuch: Verzug 0 — ROT am Saum", j: { leiter: "mensch.leib.stoff", adapter: KARTE, sprossen: { 2: { art: "zahl", n: 1, werte: { verzug: 0, durch: 0 } } } }, gruen: false, zahl: /ROT an Verzug des Saums \(ms\) 0 verfehlt > 0/ }],
        },
    }),

    // ═══ BEWEGUNGS-AUSDRUCK: Akt und Gemüt der zehn am Markt, was die Welt an Gang, Gestik und Abstand trägt ═══
    F.leiter("mensch.leib.ausdruck", {
        sek: 45,
        pfad: PFAD,
        seite: { ZENSUS, FAECHER, HALTUNG_AN },
        messe: async (H, K) => {
            const welt = (name, arg, ms) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms);
            K.sicht = "third";
            await K.messort("stadt-voll");
            const z = await welt("ZENSUS", { nah: 100 }, 40000);
            H.zeile("Ausdruck: Akte " + JSON.stringify(z.akte) + " · unter Last/verletzt " + z.last);
            await K.schritt(2, async () => {
                if (z.last > 0 && z.n >= 100) {
                    const b = await K.bild(2, z.posen.ueber, { wahl: 0 });
                    return K.auge(2, { bild: b.datei, pose: "stadt-voll: Markt aus 20 m", mass: "unter Last/verletzt " + z.last });
                }
                K.nicht(2, { n: z.last, fehlt: "10² Gänge nach Alter, Bau, Last, Verletzung: " + z.last + " Bewohner unter Last oder verletzt (von " + z.n + "), Alter nur " + (z.alterJ ? z.alterJ.map((x) => x.toFixed(0)).join("–") : "—") + " J." });
            });
            await K.schritt(3, async () => K.nicht(3, { n: z.treff, fehlt: "10³ im Gespräch: " + z.treff + " im Akt treff, keine Gestik (Gruß, Zeigen, Streit, Gebet, Verbeugung)" }));
            await K.schritt(4, async () => K.nicht(4, { n: z.regionen.length, fehlt: "10⁴ mit Gestik je Kultur: " + z.n + " Bewohner in " + z.regionen.length + " Kultur(en)" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.n, fehlt: "10⁵ mit eigenem Gang und Gestus: die Welt trägt " + z.n }));
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "fremde Leiber und Kulturen: die Bewohner sind EINE Art (Mensch)" }));
            // S1 AM GESETZ (der Fächer): 7 Akte des Tags × 5 Anlässe im Gedächtnis (HALTUNG_AN) — welche Haltungen trägt das Gesetz im
            // Stand und im Gang, wie weit liegen sie auseinander (rad, die größte Achse), und welchen Anteil der Akte unterscheidet eine
            // Haltung (die Decke des Prüfers am Bewohner ohne Rolle). DAS BAND (Coulson 2004, J. Nonverbal Behav. 28: 176 statische
            // Haltungen, Treffer bis > 90 % für Zorn und Trauer, Ekel nahe 0, Furcht und Überraschung verwechselt): eine Haltung ist so
            // gut wie ihr Abstand zur nächsten. Fehlt ein ganzer Grund nicht, nennt die Probe die Zahl-Hälfte am Bild
            await K.schritt(1, async () => {
                const ohne = (aus) => aus.filter((x) => x.a.zeit === "ohne");
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.HALTUNG_AN, export: "stamm/siedlung-bewohner.js:2725 _bewohnerGemuet (koerper-core.js:5484 tagesHaltung) → stamm/koerper-leib.js:3096 _koerperMotionName", leser: "stamm/koerper-leib.js:3091" },
                    // die Akte des Tags (koerper-core.js:5677 tagesPlan) × die Anlässe im Gedächtnis des Leibs (s. HALTUNG_AN)
                    adressen: { orte: ["schlaf", "morgen", "arbeit", "mittag", "besuch", "spiel", "abend"], zeiten: ["ohne", "gewalt", "geschlagen", "gefuettert", "spoken"] },
                    masse: {
                        stand: { wie: (v, aus) => Array.from(new Set(aus.flatMap((x) => x.w.stand))) },
                        geht: { wie: (v, aus) => Array.from(new Set(aus.flatMap((x) => x.w.geht))) },
                        abstand: {
                            wie: (v, aus) => {
                                const P = Object.assign({}, ...aus.map((x) => x.w.profil));
                                const L = Array.from(new Set(aus.flatMap((x) => x.w.stand))).filter((n) => P[n]);
                                let m = null;
                                for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
                                    const d = Math.max(...P[L[i]].map((x, k) => Math.abs(x - P[L[j]][k])));
                                    if (m == null || d < m.d) m = { d: +d.toFixed(3), paar: L[i] + "↔" + L[j] };
                                }
                                return m;
                            },
                        },
                        deckeStand: { wie: (v, aus) => new Set(ohne(aus).map((x) => x.w.je.wohnhaus.stand)).size / ohne(aus).length },
                        deckeGang: { wie: (v, aus) => new Set(ohne(aus).map((x) => x.w.je.wohnhaus.geht)).size / ohne(aus).length },
                        furcht: { wie: (v, aus) => aus.filter((x) => x.a.zeit !== "ohne" && x.w.je.wohnhaus.stand === "fear").length },
                        nGang: { wie: (v, aus) => new Set(aus.flatMap((x) => x.w.geht)).size },
                    },
                    schlecht: { feld: "geht.length", richtung: "min" },
                    pose: (a, w) => "Akt " + a.ort + ", Anlass " + a.zeit + ": im Stand " + w.stand.join("/") + ", im Gang " + w.geht.join("/") + " — der Gehende trägt keinen Akt",
                    ungemessen: ["das Bild der zehn am Markt (Prüfer errät Akt/Gemüt ≥ 60 %): ungemessen bis zum Gerät; der Anteil der Gehenden unter den zehn: in der warmen Welt ungemessen"],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Ausdruck S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W));
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "Haltung nach Akt und Gemüt: " + R.fehlt });
                const b = await K.bild(1, z.posen.zehn, { wahl: 0 });
                K.auge(1, {
                    bild: b.datei,
                    pose: "stadt-voll am Markt: 2 m hinter dem nächsten Bewohner, Blick auf die Mitte der zehn nächsten",
                    mass:
                        "Gesetz: im Stand " + W.stand.length + " Haltungen (" + W.stand.join(", ") + "), nächste " + (W.abstand ? W.abstand.paar + " " + W.abstand.d + " rad" : "—") + "; im Gang " + W.nGang + " (" + W.geht.join(", ") + ") für jeden Akt und Anlass; Decke Akt " + W.deckeStand.toFixed(2) +
                        " im Stand, " + W.deckeGang.toFixed(2) + " im Gang · am Ort: Akte " + JSON.stringify(z.akt10) + " · Haltung " + JSON.stringify(z.haltung10),
                });
            });
        },
        sprossen: {
            1: { auge: { pose: "stadt-voll am Markt, 2 m hinter dem nächsten Bewohner", vorbild: "Silhouetten realer Menschen bei Arbeit, Müdigkeit, Furcht (Prüfer errät Akt/Gemüt ≥ 60 %)" } },
            2: { auge: { pose: "stadt-voll: Markt aus 20 m", vorbild: "Lichtpunkt-Gang (Johansson): Alter ± 15 J., verletzt/beladen ≥ 80 %" }, erwartet: "nicht", fehlt: "kein Gang unter Last oder Verletzung" },
            3: { auge: { pose: "keine: Gestik im Gespräch fehlt", vorbild: "Ganzkörper-Gestik realer Gespräche (≥ 70 %)" }, erwartet: "nicht", fehlt: "10³ Gesten im Gespräch" },
            4: { auge: { pose: "keine: Kulturen der Gestik fehlen", vorbild: "Proxemik-Daten (Sorokowska 2017, ≤ 20 %), Kultur aus Gestik ≥ 50 %" }, erwartet: "nicht", fehlt: "10⁴ mit Gestik je Kultur" },
            5: { auge: { pose: "keine: 10⁵ fehlen", vorbild: "Feldaufnahme eines Platzes gleicher Kultur (Verwechslung ≥ 50 %)" }, erwartet: "nicht", fehlt: "10⁵ mit eigenem Gang und Gestus" },
            6: { auge: { pose: "keine: fremde Arten mit Kultur fehlen", vorbild: "Ausdruck nach Bau und Kultur der Art (N = 100 Arten, ≥ 60 %)" }, erwartet: "nicht", fehlt: "fremde Leiber und Kulturen" },
        },
        proben: { 1: ohneBild("mensch.leib.ausdruck", 1) },
    }),

    // ═══ SPUR AM LEIB: das Alter und die Berufe der vollen Stadt, was die Welt an Wunde, Zeichen und Biografie trägt ═══
    F.leiter("mensch.leib.spur", {
        sek: 45,
        pfad: PFAD,
        seite: { ZENSUS, FAECHER, LEIBER_AN },
        messe: async (H, K) => {
            const welt = (name, arg, ms) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms);
            K.sicht = "third";
            await K.messort("stadt-voll");
            const z = await welt("ZENSUS", { nah: 10 }, 40000);
            const a = z.alterJ || [0, 0];
            H.zeile("Spur: Alter " + a.map((x) => x.toFixed(1)).join("–") + " J. · Berufe " + z.berufe.length + " (" + z.berufe.join(", ") + ") · Wunde/Narbe " + z.last);
            await K.schritt(2, async () => {
                if (z.berufe.length >= 10) {
                    const b = await K.bild(2, z.posen.leib, { wahl: 0 });
                    return K.auge(2, { bild: b.datei, pose: "stadt-voll: 3 m vor dem nächsten Bewohner", mass: "Berufe " + z.berufe.join(", ") });
                }
                K.nicht(2, { n: z.berufe.length, fehlt: "10 Berufe am Leib: " + z.berufe.length + " Berufe/Rollen (" + z.berufe.join(", ") + "), keine Spur der Arbeit an Haut und Händen" });
            });
            await K.schritt(3, async () => K.nicht(3, { n: z.last, fehlt: "keine Verletzung live: " + z.last + " Bewohner mit Wunde, Verband oder Narbe" }));
            await K.schritt(4, async () => K.nicht(4, { n: z.regionen.length, fehlt: "10² Kulturen mit Zeichen: " + z.regionen.length + " Kultur(en), kein Schmuck, keine Tätowierung, Bemalung, Implantat" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.last, fehlt: "keine Biografie im Leib: " + z.last + " Leiber mit Bruch, Pocken, Narbe, Prothese" }));
            await K.schritt(6, async () => K.nicht(6, { n: z.n, fehlt: "jeder Mensch eines Planeten: " + z.n + " Leiber, keine Spur" }));
            // S1 AM GESETZ (der Fächer): 20 Saaten × 60 Leiber (LEIBER_AN) — die eigenen Jahre jedes Bewohners (sein Genom, koerper
            // ALTER_GESETZ über die Pyramide seiner Epoche) gegen die Jahre, die sein Leib ZEIGT (die Form seiner Gestalt: das Weiche
            // samt Alter ist G.dK, stamm/siedlung-bewohner.js:607). Der Prüfer schätzt das Alter am Leib (Fehler ≤ 15 J.): ein Leib, der
            // > 15 J. neben seinem Alter steht, fällt auch dem fehlerlosen Prüfer. Trägt das Gesetz die Achse und der Leib nicht, ist das
            // ein fehlender Leser
            await K.schritt(1, async () => {
                const P = (aus) => aus.flatMap((x) => x.w.leute);
                const E = (aus) => P(aus).filter((p) => p.J >= 18);
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.LEIBER_AN, export: "stamm/koerper-leib.js:12 _rollHumanoidGenome (koerper-core.js:1782 epochenAlter, :1804 alterLeib) → stamm/siedlung-bewohner.js:580 die Gestalt", leser: "stamm/siedlung-bewohner.js:607" },
                    adressen: { saaten: 20 },
                    mit: { nH: 60, n: 60 },
                    masse: {
                        leiber: { wie: "summe", feld: "n" },
                        jMin: { wie: (v, aus) => Math.min(...P(aus).map((p) => p.J)) },
                        jMax: { wie: (v, aus) => Math.max(...P(aus).map((p) => p.J)) },
                        zeigtMax: { wie: (v, aus) => Math.max(...P(aus).map((p) => p.JG)) },
                        erwachsene: { wie: (v, aus) => E(aus).length },
                        daneben: { wie: (v, aus) => E(aus).filter((p) => Math.abs(p.JG - p.J) > 15).length },
                        danebenMax: { wie: (v, aus) => +Math.max(...E(aus).map((p) => Math.abs(p.JG - p.J))).toFixed(1) },
                        fehlerMittel: { wie: (v, aus) => +(E(aus).reduce((s, p) => s + Math.abs(p.JG - p.J), 0) / E(aus).length).toFixed(1) },
                        alt: { wie: (v, aus) => E(aus).filter((p) => p.J >= 60).length },
                        altJung: { wie: (v, aus) => E(aus).filter((p) => p.J >= 60 && p.JG < 45).length },
                        grauJung: { wie: (v, aus) => P(aus).filter((p) => p.J < 40 && /grey|white|platinum/.test(p.f[1])).length + " von " + P(aus).filter((p) => p.J < 40).length },
                    },
                    schlecht: { feld: "alterDaneben", richtung: "max" },
                    pose: (a, w) => {
                        const p = w.leute.filter((x) => x.J >= 18).sort((x, y) => Math.abs(y.JG - y.J) - Math.abs(x.JG - x.J))[0];
                        return "Saat " + a.saat + ": der Bewohner mit " + (p ? p.J + " J., der Leib seiner Gestalt zeigt " + p.JG + " J." : "—") + " (Gestalten " + w.gestaltJ.join(", ") + " J.)";
                    },
                    ungemessen: ["die Altersschätzung des Prüfers am Bild (Fehler ≤ 15 J.): ungemessen bis zum Gerät (die Bildpflicht braucht die Karte und das Panel)"],
                    ms: Math.max(3000, Math.floor((H.rest() - 4) * 1000)),
                });
                const W = R.werte;
                H.zeile("Spur S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W) + " · am Ort: Alter " + a.map((x) => x.toFixed(0)).join("–") + " J.");
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "Alter als Achse 18–80: " + R.fehlt });
                if (!(W.jMin <= 18 && W.jMax >= 80))
                    return K.nicht(1, { n: R.gemessen, fehlt: "die Achse 18–80 J. trägt das Gesetz nicht: die Bewohner von " + R.gemessen + " Saaten tragen " + W.jMin + "–" + W.jMax + " J. (koerper-core.js:1782 epochenAlter)" });
                if (W.daneben > 0)
                    return K.leser(1, {
                        n: W.daneben,
                        fehlt: "das Genom trägt " + W.jMin + "–" + W.jMax + " J., der Leib zeigt das Alter seiner Gestalt (8 je Siedlung, höchstens " + W.zeigtMax + " J.): " + W.daneben + " von " + W.erwachsene + " Erwachsenen > 15 J. daneben (bis " + W.danebenMax + " J.), " + W.altJung + " von " + W.alt + " ab 60 J. zeigen sich unter 45",
                        wo: "stamm/siedlung-bewohner.js:607",
                    });
                const b = await K.bild(1, z.posen.leib, { wahl: 0 });
                K.auge(1, { bild: b.datei, pose: "stadt-voll: 3 m vor dem nächsten Bewohner", mass: "Alter " + W.jMin + "–" + W.jMax + " J., der Leib zeigt es (Fehler im Mittel " + W.fehlerMittel + " J.)" });
            });
        },
        sprossen: {
            1: { auge: { pose: "stadt-voll am Markt: 3 m vor dem nächsten Bewohner, 1,5 m hoch", vorbild: "Porträts 18–80 J. (Prüfer-Altersschätzung, Fehler ≤ 15 J.)" }, erwartet: "leser", fehlt: "das Genom trägt die Achse 2–90 J., der nahe Leib zeigt das Alter seiner Gestalt: 32 % der Erwachsenen > 15 J. daneben", wo: "stamm/siedlung-bewohner.js:607" },
            2: { auge: { pose: "stadt-voll: 3 m vor dem nächsten Bewohner", vorbild: "Fotos von Bauer, Schmied, Schreiber (Beruf-Rateaufgabe ≥ 50 %)" }, erwartet: "nicht", fehlt: "keine 10 Berufe mit Spur am Leib" },
            3: { auge: { pose: "keine: keine Wunde am Leib", vorbild: "Bildreihe Wunde → Verband → Narbe, Tag 0/3/30" }, erwartet: "nicht", fehlt: "keine Verletzung live" },
            4: { auge: { pose: "keine: keine Zeichen am Leib", vorbild: "Schmuck, Tätowierung, Bemalung realer Kulturen (N = 100, ≥ 60 %)" }, erwartet: "nicht", fehlt: "10² Kulturen mit Zeichen" },
            5: { auge: { pose: "keine: keine Biografie am Leib", vorbild: "Porträt mit Datensatz (≥ 3 von 5 Fakten)" }, erwartet: "nicht", fehlt: "Biografie im Leib bis zur Kybernetik" },
            6: { auge: { pose: "keine: ein Planet fehlt", vorbild: "Spuren realer Lebensläufe (N = 500, plausibel ≥ 0,9)" }, erwartet: "nicht", fehlt: "jeder Mensch eines Planeten" },
        },
        proben: { 1: ohneBild("mensch.leib.spur", 1) },
    }),
];
module.exports.LEIBER_AN = LEIBER_AN;
module.exports.HALTUNG_AN = HALTUNG_AN;
