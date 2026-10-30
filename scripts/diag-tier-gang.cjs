#!/usr/bin/env node
// diag-tier-gang.cjs — DIE GLEIT-LINSE DER TIERE („Gang ohne Gleiten"; npm run gate:tier-gang).
// Am ECHTEN Chokepoint (_animateCompoundMotion → _animateTierBaum, headless Null-Renderer, Produktions-Boot): jede
// Gattung läuft geradeaus bei v̂ 0,3 · 0,74 · 1,2 · 3,5, je Takt der Aufsetz-Punkt jeder Pfote (der Boden-Punkt unter
// der Handwurzel in der Ruhe-Pose, im Gelenk-Raum der Pfote mitgeführt). Im STAND (unterste 5 % der Hüft-Höhe) darf er nicht mit dem Leib wandern: der SCHLUPF = Weg des
// Stand-Fußes / Weg des Leibs in denselben Takten. Soll ≤ 0,05 (eine Pfote, die mit dem Leib gleitet, hat 1).
// UNTER LAST (Integration W5-Körper): das Zielgerät läuft 30 fps, das Wesen steht im 1/4-Band der Anim-Raten-Leiter
// (_creatureAnimDiv auf 0,8 × Fern-Distanz, mit dem Takt des Gangs) — gemessen wird zwischen zwei Auswertungen (der
// Leib zieht jeden Frame weiter).
//   DER SPIELER-LEIB: derselbe Aufsetz-Punkt, dieselbe Schwelle am Menschen (LEIB, unten), dazu Kadenz und Töne,
//   das BECKEN (Hub und Tiefe unter der Ruhe, in Beinlängen: Gehen ≤ 0,07 / 0,15, Laufen ≤ 0,12 / 0,25 — Gard 2004,
//   Cavagna 1976, Lee & Farley 1998) und die LOCK-LÖSER im Stand-Fenster (Soll 0: der stehende Fuß löst nie an der
//   Reichweite, die das Gesetz ihm selbst gibt).
//   DAS KÖRPER-STUDIO: derselbe Schlupf am Menschen des Labors im Spiel-Modus (STUDIO, unten) — geduckt, gehen, Sprint.
//   DIE SCHWERE: Mensch und Tier gehen nach der Schwere der Welt, Schritt und Becken aus EINER Zeile (SCHWERE, unten).
//   DER SATZ: jenseits der nahen Leiber geht das Tier im Satz seiner Gestalt (SATZ, unten) — Schlupf, Gangart, Tastgrad
//   und die Phasen der Folge, wie der Knoten sie zeichnet; die KREUZ-PROBE Stimmung × Tempo (KREUZ, unten).
//   --selftest: das Gang-Gesetz gestubbt (fester Takt, feste Auslenkung — der Vor-Welle-Gang) → der Schlupf steigt
//   über die Schwelle, die Linse feuert; die Zeile ohne die Schwere der Welt → die Schwere-Wand feuert; die Flucht
//   wählt den Galopp → die Kreuz-Probe feuert. Jede Zeile des Selbsttests trägt „[Selbsttest]“ (ihr ❌ ist das Soll).
//   node scripts/diag-tier-gang.cjs [--selftest]
"use strict";
const { statikServer, starteBrowser, nullRenderer, hauptLauf, urteilEnde, SELBSTTEST } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.TIER_GANG_PORT) || 4449;
const SELBST = SELBSTTEST;
// die Ratsche: 0,2 → 0,05 — der Fuß im Stand steht (Gleiten < 5 %), Tier und Mensch an EINER Schwelle
const SCHWELLE = 0.05;
const KADENZ_GEHEN = 1.5; // Schritte/s bei 1,15 m/s (physio-pedia, Weidmann 1993)
const TON_TOLERANZ = 0.15; // Töne = 2·v·t/Λ ± 15 %
// das Becken in Beinlängen (Hub = höchste − tiefste Lage, Tiefe = Ruhe − tiefste Lage): Gehen (Gard 2004: 4–5 cm bei
// 0,9 m Bein) und Laufen (Cavagna 1976, Lee & Farley 1998: Hub 6–10 cm, das Bein federt um 10–15 %). Die Tiefe des
// Gehens als Ratsche 0,15 → 0,08 (K07, das Abrollen des Fußes).
const BECKEN = { gehen: { hub: 0.07, tief: 0.08 }, laufen: { hub: 0.12, tief: 0.25 } };
const server = statikServer();
// DER SCHLUPF, EIN Maß für Welt-Tier, Spieler-Leib und Labor (im Seiten-Kontext `window.__schlupf`): je Fuß die
// Aufsetz-Punkte je Takt (der tiefere trägt) ab Takt `ab`, Stand = die untersten 5 % der Beinlänge, der Leib-Weg aus {x, z}.
// Mit der Uhr des Gangs (`uhr`, Zyklen je Takt) DIE PHASEN DER FOLGE aus dem Verhalten: je Fuß die Phase seines Aufsetzens
// (das Unterschreiten der Stand-Schwelle, zwischen zwei Takten gelegt), im Kreis gemittelt — wie das Netz sie trüge (ein
// größerer Versatz setzt früher auf).
const SCHLUPF = (spur, leib, ab, bein, uhr) => {
    let [wegFuss, wegLeib, stand] = [0, 0, 0];
    const ph = spur.map((s) => {
        let [ymin, c, sn] = [Infinity, 0, 0];
        for (let i = ab; i < s.length; i++) for (const p of s[i]) ymin = Math.min(ymin, p.y);
        for (let i = ab + 1; i < s.length; i++) {
            const k = s[i].length > 1 && s[i][1].y < s[i][0].y - 1e-4 ? 1 : 0;
            const [a, b, lo] = [s[i - 1][k], s[i][k], ymin + 0.05 * bein];
            if (uhr && a.y > lo && b.y <= lo) {
                const q = 2 * Math.PI * (uhr[i - 1] + ((a.y - lo) / (a.y - b.y)) * (uhr[i] - uhr[i - 1]));
                [c, sn] = [c + Math.cos(q), sn + Math.sin(q)];
            }
            if (a.y > lo || b.y > lo) continue;
            stand++;
            wegFuss += Math.hypot(b.x - a.x, b.z - a.z);
            wegLeib += Math.hypot(leib[i].x - leib[i - 1].x, leib[i].z - leib[i - 1].z);
        }
        return -Math.atan2(sn, c);
    });
    const standAnteil = +(stand / (spur.length * (spur[0].length - ab - 1))).toFixed(2);
    return { standAnteil, schlupf: wegLeib > 0 ? +(wegFuss / wegLeib).toFixed(3) : null, ph };
};

// Im Seiten-Kontext: eine Gattung läuft mit der Froude-Wurzel v̂ (v = v̂·√(g·L), L die Bein-Länge des Gangs), je Takt die
// Aufsetz-Punkte und die Uhr des Gangs (der Querhang misst am Hang der Welt: gate:kreatur-takt querhang). Stimmung und Zustand
// (`emotions`, `zustand`) trägt der Leib in die EINE Brücke `_motionProfileName` — die Kreuz-Probe. Mit `satz` geht das Tier
// im SATZ seiner Gestalt (Meisterkarte Tiere K3, Staffel 2 — jenseits der `KREATUR_SATZ.nahLeiber` Nächsten): je Takt rückt
// sein Weg die Phase (`_tierSatzGang`, der Takt von updateCreatures), der Blick des Bilds schreibt Band, Phase und Gewicht in
// die Instanz (`_tierSatzPlaetze`); gemessen wird, was der Knoten zeichnet (`_gangSatzKnoten`): je Pfote derselbe Aufsetz-Punkt
// als Ecke ganz an ihrem Knochen (die Vorlage = (Inverse × Bindung)⁻¹ × der Punkt im Gelenk-Raum der Pfote) aus dem
// Knochen-Puffer an Band, Phase und Gewicht × Instanz-Matrix, die Uhr ist die Phase der Instanz. Mit `g` geht es unter der
// Schwere g der Welt (state.gravity; v̂ misst mit ihr — die DSL setzt sie, die Zeile des Tiers muss sie lesen).
const LAUF = (k) => {
    const s = st;
    const T = window.THREE;
    const core = window.__tetrapodaCore;
    const [echt, wahl, g0] = [core.gangSchritt, AnazhRealm._gangWahl, s.gravity];
    // die Täter des Selbsttests (`taeter`): der Vor-Welle-Gang (fester Takt, feste Auslenkung) · der Satz wählt ohne das
    // Gedächtnis des Leibs (das rohe Tempo ohne die Gangart des Vor-Takts — so trabte vor `_gangWahl` jedes anlaufende
    // Satz-Tier bei Fr 0,55) · die Zeile des Tiers ohne die Schwere der Welt
    if (k.taeter === "gang")
        core.gangSchritt = () => ({ omega: 3.2, S: 0.06, schritt: 0.12, tast: 0.5, folge: core.GANG_FOLGE.trab });
    if (k.taeter === "satz") AnazhRealm._gangWahl = (g, v, dt, l, L, Z) => echt(v || 0, L, Z);
    if (k.taeter === "schwere") r._gangZeile = () => undefined;
    if (k.g) s.gravity = -k.g;
    const pm = s.playerMesh.position;
    const x0 = pm.x + 40,
        z0 = pm.z + 40;
    const saveMax = s.maxCreatures;
    s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 4);
    const cr = r.spawnCreatureAt(x0, 30, z0, "happy", k.seele, { precise: true, bodySize: 1 });
    s.maxCreatures = saveMax;
    try {
        if (!cr) return { fehler: "Spawn " + k.seele };
        cr.userData.task = { name: "wait", args: {}, since: 0 };
        cr.userData.emotions = k.emotions || null;
        cr.userData._motionZustand = k.zustand || null;
        cr.rotation.set(0, Math.PI / 2, 0); // Blick +x, der Lauf geht +x
        cr.position.set(x0, 0, z0);
        const tb = cr.userData._tierBaum;
        const roles = r._motionRolesForSoul(cr.userData.soul);
        const Tt = tb.teile;
        const pfoten = [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP];
        r._tierBaumNeutralStance(cr);
        cr.updateMatrixWorld(true);
        const boden = cr.position.y;
        const lokal = pfoten.map((p) => {
            const w = new T.Vector3().setFromMatrixPosition(p.matrixWorld);
            w.y = boden;
            return p.worldToLocal(w.clone());
        });
        const hueft = new T.Vector3().setFromMatrixPosition(Tt.legHL.matrixWorld).y - boden;
        const v = k.vh * Math.sqrt(-s.gravity * tb.beinL * (cr.scale.x || 1));
        const satz = k.satz && r._tierSatzFuer(cr);
        if (satz && !satz.fertig) r._tierSatzBacken(satz, 1e6);
        if (k.satz && !(satz && satz.fertig)) return { fehler: "kein Satz für " + k.seele };
        const S = satz && satz.satz;
        // je Pfote ihr Platz im Knochen-Puffer und ihre Vorlage; die Ecke in der Zeile z (drei Texel je Knochen: die Zeilen
        // der affinen Matrix)
        const ecken = (S ? pfoten : []).map((p, j) => {
            const e = S.knochen.findIndex((x) => x.nm === p.name);
            const { q, j: b } = S.knochen[e];
            const m = new T.Matrix4().multiplyMatrices(q.m.skeleton.boneInverses[b], q.m.bindMatrix);
            return [e, lokal[j].clone().applyMatrix4(m.invert())];
        });
        const P = (z, [e, v]) =>
            new T.Vector3(
                ...[0, 1, 2].map((i) =>
                    [v.x, v.y, v.z, 1].reduce((a, q, c) => a + q * S.tex.image.data[((z * S.J + e) * 3 + i) * 4 + c], 0)
                )
            );
        if (satz) r._tierSatzEin(cr, satz);
        const m4 = new T.Matrix4();
        // Frame-Takt und Raten-Leiter: je Frame zieht der Leib weiter, ausgewertet (und gemessen) wird, wenn die ECHTE
        // Leiter (_creatureAnimDiv mit dem Takt des Gangs) es will — im Band ihrer Stufe 1/4 (0,8 × Fern-Distanz).
        const dt = 1 / (k.fps || 60),
            N = 360;
        const fernDist = core.PORTAL_RENDER_CONFIG.lod.budget.kreatur[1].ab * (cr.scale.x || 1);
        const stufe = () =>
            k.last ? r._creatureAnimDiv(0.8 * fernDist, fernDist, tb._gang ? tb._gang.omega : 0, dt) : 1;
        let maxDiv = 1,
            auswertungen = 0;
        let t = 0,
            phase = 0;
        const spur = pfoten.map(() => []);
        const [leib, uhr] = [[], []];
        cr.userData._animFade = 1;
        for (let i = 0; auswertungen < N; i++) {
            cr.position.x += v * dt;
            t += dt;
            phase += dt * 5.0;
            if (satz) {
                r._tierSatzGang(cr, dt);
                if (r._tierSatzStempel(cr)) cr.userData._satzVer = (cr.userData._satzVer || 0) + 1;
                r._tierSatzPlaetze(satz.platzB, [cr]);
                // wie der Knoten: Stand ↔ (Zeile k0 ↔ k0 + 1 an der Phase) am Gewicht, × Instanz-Matrix
                const a = S.fell.geometry.attributes.aGang;
                const [f, b] = [(a.getX(0) % 1) * S.n, Math.floor(a.getX(0)) * S.n];
                const k0 = Math.floor(f);
                m4.fromArray(S.fell.instanceMatrix.array, 0);
                ecken.forEach((e, j) => {
                    const lauf = P(b + k0, e).lerp(P(b + ((k0 + 1) % S.n), e), f - k0);
                    spur[j].push([
                        P(S.baender * S.n, e)
                            .lerp(lauf, a.getY(0))
                            .applyMatrix4(m4),
                    ]);
                });
                uhr.push(cr.userData._satzPh);
            } else {
                const div = stufe();
                if (i % div !== 0) continue;
                maxDiv = Math.max(maxDiv, auswertungen > 60 ? div : 1);
                r._animateCompoundMotion(cr, roles, t, phase, true, cr.userData.emotions);
                cr.updateMatrixWorld(true);
                pfoten.forEach((p, j) => spur[j].push([p.localToWorld(lokal[j].clone())]));
                uhr.push((t * tb._gang.omega) / (2 * Math.PI)); // die Zeit im Takt des Gangs (die Phase eines Beins springt an seiner Kette)
            }
            auswertungen++;
            leib.push({ x: cr.position.x, z: cr.position.z });
        }
        return {
            seele: k.seele,
            vh: k.vh,
            v,
            band: satz ? AnazhRealm.KREATUR_SATZ.baender[cr.userData._satzBand] : null,
            last: !!k.last,
            name: k.last ? `${k.fps} fps · Leiter 1/${maxDiv}` : k.name,
            hueftM: +hueft.toFixed(3),
            ...window.__schlupf(spur, leib, 60, hueft, uhr), // nach 60 Takten Einschwingen
        };
    } finally {
        [core.gangSchritt, AnazhRealm._gangWahl, s.gravity] = [echt, wahl, g0];
        delete r._gangZeile;
        if (cr) r.removeCreature(cr);
    }
};

// DER SPIELER-LEIB (K07, dieselbe Linse): der Mensch geht durch seinen ECHTEN Chokepoint (animatePlayerSoul — Gang-Tick,
// Pose, Fuß-IK, Schritt-Klang), erst 3 s Gehen (1,15 m/s, das Tempo von W im Modus pfad), dann 3 s Laufen (5,16 m/s,
// Shift); der Leib zieht je Takt um v·dt längs seiner Gier, der Boden ist eben (der Träger des Kapsel-Schritts). Gemessen
// wird derselbe Aufsetz-Punkt wie bei den Tieren (der Boden-Punkt unter dem Knöchel in der Ruhe-Pose, im Gelenk-Raum
// mitgeführt), dieselbe Stand-Schwelle (5 % der Beinlänge) und derselbe Schlupf; dazu die Kadenz (Halbzyklen der
// Gang-Phase je Sekunde, Soll ≥ 1,5 beim Gehen) und die Schritt-Töne (state._schrittKlang.schritte) gegen 2·v·t/Λ, Λ der
// Doppelschritt des Chokepoints (jeder Schritt klingt).
const LEIB = (k) => {
    const s = st,
        A = AnazhRealm;
    const T = window.THREE;
    const core = window.__tetrapodaCore;
    const p = s.player;
    if (!s.playerMesh.userData.rig) r.applyPlayerSoul("human");
    const mesh = s.playerMesh;
    const rig = mesh.userData.rig;
    if (!rig) return { fehler: "Spieler ohne Rig" };
    if (k.stub) {
        window.__gangEcht = core.gangSchritt;
        // der Vor-Wellen-Gang des Menschen: 3,4 m je Schritt, der Sinus-Schwung (±0,5 rad ≈ 0,86 m Fußweg)
        core.gangSchritt = (v) =>
            v > 0.05
                ? { omega: (Math.PI * v) / 3.4, S: 0.86, schritt: 6.8, tast: 0.5 }
                : { omega: 0, S: 0, schritt: 0, tast: 0.5 };
    }
    const gespeichert = {
        vel: s.playerVel,
        uw: s.playerUnderwater,
        arch: p.mountedArch,
        luft: s.isInAir,
        tr: s._kapselTraegerY,
        st: s._kapselStruktur,
    };
    const pos0 = mesh.position.clone(),
        rot0 = mesh.rotation.y;
    s.playerUnderwater = false;
    p.mountedArch = null;
    s.isInAir = false;
    let vx = 0;
    s.playerVel = { x: () => vx, z: () => 0, y: () => 0 };
    // ein ebener Ort fern jedes gebauten Chunks: der Stand-Leser trägt dort den Träger
    mesh.position.set(pos0.x + 4000, 50, pos0.z + 4000);
    mesh.rotation.y = Math.PI / 2; // Blick +x
    const sohle = () => mesh.position.y - A.PLAYER_FOOT_OFFSET;
    s._kapselTraegerY = sohle();
    s._kapselStruktur = false;
    let t = 1000;
    const dt = 1 / 60;
    p.animationLastTick = -Infinity;
    for (let i = 0; i < 90; i++) r.animatePlayerSoul((t += dt)); // Ruhe einschwingen
    mesh.updateMatrixWorld(true);
    const knoechel = [rig.legL.ankle, rig.legR.ankle];
    const lokal = knoechel.map((a) => {
        const w = new T.Vector3().setFromMatrixPosition(a.matrixWorld);
        w.y = sohle();
        return a.worldToLocal(w.clone());
    });
    // DER KONTAKT DES FUSSES (K07, das Abrollen): Ferse (die Sohle unter dem Knöchel) und Ballen (ballen × R davor, im
    // Gelenk-Maß des Knöchels) — der tiefere Punkt trägt. Rollt der Fuß über den Ballen, steht der Ballen; der Schlupf
    // misst ihn, nie die steigende Ferse. Ohne Abrollen in der Zeile liegt der Ballen auf der Ferse (die Messung von vorher).
    const zeileB = r._gangZeile(true);
    const massB = r._gaitBeinMass(rig);
    const ballenL = zeileB && zeileB.ballen > 0 ? zeileB.ballen * core.gangReich(massB.l1 + massB.l2) : 0;
    const lokalB = lokal.map((v) => v.clone().add(new T.Vector3(0, 0, ballenL)));
    const beinM = massB.L;
    // die LOCK-LÖSER: je Takt und Bein, das im Stand-Fenster des Gesetzes geht (w ≥ 0,35) — trug es den Lock und
    // trägt es ihn danach nicht mehr, hat die Fuß-IK den stehenden Fuß gelöst
    const zaehl = { stand: 0, loeser: 0, wo: [], takt: 0 };
    const ikAlt = r._gaitLegIK;
    r._gaitLegIK = function (leg, ik, probe, lock, foot, imStand, w) {
        const vor = lock && lock.on;
        const out = ikAlt.apply(this, arguments);
        if (imStand && w >= 0.35) {
            zaehl.stand++;
            if (vor && !lock.on) {
                zaehl.loeser++;
                zaehl.wo.push(
                    +(st.player.walkPhase % (2 * Math.PI)).toFixed(2) + "@" + zaehl.takt
                );
            }
        }
        return out;
    };
    const hw = new T.Vector3();
    const huefte = () => (rig.hips.getWorldPosition(hw), hw.y - sohle());
    const klang = () => (s._schrittKlang ? s._schrittKlang.schritte : 0);
    const ruheH = huefte();
    const zeilen = [];
    for (const [name, v] of [
        ["gehen (W)", 1.15],
        ["laufen (Shift)", 5.16],
        ["Spitze", 6.75],
    ]) {
        zaehl.stand = zaehl.loeser = 0;
        zaehl.wo = [];
        // das Becken im eingeschwungenen Gang (ab Takt 60: der Anlauf-Schritt aus dem Stand liegt davor)
        let hMin = Infinity,
            hMax = -Infinity;
        vx = v;
        const N = 180;
        const spur = [[], []],
            leib = [];
        let ton0 = null,
            ph0 = null;
        for (let i = 0; i < N; i++) {
            mesh.position.x += v * dt;
            zaehl.takt = i;
            r.animatePlayerSoul((t += dt));
            mesh.updateMatrixWorld(true);
            if (i === 30) {
                ton0 = klang();
                ph0 = p.walkPhase;
            }
            leib.push({ x: mesh.position.x, z: mesh.position.z });
            knoechel.forEach((a, j) =>
                spur[j].push([a.localToWorld(lokal[j].clone()), a.localToWorld(lokalB[j].clone())])
            );
            if (i >= 60) {
                const h = huefte();
                hMin = Math.min(hMin, h);
                hMax = Math.max(hMax, h);
            }
        }
        const sek = (N - 1 - 30) * dt;
        const toene = klang() - ton0;
        const kadenz = (p.walkPhase - ph0) / Math.PI / sek;
        // Λ = der Doppelschritt, den der Chokepoint dem Leib gibt
        const lam = r._gaitGesetz(rig, v).schritt;
        const soll = (2 * v * sek) / lam;
        const sl = window.__schlupf(spur, leib, 30, beinM);
        zeilen.push({
            name,
            v,
            beinM: +beinM.toFixed(3),
            ...sl,
            kadenz: +kadenz.toFixed(2),
            schrittM: kadenz > 0 ? +(v / kadenz).toFixed(2) : null,
            toene,
            soll: +soll.toFixed(1),
            beckenHub: +((hMax - hMin) / beinM).toFixed(3),
            beckenTief: +((ruheH - hMin) / beinM).toFixed(3),
            standTakte: zaehl.stand,
            loeser: zaehl.loeser,
            loeserWo: zaehl.wo.join(" "),
        });
    }
    r._gaitLegIK = ikAlt;
    if (k.stub) core.gangSchritt = window.__gangEcht;
    s.playerVel = gespeichert.vel;
    s.playerUnderwater = gespeichert.uw;
    p.mountedArch = gespeichert.arch;
    s.isInAir = gespeichert.luft;
    s._kapselTraegerY = gespeichert.tr;
    s._kapselStruktur = gespeichert.st;
    mesh.position.copy(pos0);
    mesh.rotation.y = rot0;
    const taeter = "_gaitGesetz (fx.bewegung.gang)";
    // der flache Fuß: ohne das Abrollen über den Ballen (tetrapoda gangRolle, fx.bewegung.gang rollWinkel) sinkt das
    // Becken im Doppel-Stand so tief, wie ein flacher Fuß hinten und vorn die Kette verlangt — das Knie knickt ein
    const beckenTaeter =
        zeileB && zeileB.rollWinkel > 0
            ? "tetrapoda gangBecken (das Becken des Gesetzes)"
            : "tetrapoda gangFuss/gangBecken (der flache Fuß, kein Abrollen über den Ballen: gangRolle)";
    const loeserTaeter = "_gaitLegIK (die Reichweiten-Wand löst den stehenden Fuß)";
    return { zeilen, taeter, beckenTaeter, loeserTaeter };
};

// DIE SCHWERE DES GANGS (K07, dieselbe Linse): Schritt und Becken lesen die Schwere der Welt (state.gravity, die DSL setzt
// sie) aus EINER Zeile, Mensch und Tier. Unter der Mond-Schwere (1,62 m/s²) gleicht der Takt des Menschen beim Laufen
// gangSchritt mit dieser Schwere, das Becken des Menschen bekommt dieselbe Zeile (der Spion am Kern liest ihre Schwere), und
// kein Zwilling steht als Literal im Wirt (die Schwere als Zahl im Rig). Das Tier urteilt die Gangart am Verhalten (LAUF mit
// `g`: der Wolf trabt bei v̂ 1,2 der Mond-Schwere, 1,2 m/s — mit der Schwere der Erde ein Schritt); vorher maß hier ein
// Takt-Quotient im Schritt, den der Bein-Winkel bei jeder Schwere gleich deckelt. --selftest: die Zeile ohne die Schwere der
// Welt (der Vor-K07-Gang) → ROT.
const SCHWERE = (k) => {
    const s = st,
        A = AnazhRealm;
    const core = window.__tetrapodaCore;
    const G_MOND = 1.62;
    const rig = s.playerMesh.userData.rig;
    const block = A._bewegungsBlock("gang", A.GANG_FELDER);
    const zeileEcht = r._gangZeile;
    if (k.stub) r._gangZeile = (mensch) => (mensch ? block : undefined);
    const beckenEcht = core.gangBecken;
    const beckenG = [];
    core.gangBecken = function (...a) {
        const Z = a.find((x) => x && typeof x === "object");
        beckenG.push(Z && typeof Z.g === "number" ? Z.g : null);
        return beckenEcht.apply(this, a);
    };
    const g0 = s.gravity;
    const o = {};
    try {
        s.gravity = -G_MOND;
        const L = r._gaitBeinMass(rig).L;
        const gait = r._gaitGesetz(rig, 5.16);
        o.mensch = gait.omega / core.gangSchritt(5.16, L, Object.assign({}, block, { g: G_MOND })).omega;
        r._animateHumanoidRig(rig, 1000, 1, true, false, null, gait);
        o.becken = beckenG.length ? beckenG[beckenG.length - 1] : "nie gerufen";
    } finally {
        s.gravity = g0;
        core.gangBecken = beckenEcht;
        r._gangZeile = zeileEcht;
    }
    // die Zwillinge als Literal (kommentar-gestrippt: der EINE Absenz-Helfer des Welt-Boots)
    o.zwillinge = [];
    if (!window.__fehlt([r._animateHumanoidRig, r._gaitGesetz], /\b9\.81\b/))
        o.zwillinge.push("_animateHumanoidRig/_gaitGesetz: die Schwere als Zahl 9,81");
    return o;
};

// DAS KÖRPER-STUDIO: derselbe Mensch im Labor (worlds/koerperstudio, Spiel-Modus) — die Taste geht, playInput
// und playPhysics ziehen den Leib mit festem Takt 1/60 s über ebenen Boden (die Park-Boxen ruhen), je Takt das Fuß-
// gelenk beider Beine in der Welt. Derselbe Schlupf (Weg des Stand-Fußes / Weg des Leibs, Stand = unterste 5 % der
// Beinlänge), dazu die Kadenz aus der Phase.
const STUDIO = (k) => {
    /* eslint-disable no-undef */
    const core = window.__tetrapodaCore;
    if (k.stub) {
        window.__gangEcht = core.gangSchritt;
        core.gangSchritt = () => ({ omega: 3.2, S: 0.06, schritt: 0.12, tast: 0.5, hub: 0.1 });
    }
    if (!play.on) enterPlay();
    const boxen = parkBoxes.splice(0, parkBoxes.length);
    // ein ebener Boden ohne Hindernis (der Boden des Labors ist selbst eine Park-Box)
    parkBoxes.push({ cx: 0, cy: -0.45, cz: 0, sx: 4000, sy: 1, sz: 4000, maxY: 0.05, minY: -0.95, wall: false });
    const dt = 1 / 60,
        N = 300,
        EIN = 90;
    for (const c of Object.keys(keys)) delete keys[c];
    Object.assign(keys, k.tasten);
    play.yaw = 0;
    play.vx = play.vz = play.vy = 0;
    play.posY = play.smY = 0.05;
    play.onGround = true;
    play.slide = 0;
    // BÜHNE: die Gang-Bühne der Probe (eigene Ebene, kein Weltboden)
    character.position.set(0, 0.05, 0);
    const cs = character.scale.x || 1;
    const bein = (L1 + L2) * cs;
    const T = window.THREE;
    const w = new T.Vector3();
    const spur = [[], []],
        leib = [];
    let phase = 0,
        phPrev = play.gaitPhase;
    for (let i = 0; i < N; i++) {
        playInput(dt);
        playPhysics(dt);
        character.updateMatrixWorld(true);
        ["ankle1", "ankle-1"].forEach((n, j) => {
            // Ferse und Ballen (K07, wie in der Welt): die Sohle footBelowAnkle unter dem Knöchel, der Ballen ballen × R davor
            const ballenE = _GZ && _GZ.ballen > 0 ? _GZ.ballen * core.gangReich(L1 + L2) : 0;
            const f = parts[n].localToWorld(w.set(0, -footBelowAnkle, 0)).clone();
            const b = parts[n].localToWorld(w.set(0, -footBelowAnkle, ballenE)).clone();
            spur[j].push([f, b]);
        });
        leib.push({ x: character.position.x, z: character.position.z, y: character.position.y });
        if (i >= EIN) phase += (play.gaitPhase - phPrev + 1) % 1;
        phPrev = play.gaitPhase;
    }
    for (const c of Object.keys(keys)) delete keys[c];
    parkBoxes.splice(0, parkBoxes.length, ...boxen);
    if (k.stub) core.gangSchritt = window.__gangEcht;
    const sl = window.__schlupf(spur, leib, EIN, bein);
    let yMin = Infinity,
        yMax = -Infinity;
    for (let i = EIN; i < N; i++) {
        yMin = Math.min(yMin, leib[i].y);
        yMax = Math.max(yMax, leib[i].y);
    }
    const zeit = (N - EIN) * dt;
    const v = Math.hypot(leib[N - 1].x - leib[EIN].x, leib[N - 1].z - leib[EIN].z) / zeit;
    return {
        name: k.name,
        v: +v.toFixed(2),
        beinE: +bein.toFixed(3),
        ...sl,
        kadenz: +((2 * phase) / zeit).toFixed(2),
        beckenHub: +((yMax - yMin) / bein).toFixed(3),
        taeter: "gangGesetz (tetrapoda gangSchritt/gangFuss)",
    };
    /* eslint-enable no-undef */
};

// DIE GANGART UND IHR TASTGRAD AUS DEM TEMPO (Meisterkarte Tiere H3, K3): Welt (LAUF als Leib, SATZ im Satz) und Labor
// (worlds/tetrapoda, EIN Tier über dieselben v̂) bei v̂ 0,3 · 0,74 (Fr 0,55 im Band der Hysterese) · 1,2 · 3,5 → Schritt
// lateral, Trab, Galopp, Labor = Leib = Satz auf ≤ 0,05 Zyklus je Bein; der TASTGRAD (Anteil des Zyklus im Stand: Welt die
// Pfote am Boden, Labor der Fuß aus gangFuss) im Band (Alexander 1984, Hildebrand 1965). --selftest: Stimmungs-Muster und
// Tastgrad 0,5 → ROT.
const VH = [0.3, 0.74, 1.2, 3.5];
const GANG_SOLL = { 0.3: "schritt-lateral", 0.74: "schritt-lateral", 1.2: "trab", 3.5: "galopp" };
const TAST_SOLL = { 0.3: [0.6, 0.7], 0.74: [0.6, 0.7], 1.2: [0.4, 0.6], 3.5: [0.25, 0.35] };
const LABOR_WELT = { wolf: "wolf", fox: "fuchs", bear: "baer", deer: "wesen" };
const STIMMUNG_FOLGE = [0, 0.75 * Math.PI, 1.5 * Math.PI, 0.25 * Math.PI];
// DIE KREUZ-PROBE Stimmung × Tempo (das Schlupfloch der Karte: ein Galopp an der Flucht bestünde beim Flucht-Tempo zufällig):
// jede Gattung in vier Stimmungen und Zuständen (die Achsen der EINEN Brücke `_motionProfileName`, der Zustand von
// updateCreatures) bei v̂ 0,3 · 1,2 · 3,5 — die Gangart folgt nur der Froude-Zahl
const KREUZ = [
    { name: "Freude", emotions: { joy: 1 } },
    { name: "Furcht", emotions: { chaos: 1, sorrow: 0.6 }, zustand: "flucht" },
    { name: "Trauer", emotions: { sorrow: 1 } },
    { name: "Jagd", zustand: "jagd" },
];
// der Abstand zweier Phasen im Kreis (Zyklen)
const kreis = (a, b) => Math.min(Math.abs(a - b), 1 - Math.abs(a - b));
const zyklus = (ph) => ph.map((q) => ((((q - ph[0]) / (2 * Math.PI)) % 1) + 1) % 1);
// Aufsetzen bei Phase π (gangFuss): ein größerer Versatz setzt früher auf
function gangart(ph) {
    const rel = zyklus(ph);
    const d = (a, b) => kreis(rel[a], rel[b]);
    const aus = (art) => ({ art, rel: rel.map((x) => +x.toFixed(2)) });
    if (d(0, 3) < 0.1 && d(1, 2) < 0.1 && d(0, 1) > 0.4) return aus("trab");
    if (d(0, 1) < 0.25 && d(2, 3) < 0.25 && d(0, 2) >= 0.25 && d(1, 3) >= 0.25) return aus("galopp");
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) if (d(a, b) < 0.15) return aus("unbestimmt");
    const folge = [0, 1, 2, 3].sort((a, b) => ((1 - rel[a]) % 1) - ((1 - rel[b]) % 1));
    const nach = (bein) => folge[(folge.indexOf(bein) + 1) % 4];
    return aus(nach(2) === 0 && nach(3) === 1 ? "schritt-lateral" : "schritt-diagonal");
}
// das Labor (gangTakt): Phasen gegen das erste Bein und Tastgrad über die sechste Sekunde (im Kreis gemittelt)
const GANG = (k) => {
    /* eslint-disable no-undef */
    const core = window.__tetrapodaCore;
    const echt = core.gangSchritt;
    if (k.stub)
        core.gangSchritt = function (...a) {
            return Object.assign(echt.apply(this, a), { folge: k.stimmung, tast: 0.5 });
        };
    const zeilen = [];
    try {
        document.querySelector('#presets button[data-p="' + k.art + '"]').click();
        for (const vh of k.vh) {
            const c = [0, 0, 0, 0],
                s = [0, 0, 0, 0];
            let steht = 0;
            gangTempo(vh);
            for (let i = 0; i < 360; i++) {
                gangTakt(1 / 60);
                if (i < 300) continue;
                for (let j = 0; j < 4; j++) {
                    c[j] += Math.cos(cpgPhase[j] - cpgPhase[0]);
                    s[j] += Math.sin(cpgPhase[j] - cpgPhase[0]);
                    if (core.gangFuss(cpgPhase[j], gangS, gangTast).hub === 0) steht++;
                }
            }
            zeilen.push({ vh, ph: c.map((x, i) => Math.atan2(s[i], x)), tast: +(steht / 240).toFixed(2) });
        }
        gangTempo(0);
    } finally {
        core.gangSchritt = echt;
    }
    return { zeilen };
    /* eslint-enable no-undef */
};

hauptLauf(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "null", frist: 300000 });
    // je Seite ihr Fehler beim Namen und (wo sie gemessen wird) der EINE Schlupf — ohne Frist (ein hängender Boot steht in der Stall-Akte)
    const seite = async (b, wer, schlupf) => {
        const p = await b.newPage();
        if (schlupf) await p.evaluateOnNewDocument(`window.__schlupf = ${SCHLUPF};`);
        return p;
    };
    const page = await seite(browser, "", true);
    await nullRenderer(page);
    let rot = 0;
    let schwereRot = false;
    let gangRot = false,
        tastRot = false;
    const [weltGang, satzGang, gefeuert] = [{}, {}, new Set()];
    // im Selbsttest trägt jede Zeile ihr Etikett: ihr ❌ ist das Soll (der gestubbte Täter), nie ein Befund
    const log = (...a) => console.log(...(SELBST ? ["[Selbsttest]", ...a] : a));
    // die Gangart je v̂ (Fußfolge, Tastgrad im Band) und der Abstand der Phasen gegen
    // jede Vergleichs-Zeile ({Name: Zeile}: „Name − Ort“ in Zyklen, Soll ≤ 0,05)
    const gangUrteil = (wo, z, vergleich = {}) => {
        const g = gangart(z.ph);
        const [lo, hi] = TAST_SOLL[z.vh];
        const art = g.art === GANG_SOLL[z.vh],
            tast = z.tast >= lo && z.tast <= hi;
        const ab = Object.entries(vergleich).map(([n, v]) => [
            n,
            Math.max(...zyklus(v.ph).map((x, i) => kreis(x, g.rel[i]))),
        ]);
        const nah = ab.every(([, d]) => d <= 0.05);
        const ok = art && tast && nah;
        log(
            `  ${ok ? "✅" : "❌"} Gangart ${wo} v̂ ${z.vh} · ${g.art} [${g.rel.join(" ")}]${art ? "" : " — Soll " + GANG_SOLL[z.vh]} · Tastgrad ${z.tast}${tast ? "" : ` (Soll ${lo}–${hi})`}${ab.map(([n, d]) => ` · ${n} − Labor ${d.toFixed(2)} Zyklus`).join("")}${ok ? "" : " — Täter: " + (wo[0] === "S" ? "_tierSatzSchritt" : "tetrapoda gangSchritt")}`
        );
        if (!ok) rot++;
        if (!art || !nah) gangRot = true;
        if (!tast) tastRot = true;
        return ok;
    };
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        // die Welt und ihr Gang-Gesetz sind da: das EINE Warten ohne Frist (ein hängender Boot steht in der Stall-Akte)
        await page.evaluate(() =>
            window.__weltDa(() => window.__tetrapodaCore && typeof window.__tetrapodaCore.gangSchritt === "function")
        );
        // je Gattung der Leib bei jedem v̂ (die KREUZ-PROBE im lateinischen Quadrat: jede Stimmung einmal je v̂, je Gattung eine
        // andere), unter Last und im Satz; dazu der Wolf unter der Mond-Schwere — im Selbsttest je Lauf sein Täter
        const T0 = SELBST ? "gang" : null;
        const laeufe = [{ seele: "wolf", vh: 1.2, g: 1.62, name: "Mond", taeter: T0 && "schwere" }];
        for (const [i, seele] of Object.values(LABOR_WELT).entries()) {
            for (const [j, vh] of VH.entries()) laeufe.push({ seele, vh, ...KREUZ[(i + j) % 4], taeter: T0 });
            for (const vh of [0.74, 1.2]) laeufe.push({ seele, vh, fps: 30, last: true, taeter: T0 });
            for (const vh of VH) laeufe.push({ seele, vh, satz: true, taeter: T0 && "satz" });
        }
        for (const k of laeufe) {
            const z = await page.evaluate(LAUF, k);
            if (z.fehler) {
                log("  ❌", z.fehler);
                rot++;
                continue;
            }
            const ok = z.schlupf !== null && z.schlupf <= SCHWELLE;
            log(
                `  ${ok ? "✅" : "❌"} ${z.band ? "satz " : ""}${z.seele.padEnd(5)} v̂ ${z.vh} ${z.v.toFixed(1)} m/s${z.name ? " (" + z.name + ")" : ""}${z.band ? " · Band " + z.band : ""} · Hüfte ${z.hueftM} m · Stand ${z.standAnteil} · Schlupf ${z.schlupf}`
            );
            if (!ok) rot++;
            // unter der Raten-Leiter wertet der Leib nur jeden 2./4. Takt aus (4–6 Posen je Zyklus): Aufsetzen und Stand sind auf
            // die Auswertungen gerastert — dort urteilt der Schlupf, Folge und Tastgrad urteilen die vollen Takte
            if (z.last) continue;
            const gut = gangUrteil((z.band ? "Satz " : "Welt ") + z.seele + (z.name ? ` (${z.name})` : ""), {
                vh: z.vh,
                ph: z.ph,
                tast: z.standAnteil,
            });
            if (!k.g) (z.band ? satzGang : weltGang)[z.seele + z.vh] = z;
            if (!gut) gefeuert.add(k.taeter);
        }
        const leib = await page.evaluate(LEIB, { stub: SELBST });
        if (leib.fehler) {
            log("  ❌ Spieler-Leib:", leib.fehler);
            rot++;
        } else {
            for (const z of leib.zeilen) {
                const gleit = z.schlupf !== null && z.schlupf <= SCHWELLE;
                const kad = z.v > 2 || z.kadenz >= KADENZ_GEHEN;
                const spitze = z.name === "Spitze";
                const ton = spitze || (z.soll > 0 && Math.abs(z.toene - z.soll) <= TON_TOLERANZ * z.soll);
                const B = z.v > 2 ? BECKEN.laufen : BECKEN.gehen;
                const becken = z.beckenHub <= B.hub && z.beckenTief <= B.tief;
                const lock = z.standTakte > 0 && z.loeser === 0;
                const ok = gleit && kad && ton && becken && lock;
                const taeter = [
                    !(gleit && kad && ton) ? leib.taeter : null,
                    becken ? null : leib.beckenTaeter,
                    lock ? null : leib.loeserTaeter,
                ].filter(Boolean);
                log(
                    `  ${ok ? "✅" : "❌"} mensch ${z.name} ${z.v.toFixed(2)} m/s · Bein ${z.beinM} m · Stand ${z.standAnteil} · Schlupf ${z.schlupf}${gleit ? "" : " (> " + SCHWELLE + ")"} · Kadenz ${z.kadenz} Schritte/s (${z.schrittM} m je Schritt)${kad ? "" : " < " + KADENZ_GEHEN} · Töne ${z.toene} / Soll ${z.soll}${ton ? "" : " (± 15 % verfehlt)"} · Becken Hub ${z.beckenHub} L / Tiefe ${z.beckenTief} L${becken ? "" : " (Soll ≤ " + B.hub + " / " + B.tief + ")"} · Lock-Löser ${z.loeser}${z.loeser ? " (Phase@Takt " + z.loeserWo + ")" : ""} in ${z.standTakte} Stand-Takten${ok ? "" : " — Täter: " + taeter.join(" · ")}`
                );
                if (!ok) rot++;
            }
        }
        const sw = await page.evaluate(SCHWERE, { stub: SELBST });
        const taeter = [
            Math.abs(sw.mensch - 1) <= 1e-6
                ? null
                : "_gaitGesetz (der Schritt des Menschen liest nicht die Schwere der Welt)",
            sw.becken === 1.62
                ? null
                : "_animateHumanoidRig (das Becken bekommt nicht die Zeile mit der Schwere der Welt)",
            ...sw.zwillinge,
        ].filter(Boolean);
        log(
            `  ${taeter.length ? "❌" : "✅"} Schwere 1,62 m/s² · Takt Mensch ${sw.mensch.toFixed(4)} × Gesetz · Becken-Zeile g ${sw.becken} · Literal-Zwillinge ${sw.zwillinge.length}${taeter.length ? " — Täter: " + taeter.join(" · ") : ""}`
        );
        if (taeter.length) {
            rot++;
            schwereRot = true;
        }
        // das Labor braucht WebGL (r128): ein eigener Browser mit dem Software-Holz
        const sb = await starteBrowser({ art: "linse", frist: 300000 });
        try {
            const sp = await seite(sb, "STUDIO-", true);
            await server.zeige(sp, 240000, "worlds/koerperstudio/index.html");
            // das Labor steht, wenn sein Spiel-Modus geladen ist — ohne Frist (ein swiftshader-Bild des Labors hält den Compositor
            // und mit ihm den Poll); ein hängendes Labor steht in der Stall-Akte
            // eslint-disable-next-line no-undef
            await sp.waitForFunction(
                () =>
                    typeof enterPlay === "function" &&
                    typeof playPhysics === "function" &&
                    typeof parkBoxes !== "undefined",
                { timeout: 0 }
            );
            for (const [name, tasten] of [
                ["geduckt", { KeyW: true, ControlLeft: true }],
                ["gehen", { KeyW: true }],
                ["sprint", { KeyW: true, ShiftLeft: true }],
            ]) {
                const z = await sp.evaluate(STUDIO, { name, tasten, stub: SELBST });
                // dasselbe Becken-Soll wie in der Welt (geduckt geht, gehen und Sprint laufen im Labor)
                const B = name === "geduckt" ? BECKEN.gehen : BECKEN.laufen;
                const ok = z.schlupf !== null && z.schlupf <= SCHWELLE && z.beckenHub <= B.hub;
                log(
                    `  ${ok ? "✅" : "❌"} studio ${z.name} ${z.v} E/s · Bein ${z.beinE} E · Stand ${z.standAnteil} · Schlupf ${z.schlupf} · Kadenz ${z.kadenz} Schritte/s · Becken Hub ${z.beckenHub} L (Soll ≤ ${B.hub}) · Täter ${z.taeter}`
                );
                if (!ok) rot++;
            }
            // dieselbe Gangart im Labor der Tiere (Labor = Welt)
            const tp = await seite(sb, "TETRAPODA-");
            await server.zeige(tp, 240000, "worlds/tetrapoda/index.html");
            await tp.waitForFunction(() => typeof wolf !== "undefined" && !!wolf && typeof emo !== "undefined", { timeout: 0 });
            for (const [gattung, seele] of Object.entries(LABOR_WELT)) {
                const res = await tp.evaluate(GANG, { art: gattung, vh: VH, stub: SELBST, stimmung: STIMMUNG_FOLGE });
                for (const z of res.zeilen)
                    gangUrteil("Labor " + gattung, z, { Welt: weltGang[seele + z.vh], Satz: satzGang[seele + z.vh] });
            }
        } finally {
            await sb.close();
        }
    } finally {
        await browser.close();
        server.close();
    }
    if (SELBST) {
        // je Wand ihr Täter — feuert er nicht, ist die Wand vakuös
        const vakuoes = [
            [rot > 0, "mit gestubbtem Gang-Gesetz glitt keine Pfote: die Linse"],
            [schwereRot && gefeuert.has("schwere"), "die Zeile ohne die Schwere der Welt blieb grün: die Schwere-Wand"],
            [gangRot, "das Muster der Stimmung blieb grün: die Gangart-Wand"],
            [tastRot, "der halbe Stand (Tastgrad 0,5) blieb grün: die Tastgrad-Wand"],
            [gefeuert.has("satz"), "der Satz ohne das Gedächtnis des Leibs blieb grün: die Satz-Wand"],
        ].find(([ok]) => !ok);
        urteilEnde(vakuoes, () => `\n❌ SELBST-TEST ROT — ${vakuoes[1]} ist vakuös.`, `\n✅ SELBST-TEST GRÜN — der Vor-Welle-Gang gleitet (${rot} Läufe über ${SCHWELLE}).`);
    }
    if (rot) {
        console.error(
            `\n❌ ROT — ${rot} Läufe verletzt (Schlupf > ${SCHWELLE}, Kadenz, Töne, Becken, Lock-Löser, Gangart oder Tastgrad).`
        );
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — jede Gattung setzt ihre Pfoten (Schlupf ≤ ${SCHWELLE}) in Schritt, Trab und Galopp; der Mensch geht und läuft nach demselben Gesetz (Kadenz ≥ ${KADENZ_GEHEN}, Töne ± 15 %), in der Welt und im Körper-Studio.`
    );
    process.exit(0);
});
