// diag-studio-begehen.cjs — DAS STUDIO-DORF BEGEHEN (gate:studio-begehen, Welle L 06.10.).
// Befund der Leben-Prüfung (Dorf/Stadt S-S1 … S-S5; gespielt im sichtbaren Fenster): das Fachwerk-Labor baut ein
// Profi-Dorf, lässt aber niemanden hinein — die promovierten Häuser behalten ihre Ganz-Haus-Hülle (4 von 4 zu, 1,1 m vor
// der offenen Tür), demotierte Häuser werden Geister (0 Solids); auf der Speichertreppe klemmt der Kopf im Dachboden-Boden
// (0,000 m Weg); im Keller ist die Decke die Wiesen-Platte; der Fluss liegt unter der Boden-Platte (die Brücke überspannt
// Gras); jede städtische Antike stürzt ab (`wm is not defined`). Der Selbsttest des Labors schrieb S1 fest (Demotion
// verlangte null Solids). Die Linse ruft die ECHTEN Lab-Pfade (buildDorf · promoteB · demoteB · walkUpdate →
// moveAxis/gravity/overlap · Raycaster gegen dorfGroup), nie eine Nachrechnung:
//   B1  HÜLLE: jedes promovierte Haus trägt 0 Hüllen-Solids, jedes demotierte genau 1 (EIN Lebenszyklus je Haus)
//   B2  TÜR: aus 2 m vor der Haustür geht der Körper (W, echte Lab-Physik) bis 1 m hinter die Schwelle
//   B3  TREPPE: auf jeder Treppe (Geschoss- und Speichertreppe, seitlicher Versatz −0,10 … +0,10 m) endet kein Schritt
//       mit dem Körper in einem Solid, das kein Tritt ist (die Klemme), und JEDER Lauf (mittig) erreicht seine Höhe —
//       EG→OG, OG→2.OG und Speicher (die Speichertreppe stieß mit der Zylinder-Kante an den Estrich: 0 von 3 oben; der
//       Lauf ins 2. OG lag ohne Speicher und Keller auf einer Null-Spur: 0 m breit, 44 von 270 Siedlungs-Häusern); am
//       Austritt steht der Körper (PH) unter der sichtbaren Decke (der Speicherlauf dreigeschossiger Häuser trat unter der
//       Schräge aus: Kopfraum 1,2 m)
//   B4  KELLER: der erste Strahl-Treffer aus dem Keller nach oben ist nie die Dorf-Boden-Platte
//   B5  FLUSS: der erste Strahl-Treffer von oben auf die Flussmitte ist das Wasser (nie die Boden-Platte)
//   B6  EPOCHEN: Antike × {18, 40, 120} baut ohne Ausnahme (die Welt steht, das Dorf hat Häuser)
//   --selftest: je Defekt wird die Basis-Zeile zurückgesetzt — als QUELL-Patch der servierten Datei (der Server reicht dem
//   Labor die Basis-Form der geheilten Zeile) bzw. als Basis-Platte in der Seite — und GENAU die Probe dieses Defekts MUSS
//   rot werden. Fehlt die geheilte Zeile in der Quelle, ist der Selbsttest rot (die Linse kann ihren Defekt nicht setzen).
//   Vorher-Lauf gegen die Basis cf9a07ba (06.10.): B1 8/8 zu · 0/6 demotiert mit Hülle · B2 0/8 betreten · B3 Klemme
//   75/75 · B4 2/2 Platte · B5 0/112 Wasser · B6 3/3 `wm is not defined`.
//   node scripts/diag-studio-begehen.cjs [--selftest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const PORT = Number(process.env.STUDIO_BEGEHEN_PORT || 4473);
const ROOT = path.resolve(__dirname, "..");
const SELBST = process.argv.includes("--selftest");
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
};

// DIE BASIS-ZEILEN je Defekt: [Datei, geheilte Form, Basis-Form]. Der Selbsttest serviert die Basis-Form.
const LAB = "/worlds/fachwerk/fachwerk.js";
const KERN = "/fachwerk-core.js";
const BASIS = {
    // S-S1: die Promotion ließ die Hülle stehen, die Demotion löschte sie mit
    huelle: [
        [LAB, "  { const ix=solids.indexOf(B.huelle); if(ix>=0) solids.splice(ix,1); }", ""],
        [LAB, "  if(B.huelle) solids.push(B.huelle);", ""],
    ],
    // S-S2: der Achs-Schritt ohne Kopf-Prüfung und der Körper als Zylinder (die Klemme der Basis)
    kopf: [
        [
            LAB,
            "  if(climb>oldY){ for(const s of solids){ if(overlap(p,s)){ p[ax]=oldA; p.y=oldY; return; } } } }",
            " }",
        ],
        [LAB, "s.min[1]>yk? Math.sqrt(Math.max(0,R*R-(s.min[1]-yk)*(s.min[1]-yk))) : R;", "R;"],
    ],
    // S-S2 (Steigen): der Körper als Zylinder — die Kante stößt hinter dem Antritt an den Estrich
    kappe: [[LAB, "s.min[1]>yk? Math.sqrt(Math.max(0,R*R-(s.min[1]-yk)*(s.min[1]-yk))) : R;", "R;"]],
    // die Null-Spur: ohne Speicher und Keller hatte die rechte Spur 0 m
    spur: [[KERN, "||P.keller||levels.length>=3) ? 0.90 : 0;", "||P.keller) ? 0.90 : 0;"]],
    // der Speicherlauf folgte stur der Kehre — bei drei Geschossen trat er unter der Schräge aus (Kopfraum 1,2 m)
    austritt: [[KERN, "    if(austritt(dir)>zBandTop && austritt(-dir)<=zBandTop) dir=-dir;", ""]],
    // S-S5: das Wasser-Material lebte nur im Fluss-Block
    antike: [
        [LAB, "  const wm=lay.fluss?new THREE.MeshLambertMaterial({color:0x3d6d9c, side:THREE.DoubleSide}):null;", ""],
        [
            LAB,
            "  if(lay.fluss){                                                                              // FLUSS: Wasserband + Ufer",
            "  if(lay.fluss){ const wm=new THREE.MeshLambertMaterial({color:0x3d6d9c, side:THREE.DoubleSide});",
        ],
    ],
};
let patch = null; // die aktive Basis-Liste
let patchFehler = [];

const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/worlds/fachwerk/index.html";
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        if (patch) {
            let txt = null;
            for (const [datei, geheilt, basis] of patch) {
                if (datei !== p) continue;
                if (txt === null) txt = data.toString("utf8");
                if (!txt.includes(geheilt))
                    patchFehler.push(`${datei}: geheilte Zeile fehlt („${geheilt.slice(0, 60)}…")`);
                else txt = txt.replace(geheilt, basis);
            }
            if (txt !== null) data = Buffer.from(txt, "utf8");
        }
        res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// Die Proben laufen IN der Lab-Seite (die Top-Level-Bindungen des Labors sind globale lexikalische Namen).
// `platte` setzt in der Seite die Basis-Boden-Platte (0,3 m, −0,32 … −0,02) zurück.
function proben(inj) {
    /* global buildDorf, dorfB, solids, promoteB, demoteB, player, keys, walkUpdate, dorfGroup, dorfCellars, dorf,
       STEP, PH, overlap */
    const out = { fehler: null };
    const T = window.THREE;
    // ── B6 Epochen: Antike × 18/40/120 baut (die städtische Antike stürzte an `wm is not defined` ab, 3 von 3) ──
    const b6Lauf = () => {
        const b6 = { faelle: [] };
        for (const [seed, nH] of [
            [7, 18],
            [11, 40],
            [7, 120],
        ]) {
            let fehler = null;
            try {
                buildDorf({ epoche: "antike", nH, seed, budget: 170000 });
            } catch (e) {
                fehler = e.message;
            }
            b6.faelle.push({ seed, nH, fehler, haeuser: fehler ? 0 : dorfB.length });
        }
        return b6;
    };
    try {
        const pd = document.getElementById("pDorf");
        if (pd) pd.checked = true;
        buildDorf({ epoche: "gewuerfelt", nH: 18, seed: 7, budget: 170000 });
    } catch (e) {
        out.fehler = "buildDorf 7/18: " + e.message;
        return out;
    }
    const huelleVon = (B, bi) =>
        solids.filter(
            (s) =>
                s.bi === bi &&
                B.ext &&
                Math.abs(s.min[0] - B.ext.x0) < 1e-9 &&
                Math.abs(s.max[0] - B.ext.x1) < 1e-9 &&
                Math.abs(s.min[2] - B.ext.z0) < 1e-9 &&
                Math.abs(s.max[2] - B.ext.z1) < 1e-9 &&
                s.min[1] === 0
        ).length;
    // haus-lokal → Welt (das Lab-Gesetz: wrap.rotation.y = phi, wrap.position = q)
    const welt = (B, lx, lz) => {
        const c = Math.cos(B.q.phi),
            s = Math.sin(B.q.phi);
        return { x: B.q.x + lx * c + lz * s, z: B.q.z - lx * s + lz * c };
    };
    const lokal = (B, x, z) => {
        const c = Math.cos(B.q.phi),
            s = Math.sin(B.q.phi),
            dx = x - B.q.x,
            dz = z - B.q.z;
        return { x: dx * c - dz * s, z: dx * s + dz * c };
    };
    const ruhe = () => {
        for (const k in keys) keys[k] = false;
    };
    // EIN Lauf mit der echten Lab-Physik (walkUpdate → moveAxis/gravity), feste 60 Hz.
    const laufe = (n, yawW, jeSchritt) => {
        ruhe();
        keys.KeyW = true;
        let eingeklemmt = 0;
        for (let i = 0; i < n; i++) {
            // eslint-disable-next-line no-undef
            yaw = yawW;
            walkUpdate(1 / 60);
            const p = player.pos;
            if (solids.some((s) => overlap(p, s) && s.max[1] - p.y > STEP + 1e-6)) eingeklemmt++;
            if (jeSchritt) jeSchritt();
        }
        ruhe();
        return eingeklemmt;
    };
    // die Lab-Blickrichtung: vorwärts = (−sin yaw, −cos yaw)
    const yawZu = (dx, dz) => Math.atan2(-dx, -dz);
    const ray = new T.Raycaster();
    // ── B1/B2/B3: Promotion · Tür · Treppen · Demotion ──
    const kandidaten = [];
    for (let bi = 0; bi < dorfB.length; bi++) if (dorfB[bi].lod === "chunk") kandidaten.push(bi);
    const b1 = { promoviert: 0, huelleNachPromotion: 0, demotiert: 0, huelleNachDemotion: 0 };
    const b2 = { tueren: 0, hinein: 0, faelle: [] };
    const treppen = [];
    const keller = [];
    for (const bi of kandidaten.slice(0, 10)) {
        promoteB(bi);
        const B = dorfB[bi];
        if (B.lod !== "voll") continue;
        b1.promoviert++;
        b1.huelleNachPromotion += huelleVon(B, bi);
        const dm = B.H && B.H.dims;
        if (dm && dm.tuer) {
            b2.tueren++;
            const st = welt(B, dm.tuer.x, dm.tuer.z - 2.0);
            const zi = welt(B, dm.tuer.x, dm.tuer.z + 1.0);
            player.pos.set(st.x, 0, st.z);
            player.vy = 0;
            player.groundY = 0;
            for (let i = 0; i < 20; i++) walkUpdate(1 / 60); // landen
            laufe(240, yawZu(zi.x - st.x, zi.z - st.z));
            const l = lokal(B, player.pos.x, player.pos.z);
            if (l.z > dm.tuer.z + 0.6) b2.hinein++;
            else b2.faelle.push(bi + ":" + (l.z - dm.tuer.z).toFixed(2));
        }
        if (B.H && B.H.cellar) keller.push(bi);
        // B3 läuft im promovierten Zustand (die Solids des Hauses stehen); die Kellertreppe steigt aus dem Keller (eigene
        // Schwerkraft-Ebene) und ist nicht Teil dieser Probe.
        for (const f of (dm && dm.flights) || []) {
            if (f.atLevel === "keller") continue;
            const N = f.N || 0;
            if (!(N > 0)) continue;
            const t = { bi, loft: !!f.isLoft, eg: f.atLevel === 1, breite: +(f.x1 - f.x0).toFixed(2), N, faelle: [] };
            treppen.push(t);
            const go = f.go || 0.26;
            const dir = f.dir || 1;
            // seitlicher Versatz in der Spur (Spur 0,90 m, Körper Ø 0,60 m → Spiel ±0,15 m; die Befund-Klemme kam bei 5 cm)
            for (const off of [-0.1, -0.05, 0, 0.05, 0.1]) {
                const xm = (f.x0 + f.x1) / 2 + off;
                // der freie Antritt: von 0,35 m vor dem Fuß rückwärts bis 1,2 m — der erste Punkt, an dem der Körper frei steht
                let st = null;
                for (let a = 0.35; a <= 1.2 && !st; a += 0.05) {
                    const w = welt(B, xm, f.zFoot - dir * a);
                    const q = { x: w.x, y: f.base + 0.1, z: w.z }; // über der Dielen-Oberkante (Boden-Solid ±0,06 um die Ebene)
                    if (!solids.some((s) => overlap(q, s))) st = w;
                }
                if (!st) {
                    t.faelle.push({ off, antritt: false });
                    continue;
                }
                const zi = welt(B, xm, f.zFoot + dir * (N * go + 1));
                player.pos.set(st.x, f.base + 0.1, st.z);
                player.vy = 0;
                player.groundY = f.base;
                for (let i = 0; i < 10; i++) walkUpdate(1 / 60);
                const y0 = player.pos.y;
                const soll = N * f.rise;
                // der KOPFRAUM am Austritt: im ersten Schritt auf der Lauf-Höhe der Strahl vom Fuß nach oben (die sichtbare Decke
                // bzw. Dachhaut) — der Körper (PH) muss darunter stehen, nie mit dem Kopf im Dach
                let kopfraum = null;
                const klemm = laufe(300, yawZu(zi.x - st.x, zi.z - st.z), () => {
                    if (kopfraum !== null || !(player.pos.y - y0 >= 0.9 * soll)) return;
                    ray.set(new T.Vector3(player.pos.x, player.pos.y + 0.3, player.pos.z), new T.Vector3(0, 1, 0));
                    const h = ray.intersectObject(dorfGroup, true).find((x) => x.object.visible !== false);
                    kopfraum = h ? +(h.distance + 0.3).toFixed(2) : 99;
                });
                t.faelle.push({
                    off,
                    antritt: true,
                    klemm,
                    steig: +(player.pos.y - y0).toFixed(2),
                    soll: +soll.toFixed(2),
                    kopfraum,
                });
            }
        }
        // die Demotion setzt die Hülle zurück (EIN Lebenszyklus je Haus); Keller-Häuser bleiben für B4 promoviert
        if (!(B.H && B.H.cellar)) {
            demoteB(bi);
            b1.demotiert++;
            b1.huelleNachDemotion += huelleVon(B, bi);
        }
    }
    // ── B4 Keller (promovierte Häuser mit Keller): der erste Treffer nach oben ──
    const boden = dorfGroup.children.find((o) => o.isMesh && o.userData && o.userData.dorfBoden);
    const istBodenPlatte = (o) =>
        !!o &&
        (o === boden ||
            (o.geometry &&
                o.geometry.type === "BoxGeometry" &&
                o.geometry.parameters &&
                o.geometry.parameters.height === 0.3 &&
                o.position.y < -0.1 &&
                o.position.y > -0.25));
    if (inj === "platte") {
        const W2 = dorf.lay.welt;
        const g = new T.Mesh(new T.BoxGeometry(W2.x1 - W2.x0, 0.3, W2.z1 - W2.z0), new T.MeshBasicMaterial());
        g.position.set((W2.x0 + W2.x1) / 2, -0.17, (W2.z0 + W2.z1) / 2);
        dorfGroup.add(g);
        dorfGroup.updateMatrixWorld(true);
    }
    const b4 = { keller: 0, platteDecke: 0 };
    for (const bi of keller) {
        const kc = dorfCellars.find((c) => c.bi === bi);
        if (!kc) continue;
        b4.keller++;
        const B = dorfB[bi];
        const m = welt(B, (kc.x0 + kc.x1) / 2 + 0.3, (kc.z0 + kc.z1) / 2 + 0.3);
        ray.set(new T.Vector3(m.x, kc.floorY + 1.0, m.z), new T.Vector3(0, 1, 0));
        const hit = ray.intersectObject(dorfGroup, true).find((h) => h.object.visible !== false);
        if (hit && istBodenPlatte(hit.object)) b4.platteDecke++;
    }
    // ── B5 Fluss: von oben auf die Mitte (ohne Brücken-Spannen) ──
    const b5 = { punkte: 0, wasser: 0, platte: 0 };
    const fl = dorf.lay.fluss;
    if (fl && Array.isArray(fl.pts)) {
        for (const q of fl.pts) {
            const unterBruecke = (dorf.lay.bruecken || []).some((bk) => {
                const dx = q.x - bk.x,
                    dz = q.z - bk.z;
                const lp = dx * Math.cos(bk.th) + dz * Math.sin(bk.th),
                    lq = -dx * Math.sin(bk.th) + dz * Math.cos(bk.th);
                return Math.abs(lp) < bk.len / 2 + 1 && Math.abs(lq) < bk.w / 2 + 1;
            });
            if (unterBruecke) continue;
            ray.set(new T.Vector3(q.x, 6, q.z), new T.Vector3(0, -1, 0));
            const hit = ray.intersectObject(dorfGroup, true).find((h) => h.object.visible !== false);
            if (!hit) continue;
            b5.punkte++;
            if (hit.object.material && hit.object.material.color && hit.object.material.color.getHex() === 0x3d6d9c)
                b5.wasser++;
            else if (istBodenPlatte(hit.object)) b5.platte++;
            else
                (b5.andere = b5.andere || []).push(
                    (hit.object.geometry && hit.object.geometry.type) + "@" + hit.point.y.toFixed(2)
                );
        }
    }
    out.PH = PH;
    out.b1 = b1;
    out.b2 = b2;
    out.b3 = treppen;
    out.b4 = b4;
    out.b5 = b5;
    out.b6 = b6Lauf();
    return out;
}

// B3 zählt: Läufe aus freiem Antritt · davon geklemmt (ein Schritt endet im Solid, das kein Tritt ist) · die Mittel-Läufe
// je Art (EG→OG, OG→OG, Speicher), die ihre Höhe erreichen (≥ 90 % der Lauf-Höhe).
function b3Zahl(o) {
    const z = {
        laeufe: 0,
        klemm: 0,
        kopfZu: 0,
        kopfMin: 99,
        ohneAntritt: 0,
        eg: 0,
        egOben: 0,
        og: 0,
        ogOben: 0,
        speicher: 0,
        speicherOben: 0,
        alle: 0,
        alleOben: 0,
    };
    for (const t of o.b3)
        for (const c of t.faelle) {
            if (!c.antritt) {
                z.ohneAntritt++;
                if (c.off === 0) z.alle++; // ein Lauf ohne Antritt erreicht seine Höhe nicht
                continue;
            }
            z.laeufe++;
            if (c.klemm > 0) z.klemm++;
            if (c.kopfraum !== null && c.kopfraum !== undefined) {
                if (c.kopfraum < z.kopfMin) z.kopfMin = c.kopfraum;
                if (c.kopfraum < o.PH) z.kopfZu++;
            }
            if (c.off !== 0) continue;
            const oben = c.steig >= 0.9 * c.soll;
            const art = t.loft ? "speicher" : t.eg ? "eg" : "og";
            z[art]++;
            z.alle++;
            if (oben) {
                z[art + "Oben"]++;
                z.alleOben++;
            }
        }
    return z;
}

function urteil(o) {
    const f = [];
    if (o.fehler) return [o.fehler];
    if (!(o.b1.promoviert >= 3)) f.push(`B1 zu wenig promoviert (${o.b1.promoviert})`);
    if (o.b1.huelleNachPromotion !== 0)
        f.push(`B1 Hülle nach Promotion: ${o.b1.huelleNachPromotion} von ${o.b1.promoviert} Häusern zu`);
    if (!(o.b1.demotiert >= 1) || o.b1.huelleNachDemotion !== o.b1.demotiert)
        f.push(`B1 Hülle nach Demotion: ${o.b1.huelleNachDemotion} von ${o.b1.demotiert} Häusern (Geister)`);
    if (!(o.b2.tueren >= 3)) f.push(`B2 zu wenig Türen (${o.b2.tueren})`);
    if (o.b2.hinein !== o.b2.tueren)
        f.push(`B2 Tür: ${o.b2.hinein} von ${o.b2.tueren} Häusern betreten (${o.b2.faelle.join(" ")})`);
    const z = b3Zahl(o);
    if (!(z.laeufe >= 10)) f.push(`B3 zu wenig Treppen-Läufe (${z.laeufe})`);
    if (z.klemm) f.push(`B3 Kopf: ${z.klemm} von ${z.laeufe} Treppen-Läufen enden im Solid`);
    if (z.kopfZu)
        f.push(`B3 Kopfraum: ${z.kopfZu} Austritte unter ${o.PH} m (min ${z.kopfMin} m — der Kopf steht im Dach)`);
    if (!(z.eg >= 3) || !(z.og >= 1) || !(z.speicher >= 1))
        f.push(`B3 Steigen: die Probe trifft zu wenig Läufe (EG→OG ${z.eg} · OG→OG ${z.og} · Speicher ${z.speicher})`);
    if (z.alleOben !== z.alle)
        f.push(
            `B3 Steigen: ${z.alleOben} von ${z.alle} Treppen erreichen ihre Höhe (EG→OG ${z.egOben}/${z.eg} · OG→OG ${z.ogOben}/${z.og} · Speicher ${z.speicherOben}/${z.speicher})`
        );
    if (!(o.b4.keller >= 1)) f.push(`B4 kein Keller-Haus promoviert`);
    if (o.b4.platteDecke) f.push(`B4 Keller-Decke = Boden-Platte in ${o.b4.platteDecke} von ${o.b4.keller}`);
    if (!(o.b5.punkte >= 5)) f.push(`B5 zu wenig Fluss-Punkte (${o.b5.punkte})`);
    if (o.b5.platte || !(o.b5.wasser >= 0.95 * o.b5.punkte))
        f.push(`B5 Fluss: ${o.b5.wasser} von ${o.b5.punkte} Punkten zeigen Wasser (${o.b5.platte} die Platte)`);
    for (const c of o.b6.faelle)
        if (c.fehler || !(c.haeuser > 0)) f.push(`B6 Antike ${c.seed}/${c.nH}: ${c.fehler || "0 Häuser"}`);
    return f;
}

function zeile(o) {
    if (o.fehler) return o.fehler;
    const z = b3Zahl(o);
    return (
        `B1 Hülle promoviert ${o.b1.huelleNachPromotion}/${o.b1.promoviert} · demotiert ${o.b1.huelleNachDemotion}/${o.b1.demotiert}` +
        ` · B2 Tür ${o.b2.hinein}/${o.b2.tueren} · B3 Klemme ${z.klemm}/${z.laeufe} · Kopfraum am Austritt min ${z.kopfMin} m · oben EG→OG ${z.egOben}/${z.eg} · OG→OG ${z.ogOben}/${z.og} · Speicher ${z.speicherOben}/${z.speicher}` +
        ` · B4 Platte ${o.b4.platteDecke}/${o.b4.keller} · B5 Wasser ${o.b5.wasser}/${o.b5.punkte}` +
        ` · B6 ${o.b6.faelle.map((c) => (c.fehler ? "x" : c.haeuser)).join("/")}`
    );
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    let rot = 0;
    try {
        const lauf = async (inj) => {
            patch = inj && BASIS[inj] ? BASIS[inj] : null;
            patchFehler = [];
            const page = await browser.newPage();
            const errs = [];
            page.on("pageerror", (e) => errs.push((e.message || String(e)).split("\n")[0]));
            await page.goto(`http://127.0.0.1:${PORT}/worlds/fachwerk/index.html`, {
                waitUntil: "load",
                timeout: 120000,
            });
            await page.waitForFunction(() => typeof buildDorf === "function" && typeof walkUpdate === "function", {
                timeout: 60000,
            });
            const o = await page.evaluate(proben, inj || null);
            await page.close();
            patch = null;
            return { o, errs, patchFehler: patchFehler.slice() };
        };
        if (SELBST) {
            // je Basis-Zeile muss GENAU die Probe ihres Defekts rot werden (nicht irgendeine)
            const soll = {
                huelle: ["B1 Hülle nach Promotion", "B1 Hülle nach Demotion"],
                kopf: ["B3 Kopf"],
                kappe: ["B3 Steigen"],
                spur: ["B3 Steigen"],
                austritt: ["B3 Kopfraum"],
                platte: ["B4 Keller-Decke", "B5 Fluss"],
                antike: ["B6 Antike"],
            };
            for (const inj of Object.keys(soll)) {
                const { o, patchFehler: pf } = await lauf(inj);
                const f = urteil(o);
                const fehlt = soll[inj].filter((s) => !f.some((x) => x.startsWith(s)));
                const ok = pf.length === 0 && fehlt.length === 0;
                const beleg = soll[inj].map((s) => f.find((x) => x.startsWith(s)) || `${s}: grün (blind!)`).join(" | ");
                console.log(
                    `  ${ok ? "✅" : "❌"} Selbsttest „${inj}" macht ${soll[inj].join(" + ")} rot — ${pf.length ? pf.join("; ") : beleg}`
                );
                if (!ok) rot++;
            }
        }
        const { o, errs } = await lauf(null);
        console.log("  " + zeile(o));
        const f = urteil(o);
        for (const x of f) console.log("  ❌ " + x);
        if (errs.length) console.log("  ❌ Seiten-Fehler: " + errs[0]);
        rot += f.length + (errs.length ? 1 : 0);
        if (process.env.STUDIO_BEGEHEN_JSON)
            fs.writeFileSync(process.env.STUDIO_BEGEHEN_JSON, JSON.stringify(o, null, 1));
    } finally {
        await browser.close();
        server.close();
    }
    console.log(rot ? `❌ gate:studio-begehen ROT (${rot})` : "✅ gate:studio-begehen grün");
    process.exit(rot ? 1 : 0);
})().catch((e) => {
    console.error(e);
    process.exit(2);
});
