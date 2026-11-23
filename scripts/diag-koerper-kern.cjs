#!/usr/bin/env node
// ============================================================================
// ULTRAGUSS U3 — DIE KOERPER-KERN-LINSE (gate:koerper-kern).
//
// DER MENSCH IST EINER: das Lab-Anatomie-Gesetz (worlds/koerperstudio/
// koerperstudio.js — Proportions-Zeile Z.99 · morph()-Dial-Formeln Z.1740 ·
// _landmarks()-Urteil Z.1388) ist verbatim nach koerper-core.js gewandert
// (labProportionen/labMorph/labLandmarks). Diese Linse beweist alt==neu:
//
//   (a) ALT = die hier EINGEFRORENEN Original-Formeln (byte-treu aus dem
//       Lab-Stand vor der Wanderung kopiert, Quelle zitiert),
//   (b) NEU = der Kern, wie Shell und Stamm ihn rufen (morphAuf auf den
//       Teile-Baum, labLandmarks auf Messwerte),
//   verglichen auf dem Dial-Gitter: die 6 morph-wirksamen Dials
//   (height/mass/tone/age/gender/arms) je min/def/max kombiniert = 729
//   Gitter-Punkte (>=500; hairLen/hairVol wirken nicht auf morph — sie
//   skalieren nur den Haar-Rebuild). 0 Abweichungen, EXAKTE Gleichheit
//   (Object.is — kein Epsilon: die Ausdrucks-Reihenfolge wanderte mit).
//
// --selftest injiziert je eine Abweichung in Proportionen/Morph/Landmarken
// und beweist, dass die Linse feuert (kein vakuoeses Gruen).
// ============================================================================
"use strict";
const { urteilEnde, SELBSTTEST } = require("./lib/welt-boot.cjs");

require("../koerper-core.js");
require("../samen-core.js"); // der Samen-Baum vor jedem Kern (Welle SAMEN)
require("../phyto-core.js");
require("../tetrapoda-core.js"); // die Froude-Einheit des Gangs (das Können, K3)
require("../schmiede-core.js"); // das Stoff-Gesetz der Stoffstrom-Kette (Verhüttung, das Eisen des Werkzeugs, Teil D)
const core = globalThis.__koerperCore;
const { mulberry32 } = globalThis.__phytoCore; // der Test-Strom ist der Strom des Kerns

// ────────────────────────────────────────────────────────────────────────────
// ALT — die eingefrorenen Original-Formeln. VERTRAGS-AKT w28-leib-kanon (der Kanon des Leibs, LEIB_SOLL.kanon): vier Zahlen neu
// eingefroren — baseArmX = shoulderHW · 0,82 (vorher 0,95), waistMod 0,86 + 0,14 g (0,76 + 0,24 g), der Brustkorb quer 0,92 + 0,08 g
// (shMod), der Brust-Muskel quer 0,74 + 0,14 g (0,62 + 0,38 g); dazu der Hüft-Abstand je Geschlecht (hipHW · 0,55 · (0,94 + 0,14 (1 − g))).
// Zweiter Akt w28-leib-kanon (die Glieder sind das Profil der Liste, koerper LEIB_RELIEF.traeger): die sieben Muskel-Formeln der
// Glieder (quad, hamstring, calf, bicep, tricep, uarm, forearm) fielen aus Morph und Mock — ihre Träger stellt `_reliefTraegerAuf`
// aus dem Profil, gemessen am Guss (gate:mensch-anatomie FORM, RUHE); die Ruhe der Arme beginnt am Lot: armPose.rotZ = arms · 1,30
// (vorher 0,06 + 0,05 g + arms · 1,30 — der Vorhalt für die dicken Kugeln).
// Dritter Akt w28-leib-kanon Nummer 4 (der Rumpf ist das Profil der Liste, koerper LEIB_RELIEF.profil.rumpf): die dreizehn Formeln der
// Rumpf-Kugeln (ribcage, pelvis, waist, abs, oblique, glute, deltoid, trap, lat, upperBack, chest, pec, breast) und tneck fielen aus
// Morph und Mock — die Träger des Rumpfs, der Gürtel und die Delta-Kappe stellt `_reliefTraegerAuf` aus den Schnitten, gemessen am
// Guss (gate:mensch-anatomie KANON, FORM, RUHE).
// Vierter Akt w28-leib-kanon Nummer 4b/4c (die Schulter ist der Anfang des Arms, koerper LEIB_RELIEF.profil.schulter): der Abstand
// des Schulter-Gelenks je Geschlecht shMod 0,945 + 0,055 g (vorher 0,80 + 0,20 g) — das Verhältnis der Kanon-Breiten 0,224 : 0,237;
// das Gelenk der Frau saß 13,4 cm von der Mitte, 1,8 cm IM eigenen Brustkorb (gemessen am Guss, gate:mensch-anatomie KANON).
// ────────────────────────────────────────────────────────────────────────────

// Lab Z.99 (verbatim eingefroren):
function altProportionen() {
    const H=6.0,headSeg=0.130*H,acromionY=0.818*H,nippleY=0.720*H,trochanterY=0.530*H;const shoulderHW=0.259*H/2,hipHW=0.191*H/2,baseArmX=shoulderHW*0.82;const thighLen=0.245*H,calfLen=0.246*H,upperArmLen=0.186*H,forearmLen=0.146*H;const skullBaseR=headSeg/2,skullCY=headSeg/2,skullRX=skullBaseR*1.03,skullRY=skullBaseR*1.03*1.12,skullRZ=skullBaseR*1.03;const eyeDist=headSeg/1.618,jawW=headSeg*0.56,chinW=headSeg*0.22;const browY=headSeg*0.58,eyeY=headSeg*0.48,cheekY=headSeg*0.33;const noseY=headSeg*0.25,lipY=headSeg*0.03,chinY=-headSeg*0.20,jawY=-headSeg*0.10,hairlineY=headSeg*0.91;
    return {H,headSeg,acromionY,nippleY,trochanterY,shoulderHW,hipHW,baseArmX,thighLen,calfLen,upperArmLen,forearmLen,skullBaseR,skullCY,skullRX,skullRY,skullRZ,eyeDist,jawW,chinW,browY,eyeY,cheekY,noseY,lipY,chinY,jawY,hairlineY};
}

// Lab Z.1740 morph() (verbatim eingefroren; nur die reinen UI-Schwaenze
// updateHairScale/updateLabel/updateSkin sind gestrichen — sie sind Shell,
// kein Gesetz). Operiert auf Mock-parts/base wie das Original auf THREE.
function altMorph(params, parts, base, PROP) {
    const baseArmX = PROP.baseArmX, trochanterY = PROP.trochanterY;
    const p=params;const h=p.height;parts.__character.scale.set(h*0.93,h,h*0.93);const effTone=(0.62+p.tone*0.53)*(1-p.age*0.35);const armM=effTone*(0.68+p.gender*0.32);const armMY=1+(armM-1)*0.10;const legM=effTone*(0.88+p.gender*0.12);const legMY=1+(legM-1)*0.10;const torsoM=effTone*(0.75+p.gender*0.25);const shMod=0.945+p.gender*0.055;const hipMod=1.18-p.gender*0.23;const waistMod=0.86+p.gender*0.14;const totalFat=p.mass+p.age*0.18;const fatScale=1+totalFat*0.7;function pair(name,fn){[-1,1].forEach(sd=>{const k=name+(sd===1?'1':'-1');if(parts[k])fn(parts[k],base[k],sd);});}const neckThick=(1+totalFat*0.22)*(1+effTone*0.15)*(0.78+p.gender*0.22);if(parts.neckMain)parts.neckMain.scale.set(base.neckMain.x*neckThick,base.neckMain.y,base.neckMain.z*neckThick);if(parts.neckBase)parts.neckBase.scale.set(base.neckBase.x*neckThick,base.neckBase.y,base.neckBase.z*neckThick);pair('scm',(m,b)=>m.scale.set(b.x*neckThick,b.y,b.z*neckThick));const jawScale=(0.78+p.gender*0.22)*(1+p.age*0.12)*(1+effTone*0.04);if(parts.jaw)parts.jaw.scale.set(base.jaw.x*jawScale,base.jaw.y,base.jaw.z);if(parts.chin)parts.chin.scale.set(base.chin.x*(0.82+p.gender*0.18),base.chin.y,base.chin.z);pair('buccal',(m,b)=>m.scale.set(b.x*(1+totalFat*0.4+p.age*0.1),b.y,b.z));pair('cheekbone',(m,b)=>m.scale.set(b.x*(0.80+p.gender*0.20),b.y,b.z));pair('masseter',(m,b)=>m.scale.set(b.x*torsoM,b.y,b.z));[-1,1].forEach(sd=>{const k='arm'+(sd===1?'1':'-1');if(parts[k]){parts[k].position.x=sd*baseArmX*shMod;const bz=sd*(p.arms*1.30);const bx=0.05-p.arms*0.05;parts[k].rotation.z=bz;parts[k].rotation.x=bx;parts[k].userData.baseRotZ=bz;parts[k].userData.baseRotX=bx;}});[-1,1].forEach(sd=>{const k='hip'+(sd===1?'1':'-1');if(parts[k])parts[k].position.x=sd*PROP.hipHW*0.55*(0.94+(1-p.gender)*0.14);});if(parts.head){parts.head.position.y=base.headPosY-trochanterY-p.age*0.08;parts.head.position.z=p.age*0.12;}
}

// Lab Z.1388–1408 _landmarks() (verbatim eingefroren; die THREE-Messung
// [P()/radOf()] ist hier durch die uebergebenen Messwerte ersetzt — exakt
// die Naht, an der die neue Shell den Kern ruft):
function altLandmarks(mess) {
    var chin=mess.chin,nb=mess.neckBase,waist=mess.waist,knee=mess.knee;
    var radOfNeckBase=mess.neckBaseRad!=null?mess.neckBaseRad:0.13;
    return {chinY:chin?chin.y:5.44,
        neckTopY:(chin?chin.y:5.44)-0.04,
        collarY:nb?nb.y+0.02:4.95,
        shoulderTopY:nb?nb.y+0.04:5.06,
        neckR:Math.max(0.12,radOfNeckBase*1.05),
        neckCX:nb?nb.x:0,neckCZ:nb?nb.z:0,
        waistY:waist?waist.y:3.9,
        wristFrac:1.36,wristOverlap:0.06,
        kneeY:knee?knee.y:1.86};
}

// ────────────────────────────────────────────────────────────────────────────
// NEU — der Kern, konsumiert exakt wie die neue Shell (morph()-Delegat).
// ────────────────────────────────────────────────────────────────────────────
// NEU — der Kern, wie BEIDE Leser ihn rufen (die Shell und der Stamm): `morphAuf` (koerper-core). Bis w5-physik-k5
// trug die Linse hier eine Abschrift von dessen Rumpf (byte-gleich, 2 282 Zeichen) — ein Zwilling, der den echten Leser
// nie las.
// ────────────────────────────────────────────────────────────────────────────
// Der Mock trägt keine Gestalt (`kugeln: []`): die Ruhe der Arme (w11-koerper, `_armRuhe`) misst an den Kugeln des Baums und
// läuft hier leer — ihren Kontakt misst gate:mensch-anatomie RUHE am Guss.
const neuMorph = (p, { parts, base }) => core.morphAuf({ character: parts.__character, parts, base, kugeln: [] }, p);

// ────────────────────────────────────────────────────────────────────────────
// Mock-Rig + deterministische base-Skalen (mulberry32 — der Test-Strom).
// ────────────────────────────────────────────────────────────────────────────
const SINGLES = ["neckMain","neckBase","jaw","chin","head"];
const PAIRED = ["scm","buccal","cheekbone","masseter","arm"];

const NAMEN = [...SINGLES, ...PAIRED.flatMap((n) => [n + "1", n + "-1"])];
const skala = () => ({ x: 1, y: 1, z: 1, set(x, y, z) { [this.x, this.y, this.z] = [x, y, z]; } });

function mkMock() {
    const rnd = mulberry32(18451);
    const parts = {}, base = {};
    for (const n of NAMEN) {
        parts[n] = {
            scale: skala(),
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            userData: {},
        };
        base[n] = { x: 0.5 + rnd(), y: 0.5 + rnd(), z: 0.5 + rnd() };
    }
    parts.__character = { scale: skala() };
    base.headPosY = 5.59752; // Lab Z.131: H-headSeg/2-headSeg*0.20*(1-0.92)
    return { parts, base };
}

function snapshot(parts) {
    const out = [];
    for (const n of Object.keys(parts).sort()) {
        const m = parts[n];
        out.push(n, m.scale.x, m.scale.y, m.scale.z);
        if (m.position) out.push(m.position.x, m.position.y, m.position.z);
        if (m.rotation) out.push(m.rotation.x, m.rotation.y, m.rotation.z);
        if (m.userData) for (const k of Object.keys(m.userData).sort()) out.push(k, m.userData[k]);
    }
    return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Der Vergleich (EXAKT — Object.is; 0 Abweichungen sind das Gesetz).
// ────────────────────────────────────────────────────────────────────────────
// Der Selbsttest zählt seine Injektionen, ohne „⛔“ zu drucken (w10-figur: der Puls von dc82a268 las die Mutante quad1 +1e-9,
// „Gitter … Wert[401]“, als gekippten Byte-Vertrag) — jede „⛔“-Zeile ist ein echter Bruch.
function runVergleich(morphFn, labPropFn, labLandmarksFn) {
    const dials = ["height", "mass", "tone", "age", "gender", "arms"].map((id) => core.PARAMS_BY_KIND.koerper.find((d) => d.id === id));

    let diffs = 0, values = 0, points = 0;
    const vgl = (a, n, z) => (values++, !Object.is(a, n) && ++diffs < 5 && !SELBSTTEST && console.log(`  ⛔ ${z}: alt=${a} neu=${n}`));

    // (1) Proportionen — 28 Konstanten, alt vs neu.
    const ap = altProportionen(), np = labPropFn();
    for (const k of Object.keys(ap)) vgl(ap[k], np[k], "Proportion " + k);

    // (2) Morph — das Dial-Gitter (3^6 = 729 Punkte), alt vs neu auf dem Mock-Rig.
    const [gh, gm, gt, ga, gg, gr] = dials.map((d) => [d.min, d.def, d.max]);
    for (const height of gh) for (const mass of gm) for (const tone of gt)
    for (const age of ga) for (const gender of gg) for (const arms of gr) {
        points++;
        const p = { height, mass, tone, age, gender, arms };
        const A = mkMock(), N = mkMock();
        altMorph(p, A.parts, A.base, ap);
        morphFn(p, N);
        const sa = snapshot(A.parts), sn = snapshot(N.parts);
        if (sa.length !== sn.length) { diffs++; continue; }
        for (let i = 0; i < sa.length; i++) vgl(sa[i], sn[i], `Gitter ${JSON.stringify(p)} Wert[${i}]`);
    }

    // (3) Landmarken — Mess-Fixtures (voll · leer · Rand), alt vs neu.
    const fixtures = [
        { chin: { x: 0, y: 5.42, z: 0.1 }, neckBase: { x: 0.01, y: 4.93, z: -0.02 }, waist: { x: 0, y: 3.88, z: 0 }, knee: { x: 0.45, y: 1.84, z: 0 }, neckBaseRad: 0.142 },
        {}, // alles fehlt -> die Fallback-Konstanten tragen
        { neckBase: { x: -0.03, y: 5.01, z: 0.04 } },
        { chin: { x: 0, y: 5.6, z: 0 }, neckBaseRad: 0.09 }, // neckR-Klemme (0.12-Floor)
        { waist: { x: 0, y: 4.1, z: 0 }, knee: { x: 0.4, y: 1.9, z: 0 }, neckBaseRad: 0.2 },
    ];
    for (const mess of fixtures) {
        const la = altLandmarks(mess), ln = labLandmarksFn(mess);
        for (const k of Object.keys(la)) vgl(la[k], ln[k], "Landmarke " + k);
    }

    return { diffs, values, points };
}

// DIE WACHE (Soll-Tafel am Prüfplatz: mensch-kopf und haar zu jeder Uhr). Das EINE Rollen-Gesetz des Tags
// (TAGES_GESETZ.rollen, tagesPlan) trägt die Tag-Wache `waechter` und die Nacht-Wache `nachtwaechter` (um versatzH versetzt):
// über 1 000 Samen-Paare (die Streu ±streuH) steht zu JEDER Stunde (je 0,05 h) eine an ihrem Wache-Punkt — Werk und Platz
// sind der Punkt, wie der Wirt sie setzt; `wacheLeer` zählt die Proben ohne sie (der Byte-Beweis w4-bewohner-wache: zu 12 h,
// 7,2 h und 0 h je 1 000 von 1 000 an ihrem Werk). Bis w4-bewohner-wache schlief um 0 h jeder Bewohner drinnen (`h ≥ ruhe`):
// die Nacht-Zellen von mensch-kopf und haar standen ohne Bild (am alten Kern 217 459 von 480 000 Proben ohne Wache). Leser:
// der Wirt (`_bewohnerSoll` → tagesPlan). Täter (Selbsttest): die Nacht-Wache ohne Versatz.
const wacheLeer = (P, b = "nachtwaechter", a = "waechter", W = {}, O = { heim: 0, werk: W, platz: W, besuch: {} }) => {
    let n = 0;
    for (let s = 0; s < 2000; s += 2)
        for (let h = 0; h < 24; h += 0.05) n += P(s, a, h, O).ort !== W && P(s + 1, b, h, O).ort !== W;
    return n;
};

// DAS VERB DES LEIBS (w28-mensch-menge, koerper TAGES_GESETZ.haltung · `tagesHaltung`; Leser: der Wirt `_bewohnerGemuet`): die
// Stadt um 12 Uhr — 2000 Samen, wer draußen steht (`tagesPlan`), steht in der Haltung seines Akts; Soll ≥ 2 Klassen mit je
// ≥ 10 % der Leiber draußen. Täter (Selbsttest): das Gesetz ohne Haltung (jeder steht neutral, der Stand vor w28-mensch-menge).
// Die Orte sind die der Bindung (w28-ziel-plan: koerper `tagesBindung`, je Bedürfnis ein Ort — der Tisch des Mittags draußen).
const verbKlassen = (P, H, stunde = 12, O = { heim: {}, werk: {}, platz: {}, mahl: {}, abend: {}, besuch: null }) => {
    const z = {};
    let n = 0;
    for (let s = 0; s < 2000; s++) {
        const soll = P(s, null, stunde, O);
        if (soll.drinnen) continue;
        const h = H(soll.akt, null) || "idle";
        [n, z[h]] = [n + 1, (z[h] || 0) + 1];
    }
    return Object.entries(z).filter(([, k]) => k >= 0.1 * n).map(([h, k]) => `${h} ${Math.round((100 * k) / n)} %`); // prettier-ignore
};

// TEIL S — DER STOSS IM GANG (physik.K5, koerper-core `leibStossLesen` · `leibStossSchritt`): der Leib geht (vor, 4,5 m/s,
// Bein 0,85 m) auf ebenem Grund im EINEN Bewegungs-Takt (`leibPlan` → Lage += v·dt → `leibLandung`, die Folge des Wirts), nach
// 1,5 s wirken 200 N × 0,2 s quer (Δv = F·dt/m je Takt in die Geschwindigkeit, zwischen Kontakt und Plan — wie der Stoß eines
// Tiers, `_spielerStoss`, oder die Probe der Station physik.K5#1). Gegen dieselbe Bahn ohne Stoß: S1 der Stoß kommt im
// Schwerpunkt an (die Wurzel quer ≥ ½ Δv am Ende des Stoßes), S2 der Ausfallschritt (ein Fuß des Stoß-Zustands ≥ 0,1 m in
// Stoß-Richtung, in beiden Richtungen), S3 die Erholung (die Wurzel quer ≤ 5 cm/s gegen die Bahn ab ≤ 1,5 s), S4 die doppelte
// Masse halbiert den Schritt (≤ 0,8 ×), S5 ein Hauch (20 N) fängt der Knöchel (kein Schritt), S6 ein Versetzen des Leibs (Lage
// springt, eine neue Geschwindigkeit) trägt keinen Stoß, S7 ein Halt am Ort (Geschwindigkeit 0, die Bühne, die den Leib stellt) auch
// nicht: kein Stoß-Zustand, der Plan fährt den Gang wie ohne Stoß (an z171 ROT: der Halt galt als Stoß rückwärts, die
// Gamepad-Verben gingen gebremst). Bis w5-physik-k5 zog der Antrieb (kAcc 40/s) jeden Stoß in 25 ms auf das Ziel
// des Gangs: der Leib wich 0,008 m. Leser: der Wirt (`_loopPlayerMovement` → leibPlan, `_stepCharacter` → leibLandung) und das
// Körper-Studio (playSchritt). Täter (Selbsttest): der Leib ohne Bein (der Antrieb schluckt den Stoß), kein Ausfallschritt, die
// Wache des Versetzens blind, der Halt als Stoß gelesen.
function stossLauf(C, { kraft = 200, richtung = 1, masse = 89, beinM = 0.85, eingriff = null, mutante = null } = {}) {
    const L = C.leibZustand();
    const K = { tempo: 4.5, gehTempo: 4.5, hang: 1, rittKAcc: null, rittKBrake: null, lage: [0, 0, 0], beinM, g: 9.81 };
    const [p, v] = [K.lage, L.playerVel];
    const bahn = [];
    let ausfall = 0, schritte = 0, versetzt = false;
    for (let k = 0; k < 270; k++) {
        if (kraft && k >= 90 && k < 102) v.setValue(v.x() + (richtung * kraft) / 60 / masse, 0, v.z());
        if (eingriff && k === 150) {
            if (eingriff === "versetzen") p[0] += 40;
            v.setValue(eingriff === "halt" ? +(mutante === "halt") / 1e3 : 0.7, 0, 0);
            if (mutante === "versatz") L._stossLage = [p[0], p[2]];
        }
        C.leibRichtung(L, 0, 1, 0);
        C.leibPlan(L, { vor: 1, quer: 0 }, K, k / 60, 1 / 60);
        const B = L.leibStoss;
        if (B && mutante === "ohneSchritt") B.naechster = Infinity;
        if (B) for (const i of [0, 1]) ausfall = Math.max(ausfall, richtung * C.leibStossFuss(B, i)[0]);
        if (B) [schritte, versetzt] = [Math.max(schritte, B.schritte), versetzt || (eingriff && k >= 150)];
        p[0] += v.x() / 60;
        p[2] += v.z() / 60;
        C.leibLandung(L, true, false, k / 60);
        bahn.push(richtung * p[0]);
    }
    return { bahn, ausfall, schritte, versetzt };
}
// S8 — DER STOSS JENSEITS DER SCHRITT-WEITE (aus dem Stand, dv in EINEM Takt: die Druckwelle, `_druckStoss` → `_spielerStoss`;
// 4,425 m/s ist der Stoß eines Fasses von 60,6 MJ in 1 m, same.physik.reaktion#2): ein Fuß stützt nur, solange das Bein ihn
// erreicht (schrittBein × Bein) — der Leib gewinnt höchstens den Fall bis dorthin (v² ≤ dv² + ω²·(weit + fuss)², 2 % Rand
// des Rechenschritts) und kommt zur Ruhe. Bis front-druckwelle schob der Fuß außer Reichweite weiter (ω²·(e − p) ohne
// Grenze): ab 3,5 m/s wuchs die Geschwindigkeit ohne Ende (im Spiel 282 m/s nach 3,6 s, 326 m Weg, GTX 1050). Täter
// (Selbsttest): der Fuß außer Reichweite schiebt. → { vmax, grenze, ruhe, weg }
function stossStand(C, dv, { beinM = 0.85, mutante = null } = {}) {
    const L = C.leibZustand();
    const K = { tempo: 4.5, gehTempo: 4.5, hang: 1, rittKAcc: null, rittKBrake: null, lage: [0, 0, 0], beinM, g: 9.81 };
    const [p, v, S] = [K.lage, L.playerVel, C.LEIB_STOSS];
    const [w, weit] = [Math.sqrt(K.g / beinM), S.schrittBein * beinM];
    let vmax = 0, ruhe = 1 / 0;
    for (let k = 0; k < 1800 && ruhe === 1 / 0 && Math.abs(p[0]) < 1e4; k++) {
        if (k === 30) v.setValue(dv, 0, 0);
        C.leibRichtung(L, 0, 0, 0);
        C.leibPlan(L, { vor: 0, quer: 0 }, K, k / 60, 1 / 60);
        const B = L.leibStoss;
        if (B && mutante === "ohneReich" && Math.hypot(B.e[0] - B.p[0], B.e[1] - B.p[1]) > weit) {
            const q = B.e[0] + B.d[0] / w - B.p[0];
            const a = (w * w * (B.e[0] - B.p[0] - Math.sign(q) * Math.min(Math.abs(q), S.fussM))) / 60;
            B.d[0] += a;
            v.setValue(v.x() + a, 0, 0);
        }
        p[0] += v.x() / 60;
        C.leibLandung(L, true, false, k / 60);
        vmax = Math.max(vmax, Math.abs(v.x()));
        if (k > 30 && !L.leibStoss && Math.abs(v.x()) < 0.02) ruhe = (k - 30) / 60;
    }
    return { dv, vmax, grenze: 1.02 * Math.hypot(dv, w * (weit + S.fussM)), ruhe, weg: p[0] };
}
function stossUrteil(C, mutante = null) {
    const beinM = mutante === "ohneBein" ? 0 : 0.85;
    const s = beinM ? [4.425, 7].map((dv) => stossStand(C, dv, { beinM, mutante })) : [];
    const lies = (o) => {
        const [P, B] = [o, { kraft: 0, richtung: o.richtung }].map((x) => stossLauf(C, Object.assign({ beinM, mutante }, x)));
        const q = P.bahn.map((x, k) => x - B.bahn[k]);
        const vq = (k) => (q[k] - q[k - 1]) * 60;
        let erholt = 1 / 0;
        for (let k = q.length - 1; k > 102 && Math.abs(vq(k)) <= 0.05; k--) erholt = (k - 90) / 60;
        return { ...P, vEnde: vq(101), erholt };
    };
    const [a, g, m, h] = [{}, { richtung: -1 }, { masse: 178 }, { kraft: 20 }].map(lies);
    const rot = [
        [a.vEnde >= 0.22, `S1 der Antrieb schluckt den Stoß (leibPlan): Wurzel ${a.vEnde.toFixed(3)} m/s`],
        [a.ausfall >= 0.1 && g.ausfall >= 0.1, `S2 kein Ausfallschritt (leibStossSchritt): ${a.ausfall.toFixed(3)} / ${g.ausfall.toFixed(3)} m`],
        [a.erholt <= 1.5, `S3 erholt ${a.erholt} s`],
        [m.ausfall > 0 && m.ausfall <= 0.8 * a.ausfall, `S4 die Masse ×2 zieht nicht: ${m.ausfall.toFixed(3)} m`],
        [!h.schritte, `S5 20 N: ${h.schritte} Schritte`],
        [!stossLauf(C, { kraft: 0, beinM, eingriff: "versetzen", mutante }).versetzt, "S6 das Versetzen trägt einen Stoß (leibStossLesen)"],
        [!stossLauf(C, { kraft: 0, beinM, eingriff: "halt", mutante }).versetzt, "S7 der Halt trägt einen Stoß (leibStossLesen)"],
        [s.every((x) => x.vmax <= x.grenze && x.ruhe < 1 / 0), `S8 der Fuß außer Reichweite schiebt (leibStossSchritt): ${s.map((x) => `${x.dv} m/s → ${x.vmax.toFixed(2)} m/s (Soll ≤ ${x.grenze.toFixed(2)}), Ruhe ${x.ruhe < 1 / 0 ? x.ruhe.toFixed(2) + " s" : "nie"}, Weg ${x.weg.toFixed(1)} m`).join(" · ")}`],
    ].filter(([ok]) => !ok).map(([, z]) => z);
    return { rot, a, m, s };
}

// TEIL B — DER BESTAND (Meisterkarte 2 mensch.wirtschaft markt S1 · handel S1; koerper BESTAND_GESETZ): eine Stadt im Kleinen in der
// Folge des Wirts (`_bestandTausch`, `_verkehrLieferAn`) über die Funktionen des Kerns — ein Acker (Kraut, ein Bauer), ein Stand
// (voll), ein Wagen (leer), der Spieler mit 5 Stein; Tag 3, 6 Uhr. B1 der Tausch: der Stand gibt 1 Kraut und nimmt 1 Stein, Kraut
// und Stein von Stand + Spieler bleiben je gleich (Soll: der Bestand des Händlers sinkt um 1); B2 der Bestand füllt sich nur aus
// Herstellung: der Stand steigt ohne Lieferung nie (je Stunde über zwei Tage), der Acker steigt nur in den Stunden seines Bauern
// (nachts 0); B3 die Lieferung: der Wagen lädt am Acker (> 0) und gibt dem Stand genau, was er trug; B4 ohne Lieferung ist der Stand
// binnen 24 h leer; B5 die Erhaltung: Σ Bestand am Ende − am Anfang = Herstellung − Verbrauch (die Bücher `her` · `ver`), auf 1e-9.
// Täter (Selbsttest): „der Bestand füllt sich ohne Herstellung" (der Stand wächst ohne Lieferung), „der Wagen fährt ohne Ladung" (die
// Ankunft am Acker lädt nichts), „der Tausch erzeugt Ware" (der Stand gibt, ohne zu verlieren). Leser: der Wirt (`_bestandAnlegen`,
// `_bestandTausch`, `_verkehrLieferung`, `_verkehrLieferAn`, `_bestandBild`).
function bestandUrteil(C0, mutante = null) {
    const C = Object.assign({}, C0);
    if (mutante === "ohneHerstellung") C.bestandAm = (H, h, w) => C0.bestandAm(H, h, w) + (H.art === "stand" && h > H.h ? (h - H.h) * 0.25 : 0);
    if (mutante === "ohneLadung") C.bestandAnkunft = (W, an, h) => (an.art === "werk" ? 0 : C0.bestandAnkunft(W, an, h));
    if (mutante === "erzeugt") C.bestandNimm = (H, w, m, h) => (C0.bestandFassen(H, h), Math.min(m, Math.floor(H.n[w] || 0)));
    const h0 = 3 * 24 + 6;
    const acker = C.bestandHalter("werk", "kraut", h0, 0, 12345, "wohnhaus", "feld");
    const stand = C.bestandHalter("stand", "kraut", h0, C.BESTAND_GESETZ.lager.stand, 777, "haendler", "haendler");
    const wagen = C.bestandHalter("wagen", "kraut", h0, 0);
    const spieler = { kraut: 0, stein: 5 };
    const summe = (w) => [acker, stand, wagen].reduce((a, H) => a + C.bestandAm(H, ht, w), 0) + (spieler[w] || 0);
    const rot = [];
    // B1 der Tausch (10 Uhr)
    let ht = h0 + 4;
    const [k0, s0, vor] = [summe("kraut"), summe("stein"), C.bestandAm(stand, ht)];
    const k = C.bestandNimm(stand, "kraut", 1, ht);
    spieler.kraut += k;
    if (k) [spieler.stein] = [spieler.stein - C.bestandGib(stand, "stein", 1, ht)];
    const sinkt = C.bestandAm(stand, ht) - vor;
    if (!(sinkt < 0)) rot.push(`B1 der Bestand des Händlers sinkt beim Tausch nicht (${sinkt})`);
    if (Math.abs(summe("kraut") - k0) > 1e-9 || Math.abs(summe("stein") - s0) > 1e-9)
        rot.push(`B1 der Tausch erzeugt Ware: Kraut ${k0} → ${summe("kraut")}, Stein ${s0} → ${summe("stein")}`);
    // B2 nur Herstellung füllt: der Stand steigt ohne Lieferung nie, der Acker nur in den Stunden seines Bauern
    let ohneHerstellung = 0;
    const fenster = C.tagesFenster(12345, "wohnhaus");
    const imFenster = (h) => fenster.some(([a, b]) => (h % 24) >= a && (h % 24) < b);
    for (let h = ht; h < ht + 48; h += 0.5) {
        ohneHerstellung = Math.max(ohneHerstellung, C.bestandAm(stand, h + 0.5) - C.bestandAm(stand, h));
        if (!imFenster(h) && !imFenster(h + 0.49)) ohneHerstellung = Math.max(ohneHerstellung, C.bestandAm(acker, h + 0.5) - C.bestandAm(acker, h));
    }
    if (!(ohneHerstellung <= 0)) rot.push(`B2 der Bestand füllt sich ohne Herstellung (+${ohneHerstellung.toFixed(3)} je halbe Stunde)`);
    // B3 die Lieferung (18 Uhr am Acker, 19 Uhr am Stand)
    ht = h0 + 12;
    const geladen = C.bestandAnkunft(wagen, acker, ht);
    ht = h0 + 13;
    const standVor = C.bestandAm(stand, ht);
    const abgeladen = -C.bestandAnkunft(wagen, stand, ht);
    if (!(geladen > 0)) rot.push(`B3 der Wagen fährt ohne Ladung (am Acker ${geladen} geladen, der Acker trug ${C.bestandAm(acker, h0 + 12).toFixed(2)})`);
    if (Math.abs(C.bestandAm(stand, ht) - standVor - abgeladen) > 1e-9 || abgeladen !== geladen)
        rot.push(`B3 der Stand erhält nicht, was der Wagen trug (${geladen} geladen, ${abgeladen} abgeladen)`);
    // B4 ohne Lieferung leer binnen der Tagesfrist
    const leer24 = C.bestandAm(stand, ht + 24);
    if (!(leer24 === 0)) rot.push(`B4 der Stand ist 24 h ohne Lieferung nicht leer (${leer24.toFixed(2)})`);
    // B5 die Erhaltung über alles: Σ Ende − Σ Anfang = Herstellung − Verbrauch
    const he = ht + 30;
    const anfang = C.BESTAND_GESETZ.lager.stand + 5; // Kraut am Stand + Stein beim Spieler
    for (const H of [acker, stand, wagen]) C.bestandFassen(H, he);
    const ende = [acker, stand, wagen].reduce((a, H) => a + Object.values(H.n).reduce((x, y) => x + y, 0), 0) + spieler.kraut + spieler.stein;
    const buch = [acker, stand, wagen].reduce((a, H) => a + H.her - H.ver, 0);
    if (Math.abs(ende - anfang - buch) > 1e-9) rot.push(`B5 die Erhaltung bricht: Ende − Anfang ${(ende - anfang).toFixed(4)} ≠ Herstellung − Verbrauch ${buch.toFixed(4)}`);
    return { rot, sinkt, ohneHerstellung, geladen, abgeladen, leer24, her: acker.her, ver: stand.ver };
}

// TEIL C — DIE ACKER-KETTE (Meisterkarte 2 mensch.nahrung strom S1 · frucht S1 · hand S2; koerper `scheuneHalter` ·
// `scheuneFassen`, phyto ACKER_GESETZ · `ackerStand`): ein Hof mit zwei Äckern (Bauern, Same 12345 und 4242) und sechs Essern,
// fünf Tage Stunde für Stunde über die Scheune des Kerns (`scheuneFassen`, wie der Wirt sie ruft). C1 der Sägezahn: an jedem Tag
// steigt die Scheune (eine Ernte) und fällt sie (das Mahl), `ernten` ≥ 1 je Tag; C2 die Erhaltung: Σ Bestand von Äckern und
// Scheune am Ende − am Anfang = Herstellung − Verbrauch (die Bücher), auf 1e-9, und die Scheune bleibt in [0, Lager]; C3 die
// Frucht: über die Tage bis zur Ernte steigt die Höhe nie und reift die Farbe nie zurück, die Saat steht bei 0, die reife bei
// voller Reife, nach der Ernte die Stoppel; `ackerTage` liegt in [0, Jahr). Täter (Selbsttest): „die Scheune erntet nicht" (der
// Ruf legt nur den Verbrauch an), „die Ernte erzeugt Ware" (die Scheune bekommt, was das Werk nicht gab), „der Acker wächst nicht"
// (der Stand bleibt flach). Leser: der Wirt (`_scheuneAnlegen`, `_scheuneFassen`, `_bestandBild`, `_ackerKoerperTakt`).
function ackerUrteil(C0, P0, mutante = null) {
    const C = Object.assign({}, C0);
    const P = Object.assign({}, P0);
    if (mutante === "ohneErnte") C.scheuneFassen = (S, w, h) => (C0.bestandFassen(S, h), 0);
    if (mutante === "erzeugt")
        C.scheuneFassen = (S, werke, h) => {
            const n = C0.scheuneFassen(S, werke, h);
            if (n) S.n[S.ware] = Math.min(S.cap, S.n[S.ware] + n);
            return n;
        };
    if (mutante === "flach") P.ackerStand = (t) => Object.assign({}, P0.ackerStand(t), { hoeheM: 0 });
    const rot = [];
    const h0 = 3 * 24;
    const werke = [12345, 4242].map((s) => C.bestandHalter("werk", "kraut", h0, 0, s, "wohnhaus", "feld"));
    const S = C.scheuneHalter("kraut", h0, 0, 6);
    const summe = (h) => werke.reduce((a, W) => a + C.bestandAm(W, h), 0) + C.bestandAm(S, h);
    const anfang = summe(h0);
    const tage = 5;
    let [steigt, faellt, raus] = [new Set(), new Set(), 0];
    let vor = C.bestandAm(S, h0);
    for (let h = h0 + 0.5; h <= h0 + 24 * tage; h += 0.5) {
        C.scheuneFassen(S, werke, h);
        const n = C.bestandAm(S, h);
        const d = Math.floor((h - 1e-9) / 24);
        if (n > vor + 1e-9) steigt.add(d);
        if (n < vor - 1e-9) faellt.add(d);
        if (n < -1e-9 || n > S.cap + 1e-9) raus++;
        vor = n;
    }
    // (am ersten Tag ist die Scheune vor der ersten Ernte leer: das Mahl fällt an den Tagen nach ihr)
    if (steigt.size < tage || faellt.size < tage - 1)
        rot.push(`C1 kein Sägezahn: die Scheune steigt an ${steigt.size}, fällt an ${faellt.size} von ${tage} Tagen (Ernten ${S.ernten})`);
    if (S.ernten < tage) rot.push(`C1 die Scheune erntet nicht: ${S.ernten} Ernten in ${tage} Tagen`);
    const he = h0 + 24 * tage;
    for (const W of werke) C.bestandFassen(W, he);
    const buch = [...werke, S].reduce((a, H) => a + H.her - H.ver, 0);
    if (Math.abs(summe(he) - anfang - buch) > 1e-9)
        rot.push(`C2 die Ernte erzeugt Ware: Ende − Anfang ${(summe(he) - anfang).toFixed(4)} ≠ Herstellung − Verbrauch ${buch.toFixed(4)}`);
    if (raus) rot.push(`C2 die Scheune verlässt ihr Lager in ${raus} Proben`);
    // C3 die Frucht nach dem Gesetz des Wuchses
    const G = P.ACKER_GESETZ.frucht;
    let [hoch, reif, zurueck] = [0, 0, 0];
    for (let t = 0; t < G.ernteTag; t++) {
        const a = P.ackerStand(t);
        if (a.hoeheM < hoch - 1e-9 && t <= G.stuetzen[G.stuetzen.length - 3][0]) zurueck++;
        if (a.reife < reif - 1e-9) zurueck++;
        [hoch, reif] = [Math.max(hoch, a.hoeheM), Math.max(reif, a.reife)];
    }
    const [saat, ernte, stoppel] = [P.ackerStand(0), P.ackerStand(G.ernteTag - 6), P.ackerStand(G.ernteTag + 1)];
    if (!(hoch >= 0.5) || zurueck || saat.hoeheM !== 0 || !(ernte.reife >= 0.95) || !stoppel.stoppel)
        rot.push(`C3 der Acker wächst nicht nach dem Gesetz: Höhe bis ${hoch.toFixed(2)} m, ${zurueck} Rückschritte, Saat ${saat.hoeheM} m, Reife zur Ernte ${ernte.reife}, Stoppel ${!!stoppel.stoppel}`);
    const jt = [0, 0.37, 0.99].map((ph) => P.ackerTage(ph, 365));
    if (jt.some((t) => !(t >= 0 && t < 365))) rot.push(`C3 die Tage seit der Saat liegen außerhalb des Jahrs: ${jt.join(", ")}`);
    return { rot, ernten: S.ernten, steigt: steigt.size, faellt: faellt.size, voll: C.bestandAm(S, he), hoch, buch };
}

// DAS KÖNNEN AUS DEM LEIB (mensch-zahlen, koerper `leibKoennen`; Meisterkarte 2 mensch.sport.koennen S1): K1 am Bezugs-Leib
// (START_PARAMS + KOENNEN_BEZUG) exakt 1; K2 je Achse des Leibs die Richtung — mehr Muskel-Ton läuft schneller, mehr Alter und
// mehr Masse langsamer, über ein Gitter der übrigen Dials; K3 die Höhe kürzt sich: gleich gebaut und verschieden hoch trägt die
// Froude-Einheit des Gangs (tetrapoda `tempoEinheit` am Bein ∝ Höhe) × `lauf` dasselbe Tempo (1e-9); K4 der Greis ohne
// Ton läuft höchstens 0,8 des jungen Athleten. K5 DER BEZUGS-LEIB IST DER ERWACHSENE MEDIAN (eine-huelle): er trägt die Mitte
// der Achsen, die das Genom rollt (Geschlecht, Gewicht, Muskel-Ton je 0,5), mit 30 J (der Regler `age`: 18–80 J), und über das
// Gitter dieser Achsen (9³, je Achse gleich verteilt wie der Wurf) liegt der Median von `lauf` mit 30 J bei 1 (± 0,01) — bis
// hier war der Bezug START_PARAMS (ein Mann von 27 J, Gewicht 0,35): der Median der Dreißigjährigen lief 0,908, die Stadt 0,87.
// Täter (Selbsttest): „ohne Können“ (der Stand vor dem Gesetz: jeder 1), „ohne Alter“, „ohne Masse“, „mit Höhe“ (die Höhe
// bleibt im Tempo), „Bezug Start“ (der Bezug vor eine-huelle). Leser: der Wirt (`_bewohnerGenome` → das Tempo des Gangs).
function koennenUrteil(C0, mutante = null) {
    const S = C0.START_PARAMS;
    const TC = globalThis.__tetrapodaCore;
    let K = C0.leibKoennen;
    if (mutante === "ohneKoennen") K = () => ({ kraft: 1, lauf: 1 });
    if (mutante === "ohneAlter") K = (d) => C0.leibKoennen(Object.assign({}, d, { age: S.age }));
    if (mutante === "ohneMasse") K = (d) => C0.leibKoennen(Object.assign({}, d, { mass: S.mass }));
    if (mutante === "mitHoehe") K = (d) => ((k) => ({ kraft: k.kraft * d.height, lauf: Math.sqrt(k.kraft * d.height) }))(C0.leibKoennen(d));
    if (mutante === "bezugStart") K = (d) => ((k) => ({ kraft: k, lauf: Math.sqrt(k) }))(C0.leibKoennen(d).kraft / C0.leibKoennen(S).kraft);
    const rot = [];
    const B = C0.KOENNEN_BEZUG;
    if (!B) rot.push("K1 der Kern trägt keinen Bezugs-Leib (KOENNEN_BEZUG)");
    const bezug = Object.assign({}, S, B || {});
    const kanon = K(bezug);
    if (!(kanon.kraft === 1 && kanon.lauf === 1)) rot.push(`K1 das Können des Bezugs-Leibs ist nicht 1 (kraft ${kanon.kraft}, lauf ${kanon.lauf})`);
    const bezugJ = 18 + 62 * bezug.age;
    if (!(Math.abs(bezugJ - 30) < 1e-9 && bezug.gender === 0.5 && bezug.mass === 0.5 && bezug.tone === 0.5 && bezug.height === S.height))
        rot.push(`K5 der Bezugs-Leib ist nicht die Mitte der Achsen mit 30 J (${bezugJ.toFixed(1)} J, Geschlecht ${bezug.gender}, Gewicht ${bezug.mass}, Ton ${bezug.tone}, Höhe ${bezug.height})`);
    const achse = Array.from({ length: 9 }, (_, i) => (i + 0.5) / 9);
    const L30 = [];
    for (const gender of achse) for (const mass of achse) for (const tone of achse) L30.push(K(Object.assign({}, S, { age: (30 - 18) / 62, gender, mass, tone })).lauf); // prettier-ignore
    const median30 = L30.sort((a, c) => a - c)[(L30.length - 1) >> 1];
    if (!(Math.abs(median30 - 1) <= 0.01)) rot.push(`K5 der Median der Bevölkerung mit 30 J läuft ${median30.toFixed(4)} des Bezugs (Gitter 9³ über Geschlecht, Gewicht, Muskel-Ton; Soll 1 ± 0,01)`);
    const stufen = [0, 0.5, 1];
    const gitter = [];
    for (const mass of stufen) for (const tone of stufen) for (const age of [0.05, 0.25, 0.5]) for (const gender of stufen) gitter.push(Object.assign({}, S, { mass, tone, age, gender })); // prettier-ignore
    const faellt = { tone: 0, age: 0, mass: 0 };
    for (const d of gitter)
        for (const [achse, hoch, richtung] of [["tone", 1, 1], ["age", 0.5, -1], ["mass", 1, -1]]) {
            if (d[achse] >= hoch) continue;
            const mehr = Object.assign({}, d, { [achse]: achse === "age" ? Math.min(0.5, d.age + 0.2) : d[achse] + 0.5 });
            if (!((K(mehr).lauf - K(d).lauf) * richtung > 0)) faellt[achse]++;
        }
    if (faellt.tone) rot.push(`K2 das Können folgt dem Muskel nicht (${faellt.tone} Gitter-Punkte)`);
    if (faellt.age) rot.push(`K2 das Können folgt dem Alter nicht (${faellt.age} Gitter-Punkte)`);
    if (faellt.mass) rot.push(`K2 das Können folgt der Masse nicht (${faellt.mass} Gitter-Punkte)`);
    const tempo = (d) => TC.tempoEinheit(0.9 * d.height) * K(d).lauf;
    const hoch = Object.assign({}, S, { height: 1.08, tone: 0.2, age: 0.4 });
    const klein = Object.assign({}, hoch, { height: 0.92 });
    const dH = Math.abs(tempo(hoch) / tempo(klein) - 1);
    if (!(dH < 1e-9)) rot.push(`K3 die Höhe bleibt im Tempo: gleich gebaut, 1,08 gegen 0,92 hoch, Tempo × ${(tempo(hoch) / tempo(klein)).toFixed(4)}`);
    const greis = K(Object.assign({}, S, { tone: 0.1, age: 0.5 })).lauf / K(Object.assign({}, S, { tone: 0.9, age: 0.05 })).lauf;
    if (!(greis <= 0.8)) rot.push(`K4 der Greis läuft wie der Athlet (× ${greis.toFixed(3)}, Soll ≤ 0,8)`);
    const L = gitter.map((d) => K(d).lauf);
    return { rot, greis, min: Math.min(...L), max: Math.max(...L), median30, start: K(S).lauf };
}

// TEIL D — DIE STOFFSTROM-KETTE (Meisterkarte 2 mensch.wirtschaft.stoffstrom#1; koerper `stoffstromHalter` · `stoffstromFassen`,
// schmiede `STOFFSTROM`): Erz → Barren → Werkzeug. Zwei Öfen (die Werke zweier Schmiede, Same 4242 und 12345), die Halde aus dem
// Samen 7, zwölf Hände; sieben Tage ab Tag 3, 6 Uhr, Stunde für Stunde über den Kern, wie der Wirt ihn ruft. D0 die Kette steht:
// der Kern trägt sie, und das Werk der Schmiede ist ihr Ofen (`herstellung.schmiede.aus` das Erz) — sonst schmilzt die Esse kein
// Erz; D1 die Halde schrumpft (nie steigt sie, an jedem Tag fällt sie, solange sie trägt); D2 Barren am Ofen ≥ 1 am Ende;
// D3 Werkzeug in der Hand ≥ 1; D4 die Erhaltung: Halde vorher − nachher = verhüttetes Erz (1e-9), das Eisen der Luppen = Erz ×
// Ausbeute, und es steckt ganz in Luppe + Barren · barrenKg + Anbruch + Werkzeug · werkzeugKg; D5 die Verhüttung erhält die Masse
// (Erz + Kohle = Eisen + Schlacke + CO₂, relativ 1e-12) und die Ausbeute ist ein Anteil des Erzes; D6 kein Eisen aus dem Nichts:
// ein Werk der Schmiede ohne Kette bleibt über einen Tag leer; D7 die Kette ist eine Funktion der Zeit: in 0,37-h-Rufen gelesen
// trägt sie dasselbe wie in Stunden-Rufen. Täter (Selbsttest): „die Esse schmilzt kein Erz" (der Kern ohne Kette, der Stand vor
// stoffstrom-kette: die Schmiede stellte 0,5 Eisen je Stunde aus dem Nichts her), „das Eisen entsteht aus dem Nichts" (das Werk
// stellt her), „die Kette erzeugt Eisen" (ein Barren ohne Luppe), „die Halde schrumpft nicht", „kein Werkzeug in der Hand", „die
// Verhüttung erzeugt Masse". Leser: der Wirt (`_stoffstromAnlegen`, `_stoffstromFassen`, `_stoffstromZensus`, `_stoffstromBild`).
function stoffstromUrteil(C0, S0, mutante = null) {
    const C = Object.assign({}, C0);
    const ST = S0 && S0.STOFFSTROM ? Object.assign({}, S0.STOFFSTROM) : null;
    const B = C0.BESTAND_GESETZ;
    const rot = [];
    if (mutante === "ohneKette") C.stoffstromHalter = undefined;
    if (mutante === "ausNichts")
        C.bestandHalter = (...a) => {
            const H = C0.bestandHalter(...a);
            if (H.art === "werk") H.rate = 0.5;
            return H;
        };
    if (mutante === "erzeugt")
        C.stoffstromFassen = (K, h) => {
            const n = C0.stoffstromFassen(K, h);
            if (n) C0.bestandGib(K.oefen[0], K.oefen[0].ware, 1, K.h);
            return n;
        };
    if (mutante === "haldeVoll")
        C.stoffstromFassen = (K, h) => {
            const n = C0.stoffstromFassen(K, h);
            K.haldeKg = K.halde0;
            return n;
        };
    if (mutante === "ohneHand") C.stoffstromHalter = (o, h, a, w, m, s) => C0.stoffstromHalter(o, h, a, w, 0, s);
    if (mutante === "bilanz" && ST)
        ST.verhuettung = (kg, erz) => Object.assign({}, S0.STOFFSTROM.verhuettung(kg, erz), { eisen: S0.STOFFSTROM.verhuettung(kg, erz).eisen * 1.1 });
    const h0 = 3 * 24 + 6;
    const ofen = (same) => C.bestandHalter("werk", "eisen", h0, 0, same, "schmiede", "schmiede");
    // D6 kein Eisen aus dem Nichts: das Werk der Schmiede allein, einen Tag
    const W0 = ofen(4242);
    const leer = C.bestandAm(W0, h0 + 24);
    if (leer > 1e-9) rot.push(`D6 das Eisen entsteht aus dem Nichts: das Werk der Schmiede trägt nach 24 h ohne Erz ${leer.toFixed(2)} Eisen (BESTAND_GESETZ.herstellung.schmiede.jeStunde ${B.herstellung.schmiede.jeStunde})`);
    // D0 die Kette steht
    const P = B.herstellung.schmiede;
    if (typeof C.stoffstromHalter !== "function" || typeof C.stoffstromFassen !== "function" || !ST || !P.aus || !B.stoffstrom) {
        rot.push(`D0 die Esse schmilzt kein Erz: keine Kette Erz → Barren → Werkzeug im Kern (koerper stoffstromHalter ${typeof C.stoffstromHalter}, schmiede STOFFSTROM ${!!ST}, herstellung.schmiede.aus ${P.aus || "—"}) — die Schmiede stellt ${P.jeStunde} Eisen je Stunde aus dem Nichts her, keine Halde, kein Barren`);
        return { rot };
    }
    // D5 die Verhüttung erhält die Masse
    const v = ST.verhuettung(100, ST.erz);
    const ein = v.erz + v.kohle;
    const aus = v.eisen + v.schlacke + v.co2;
    if (Math.abs(ein - aus) > 1e-12 * ein) rot.push(`D5 die Verhüttung erzeugt Masse: Erz + Kohle ${ein.toFixed(6)} kg ≠ Eisen + Schlacke + CO₂ ${aus.toFixed(6)} kg`);
    const ausbeute = ST.ausbeute(ST.erz);
    if (!(ausbeute > 0 && ausbeute < 1)) rot.push(`D5 die Ausbeute ${ausbeute} ist kein Anteil des Erzes`);
    const werkzeugKg = ST.werkEisen(ST.werkzeug);
    const lauf = (schritt) => {
        const oefen = [ofen(4242), ofen(12345)];
        let K = null;
        try {
            K = C.stoffstromHalter(oefen, h0, ausbeute, werkzeugKg, 12, 7);
        } catch (e) {
            return { fehler: String((e && e.message) || e) };
        }
        const tage = [];
        for (let h = h0 + schritt; h <= h0 + 7 * 24 + 1e-9; h += schritt) {
            C.stoffstromFassen(K, h);
            const d = Math.floor((h - h0 - 1e-9) / 24);
            tage[d] = K.haldeKg;
        }
        C.stoffstromFassen(K, h0 + 7 * 24);
        return { K, oefen, tage };
    };
    const L = lauf(1);
    if (L.fehler) {
        rot.push(`D0 die Esse schmilzt kein Erz: der Kern legt keine Kette an (${L.fehler})`);
        return { rot };
    }
    const { K, oefen, tage } = L;
    const he = h0 + 7 * 24;
    // D1 die Halde schrumpft
    let vor = K.halde0, stieg = 0, flach = 0;
    for (const x of tage) {
        if (x > vor + 1e-9) stieg++;
        if (x > vor - 1e-9 && vor > 1e-9) flach++;
        vor = x;
    }
    if (stieg || flach || !(K.haldeKg < K.halde0))
        rot.push(`D1 die Halde schrumpft nicht: ${K.halde0.toFixed(1)} → ${K.haldeKg.toFixed(1)} kg, ${flach} Tage ohne Abbau, ${stieg} Tage steigend`);
    // D2 Barren am Ofen
    const barren = oefen.reduce((a, O) => a + C.bestandAm(O, he), 0);
    if (!(barren >= 1)) rot.push(`D2 kein Barren am Ofen: ${barren} Barren nach 7 Tagen (gegossen ${K.barren})`);
    // D3 Werkzeug in der Hand
    if (!(K.haende >= 1)) rot.push(`D3 kein Werkzeug in der Hand: ${K.haende} Hände tragen eines (geschmiedet ${K.werkzeug})`);
    // D4 die Erhaltung
    const G = B.stoffstrom;
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const imEisen = sum(K.luppe) + barren * G.barrenKg + sum(K.anbruch) + K.werkzeug * K.werkzeugKg;
    if (Math.abs(K.halde0 - K.haldeKg - K.erz) > 1e-9 || Math.abs(K.eisen - K.erz * K.ausbeute) > 1e-9 || Math.abs(imEisen - K.eisen) > 1e-9)
        rot.push(`D4 die Kette erzeugt Eisen: Halde ${(K.halde0 - K.haldeKg).toFixed(4)} kg ab, Erz ${K.erz.toFixed(4)} kg verhüttet, Eisen der Luppen ${K.eisen.toFixed(4)} kg (Soll ${(K.erz * K.ausbeute).toFixed(4)}), im Ofen, im Anbruch und in den Werkzeugen ${imEisen.toFixed(4)} kg`);
    // D7 die Kette ist eine Funktion der Zeit
    const M = lauf(0.37);
    const gleich = !M.fehler && Math.abs(M.K.haldeKg - K.haldeKg) < 1e-9 && M.K.werkzeug === K.werkzeug && M.K.haende === K.haende && M.K.barren === K.barren;
    if (!gleich) rot.push(`D7 die Kette hängt am Rufmuster: in 0,37-h-Rufen Halde ${M.K ? M.K.haldeKg.toFixed(3) : "—"} kg, ${M.K ? M.K.werkzeug : "—"} Werkzeuge gegen ${K.haldeKg.toFixed(3)} kg, ${K.werkzeug}`);
    return { rot, halde0: K.halde0, halde: K.haldeKg, barren, haende: K.haende, werkzeug: K.werkzeug, gegossen: K.barren, erz: K.erz, eisen: K.eisen, ausbeute, werkzeugKg };
}

// TEIL W — DIE WARE IN DER KISTE (Meisterkarte 2 mensch.wirtschaft.stoffstrom#1; koerper `bestandStueck` · `bestandKiste` ·
// `bestandKisteTeile` · `bestandFuellung` · `bestandKisten` · `bestandBock`, BESTAND_GESETZ kiste · stueck · behaelter · bock): jede Ware des Bestands —
// was ein Werk herstellt (`herstellung[].ware`), woraus es herstellt (`aus`, das Erz) und das Werkzeug der Kette (schmiede
// STOFFSTROM.werkzeug) — zeigt sich als Stück aus ihrem Stoff in ihrer Holzkiste. W1 die Kiste ist eine Kiste: ein Boden aus
// Brettern, jede der vier Wände aus mindestens zwei Latten mit Fuge, vier Pfosten innen in den Ecken über den Rand, oben offen
// (kein Brett über dem Inhalt); W2 das Stück wiegt, was es trägt: Volumen × ρ der Zeile des Stoff-Gesetzes = die Masse des
// Gesetzes, und seine Maße umschließen genau dieses Volumen (der Barren L·H·B·(1 + oben)/2 · (1 − 2e + 2e(1 + k + k²)/3), der Bund
// π/4·L·H·B); W3 nichts liegt ineinander — kein Stück im anderen, keins in einem Brett, in jedem Lager (`lager`: Stand, Werk,
// Wagen, Scheune) keine Kiste in der anderen; W4 die Kiste ist befüllt: die erste Lage liegt auf dem Boden, jede weitere auf der
// darunter, die oberste `randM` unter dem Rand (man sieht hinein, nichts ragt heraus); W5 das Eisen liest als Barren: 35–45 cm
// lang, 3,5–5,5 cm stark, die Enden verjüngt; W6 ein Mensch hebt die Kiste (ihr Inhalt ≤ `traglastKg`); W7 die Kisten stehen auf
// ihrem Bock (der Rand in `hebeM`, die Beine vom Fuß bis unter die Platte, jede Kiste ganz auf der Platte, kein Brett in einer
// Kiste — eine Kiste von 9 cm am Boden lag am Messort dorf auf 10 m im Halm). Täter (Selbsttest): „die
// Kiste liest als Quader" (der Stand vor stoffstrom-kette-2: der geschlossene Block 0,6 m, vier Abgaben nannten die dunkle Kiste),
// „das Stück wiegt nicht, was es trägt" (die Dichte fehlt), „nichts liegt ineinander" (die Stücke auf einer Stelle), „die Kiste
// ist nicht befüllt" (der Inhalt schwebt über dem Rand), „das Eisen liest nicht als Barren" (der Spitzbarren des Kopfs 813034f4: zwei
// Pyramiden Fuß an Fuß, 39 × 7 cm — der Schöpfer nannte sie „Eisendreiecke"), „die Kiste hebt kein Mensch" (Barren doppelter Masse), „die Kiste steht im Gras" (der Bock fehlt). Das Werkzeug trägt
// sein Maß im Bauplan der Schmiede (der Wirt reicht es, `_wareBild`) — seine Kiste prüft die Konsum-Probe am Ofen. Leser: der
// Wirt (`_wareBild` — Stand, Scheune, Ofen, Wagen, die Werkzeuge der Schmiede; die Halde trägt `stoffstromHaldeForm`).
function wareUrteil(C0, S0, mutante = null) {
    const C = Object.assign({}, C0);
    const B = C0.BESTAND_GESETZ;
    const KB = B.behaelter;
    const BK = B.bock;
    const SG = S0.STOFF_GESETZ;
    const rot = [];
    const zeilen = [];
    if (mutante === "quader") C.bestandKisteTeile = () => [{ art: "boden", mitte: [0, 0.3, 0], masz: [0.6, 0.6, 0.6], ton: 1 }];
    if (mutante === "ohneStoff") C.bestandStueck = (w) => C0.bestandStueck(w, 1000);
    if (mutante === "ineinander") C.bestandFuellung = (K) => C0.bestandFuellung(K).map((v, i) => (i % 4 === 2 ? 0 : v));
    if (mutante === "schwebt") C.bestandFuellung = (K) => C0.bestandFuellung(K).map((v, i) => (i % 4 === 1 ? v + 0.3 : v));
    if (mutante === "spitzbarren")
        C.bestandStueck = (w, rho) => {
            if (w !== "eisen") return C0.bestandStueck(w, rho);
            const V = B.stoffstrom.barrenKg / rho;
            const L = Math.cbrt(V / ((0.18 * 0.18) / 3)); // zwei vierseitige Pyramiden Fuß an Fuß, die Mitte 0,18 der Länge
            return { ware: w, gestalt: "barren", kg: B.stoffstrom.barrenKg, masz: [L, 0.18 * L, 0.18 * L], volumen: V, form: { oben: 1, ende: 0.5, spitze: 0 } }; // prettier-ignore
        };
    if (mutante === "amBoden") C.bestandBock = () => ({ hoehe: 0, teile: [] });
    if (mutante === "traglast")
        C.bestandStueck = (w, rho) => {
            const s = C0.bestandStueck(w, rho);
            return s.kg ? { ...s, kg: 2 * s.kg, volumen: 2 * s.volumen, masz: s.masz.map((v) => v * Math.cbrt(2)) } : s;
        };
    const H = Object.values(B.herstellung);
    const waren = [...new Set([...H.map((h) => h.ware), ...H.map((h) => h.aus).filter(Boolean), S0.STOFFSTROM.werkzeug])];
    const tol = 1e-6;
    // die Hülle eines Quaders [mitte, masz] als [x0, y0, z0, x1, y1, z1]; zwei Hüllen durchdringen sich (Berühren ist frei)
    const huelle = (m, s) => [m[0] - s[0] / 2, m[1] - s[1] / 2, m[2] - s[2] / 2, m[0] + s[0] / 2, m[1] + s[1] / 2, m[2] + s[2] / 2];
    const durch = (a, b) => [0, 1, 2].every((d) => a[d] < b[d + 3] - tol && b[d] < a[d + 3] - tol);
    for (const w of waren) {
        let z = null;
        try {
            z = SG.zeile(w);
        } catch (_e) {
            z = null; // das Werkzeug trägt keine Zeile: seine Stoffe trägt der Bauplan der Schmiede
        }
        let st = null;
        try {
            st = C.bestandStueck(w, z ? z.rho : null);
        } catch (e) {
            rot.push(`W1 die Kiste liest als Quader: ${w} hat kein Stück (${(e && e.message) || e})`);
            continue;
        }
        if (!["barren", "bund", "schuettung", "werkzeug"].includes(st.gestalt)) {
            rot.push(`W1 die Kiste liest als Quader: ${w} trägt die Gestalt „${st.gestalt}" (Soll: barren, bund, schuettung, werkzeug)`);
            continue;
        }
        if (!st.masz) {
            zeilen.push(`${w} ${st.gestalt}${st.gestalt === "werkzeug" ? " (Maß aus dem Bauplan)" : " (Halde)"}`);
            continue;
        }
        const [L, Hh, Bb] = st.masz;
        // W5 das Eisen liest als Barren
        if (w === "eisen") {
            const F = st.form || {};
            if (st.gestalt !== "barren" || !(L >= 0.35 && L <= 0.45) || !(Hh >= 0.035 && Hh <= 0.055) || !(F.ende > 0 && F.spitze > 0 && F.spitze < 1)) // prettier-ignore
                rot.push(`W5 das Eisen liest nicht als Barren: ${st.gestalt} ${(L * 100).toFixed(1)} cm lang, ${(Hh * 100).toFixed(1)} cm stark, Enden ${F.ende} auf ${F.spitze} (Soll 35–45 cm, 3,5–5,5 cm, verjüngt auf eine Fläche)`); // prettier-ignore
        }
        // W2 das Stück wiegt, was es trägt
        const F = st.form;
        const V =
            st.gestalt === "barren"
                ? ((L * Hh * Bb * (1 + F.oben)) / 2) * (1 - 2 * F.ende + (2 * F.ende * (1 + F.spitze + F.spitze * F.spitze)) / 3)
                : (L * Hh * Bb * Math.PI) / 4;
        if (!z || Math.abs(st.volumen * z.rho - st.kg) > 1e-9 * st.kg || Math.abs(V - st.volumen) > 1e-9 * st.volumen)
            rot.push(`W2 das Stück wiegt nicht, was es trägt: ${w} ${st.kg} kg, Volumen ${st.volumen.toExponential(4)} m³ × ρ ${z ? z.rho.toFixed(1) : "—"} = ${z ? (st.volumen * z.rho).toFixed(4) : "—"} kg, die Maße umschließen ${V.toExponential(4)} m³`); // prettier-ignore
        const K = C.bestandKiste(st);
        const T = C.bestandKisteTeile(K);
        const P = C.bestandFuellung(K);
        const n = B.kiste;
        const t = KB.brettM;
        const rand = K.aussen[1];
        // W1 die Kiste ist eine Kiste
        const latten = T.filter((b) => b.art === "latte");
        const pfosten = T.filter((b) => b.art === "pfosten");
        const wand = (achse, seite) =>
            latten
                .filter((b) => b.masz[achse] <= t + tol && Math.sign(b.mitte[achse]) === seite)
                .sort((a, b) => a.mitte[1] - b.mitte[1]);
        const waende = [wand(0, -1), wand(0, 1), wand(2, -1), wand(2, 1)];
        const ohneFuge = waende.find(
            (W) => W.length < 2 || W.some((b, i) => i && b.mitte[1] - b.masz[1] / 2 - (W[i - 1].mitte[1] + W[i - 1].masz[1] / 2) < KB.fugeM - tol) // prettier-ignore
        );
        const deckel = T.find((b) => b.art !== "pfosten" && durch(huelle(b.mitte, b.masz), [-tol, t + K.fuellM, -tol, tol, rand + 1, tol])); // prettier-ignore
        const ecke = pfosten.length === 4 && pfosten.every((b) => b.mitte[1] + b.masz[1] / 2 > rand + tol && Math.abs(b.mitte[0]) + b.masz[0] / 2 <= K.innen[0] / 2 + tol && Math.abs(b.mitte[2]) + b.masz[2] / 2 <= K.innen[2] / 2 + tol && Math.abs(b.mitte[0]) > K.innen[0] / 4 && Math.abs(b.mitte[2]) > K.innen[2] / 4); // prettier-ignore
        if (ohneFuge || deckel || !ecke || !T.some((b) => b.art === "boden"))
            rot.push(`W1 die Kiste liest als Quader: ${w} ${T.length} Teile, ${latten.length} Latten (${ohneFuge ? "eine Wand ohne zwei Latten mit Fuge" : "Wände aus Latten"}), ${pfosten.length} Pfosten${ecke ? "" : " (Soll vier innen in den Ecken über den Rand)"}${deckel ? ", ein Brett über dem Inhalt (oben zu)" : ", oben offen"}`); // prettier-ignore
        // W3 nichts liegt ineinander: die Stücke (ihre Hülle, gedreht um die Senkrechte) unter sich und gegen jedes Brett
        const stueck = (i) => {
            const quer = Math.abs(Math.sin(P[4 * i + 3])) > 0.5;
            return huelle([P[4 * i], P[4 * i + 1], P[4 * i + 2]], quer ? [Bb, Hh, L] : [L, Hh, Bb]);
        };
        const S = Array.from({ length: n }, (_, i) => stueck(i));
        const bretter = T.map((b) => huelle(b.mitte, b.masz));
        let paar = null;
        for (let i = 0; i < n && !paar; i++) {
            for (let j = 0; j < i && !paar; j++) if (durch(S[i], S[j])) paar = `Stück ${j} und ${i}`;
            for (let j = 0; j < bretter.length && !paar; j++) if (durch(S[i], bretter[j])) paar = `Stück ${i} im Brett ${j} (${T[j].art})`; // prettier-ignore
        }
        let lagenMax = 0;
        let imGras = null;
        let bockM = 0;
        for (const cap of [...new Set(Object.values(B.lager))].sort((a, b) => a - b)) {
            const m = Math.ceil(cap / n);
            const O = C.bestandKisten(m, K);
            const fuss = (c) => huelle([O[2 * c], 0.5, O[2 * c + 1]], [K.aussen[0], 1, K.aussen[2]]);
            for (let c = 0; c < m && !paar; c++) for (let d = 0; d < c && !paar; d++) if (durch(fuss(c), fuss(d))) paar = `Kiste ${d} und ${c} im Lager ${cap}`; // prettier-ignore
            lagenMax = Math.max(lagenMax, m);
            // W7 der Block auf seinem Bock: der Rand in `hebeM`, die Beine vom Fuß bis unter die Platte, jede Kiste ganz auf der
            // Platte, kein Brett des Bocks in einer Kiste
            const Bk = C.bestandBock(m, K);
            bockM = Bk.hoehe;
            const beine = Bk.teile.filter((b) => b.art === "bein");
            const bohlen = Bk.teile.filter((b) => b.art === "bohle").map((b) => huelle(b.mitte, b.masz));
            const platte = [Math.min(...bohlen.map((h) => h[0])), Math.min(...bohlen.map((h) => h[2])), Math.max(...bohlen.map((h) => h[3])), Math.max(...bohlen.map((h) => h[5]))]; // prettier-ignore
            const kiste = (c) => huelle([O[2 * c], Bk.hoehe + rand / 2, O[2 * c + 1]], K.aussen);
            if (imGras) continue;
            if (Math.abs(Bk.hoehe + rand - BK.hebeM) > tol) imGras = `im Lager ${cap} der Rand ${(Bk.hoehe + rand).toFixed(3)} m über dem Fuß (Soll ${BK.hebeM} m, die Hand-Höhe)`; // prettier-ignore
            else if (beine.length < 4 || beine.some((b) => Math.abs(b.mitte[1] - b.masz[1] / 2) > tol || Math.abs(b.mitte[1] + b.masz[1] / 2 - (Bk.hoehe - BK.bohleM)) > tol)) imGras = `im Lager ${cap} ${beine.length} Beine (Soll mindestens vier vom Fuß bis unter die Platte)`; // prettier-ignore
            else if (!bohlen.length || bohlen.some((h) => Math.abs(h[4] - Bk.hoehe) > tol)) imGras = `im Lager ${cap} trägt keine Platte in ${Bk.hoehe.toFixed(3)} m`; // prettier-ignore
            for (let c = 0; c < m && !imGras; c++) {
                const k = kiste(c);
                if (k[0] < platte[0] - tol || k[2] < platte[1] - tol || k[3] > platte[2] + tol || k[5] > platte[3] + tol) imGras = `im Lager ${cap} ragt Kiste ${c} über die Platte`; // prettier-ignore
                for (const b of Bk.teile) if (!imGras && durch(huelle(b.mitte, b.masz), k)) imGras = `im Lager ${cap} liegt ein Brett des Bocks (${b.art}) in Kiste ${c}`; // prettier-ignore
            }
        }
        if (paar) rot.push(`W3 nichts liegt ineinander — verletzt: ${w}, ${paar}`);
        if (imGras) rot.push(`W7 die Kiste steht im Gras: ${w}, ${imGras}`);
        // W4 die Kiste ist befüllt: jede Lage auf dem Boden oder auf der darunter, die oberste `randM` unter dem Rand
        let schwebt = -1;
        for (let i = 0; i < n && schwebt < 0; i++) {
            if (Math.abs(S[i][1] - t) < tol) continue;
            const traegt = (j) => j !== i && Math.abs(S[j][4] + KB.luftM - S[i][1]) < tol;
            if (!S.some((_, j) => traegt(j))) schwebt = i;
        }
        const oben = Math.max(...S.map((s) => s[4]));
        if (schwebt >= 0 || Math.abs(rand - oben - KB.randM) > tol)
            rot.push(`W4 die Kiste ist nicht befüllt: ${w}${schwebt >= 0 ? `, Stück ${schwebt} liegt ${S[schwebt][1].toFixed(3)} m über dem Fuß auf nichts` : ""}, der Inhalt endet ${(rand - oben).toFixed(3)} m unter dem Rand (Soll ${KB.randM})`); // prettier-ignore
        // W6 ein Mensch hebt die Kiste
        if (!(K.kg <= KB.traglastKg + tol))
            rot.push(`W6 die Kiste hebt kein Mensch: ${w} ${K.kg} kg in einer Kiste (höchstens ${KB.traglastKg} kg, NIOSH)`);
        zeilen.push(`${w} ${st.gestalt} ${st.kg} kg ${(L * 100).toFixed(1)} × ${(Hh * 100).toFixed(1)} cm (ρ ${z.rho.toFixed(0)}), Kiste ${K.aussen.map((v) => (v * 100).toFixed(0)).join(" × ")} cm, ${K.je}×${K.lagen} Stück, ${K.latten} Latten, ${K.kg} kg, bis ${lagenMax} Kisten auf dem Bock ${(bockM * 100).toFixed(0)} cm`); // prettier-ignore
    }
    return { rot, waren, zeilen };
}

// ────────────────────────────────────────────────────────────────────────────
if (SELBSTTEST) {
    // Vier injizierte Abweichungen (Morph, Proportionen, Landmarken, die Wache ohne Versatz) — jede MUSS die Linse zuenden.
    let fails = 0;
    const morphMut = (p, N) => { neuMorph(p, N); N.parts.scm1.scale.x += 1e-9; };
    const propMut = () => { const o = core.labProportionen(); o.acromionY += 1e-9; return o; };
    const lmMut = (m) => { const o = core.labLandmarks(m); o.wristFrac += 1e-9; return o; };
    const t1 = runVergleich(morphMut, core.labProportionen, core.labLandmarks);
    const t2 = runVergleich(neuMorph, propMut, core.labLandmarks);
    const t3 = runVergleich(neuMorph, core.labProportionen, lmMut);
    // die Wache ohne Versatz (der Täter) fällt ROT, das Gesetz hält
    const w = wacheLeer(core.tagesPlan, "waechter");
    // der Stoß im Gang: jeder Täter fällt ROT beim Namen, das Gesetz hält
    const gut = !stossUrteil(core).rot.length;
    const taeter = ["ohneBein S1", "ohneSchritt S2", "versatz S6", "halt S7", "ohneReich S8"].map((m) => [gut && stossUrteil(core, m.split(" ")[0]).rot.some((z) => z.startsWith(m.split(" ")[1])), m]);
    // der Bestand: das Gesetz hält, jeder Täter fällt ROT beim Namen
    const bGut = !bestandUrteil(core).rot.length;
    const bestandTaeter = [["ohneHerstellung", "B2 der Bestand füllt sich ohne Herstellung"], ["ohneLadung", "B3 der Wagen fährt ohne Ladung"], ["erzeugt", "B1 der Tausch erzeugt Ware"]].map(([m, z]) => [bGut && bestandUrteil(core, m).rot.some((r) => r.startsWith(z)), z]);
    // die Acker-Kette: das Gesetz hält, jeder Täter fällt ROT beim Namen
    const aGut = !ackerUrteil(core, globalThis.__phytoCore).rot.length;
    const ackerTaeter = [["ohneErnte", "C1 die Scheune erntet nicht"], ["erzeugt", "C2 die Ernte erzeugt Ware"], ["flach", "C3 der Acker wächst nicht"]].map(([m, z]) => [aGut && ackerUrteil(core, globalThis.__phytoCore, m).rot.some((r) => r.startsWith(z)), z]);
    // das Können: das Gesetz hält, jeder Täter fällt ROT beim Namen
    const kGut = !koennenUrteil(core).rot.length;
    const koennenTaeter = [["ohneKoennen", "K2 das Können folgt dem Muskel nicht"], ["ohneAlter", "K2 das Können folgt dem Alter nicht"], ["ohneMasse", "K2 das Können folgt der Masse nicht"], ["mitHoehe", "K3 die Höhe bleibt im Tempo"], ["bezugStart", "K5 der Median der Bevölkerung mit 30 J"]].map(([m, z]) => [kGut && koennenUrteil(core, m).rot.some((r) => r.startsWith(z)), z]);
    // die Stoffstrom-Kette: das Gesetz hält, jeder Täter fällt ROT beim Namen
    const sc = globalThis.__schmiedeCore;
    const sGut = !stoffstromUrteil(core, sc).rot.length;
    const stoffTaeter = [["ohneKette", "D0 die Esse schmilzt kein Erz"], ["ausNichts", "D6 das Eisen entsteht aus dem Nichts"], ["erzeugt", "D4 die Kette erzeugt Eisen"], ["haldeVoll", "D1 die Halde schrumpft nicht"], ["ohneHand", "D3 kein Werkzeug in der Hand"], ["bilanz", "D5 die Verhüttung erzeugt Masse"]].map(([m, z]) => [sGut && stoffstromUrteil(core, sc, m).rot.some((r) => r.startsWith(z)), z]);
    // die Ware in der Kiste: das Gesetz hält, jeder Täter fällt ROT beim Namen
    const wGut = !wareUrteil(core, sc).rot.length;
    const wareTaeter = [["quader", "W1 die Kiste liest als Quader"], ["ohneStoff", "W2 das Stück wiegt nicht, was es trägt"], ["ineinander", "W3 nichts liegt ineinander"], ["schwebt", "W4 die Kiste ist nicht befüllt"], ["spitzbarren", "W5 das Eisen liest nicht als Barren"], ["traglast", "W6 die Kiste hebt kein Mensch"], ["amBoden", "W7 die Kiste steht im Gras"]].map(([m, z]) => [wGut && wareUrteil(core, sc, m).rot.some((r) => r.startsWith(z)), z]);
    for (const [x, n] of [[t1.diffs, "Morph"], [t2.diffs, "Proportionen"], [t3.diffs, "Landmarken"], [w && !wacheLeer(core.tagesPlan), "Wache"], [verbKlassen(core.tagesPlan, () => null).length < 2 && verbKlassen(core.tagesPlan, core.tagesHaltung).length >= 2, "Verb"], ...taeter, ...bestandTaeter, ...ackerTaeter, ...koennenTaeter, ...stoffTaeter, ...wareTaeter])
        if (!x) {
            console.log(`⛔ Selbsttest: ${n}-Injektion NICHT erkannt`);
            fails++;
        }
    urteilEnde(fails, "❌ ROT — die Linse ist blind.", `✅ Selbsttest: alle vierunddreißig injizierten Abweichungen erkannt (${t1.diffs}/${t2.diffs}/${t3.diffs} Treffer, die Wache, das Verb, fünf Täter des Stoßes, drei Täter des Bestands, drei Täter der Acker-Kette, fünf Täter des Könnens, sechs Täter der Stoffstrom-Kette, sieben Täter der Ware in der Kiste).`);
}

const r = runVergleich(neuMorph, core.labProportionen, core.labLandmarks);
const leer = wacheLeer(core.tagesPlan);
const st = stossUrteil(core);
const verb = verbKlassen(core.tagesPlan, core.tagesHaltung);
if (verb.length < 2) st.rot.push(`VERB die Stadt um 12 Uhr steht in ${verb.length} Haltung(en) [${verb.join(", ")}] (Soll ≥ 2) — Täter: koerper tagesHaltung`);
console.log(`  VERB die Stadt um 12 Uhr: ${verb.join(" · ")}`);
const be = bestandUrteil(core);
for (const z of be.rot) st.rot.push("BESTAND " + z + " — Täter: koerper BESTAND_GESETZ");
const ak = typeof core.scheuneFassen === "function" && typeof globalThis.__phytoCore.ackerStand === "function"
    ? ackerUrteil(core, globalThis.__phytoCore)
    : { rot: ["C0 der Kern trägt keine Acker-Kette (koerper scheuneHalter/scheuneFassen, phyto ackerStand)"] };
for (const z of ak.rot) st.rot.push("ACKER " + z + " — Täter: koerper scheuneFassen · phyto ACKER_GESETZ");
if (!ak.rot.length) console.log(`  ACKER Scheune: ${ak.ernten} Ernten in 5 Tagen, steigt an ${ak.steigt}, fällt an ${ak.faellt} Tagen, am Ende ${ak.voll.toFixed(2)} · Frucht bis ${ak.hoch.toFixed(2)} m`);
const sk = stoffstromUrteil(core, globalThis.__schmiedeCore);
for (const z of sk.rot) st.rot.push("STOFFSTROM " + z + " — Täter: koerper stoffstromHalter · stoffstromFassen · schmiede STOFFSTROM");
if (!sk.rot.length) console.log(`  STOFFSTROM Halde ${sk.halde0.toFixed(1)} → ${sk.halde.toFixed(1)} kg in 7 Tagen (Erz ${sk.erz.toFixed(1)} kg, Ausbeute ${sk.ausbeute.toFixed(4)}, Eisen ${sk.eisen.toFixed(2)} kg) · ${sk.gegossen} Barren gegossen, ${sk.barren} am Ofen · ${sk.werkzeug} Werkzeuge zu je ${sk.werkzeugKg.toFixed(3)} kg Eisen, ${sk.haende} in der Hand`);
const wu = wareUrteil(core, globalThis.__schmiedeCore);
for (const z of wu.rot) st.rot.push("WARE " + z + " — Täter: koerper bestandStueck · bestandKiste · bestandKisteTeile · bestandFuellung · bestandKisten · bestandBock · BESTAND_GESETZ.stueck/behaelter/bock");
if (!wu.rot.length) console.log(`  WARE ${wu.waren.length} Waren in ihrer Kiste: ${wu.zeilen.join(" · ")}`);
const kn = koennenUrteil(core);
for (const z of kn.rot) st.rot.push("KÖNNEN " + z + " — Täter: koerper leibKoennen");
console.log(`  KÖNNEN lauf über das Gitter ${kn.min.toFixed(3)}–${kn.max.toFixed(3)} (Bezugs-Leib 1: die Mitte der Achsen mit 30 J) · der Median der Dreißigjährigen ${kn.median30.toFixed(4)} · START_PARAMS ${kn.start.toFixed(4)} · der Greis ohne Ton × ${kn.greis.toFixed(3)} des jungen Athleten`);
console.log(`  BESTAND Tausch ${be.sinkt} · Füllung ohne Herstellung ${be.ohneHerstellung} · Wagen ${be.geladen} geladen, ${be.abgeladen} abgeladen · Stand nach 24 h ${be.leer24} · Herstellung ${be.her.toFixed(2)}, Verbrauch ${be.ver.toFixed(2)}`);
urteilEnde(r.points < 500 || r.diffs || leer || st.rot.length, `❌ ROT — Gitter ${r.points} Punkte, ${r.diffs} Abweichungen alt↔neu, ${leer} Proben ohne Wache${st.rot.length ? " · " + st.rot.join(" · ") : ""}`, `✅ DER MENSCH IST EINER — Dial-Gitter ${r.points} Punkte, ${r.values} Werte alt==neu exakt (0 Abweichungen); Proportionen + Landmarken-Urteil identisch; DIE WACHE STEHT zu jeder Stunde; DER STOSS IM GANG: Ausfall ${st.a.ausfall.toFixed(3)} m (Masse ×2 ${st.m.ausfall.toFixed(3)}), erholt ${st.a.erholt.toFixed(3)} s; aus dem Stand ${st.s.map((x) => `${x.dv} m/s → höchstens ${x.vmax.toFixed(2)} m/s, Ruhe nach ${x.ruhe.toFixed(2)} s und ${x.weg.toFixed(1)} m`).join(" · ")}.`);
