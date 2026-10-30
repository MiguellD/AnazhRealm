// diag-studio-begehen.cjs — DAS STUDIO-DORF BEGEHEN (gate:studio-begehen).
// Der Selbsttest des Labors schrieb S1 fest (Demotion
// verlangte null Solids). Die Linse ruft die ECHTEN Lab-Pfade (buildDorf · promoteB · demoteB · walkUpdate →
// moveAxis/gravity/overlap · Raycaster gegen dorfGroup), nie eine Nachrechnung:
//   B1  HÜLLE: jedes promovierte Haus trägt 0 Hüllen-Solids, jedes demotierte genau 1 (EIN Lebenszyklus je Haus)
//   B2  TÜR: aus 2 m vor der Haustür geht der Körper (W, echte Lab-Physik) bis 1 m hinter die Schwelle
//   B3  TREPPE: auf jeder Treppe (Geschoss- und Speichertreppe, seitlicher Versatz −0,10 … +0,10 m) endet kein Schritt
//       mit dem Körper in einem Solid, das kein Tritt ist (die Klemme), und JEDER Lauf (mittig) erreicht seine Höhe —
//       EG→OG, OG→2.OG und Speicher; am Austritt steht der Körper (PH) unter der sichtbaren Decke
//   B4  KELLER: der erste Strahl-Treffer aus dem Keller nach oben ist nie die Dorf-Boden-Platte
//   B5  WELTGRUND: das Labor plant das Dorf auf der Welt-Zelle — es trägt den Plan v2 (fachwerk ortPlan, ein Slot je
//       Haus, Plan-Hash Labor = Kern über gelaende-core lageGrund + hoehenRaster + ortCtx), die Häuser stehen nicht eben (Spanne ≥ 1 m), und
//       der Fuß steht auf dem Bild (Strahlen von oben auf den Dorf-Boden: Treffer = dorfBodenY ± 0,05 m). Der Deko-Fluss
//  fiel mit seiner Klasse; das Wasser ist das der Welt.
//   B6  EPOCHEN: Antike × {18, 40, 120} baut ohne Ausnahme (die Welt steht, das Dorf hat Häuser) — nur im echten Lauf
//   --selftest: je Defekt wird die Basis-Zeile zurückgesetzt — als QUELL-Patch der servierten Datei (der Server reicht dem
//   Labor die Basis-Form der geheilten Zeile) bzw. als Basis-Platte in der Seite — und GENAU die Probe dieses Defekts MUSS
//   rot werden. Fehlt die geheilte Zeile in der Quelle, ist der Selbsttest rot (die Linse kann ihren Defekt nicht setzen).
//   node scripts/diag-studio-begehen.cjs [--selftest]
"use strict";
const { statikServer, starteBrowser, ROOT, hauptLauf } = require("./lib/welt-boot.cjs");
const fs = require("fs");

const SELBST = process.argv.includes("--selftest");

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
    austritt: [
        [
            KERN,
            "    if(austritt(dir)>zBandTop && austritt(-dir)<=zBandTop) dir=-dir;\n    if(austritt(dir)<=zBandTop){",
            "    {",
        ],
    ],
    // K10: das Dorf stand flach — der Dorf-Boden 0 und jedes Haus auf y = 0, gleich wo die Welt es trug
    flach: [
        [
            LAB,
            "    dorfBodenY=(x,z)=>{ let fx=(x-x0)/gx,",
            "    dorfBodenY=(x,z)=>0; const _k10=(x,z)=>{ let fx=(x-x0)/gx,",
        ],
        [
            LAB,
            "for(let i=0;i<plan.houses.length;i++){ const q=lay.pl[i]; if(!geparkt(q)) q.y-=yRef; }",
            "for(let i=0;i<plan.houses.length;i++){ const q=lay.pl[i]; if(!geparkt(q)) q.y=0; }",
        ],
    ],
};
let patch = null; // die aktive Basis-Liste
let patchFehler = [];

const server = statikServer({
    root: ROOT,
    start: "/worlds/fachwerk/index.html",
    wandle: (p, data) => {
        if (!data || !patch) return data;
        let txt = null;
        for (const [datei, geheilt, basis] of patch) {
            if (datei !== p) continue;
            if (txt === null) txt = data.toString("utf8");
            if (!txt.includes(geheilt)) patchFehler.push(`${datei}: geheilte Zeile fehlt („${geheilt.slice(0, 60)}…")`);
            else txt = txt.replace(geheilt, basis);
        }
        return txt === null ? data : Buffer.from(txt, "utf8");
    },
});

// Die Proben laufen IN der Lab-Seite (die Top-Level-Bindungen des Labors sind globale lexikalische Namen).
// `platte` setzt in der Seite die Basis-Boden-Platte (0,3 m, −0,32 … −0,02) zurück.
function proben(inj) {
    /* global buildDorf, dorfB, solids, promoteB, demoteB, player, keys, walkUpdate, dorfGroup, dorfCellars, dorf,
       STEP, PH, overlap, dorfBodenY */
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
                s.min[1] === B.q.y
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
        if (dm?.tuer) {
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
        if (B.H?.cellar) keller.push(bi);
        // B3 läuft im promovierten Zustand (die Solids des Hauses stehen); die Kellertreppe steigt aus dem Keller (eigene
        // Schwerkraft-Ebene) und ist nicht Teil dieser Probe.
        for (const f of dm?.flights || []) {
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
                    const q = { x: w.x, y: B.q.y + f.base + 0.1, z: w.z }; // über der Dielen-Oberkante (Boden-Solid ±0,06 um die Ebene)
                    if (!solids.some((s) => overlap(q, s))) st = w;
                }
                if (!st) {
                    t.faelle.push({ off, antritt: false });
                    continue;
                }
                const zi = welt(B, xm, f.zFoot + dir * (N * go + 1));
                player.pos.set(st.x, B.q.y + f.base + 0.1, st.z); // das Haus steht auf q.y (K10)
                player.vy = 0;
                player.groundY = B.q.y + f.base;
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
        if (!B.H?.cellar) {
            demoteB(bi);
            b1.demotiert++;
            b1.huelleNachDemotion += huelleVon(B, bi);
        }
    }
    // ── B4 Keller (promovierte Häuser mit Keller): der erste Treffer nach oben ──
    const boden = dorfGroup.children.find((o) => o.isMesh && o.userData?.dorfBoden);
    const istBodenPlatte = (o) =>
        !!o &&
        (o === boden ||
            (o.geometry &&
                o.geometry.type === "BoxGeometry" &&
                o.geometry.parameters &&
                o.geometry.parameters.height === 0.3 &&
                o.userData.basisPlatte === true));
    if (inj === "platte") {
        for (const bi of keller) {
            const B = dorfB[bi];
            const g = new T.Mesh(new T.BoxGeometry(80, 0.3, 80), new T.MeshBasicMaterial());
            g.position.set(B.q.x, B.q.y - 0.17, B.q.z);
            g.userData.basisPlatte = true;
            dorfGroup.add(g);
        }
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
    // ── B5 WELTGRUND: der Plan v2 im Labor, die Höhen-Spanne der Häuser, der Fuß auf dem Bild ──
    const b5 = {
        v2: 0,
        slots: 0,
        haeuser: 0,
        spanne: 0,
        strahlen: 0,
        aufBild: 0,
        abw: 0,
        planHash: null,
    };
    const O = dorf.ort;
    if (O?.v2) {
        b5.v2 = O.v2.version;
        b5.slots = O.v2.slots.length;
        // der Plan-Hash: der Kern rechnet in DERSELBEN Seite den Plan des Exports 7/18 am Ort über die Lage der Saat
        // (lageGrund), das Höhen-Raster der Trasse um den Ort (hoehenRaster im Rahmen trasseRahmen, wie der Ort-Faden der
        // Welt, siedlung.K3) und den ctx des Orts (ortCtx) — das Labor zeigt genau ihn (Teil O von gate:settlement hält Kern = Welt)
        const FCk = window.__fachwerkCore;
        const Gk = window.__gelaendeCore;
        const Lk = Gk.lageGrund(Gk.LAGE_GRUND.seed, window.SimplexNoise);
        const kern = FCk.ortPlan(
            FCk.exportSettlement({
                seed: 7,
                nH: 18,
                epoche: "gewuerfelt",
                budget: 170000,
                hoehe: Gk.hoehenRaster(Lk, O.ort.x, O.ort.z, FCk.trasseRahmen(18)),
            }),
            O.ort,
            Gk.ortCtx(Lk)
        );
        b5.planHash = JSON.stringify(kern) === JSON.stringify(O.v2);
    }
    let lo = Infinity;
    let hi = -Infinity;
    for (const B of dorfB) {
        const q = B.q;
        if (!q || !q.obb || Math.abs(q.obb.cx) > 5000 || Math.abs(q.obb.cz) > 5000) continue;
        b5.haeuser++;
        lo = Math.min(lo, q.y);
        hi = Math.max(hi, q.y);
    }
    b5.spanne = +(hi - lo).toFixed(2);
    const W = dorf.lay.welt;
    for (let i = 0; i < 600 && b5.strahlen < 150; i++) {
        const x = W.x0 + (W.x1 - W.x0) * ((i * 0.618034) % 1);
        const z = W.z0 + (W.z1 - W.z0) * ((i * 0.381966 + 0.5) % 1);
        ray.set(new T.Vector3(x, 900, z), new T.Vector3(0, -1, 0));
        const hit = ray.intersectObject(dorfGroup, true).find((h) => h.object.visible !== false);
        if (!hit || hit.object !== boden) continue;
        b5.strahlen++;
        const d = Math.abs(hit.point.y + 0.02 - dorfBodenY(x, z));
        if (d <= 0.05) b5.aufBild++;
        else b5.abw = Math.max(b5.abw, +d.toFixed(2));
    }
    out.PH = PH;
    out.b1 = b1;
    out.b2 = b2;
    out.b3 = treppen;
    out.b4 = b4;
    out.b5 = b5;
    out.b6 = inj ? { faelle: [] } : b6Lauf(); // kein Defekt zielt auf B6 (die Antike kostet je Seite 22–45 s)
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
    if (o.b5.v2 !== 2 || !(o.b5.haeuser > 0) || o.b5.slots !== o.b5.haeuser)
        f.push(`B5 Weltgrund: kein Plan v2 im Labor (v${o.b5.v2}, ${o.b5.slots} Slots, ${o.b5.haeuser} Häuser)`);
    if (!(o.b5.spanne >= 1)) f.push(`B5 Weltgrund: die Häuser stehen eben (Spanne ${o.b5.spanne} m)`);
    if (!(o.b5.strahlen >= 50) || o.b5.aufBild !== o.b5.strahlen)
        f.push(`B5 Weltgrund: der Fuß steht neben dem Bild (${o.b5.aufBild}/${o.b5.strahlen}, max ${o.b5.abw} m)`);
    if (o.b5.planHash !== true) f.push(`B5 Weltgrund: Plan-Hash Labor ≠ Kern (${o.b5.planHash})`);
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
        ` · B4 Platte ${o.b4.platteDecke}/${o.b4.keller} · B5 v${o.b5.v2} ${o.b5.slots}/${o.b5.haeuser} Spanne ${o.b5.spanne} m Fuß ${o.b5.aufBild}/${o.b5.strahlen} Hash ${o.b5.planHash}` +
        ` · B6 ${o.b6.faelle.map((c) => (c.fehler ? "x" : c.haeuser)).join("/")}`
    );
}

hauptLauf(async () => {
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 600000 });
    let rot = 0;
    try {
        const lauf = async (inj) => {
            patch = inj && BASIS[inj] ? BASIS[inj] : null;
            patchFehler = [];
            const page = await browser.newPage();
            await server.zeige(page, 120000, "worlds/fachwerk/index.html", "load");
            await page.waitForFunction(() => typeof buildDorf === "function" && typeof walkUpdate === "function", {
                timeout: 60000,
            });
            const o = await page.evaluate(proben, inj || null);
            await page.close();
            patch = null;
            return { o, patchFehler: patchFehler.slice() };
        };
        if (SELBST) {
            // je Basis-Zeile muss GENAU die Probe ihres Defekts rot werden (nicht irgendeine)
            const soll = {
                huelle: ["B1 Hülle nach Promotion", "B1 Hülle nach Demotion"],
                kopf: ["B3 Kopf"],
                kappe: ["B3 Steigen"],
                spur: ["B3 Steigen"],
                austritt: ["B3 Kopfraum"],
                platte: ["B4 Keller-Decke"],
                flach: ["B5 Weltgrund"],
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
        const { o } = await lauf(null);
        console.log("  " + zeile(o));
        const f = urteil(o);
        for (const x of f) console.log("  ❌ " + x);
        rot += f.length;
        if (process.env.STUDIO_BEGEHEN_JSON)
            fs.writeFileSync(process.env.STUDIO_BEGEHEN_JSON, JSON.stringify(o, null, 1));
    } finally {
        await browser.close();
        server.close();
    }
    console.log(rot ? `❌ gate:studio-begehen ROT (${rot})` : "✅ gate:studio-begehen grün");
    process.exit(rot ? 1 : 0);
});
