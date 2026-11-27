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
//   DAS KÖRPER-STUDIO (w4-koerper-park): das Labor geht den EINEN Bewegungs-Takt der Welt (TAKT, byte-gleich je Schritt) und
//   bewegt sich je Verb und Phase nach dem Soll des Kerns (BEWEGUNG: die Vorführung, das Instrument, `leibSollUrteil`); die
//   Gang-Probe des Labors fiel mit dem Schnitt — sein Gang IST der Gang der Welt (leibGangTakt · leibRigPose).
//   DIE SCHWERE: Mensch und Tier gehen nach der Schwere der Welt, Schritt und Becken aus EINER Zeile (SCHWERE, unten).
//   DER SATZ: jenseits der nahen Leiber geht das Tier im Satz seiner Gestalt (SATZ, unten) — Schlupf, Gangart, Tastgrad
//   und die Phasen der Folge, wie der Knoten sie zeichnet; die KREUZ-PROBE Stimmung × Tempo (KREUZ, unten).
//   --selftest: das Gang-Gesetz gestubbt (fester Takt, feste Auslenkung — der Vor-Welle-Gang) → der Schlupf steigt
//   über die Schwelle, die Linse feuert; die Zeile ohne die Schwere der Welt → die Schwere-Wand feuert; die Flucht
//   wählt den Galopp → die Kreuz-Probe feuert; die Hysterese beidseits der Natur (der Vor-Wechsel, hinauf × 1,2) → die
//   WECHSEL-WAND feuert (WECHSEL, unten: der Gangwechsel hinauf an der Froude-Zahl der Natur ± 8 %, je Gattung).
//   Jede Zeile des Selbsttests trägt „[Selbsttest]“ (ihr ❌ ist das Soll).
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
    // der Vor-Wechsel (nerv-bewegung): die Hysterese beidseits der Natur — hinauf erst über froudeX × 1,2
    if (k.taeter === "wechsel")
        core.gangSchritt = (v, L, Z, vorher) => {
            const gs = echt(v, L, Z, vorher);
            if (gs.art === "stand") return gs;
            const [F, h] = [core.GANG_FOLGE, core.GANG_FOLGE.hysterese];
            const fr = (Math.min(v, core.GANG_GESETZ.vMax) ** 2) / (((Z && Z.g) || core.GANG_GESETZ.g) * L);
            const rang = vorher === "galopp" ? 2 : vorher === "trab" ? 1 : 0;
            const [fT, fG] = [F.froudeTrab * (rang >= 1 ? 1 - h : 1 + h), F.froudeGalopp * (rang >= 2 ? 1 - h : 1 + h)];
            const art = fr < fT ? "schritt" : fr < fG ? "trab" : "galopp";
            return Object.assign(gs, { art, folge: F[art] });
        };
    if (k.taeter === "schwere") r._gangZeile = () => undefined;
    if (k.g) r.dslEffects.gravity([-k.g]); // die Schwere über das Wort der Welt (DSL `gravity`), nie in den Zustand
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
        // DER KONTAKT DER PFOTE (wie beim Menschen Ferse und Ballen, „der tiefere Punkt trägt“): der Punkt unter dem
        // Pfoten-Gelenk und die Zehe — die vorderste Stelle des Sohlen-Profils (tetrapoda tierBeinMass e, nahe der Sohle).
        // Rollt die Pfote über die Zehe (tierPose: die gekippte Pfote steht auf ihrem Profil), steht die Zehe; vorher zählte
        // nur der Punkt unter dem Gelenk, der im Abrollen zu Recht steigt (Satz fuchs Galopp Tastgrad 0,26 → 0,24)
        const zehe = pfoten.map((p, j) => {
            const E = (tb.bein[j] && tb.bein[j].e && tb.bein[j].e.l) || [];
            let [dzMin, dzMax] = [Infinity, -Infinity];
            for (let i = 0; i < E.length; i += 2) [dzMin, dzMax] = [Math.min(dzMin, E[i]), Math.max(dzMax, E[i])];
            let best = null;
            for (let i = 0; i < E.length; i += 2)
                if (E[i + 1] <= 0.25 * (dzMax - dzMin) && (!best || E[i] > best[0])) best = [E[i], E[i + 1]];
            if (!best || !(best[0] > 0)) return null;
            const s = cr.scale.x || 1;
            const w = new T.Vector3().setFromMatrixPosition(p.matrixWorld);
            w.set(w.x + best[0] * s, boden + best[1] * s, w.z); // der Blick geht +x
            return p.worldToLocal(w);
        });
        const hueft = new T.Vector3().setFromMatrixPosition(Tt.legHL.matrixWorld).y - boden;
        const v = k.vh * Math.sqrt(-s.gravity * tb.beinL * (cr.scale.x || 1));
        // DER ANLAUF HINAB (`vor`, v̂): die ersten 30 Takte läuft das Tier schneller, dann bremst es auf v̂ — die Gangart hält
        // die Hysterese hinab (gangBand), gemessen ab Takt 60
        const vVor = k.vor ? k.vor * Math.sqrt(-s.gravity * tb.beinL * (cr.scale.x || 1)) : v;
        const satz = k.satz && r._tierSatzFuer(cr);
        if (satz && !satz.fertig) r._tierSatzBacken(satz, 1e6);
        if (k.satz && !(satz?.fertig)) return { fehler: "kein Satz für " + k.seele };
        const S = satz && satz.satz;
        // je Pfote ihr Platz im Knochen-Puffer und ihre Vorlage; die Ecke in der Zeile z (drei Texel je Knochen: die Zeilen
        // der affinen Matrix)
        const ecken = (S ? pfoten : []).map((p, j) => {
            const e = S.knochen.findIndex((x) => x.nm === p.name);
            const { q, j: b } = S.knochen[e];
            const m = new T.Matrix4().multiplyMatrices(q.m.skeleton.boneInverses[b], q.m.bindMatrix).invert();
            return [lokal[j], zehe[j]].filter(Boolean).map((l) => [e, l.clone().applyMatrix4(m)]);
        });
        const P = (z, [e, v]) =>
            new T.Vector3(
                ...[0, 1, 2].map((i) =>
                    [v.x, v.y, v.z, 1].reduce((a, q, c) => a + q * S.tex.image.data[AnazhRealm._gangOrt(S, z, e) + i * 4 + c], 0)
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
            k.last ? r._creatureAnimDiv(0.8 * fernDist, fernDist, tb._gang ? tb._gang.omega : 0, dt, true, tb._gang ? tb._gang.tast : 0) : 1;
        let maxDiv = 1,
            auswertungen = 0;
        let t = 0,
            phase = 0;
        const spur = pfoten.map(() => []);
        const [leib, uhr] = [[], []];
        cr.userData._animFade = 1;
        for (let i = 0; auswertungen < N; i++) {
            cr.position.x += (auswertungen < 30 ? vVor : v) * dt;
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
                ecken.forEach((E, j) =>
                    spur[j].push(
                        E.map((e) => {
                            const lauf = P(b + k0, e).lerp(P(b + ((k0 + 1) % S.n), e), f - k0);
                            return P(S.baender * S.n, e).lerp(lauf, a.getY(0)).applyMatrix4(m4);
                        })
                    )
                );
                uhr.push(cr.userData._satzPh);
            } else {
                const div = stufe();
                if (i % div !== 0) continue;
                maxDiv = Math.max(maxDiv, auswertungen > 60 ? div : 1);
                r._animateCompoundMotion(cr, roles, t, phase, true, cr.userData.emotions);
                cr.updateMatrixWorld(true);
                pfoten.forEach((p, j) => spur[j].push([lokal[j], zehe[j]].filter(Boolean).map((l) => p.localToWorld(l.clone()))));
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
        [core.gangSchritt, AnazhRealm._gangWahl] = [echt, wahl];
        r.dslEffects.gravity([g0]);
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
    const ballenL = zeileB?.ballen > 0 ? zeileB.ballen * core.gangReich(massB.l1 + massB.l2) : 0;
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
    // das Tempo, das der Leib trägt (nerv-bewegung: Gehen und Sprint fallen aus der Gestalt, koerper `leibVerben` — bis hier
    // fuhr die Probe die Literale der alten Eichung 1,15 / 5,16 m/s, an denen der Spieler nicht mehr ging); die Spitze des Bands
    for (const [name, v] of [
        ["gehen (W)", st.speed],
        ["laufen (Shift)", st.sprintSpeed],
        ["Spitze", 6.75],
    ]) {
        if (!(v > 0)) return { fehler: `der Leib trägt kein Tempo für ${name} (${v})` };
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
        zeileB?.rollWinkel > 0
            ? "tetrapoda gangBecken (das Becken des Gesetzes)"
            : "tetrapoda gangFuss/gangBecken (der flache Fuß, kein Abrollen über den Ballen: gangRolle)";
    const loeserTaeter = "_gaitLegIK (die Reichweiten-Wand löst den stehenden Fuß)";
    return { zeilen, taeter, beckenTaeter, loeserTaeter };
};

// DIE KÖRPERWELLE DES FISCHS (Karte 2 leben.tiere.bewegung#2: „St = f·A/U aus dem Ausgabe-Bild“, Tiefe Strouhal 0,2–0,4 —
// Taylor, Nudds & Thomas 2003): am Bach nächst dem Spieler (er steht am Ufer jenseits der Flucht) läuft der ECHTE Takt der
// Fische (`_fischTakt`: Stand, Rheotaxis, Körperwelle) FISCH_SOLL.sek Sekunden mit dt 1/60; gemessen wird nur, was der Pool
// zeichnet (die Instanz-Matrizen von `fischPool`, je Fisch seine Glieder): die Schwanz-Spitze (Mitte des letzten Glieds −
// seine Achse × halbe Länge) quer zur Richtung des Fischs (gleitend über ±glattS — länger als die Periode des langsamsten
// Schlags) gegen die Mitte seiner Glieder, A = ihr Ausschlag Spitze–Spitze, f = ihre Durchgänge je s, U = das Tempo der
// Mitte DURCH das Wasser (gegen `_waterFlowAt`); dazu die BIEGUNG (der größte Unterschied der Gier zwischen Kopf- und
// Schwanz-Glied — ein starrer Leib hat 0). Urteil: St im Band bei ≥ anteil der STETEN Fische (die Richtung im Fenster
// ± steteRad — wer kreist oder wendet, cruist nicht und zählt offen) mit ≥ zyklen Schlägen, die Biegung im Median
// ≥ biegungRad. --selftest: der starre Leib (der Vor-Welle-Fisch: alle Glieder auf der Achse, die Gier wippt mit 2,5 Hz um
// ±0,1 rad — FISCH_GESETZ schlagHz/schlagRad bis 27.11.) → ROT an der Biegung.
const FISCH_SOLL = { st: [0.2, 0.4], sek: 12, glattS: 1.5, steteRad: 0.15, zyklen: 3, anteil: 0.9, biegungRad: 0.1, minFische: 3 };
const FISCH = async (k) => {
    const s = st,
        A = AnazhRealm;
    const pm = s.playerMesh;
    const vor = { p: pm.position.clone(), uhr: s.spielZeit, karte: r._fischKarte };
    const zur = k.stub
        ? leihe(A, {
              _fischGesetz: (() => {
                  const echt = A._fischGesetz.bind(A);
                  return () => {
                      const G = echt();
                      // der Vor-Welle-Leib: die Glieder auf der Achse, die Gier des ganzen Leibs wippt (2,5 Hz, ±0,1 rad)
                      const starr = (f, F, out) => {
                          const n = F.leib.glieder.length,
                              L = F.leib.groesse[2],
                              q = F.leib.ueberlapp / (2 * n),
                              g = f.gier + 0.1 * Math.sin(2 * Math.PI * 2.5 * s.spielZeit + f.welle);
                          for (let i = 0; i < n; i++) {
                              const x = (0.5 - (n > 1 ? q + (i * (1 - 2 * q)) / (n - 1) : 0.5)) * L;
                              [out[3 * i], out[3 * i + 1], out[3 * i + 2]] = [f.x + Math.sin(g) * x, f.z + Math.cos(g) * x, g];
                          }
                          return n;
                      };
                      return Object.assign({}, G, { leib: starr });
                  };
              })(),
          })
        : () => {};
    try {
        const F = A._fischGesetz().F;
        const n = F.leib.glieder.length;
        await __weltDa(() => !r._ensureHydroTilesAround(vor.p.x, vor.p.z, 600));
        const P = (r._hydroFor(vor.p.x, vor.p.z).rivers || []).flatMap((rv) => rv.points.slice(4, -4)).filter((q) => !q.inLake);
        P.sort((a, b) => Math.hypot(a.x - vor.p.x, a.z - vor.p.z) - Math.hypot(b.x - vor.p.x, b.z - vor.p.z));
        const ort = P.find((q) => r._waterFlowAt(q.x, q.z) && r._nassAt(q.x, q.z));
        if (!ort) return { fehler: "kein fließender Bach binnen 600 m um den Spieler" };
        await __weltDa(() => !r._ensureHydroTilesAround(ort.x, ort.z, 120));
        // der Spieler am Ufer, jenseits der Flucht (wegM): gemessen wird das stete Schwimmen gegen den Lauf (Taylor: „cruise“)
        const W = F.flucht.wegM + 2;
        let ufer = null;
        for (let i = 0; i < 64 && !ufer; i++) {
            const [x, z] = [ort.x + Math.cos(i * 0.4) * (W + (i >> 4) * 4), ort.z + Math.sin(i * 0.4) * (W + (i >> 4) * 4)];
            if (r._landAt(x, z) && !r._nassAt(x, z)) ufer = { x, z };
        }
        if (!ufer) return { fehler: `kein trockenes Ufer ${W}–${W + 12} m um den Bach ${Math.round(ort.x)}/${Math.round(ort.z)}` };
        pm.position.set(ufer.x, r.getTerrainHeightAt(ufer.x, ufer.z) + A.PLAYER_FOOT_OFFSET, ufer.z);
        r._fischKarte = null;
        const dt = 1 / 60;
        const takt = () => {
            s.spielZeit += dt;
            r._fischTakt(dt);
        };
        // die Ankunft: der Takt baut zelleJeTakt Zellen je Takt; dann steht der Bestand still (der Spieler ruht)
        for (let i = 0; i < 120; i++) takt();
        const zeilen = [];
        const proben = Math.round(k.soll.sek / dt);
        for (let i = 0; i <= proben; i++) {
            takt();
            const M = s.fischPool && s.fischPool.mesh;
            const m = M ? M.count : 0;
            const E = M ? M.instanceMatrix.array : [];
            const z = [];
            for (let j = 0; j < m; j++) {
                const b = 16 * j;
                const lz = Math.hypot(E[b + 8], E[b + 10]);
                z.push([E[b + 12], E[b + 14], Math.atan2(E[b + 8], E[b + 10]), lz / 2]);
            }
            zeilen.push(z);
        }
        const zahl = zeilen[0].length;
        if (!zahl || zeilen.some((z) => z.length !== zahl))
            return { fehler: `der Bestand stand nicht still oder ist leer (${zeilen.map((z) => z.length).filter((x, i, a) => a.indexOf(x) === i).join("/")} Glieder)` };
        const fische = [];
        for (let a = 0; a + n <= zahl; a += n) {
            // die Richtung des Fischs: das Kreis-Mittel der Gier seiner Glieder, gleitend über ±k.soll.glattS (ein Schlag
            // mittelt sich heraus, eine Wende der Flucht nicht)
            const cs = zeilen.map((z) => {
                let [c, sn] = [0, 0];
                for (let j = a; j < a + n; j++) [c, sn] = [c + Math.cos(z[j][2]), sn + Math.sin(z[j][2])];
                return [c, sn];
            });
            const h = Math.round(k.soll.glattS / dt);
            const quer = [],
                mitte = [],
                richtung = [];
            let biegung = 0;
            for (const [i, z] of zeilen.entries()) {
                let [c, sn] = [0, 0];
                for (let q = Math.max(0, i - h); q <= Math.min(cs.length - 1, i + h); q++) [c, sn] = [c + cs[q][0], sn + cs[q][1]];
                const g = Math.atan2(sn, c);
                richtung.push(g);
                let [mx, mz] = [0, 0];
                for (let j = a; j < a + n; j++) [mx, mz] = [mx + z[j][0] / n, mz + z[j][1] / n];
                const S = z[a + n - 1];
                const tx = S[0] - Math.sin(S[2]) * S[3],
                    tz = S[1] - Math.cos(S[2]) * S[3];
                quer.push((tx - mx) * Math.cos(g) - (tz - mz) * Math.sin(g));
                mitte.push([mx, mz]);
                let d = S[2] - z[a][2];
                d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
                biegung = Math.max(biegung, Math.abs(d));
            }
            // STET: die Richtung weicht im Fenster höchstens steteRad von ihrem Mittel (ein Fisch, der kreist oder wendet, schwimmt
            // nicht im Sinn des Strouhal-Gesetzes — er zählt offen als „wendend“)
            const [rc, rs] = richtung.reduce(([c, sn], g) => [c + Math.cos(g), sn + Math.sin(g)], [0, 0]);
            const rm = Math.atan2(rs, rc);
            const stet = richtung.every((g) => Math.abs(g - rm - 2 * Math.PI * Math.round((g - rm) / (2 * Math.PI))) <= k.soll.steteRad);
            const qm = quer.reduce(addiere, 0) / quer.length;
            let schlaege = 0;
            for (let i = 1; i < quer.length; i++) if (quer[i - 1] < qm && quer[i] >= qm) schlaege++;
            let u = 0;
            for (let i = 1; i < mitte.length; i++) {
                const w = r._waterFlowAt(mitte[i][0], mitte[i][1]) || { x: 0, z: 0 };
                u += Math.hypot((mitte[i][0] - mitte[i - 1][0]) / dt - w.x, (mitte[i][1] - mitte[i - 1][1]) / dt - w.z);
            }
            u /= mitte.length - 1;
            const hz = schlaege / k.soll.sek;
            const aus = Math.max(...quer) - Math.min(...quer);
            fische.push({ hz: +hz.toFixed(2), A: +aus.toFixed(4), U: +u.toFixed(3), st: u > 0 ? +((hz * aus) / u).toFixed(3) : null, biegung: +biegung.toFixed(3), schlaege, stet });
        }
        return { ort: [Math.round(ort.x), Math.round(ort.z)], fische };
    } finally {
        zur();
        pm.position.copy(vor.p);
        s.spielZeit = vor.uhr;
        if (s.fischPool) A._instanzZahl(s.fischPool.mesh, 0);
        r._fischKarte = vor.karte;
    }
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
        r.dslEffects.gravity([-G_MOND]);
        const L = r._gaitBeinMass(rig).L;
        const gait = r._gaitGesetz(rig, 5.16);
        o.mensch = gait.omega / core.gangSchritt(5.16, L, Object.assign({}, block, { g: G_MOND })).omega;
        r._animateHumanoidRig(rig, 1000, 1, true, false, null, gait);
        o.becken = beckenG.length ? beckenG[beckenG.length - 1] : "nie gerufen";
    } finally {
        r.dslEffects.gravity([g0]);
        core.gangBecken = beckenEcht;
        r._gangZeile = zeileEcht;
    }
    // die Zwillinge als Literal (kommentar-gestrippt: der EINE Absenz-Helfer des Welt-Boots)
    o.zwillinge = [];
    if (!__fehlt([r._animateHumanoidRig, r._gaitGesetz], /\b9\.81\b/))
        o.zwillinge.push("_animateHumanoidRig/_gaitGesetz: die Schwere als Zahl 9,81");
    return o;
};

// LABOR = WELT IM BEWEGUNGS-TAKT (w4-koerper-park): derselbe Eingabe-Lauf je fester Schritt (1/60 s) in der Welt (`_stepFixedSim`,
// die Verb-Tafel gesetzt, der Spieler auf der ebenen Start-Plattform bei 0/0) und im Körper-Studio (`playSchritt` auf einem Boden in
// der Höhe der Plattform, mit den Werten der Seele der Welt: Tempo, Sprint, Sprungkraft, Masse, Schwere) — Gehen, Laufen, Rutsch,
// Sprung, Doppelsprung, quer, rückwärts; dazu die Schaukel als Gerät (in der Welt gesetzt, im Labor dasselbe Angebot am selben Ort:
// fachwerk `geraetAngebotIn`): setzen, pumpen, abspringen. Je Schritt Geschwindigkeit, Vertikale, Luft, Sprung, Luft-Sprünge,
// Klettern, Rutsch, Verb, Phase, Winkel und Fahrt der Schaukel und die Hüfte: byte-gleich (Object.is); die Lage x/z byte-gleich, die
// Höhe über dem Boden auf 1e-9 m (die Welt rechnet um ihre Plattform-Höhe, die Kapsel steht ½ m über der Sohle).
const TAKT_SKRIPT = [
    [60, { vor: 1 }],
    [40, { vor: 1, sprint: true }],
    [1, { vor: 1, sprint: true, rutsch: true }],
    [50, {}],
    [1, { sprung: true }],
    [12, {}],
    [1, { sprung: true }],
    [70, {}],
    [30, { vor: 1, quer: 1 }],
    [1, { sprung: true, vor: 1 }],
    [80, { vor: -1 }],
];
const TAKT_SCHAUKEL = [[1, { rutsch: true }], [2, {}], [240, { vor: 1 }], [90, {}], [1, { sprung: true }], [70, {}]];
// DIE ORTE (Meter, die Stein-Scheibe der Start-Plattform: Ø 13 m, eben — der Quarz-Kern Ø 2,2 m in ihrer Mitte ist eine Stufe):
// der freie Lauf beginnt bei −3,5/−4,5 (sein Weg bleibt auf der Scheibe und neben dem Kern), die Schaukel steht bei −3/−3, der
// Leib 0,3 m neben ihrem Sitz 0
const TAKT_ORT = { frei: [-3.5, -4.5], schaukel: [-3, -3], sitz: [-2.4, -2.7] };
// die Welt: die EINE Wiedergabe (`replayRun`, der Spieler-Schritt des Sim-Schritts, ihre Spur die Zeile des Kerns `leibTaktZeile`)
const TAKT_WELT = (arg) => {
    /* eslint-disable no-undef */
    const st = r.state,
        pm = st.playerMesh,
        F = AnazhRealm.PLAYER_FOOT_OFFSET,
        O = arg.ort;
    const frames = (sk) => sk.flatMap(([n, T]) => Array.from({ length: n }, () => Object.assign({ dt: 1 / 60, yaw: 0, vor: 0, quer: 0 }, T)));
    const lauf = (sk, p, y, geraet) => {
        const rec = { start: { x: p[0], y, z: p[1], vx: 0, vy: 0, vz: 0, fieldVy: 0, yaw: 0 }, frames: frames(sk), spur: [], boden: y - F, geraet };
        if (st.player) st.player.stamina = 100;
        r.replayRun(rec);
        return rec.spur;
    };
    // der Boden der Start-Plattform am Ort des freien Laufs: der Leib setzt sich (2 s), seine Sohle ist y0
    const setzen = lauf([[120, {}]], O.frei, pm.position.y);
    const y0 = pm.position.y - F;
    const frei = lauf(arg.skript, O.frei, y0 + F);
    const e = r.spawnArchitecture("schaukel_doppelschaukel", { x: O.schaukel[0], y: y0 + 0.5, z: O.schaukel[1] }, { rotationY: 0, silent: true, precise: true, seed: 1 });
    const schaukel = lauf(arg.schaukel, O.sitz, y0 + F, "doppelschaukel:0");
    return { frei, schaukel, y0, steht: setzen[setzen.length - 1][7] === 0, werk: !!e, werte: { speed: st.speed, sprintSpeed: st.sprintSpeed, jumpPower: st.jumpPower, masse: r._leibMasse(pm), g: -st.gravity } };
    /* eslint-enable no-undef */
};
// das Labor: dieselben Läufe als Szenen seiner Vorführung (die Uhr wie die Wiedergabe: der erste Schritt bei dt), der Boden in
// der Höhe der Plattform, die Schaukel am selben Ort — mit den Werten der Seele der Welt
const TAKT_LABOR = (arg) => {
    /* eslint-disable no-undef */
    if (!play.on) enterPlay();
    const O = arg.ort,
        teile = parkTeile.splice(0),
        ang = parkAngebote.splice(0),
        eigen = { speed: play.werte.speed, sprintSpeed: play.werte.sprintSpeed, jumpPower: play.werte.jumpPower, masse: play.masse, g: G_WELT };
    if (arg.stub) G_WELT = 44 * M_E; // der Täter des Selbsttests: die Arcade-Schwere der alten Bühne (44 E/s²)
    parkTeile.push({ c: [0, arg.y0 - 0.5, 0], h: [2000, 0.5, 2000], gier: 0, rx: 0, tritt: true });
    const lauf = (skript, p, geraet) => {
        const spur = [];
        const ort = () => {
            Object.assign(play, { t: 1 / 60, masse: arg.werte.masse, werte: { speed: arg.werte.speed, sprintSpeed: arg.werte.sprintSpeed, jumpPower: arg.werte.jumpPower } });
            return { p: [p[0], arg.y0, p[1]], gier: 0 };
        };
        playVorfuehrung(true, [{ name: "takt", ort, skript, takt: () => spur.push(KC.leibTaktZeile(play.L, play.p, arg.y0, geraet && parkAngebote.find((a) => a.id === geraet))) }]);
        return spur;
    };
    const frei = lauf(arg.skript, O.frei);
    parkSubstanz({ id: "doppelschaukel", x: O.schaukel[0], y: arg.y0, z: O.schaukel[1], gier: 0 });
    const schaukel = lauf(arg.schaukel, O.sitz, "doppelschaukel:0");
    parkTeile.splice(0, parkTeile.length, ...teile);
    parkAngebote.splice(0, parkAngebote.length, ...ang);
    G_WELT = KC.LEIB.sprung.refG;
    exitPlay();
    return { frei, schaukel, eigen };
    /* eslint-enable no-undef */
};
// das Urteil: je Schritt jede Größe byte-gleich (die Höhe auf 1e-9 m) — die erste Abweichung beim Namen
// die Vorbedingung: wo die Welt den Leib erdet (frei, nicht in der Luft, kein Verb), liegt ihr Boden eben auf der Höhe der
// Plattform — sonst misst der Vergleich die Bühne, nicht den Takt
function taktUneben(welt) {
    for (let i = 0; i < welt.length; i++)
        if (!welt[i][7] && !welt[i][12] && Math.abs(welt[i][1]) > 1e-9) return `Vorbedingung: Boden uneben (Schritt ${i}, ${welt[i][1].toFixed(4)} m)`;
    return null;
}
const NAMEN = require("../koerper-core.js") && globalThis.__koerperCore.LEIB_TAKT_NAMEN;
function taktVergleich(welt, labor) {
    if (welt.length !== labor.length) return `Länge ${welt.length} ≠ ${labor.length}`;
    for (let i = 0; i < welt.length; i++)
        for (let k = 0; k < NAMEN.length; k++) {
            const a = welt[i][k],
                b = labor[i][k];
            if (k === 1 || k === 17 ? Math.abs(a - b) > 1e-9 : !Object.is(a, b)) return `Schritt ${i}: ${NAMEN[k]} ${a} ≠ ${b}`;
        }
    return null;
}

// DIE BEWEGUNG JE VERB UND PHASE (w4-koerper-park): die Vorführung des Labors fährt jedes Verb an seinem Gerät, sein Instrument misst
// die Pose (koerper `leibPoseWinkel`, die Sohle `leibSohle`, die gehäutete Haut gegen jedes Teil des Werks), der Kern urteilt
// (`leibSollUrteil` gegen VERB_SOLL: Winkel je Verb und Phase an JEDEM Angebot jedes Geräts, die Hand ≤ 3 cm am Anker, der Fuß nie im
// Gerät, die Haut ≤ 1 cm in keinem Teil — kein Durchgreifen —, jedes Glied so nah an seinem Ziel, wie seine Länge erlaubt, die Tempi im
// realen Band). Der Selbsttest bricht je einen Täter: die
// Arcade-Kletter-Zahl der alten Bühne (3,2 m/s), die Hand ohne Löser, das gestreckte Knie auf dem Sitz, der Fuß in der Wand, die
// Kamera ohne Leib (NP-03: der Löser der Kamera blind für den Park), das Becken durch die Bahn der Rutsche, der zweite Sitz der
// Schaukel ungefahren, das Bein der Rutsche 0,69 m über seiner Reichweite neben dem Ziel (der Stand vor w21-leib-bau: das gestreckte
// Bein drehte sich nach dem Rest der Rechnung um seine Achse, koerper `_glied`).
const BEWEGUNG = (bruch) => {
    /* eslint-disable no-undef */
    const P0 = KC.PRESETS.mensch.fx.bewegung.parkour,
        v0 = P0.kletterV,
        pose = KC.leibVerbPose,
        kam = [_kamSeg, _kamFrei];
    if (bruch === "arcade") P0.kletterV = 3.2;
    else if (bruch === "kamera") [window._kamSeg, window._kamFrei] = [() => Infinity, () => true]; // die Kamera ohne Leib
    else if (bruch)
        KC.leibVerbPose = (...a) => {
            const P = pose(...a),
                V = a[1].leibVerb;
            if (P && bruch === "knie" && V.verb === "schaukeln") P.q.knee1 = P.q["knee-1"] = [0, 0, 0, 1];
            if (P && bruch === "hand" && V.verb === "klettern") P.q.arm1 = P.q.elbow1 = [0, 0, 0, 1];
            if (P && bruch === "fuss" && V.verb === "klettern") P.wurzel.p = [P.wurzel.p[0] - V.ang.normale[0] * 0.3, P.wurzel.p[1], P.wurzel.p[2] - V.ang.normale[1] * 0.3];
            if (P && bruch === "durch" && V.verb === "rutschen") P.wurzel.p = [P.wurzel.p[0], P.wurzel.p[1] - 0.12, P.wurzel.p[2]];
            if (P && bruch === "glied" && V.verb === "rutschen") P.ueber.fuss1 = 0.69;
            return P;
        };
    try {
        const m = playVorfuehrung(true, bruch === "angebot" ? VORFUEHRUNG.filter((S) => S.name !== "schaukeln sitz1") : null);
        const zahl = (x) => (Number.isFinite(x) ? +x.toFixed(3) : null);
        return {
            zeilen: Object.keys(m.zeilen).length + Object.values(m.geraete).reduce((n, G) => n + Object.keys(G.zeilen).length, 0),
            geraete: Object.values(m.geraete).map((G) => [G.name, zahl(G.hand), zahl(G.fuss), zahl(G.durch)]),
            tempo: m.tempo,
            urteil: KC.leibSollUrteil(m),
        };
    } finally {
        P0.kletterV = v0;
        KC.leibVerbPose = pose;
        [window._kamSeg, window._kamFrei] = kam;
        exitPlay();
    }
    /* eslint-enable no-undef */
};
const BEWEGUNG_BRUCH = { arcade: /^Tempo klettern/, hand: /die Hand .* vom Anker/, knie: /schaukeln sitz0 schaukeln:[02] knie/, fuss: /der Fuß .* im Gerät/, kamera: /^Kamera: \d+ von/, durch: /^turmrutsche rutschen: die Haut greift/, angebot: /^doppelschaukel schaukeln sitz1: nicht gemessen/, glied: /^turmrutsche rutschen: fuss1 .* über seiner Reichweite/ };

// DIE GANGART UND IHR TASTGRAD AUS DEM TEMPO (Meisterkarte Tiere H3, K3): Welt (LAUF als Leib, SATZ im Satz) und Labor
// (worlds/tetrapoda, EIN Tier über dieselben v̂) bei v̂ 0,3 · 0,74 (Fr 0,55 — über dem Wechsel hinauf, Fr 0,5) · 1,2 · 3,5 →
// Schritt lateral, Trab, Trab, Galopp, Labor = Leib = Satz auf ≤ 0,05 Zyklus je Bein; der TASTGRAD (Anteil des Zyklus im
// Stand: Welt die Pfote am Boden, Labor der Fuß aus gangFuss) im Band (Alexander 1984, Hildebrand 1965). Dazu HINAB v̂ 0,67
// (Fr 0,45, im Band der Hysterese) nach dem Anlauf im Trab (v̂ 1,2): die Gangart hält — das Gedächtnis des Leibs (Welt,
// Satz und das Labor nach seinem Galopp). --selftest: Stimmungs-Muster und Tastgrad 0,5 → ROT.
const VH = [0.3, 0.74, 1.2, 3.5];
const HINAB = { vh: 0.67, vor: 1.2 };
const GANG_SOLL = { 0.3: "schritt-lateral", 0.67: "trab", 0.74: "trab", 1.2: "trab", 3.5: "galopp" };
// der Tastgrad folgt der Gangart: Schritt 0,6–0,7, Trab 0,4–0,6 (auch der langsame Trab über dem Wechsel und hinab)
const TAST_SOLL = { 0.3: [0.6, 0.7], 0.67: [0.4, 0.6], 0.74: [0.4, 0.6], 1.2: [0.4, 0.6], 3.5: [0.25, 0.35] };
// DIE WECHSEL-LEITER (nerv-bewegung, leben.tiere.bewegung#1 „Gangwechsel bei der Froude-Zahl der Natur ±10 %“): jede
// Gattung läuft aus dem Stand an, je knapp unter und knapp über der Natur (Fr 0,5 · 2,5 × (1 ∓ WECHSEL_BAND)) — unter ihr
// die alte Gangart, über ihr die neue: der Wechsel hinauf liegt in ± 8 % um die Natur (Alexander 1989: Gehen → Lauf bei
// Fr ≈ 0,5; Alexander & Jayes 1983: Trab → Galopp bei Fr 2–3; Heglund & Taylor 1988 am beschleunigenden Band). Täter:
// gangArt / gangBand (GANG_FOLGE) — vorher lag die Hysterese beidseits der Natur, der Wechsel bei Fr 0,63 und 3,15.
const WECHSEL_BAND = 0.08;
const WECHSEL_NATUR = { trab: 0.5, galopp: 2.5 };
const WECHSEL = [
    { fr: WECHSEL_NATUR.trab * (1 - WECHSEL_BAND), soll: "schritt-lateral", wechsel: "trab" },
    { fr: WECHSEL_NATUR.trab * (1 + WECHSEL_BAND), soll: "trab", wechsel: "trab" },
    { fr: WECHSEL_NATUR.galopp * (1 - WECHSEL_BAND), soll: "trab", wechsel: "galopp" },
    { fr: WECHSEL_NATUR.galopp * (1 + WECHSEL_BAND), soll: "galopp", wechsel: "galopp" },
];
const WECHSEL_TAETER = "tetrapoda-core.js gangArt / gangBand (GANG_FOLGE)";
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
    // je Seite ihr Fehler beim Namen und (wo sie gemessen wird) der EINE Schlupf — ohne Frist (ein hängender Boot steht in der Stall-Akte);
    // je Seite ein eigener Kontext (ein eigenes Fenster): ein Tab hinter dem anderen taktet nicht, das Körper-Studio fing dort keinen
    // Zeiger (Radeon, die Labore neben der Welt: pageerror WrongDocumentError, die Linse ROT)
    const seite = async (b, schlupf) => {
        const p = await (await b.createBrowserContext()).newPage();
        if (schlupf) await p.evaluateOnNewDocument(`window.__schlupf = ${SCHLUPF};`);
        return p;
    };
    const page = await seite(browser, true);
    await nullRenderer(page);
    // DAS LABOR NEBEN DER WELT (w13-gtx-proben): der Browser des Labors (WebGL r128) lädt beide Studios und misst den Gang der Tiere,
    // WÄHREND die Null-Welt läuft — er braucht von ihr nichts; nur der Takt des Körper-Studios wartet auf ihre Spur (unten). Bis dahin
    // fuhr das Labor erst nach der Welt (GTX: die Probe tiere.K3#2 riss ihren Deckel 45 s). Ein Studio steht, wenn sein Spiel-Modus
    // geladen ist — ohne Frist (ein swiftshader-Bild des Labors hält den Compositor und mit ihm den Poll); ein hängendes steht in der Stall-Akte
    const sb = await starteBrowser({ art: "linse", frist: 300000 });
    const studio = async (p, pfad, da) => (await server.zeige(p, 240000, pfad), await p.waitForFunction(da, { timeout: 0 }), p);
    /* eslint-disable no-undef */
    const koerper = studio(await seite(sb, true), "worlds/koerperstudio/index.html", () => typeof enterPlay === "function" && typeof playTakt === "function" && typeof parkTeile !== "undefined");
    const tierGang = studio(await seite(sb), "worlds/tetrapoda/index.html", () => typeof wolf !== "undefined" && !!wolf && typeof emo !== "undefined").then(async (tp) => {
        const g = {};
        for (const gattung in LABOR_WELT) g[gattung] = await tp.evaluate(GANG, { art: gattung, vh: [...VH, HINAB.vh], stub: SELBST, stimmung: STIMMUNG_FOLGE });
        return g;
    });
    /* eslint-enable no-undef */
    let rot = 0;
    let schwereRot = false;
    let taktRot = false;
    let fischRot = false;
    let bewegtFeuert = 0;
    let gangRot = false,
        tastRot = false;
    const [weltGang, satzGang, gefeuert] = [{}, {}, new Set()];
    // im Selbsttest trägt jede Zeile ihr Etikett: ihr ❌ ist das Soll (der gestubbte Täter), nie ein Befund
    const log = (...a) => console.log(...(SELBST ? ["[Selbsttest]", ...a] : a));
    // die Gangart je v̂ (Fußfolge, Tastgrad im Band) und der Abstand der Phasen gegen
    // jede Vergleichs-Zeile ({Name: Zeile}: „Name − Ort“ in Zyklen, Soll ≤ 0,05)
    const gangUrteil = (wo, z, vergleich = {}) => {
        const g = gangart(z.ph);
        const soll = z.soll || GANG_SOLL[z.vh];
        const [lo, hi] = z.soll ? [0, 1] : TAST_SOLL[z.vh];
        const art = g.art === soll,
            tast = z.tast >= lo && z.tast <= hi;
        const ab = Object.entries(vergleich).map(([n, v]) => [
            n,
            Math.max(...zyklus(v.ph).map((x, i) => kreis(x, g.rel[i]))),
        ]);
        const nah = ab.every(([, d]) => d <= 0.05);
        const ok = art && tast && nah;
        log(
            `  ${ok ? "✅" : "❌"} Gangart ${wo} v̂ ${z.vh} · ${g.art} [${g.rel.join(" ")}]${art ? "" : " — Soll " + soll} · Tastgrad ${z.tast}${tast ? "" : ` (Soll ${lo}–${hi})`}${ab.map(([n, d]) => ` · ${n} − Labor ${d.toFixed(2)} Zyklus`).join("")}${ok ? "" : " — Täter: " + (z.soll ? WECHSEL_TAETER : wo[0] === "S" ? "_tierSatzSchritt" : "tetrapoda gangSchritt")}`
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
            __weltDa(() => window.__tetrapodaCore && typeof window.__tetrapodaCore.gangSchritt === "function")
        );
        // je Gattung der Leib bei jedem v̂ (die KREUZ-PROBE im lateinischen Quadrat: jede Stimmung einmal je v̂, je Gattung eine
        // andere), unter Last und im Satz; dazu der Wolf unter der Mond-Schwere — im Selbsttest je Lauf sein Täter
        const T0 = SELBST ? "gang" : null;
        const laeufe = [{ seele: "wolf", vh: 1.2, g: 1.62, name: "Mond", taeter: T0 && "schwere" }];
        for (const [i, seele] of Object.values(LABOR_WELT).entries()) {
            for (const [j, vh] of VH.entries()) laeufe.push({ seele, vh, ...KREUZ[(i + j) % 4], taeter: T0 });
            for (const vh of [0.74, 1.2]) laeufe.push({ seele, vh, fps: 30, last: true, taeter: T0 });
            for (const vh of VH) laeufe.push({ seele, vh, satz: true, taeter: T0 && "satz" });
            laeufe.push({ seele, ...HINAB, name: "hinab", taeter: T0 }, { seele, ...HINAB, satz: true, taeter: T0 && "satz" });
            for (const w of WECHSEL) laeufe.push({ seele, vh: Math.sqrt(w.fr), wechsel: w, name: "Wechsel Fr " + w.fr.toFixed(2), taeter: SELBST ? "wechsel" : null });
        }
        const wechselJe = {};
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
                soll: k.wechsel && k.wechsel.soll,
            });
            if (k.wechsel) {
                const J = (wechselJe[z.seele] = wechselJe[z.seele] || { trab: [], galopp: [] });
                J[k.wechsel.wechsel].push({ fr: k.wechsel.fr, gut });
            } else if (!k.g) (z.band ? satzGang : weltGang)[z.seele + z.vh] = z;
            if (!gut) gefeuert.add(k.taeter);
        }
        // je Gattung der Wechsel hinauf in seinem Band um die Natur (beide Seiten gut = der Wechsel liegt zwischen ihnen)
        for (const [seele, J] of Object.entries(wechselJe)) {
            const urteil = ["trab", "galopp"].map((w) => {
                const [u, o] = J[w].map((x) => x.fr);
                return { w, u, o, gut: J[w].length === 2 && J[w].every((x) => x.gut) };
            });
            const ok = urteil.every((x) => x.gut);
            log(
                `  ${ok ? "✅" : "❌"} Wechsel ${seele.padEnd(5)} ${urteil.map((x) => `${x.w === "trab" ? "Schritt → Trab" : "Trab → Galopp"} zwischen Fr ${x.u.toFixed(2)} und ${x.o.toFixed(2)}${x.gut ? "" : " verfehlt"}`).join(" · ")} (Natur ${WECHSEL_NATUR.trab} / ${WECHSEL_NATUR.galopp} ± ${WECHSEL_BAND * 100} %)${ok ? "" : " — Täter: " + WECHSEL_TAETER}`
            );
            if (!ok) rot++;
        }
        const leib = await page.evaluate(LEIB, { stub: SELBST });
        if (leib.fehler) {
            log("  ❌ Spieler-Leib:", leib.fehler);
            rot++;
        } else for (const z of leib.zeilen) {
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
        // LABOR = WELT IM BEWEGUNGS-TAKT: die Spur der Welt (frei und an der Schaukel) und die Werte ihrer Seele
        const taktWelt = await page.evaluate(TAKT_WELT, { skript: TAKT_SKRIPT, schaukel: TAKT_SCHAUKEL, ort: TAKT_ORT });
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
        // DIE KÖRPERWELLE DES FISCHS am gezeichneten Leib (FISCH, oben)
        {
            const fz = await page.evaluate(FISCH, { stub: SELBST, soll: FISCH_SOLL });
            if (fz.fehler) {
                log("  ❌ Fisch:", fz.fehler);
                rot++;
            } else {
                const [lo, hi] = FISCH_SOLL.st;
                const gezaehlt = fz.fische.filter((f) => f.stet && f.schlaege >= FISCH_SOLL.zyklen && f.st !== null);
                const wendend = fz.fische.filter((f) => !f.stet).length;
                const imBand = gezaehlt.filter((f) => f.st >= lo && f.st <= hi).length;
                const anteil = gezaehlt.length ? imBand / gezaehlt.length : 0;
                const b = fz.fische.map((f) => f.biegung).sort(aufsteigend);
                const biegung = b.length ? rang(b) : 0;
                const stM = gezaehlt.map((f) => f.st).sort(aufsteigend);
                const ok = gezaehlt.length >= FISCH_SOLL.minFische && anteil >= FISCH_SOLL.anteil && biegung >= FISCH_SOLL.biegungRad;
                log(
                    `  ${ok ? "✅" : "❌"} Fisch am Bach ${fz.ort.join("/")} · ${fz.fische.length} Fische (${wendend} wendend), ${gezaehlt.length} stet mit ≥ ${FISCH_SOLL.zyklen} Schlägen · St im Band ${lo}–${hi}: ${imBand} von ${gezaehlt.length} (Soll ≥ ${FISCH_SOLL.anteil * 100} %) · St Median ${stM.length ? rang(stM) : "–"} [${stM.length ? stM[0] + " … " + stM[stM.length - 1] : "–"}] · Biegung Median ${biegung} rad (Soll ≥ ${FISCH_SOLL.biegungRad})${ok ? "" : " — Täter: tetrapoda FISCH_GESETZ / fischLeib (der starre Leib ohne Körperwelle)"}`
                );
                if (!ok) {
                    rot++;
                    fischRot = true;
                }
            }
        }
        // das Labor (oben: sein Browser und beide Studios laufen seit dem Anfang neben der Welt)
        const sp = await koerper;
        // LABOR = WELT IM BEWEGUNGS-TAKT (w4-koerper-park): dieselbe Spur im Körper-Studio, die erste Abweichung beim Namen
        const taktLabor = await sp.evaluate(TAKT_LABOR, { skript: TAKT_SKRIPT, schaukel: TAKT_SCHAUKEL, ort: TAKT_ORT, y0: taktWelt.y0, werte: taktWelt.werte, stub: SELBST });
        {
            const dF = taktWelt.steht ? taktUneben(taktWelt.frei) || taktVergleich(taktWelt.frei, taktLabor.frei) : "Vorbedingung: kein Stand",
                dS = taktWelt.werk ? taktUneben(taktWelt.schaukel) || taktVergleich(taktWelt.schaukel, taktLabor.schaukel) : "kein Werk";
            const verbe = new Set(taktWelt.schaukel.map((z) => z[12]).filter(Boolean));
            const W = taktWelt.werte,
                E = taktLabor.eigen;
            const seele = ["speed", "sprintSpeed", "jumpPower"].filter((k) => !Object.is(W[k], E[k])).map((k) => `${k} ${W[k]} ≠ ${E[k]}`);
            if (Math.abs(W.masse - E.masse) > 1e-9 * W.masse) seele.push(`masse ${W.masse} ≠ ${E.masse}`);
            if (Math.abs(W.g - E.g) > 1e-12) seele.push(`g ${W.g} ≠ ${E.g}`);
            const ok = !dF && !dS && verbe.has("schaukeln") && !seele.length;
            log(`  ${ok ? "✅" : "❌"} Labor = Welt im Takt: frei ${taktWelt.frei.length} ${dF || "byte-gleich"} · Schaukel ${taktWelt.schaukel.length} ${dS || "byte-gleich"} · Seele ${seele.join(" · ") || "gleich"}${ok ? "" : " — Täter: playSchritt"}`);
            if (!ok) {
                rot++;
                taktRot = true;
            }
        }
        // DIE BEWEGUNG JE VERB UND PHASE: gesund das Urteil leer, im Selbsttest je Täter seine Zeile
        for (const bruch of SELBST ? Object.keys(BEWEGUNG_BRUCH) : [null]) {
            const b = await sp.evaluate(BEWEGUNG, bruch);
            const tr = b.urteil.find((z) => bruch && BEWEGUNG_BRUCH[bruch].test(z));
            if (tr) bewegtFeuert++;
            const ok = !b.urteil.length;
            log(`  ${ok ? "✅" : "❌"} Bewegung${bruch ? " " + bruch : ""}: ${b.zeilen} Phasen · ${JSON.stringify(b.geraete)} · ${JSON.stringify(b.tempo)}${ok ? "" : " — " + (tr || b.urteil.slice(0, 4).join(" · "))}`);
            if (!ok) rot++;
        }
        // dieselbe Gangart im Labor der Tiere (Labor = Welt), gemessen neben der Welt
        const g = await tierGang;
        for (const [gattung, seele] of Object.entries(LABOR_WELT))
            for (const z of g[gattung].zeilen)
                gangUrteil("Labor " + gattung, z, { Welt: weltGang[seele + z.vh], Satz: satzGang[seele + z.vh] });
    } finally {
        await browser.close();
        await sb.close();
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
            [gefeuert.has("wechsel"), "der Wechsel über der Natur (die Hysterese beidseits) blieb grün: die Wechsel-Wand"],
            [taktRot, "die Takt-Wand (Labor = Welt)"],
            [fischRot, "der starre Fisch-Leib (Gier-Wippe 2,5 Hz ohne Körperwelle) blieb grün: die Wellen-Wand"],
            [bewegtFeuert === Object.keys(BEWEGUNG_BRUCH).length, "die Bewegungs-Wand (VERB_SOLL)"],
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
