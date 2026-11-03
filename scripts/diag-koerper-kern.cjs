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
require("../phyto-core.js");
const core = globalThis.__koerperCore;
const { mulberry32 } = globalThis.__phytoCore; // der Test-Strom ist der Strom des Kerns

// ────────────────────────────────────────────────────────────────────────────
// ALT — die eingefrorenen Original-Formeln.
// ────────────────────────────────────────────────────────────────────────────

// Lab Z.99 (verbatim eingefroren):
function altProportionen() {
    const H=6.0,headSeg=0.130*H,acromionY=0.818*H,nippleY=0.720*H,trochanterY=0.530*H;const shoulderHW=0.259*H/2,hipHW=0.191*H/2,baseArmX=shoulderHW*0.95;const thighLen=0.245*H,calfLen=0.246*H,upperArmLen=0.186*H,forearmLen=0.146*H;const skullBaseR=headSeg/2,skullCY=headSeg/2,skullRX=skullBaseR*1.03,skullRY=skullBaseR*1.03*1.12,skullRZ=skullBaseR*1.03;const eyeDist=headSeg/1.618,jawW=headSeg*0.56,chinW=headSeg*0.22;const browY=headSeg*0.58,eyeY=headSeg*0.48,cheekY=headSeg*0.33;const noseY=headSeg*0.25,lipY=headSeg*0.03,chinY=-headSeg*0.20,jawY=-headSeg*0.10,hairlineY=headSeg*0.91;
    return {H,headSeg,acromionY,nippleY,trochanterY,shoulderHW,hipHW,baseArmX,thighLen,calfLen,upperArmLen,forearmLen,skullBaseR,skullCY,skullRX,skullRY,skullRZ,eyeDist,jawW,chinW,browY,eyeY,cheekY,noseY,lipY,chinY,jawY,hairlineY};
}

// Lab Z.1740 morph() (verbatim eingefroren; nur die reinen UI-Schwaenze
// updateHairScale/updateLabel/updateSkin sind gestrichen — sie sind Shell,
// kein Gesetz). Operiert auf Mock-parts/base wie das Original auf THREE.
function altMorph(params, parts, base, PROP) {
    const baseArmX = PROP.baseArmX, trochanterY = PROP.trochanterY;
    const p=params;const h=p.height;parts.__character.scale.set(h*0.93,h,h*0.93);const effTone=(0.62+p.tone*0.53)*(1-p.age*0.35);const armM=effTone*(0.68+p.gender*0.32);const armMY=1+(armM-1)*0.10;const legM=effTone*(0.88+p.gender*0.12);const legMY=1+(legM-1)*0.10;const torsoM=effTone*(0.75+p.gender*0.25);const shMod=0.80+p.gender*0.20;const hipMod=1.18-p.gender*0.23;const waistMod=0.76+p.gender*0.24;if(parts.ribcage){var rx=base.ribcage.x*shMod,ry=base.ribcage.y,rz=base.ribcage.z*(0.95+p.gender*0.05);parts.ribcage.scale.set(rx,ry,rz);parts.ribcage.userData.baseScaleY=ry;}if(parts.pelvis)parts.pelvis.scale.set(base.pelvis.x*hipMod,base.pelvis.y,base.pelvis.z*(0.88+p.gender*0.12));const totalFat=p.mass+p.age*0.18;const fatScale=1+totalFat*0.7;if(parts.waist)parts.waist.scale.set(base.waist.x*fatScale*waistMod,base.waist.y,base.waist.z*(1+totalFat*0.4));function pair(name,fn){[-1,1].forEach(sd=>{const k=name+(sd===1?'1':'-1');if(parts[k])fn(parts[k],base[k],sd);});}if(parts.abs){const ax=base.abs.x*(1+totalFat*0.45),ay=base.abs.y,az=base.abs.z*(1+totalFat*0.3-effTone*0.08);parts.abs.scale.set(ax,ay,az);parts.abs.userData.baseScaleY=ay;}pair('oblique',(m,b)=>m.scale.set(b.x*(1+totalFat*0.35)*waistMod,b.y,b.z*(1+totalFat*0.2)));pair('glute',(m,b)=>m.scale.set(b.x*(1+totalFat*0.3)*hipMod,b.y*(1+totalFat*0.1)*(0.95+(1-p.gender)*0.22),b.z*(1+totalFat*0.2)*(1.0+(1-p.gender)*0.32)));pair('quad',(m,b)=>{m.scale.set(b.x*legM*(1+totalFat*0.15),b.y*legMY,b.z*legM);m.userData.baseScaleY=b.y*legMY;});pair('hamstring',(m,b)=>m.scale.set(b.x*legM,b.y,b.z*legM));pair('calf',(m,b)=>{m.scale.set(b.x*legM,b.y*legMY,b.z*legM);m.userData.baseScaleY=b.y*legMY;});pair('bicep',(m,b)=>{m.scale.set(b.x*armM,b.y*armMY,b.z*armM);m.userData.baseScaleY=b.y*armMY;});pair('tricep',(m,b)=>m.scale.set(b.x*armM,b.y*armMY,b.z*armM));pair('uarm',(m,b)=>m.scale.set(b.x*armM,b.y*armMY,b.z*armM));pair('forearm',(m,b)=>{var fm=(0.70+p.gender*0.30)*(0.92+effTone*0.12);m.scale.set(b.x*fm,b.y,b.z*fm);});pair('deltoid',(m,b)=>m.scale.set(b.x*armM*shMod,b.y*armM,b.z*armM*shMod));pair('trap',(m,b)=>m.scale.set(b.x*(1+(torsoM-1)*0.4)*(0.82+p.gender*0.18),b.y*(1+(torsoM-1)*0.3)*(0.85+p.gender*0.15),b.z));pair('lat',(m,b)=>m.scale.set(1+(torsoM-1)*0.5,1,1+(torsoM-1)*0.3));if(parts.upperBack)parts.upperBack.scale.set(base.upperBack.x*(1+(torsoM-1)*0.25)*shMod,base.upperBack.y,base.upperBack.z*(1+(torsoM-1)*0.2)*(0.82+p.gender*0.18));if(parts.chest){const cx=base.chest.x*(0.62+p.gender*0.38)*(1+(torsoM-1)*0.1),cy=base.chest.y,cz=base.chest.z*(0.85+p.gender*0.15);parts.chest.scale.set(cx,cy,cz);parts.chest.userData.baseScaleX=cx;parts.chest.userData.baseScaleY=cy;parts.chest.userData.baseScaleZ=cz;}pair('pec',(m,b)=>m.scale.set(b.x*(0.55+p.gender*0.45)*(1+(torsoM-1)*0.15),b.y*(1+(torsoM-1)*0.04),b.z*(0.70+p.gender*0.30)));pair('breast',(m,b)=>{var bs=Math.max(0.02,(1-p.gender)*(0.92+totalFat*0.5));m.scale.set(b.x*bs,b.y*bs*1.05,b.z*bs);});const neckThick=(1+totalFat*0.22)*(1+effTone*0.15)*(0.78+p.gender*0.22);if(parts.neckMain)parts.neckMain.scale.set(base.neckMain.x*neckThick,base.neckMain.y,base.neckMain.z*neckThick);if(parts.neckBase)parts.neckBase.scale.set(base.neckBase.x*neckThick,base.neckBase.y,base.neckBase.z*neckThick);pair('scm',(m,b)=>m.scale.set(b.x*neckThick,b.y,b.z*neckThick));pair('tneck',(m,b)=>m.scale.set(b.x*neckThick,b.y,b.z*neckThick));const jawScale=(0.78+p.gender*0.22)*(1+p.age*0.12)*(1+effTone*0.04);if(parts.jaw)parts.jaw.scale.set(base.jaw.x*jawScale,base.jaw.y,base.jaw.z);if(parts.chin)parts.chin.scale.set(base.chin.x*(0.82+p.gender*0.18),base.chin.y,base.chin.z);pair('buccal',(m,b)=>m.scale.set(b.x*(1+totalFat*0.4+p.age*0.1),b.y,b.z));pair('cheekbone',(m,b)=>m.scale.set(b.x*(0.80+p.gender*0.20),b.y,b.z));pair('masseter',(m,b)=>m.scale.set(b.x*torsoM,b.y,b.z));[-1,1].forEach(sd=>{const k='arm'+(sd===1?'1':'-1');if(parts[k]){parts[k].position.x=sd*baseArmX*shMod;const bz=sd*(0.06+p.gender*0.05+p.arms*1.30);const bx=0.05-p.arms*0.05;parts[k].rotation.z=bz;parts[k].rotation.x=bx;parts[k].userData.baseRotZ=bz;parts[k].userData.baseRotX=bx;}});if(parts.head){parts.head.position.y=base.headPosY-trochanterY-p.age*0.08;parts.head.position.z=p.age*0.12;}
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
const neuMorph = (p, N) => core.morphAuf({ character: N.parts.__character, parts: N.parts, base: N.base }, p);

// ────────────────────────────────────────────────────────────────────────────
// Mock-Rig + deterministische base-Skalen (mulberry32 — der Test-Strom).
// ────────────────────────────────────────────────────────────────────────────
const SINGLES = ["ribcage","pelvis","waist","abs","upperBack","chest","neckMain","neckBase","jaw","chin","head"];
const PAIRED = ["oblique","glute","quad","hamstring","calf","bicep","tricep","uarm","forearm","deltoid","trap","lat","pec","breast","scm","tneck","buccal","cheekbone","masseter","arm"];

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
function runVergleich(morphFn, labPropFn, labLandmarksFn) {
    const dials = ["height", "mass", "tone", "age", "gender", "arms"].map((id) => core.PARAMS_BY_KIND.koerper.find((d) => d.id === id));

    let diffs = 0, values = 0, points = 0;
    const vgl = (a, n, z) => (values++, !Object.is(a, n) && ++diffs < 5 && console.log(`  ⛔ ${z}: alt=${a} neu=${n}`));

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

// DIE WACHE (PFLICHT-OFFEN A, der Prüfplatz: mensch-kopf und haar zu jeder Uhr). Das EINE Rollen-Gesetz des Tags
// (TAGES_GESETZ.rollen, tagesPlan) trägt die Tag-Wache `waechter` und die Nacht-Wache `nachtwaechter` (um versatzH versetzt):
// über 1 000 Samen-Paare (die Streu ±streuH) steht zu JEDER Stunde (je 0,05 h) eine an ihrem Wache-Punkt — Werk und Platz
// sind der Punkt, wie der Wirt sie setzt; `wacheLeer` zählt die Proben ohne sie (der Byte-Beweis w4-bewohner-wache: zu 12 h,
// 7,2 h und 0 h je 1 000 von 1 000 an ihrem Werk). Bis w4-bewohner-wache schlief um 0 h jeder Bewohner drinnen (`h ≥ ruhe`):
// die Nacht-Zellen von mensch-kopf und haar standen ohne Bild (am alten Kern 217 459 von 480 000 Proben ohne Wache). Leser:
// der Wirt (`_bewohnerSoll` → tagesPlan). Täter (Selbsttest): die Nacht-Wache ohne Versatz.
const wacheLeer = (P, b = "nachtwaechter", a = "waechter", W = {}) => {
    let n = 0;
    for (let s = 0; s < 2000; s += 2)
        for (let h = 0; h < 24; h += 0.05) n += P(s, a, 0, W, h, W, {}).ort !== W && P(s + 1, b, 0, W, h, W, {}).ort !== W;
    return n;
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
function stossUrteil(C, mutante = null) {
    const beinM = mutante === "ohneBein" ? 0 : 0.85;
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
    ].filter(([ok]) => !ok).map(([, z]) => z);
    return { rot, a, m };
}

// ────────────────────────────────────────────────────────────────────────────
const selftest = SELBSTTEST;

if (selftest) {
    // Vier injizierte Abweichungen (Morph, Proportionen, Landmarken, die Wache ohne Versatz) — jede MUSS die Linse zuenden.
    let fails = 0;
    const morphMut = (p, N) => { neuMorph(p, N); N.parts.quad1.scale.x += 1e-9; };
    const propMut = () => { const o = core.labProportionen(); o.acromionY += 1e-9; return o; };
    const lmMut = (m) => { const o = core.labLandmarks(m); o.wristFrac += 1e-9; return o; };
    const t1 = runVergleich(morphMut, core.labProportionen, core.labLandmarks);
    const t2 = runVergleich(neuMorph, propMut, core.labLandmarks);
    const t3 = runVergleich(neuMorph, core.labProportionen, lmMut);
    // die Wache ohne Versatz (der Täter) fällt ROT, das Gesetz hält
    const w = wacheLeer(core.tagesPlan, "waechter");
    // der Stoß im Gang: jeder Täter fällt ROT beim Namen, das Gesetz hält
    const gut = !stossUrteil(core).rot.length;
    const taeter = ["ohneBein S1", "ohneSchritt S2", "versatz S6", "halt S7"].map((m) => [gut && stossUrteil(core, m.split(" ")[0]).rot.some((z) => z.startsWith(m.split(" ")[1])), m]);
    for (const [x, n] of [[t1.diffs, "Morph"], [t2.diffs, "Proportionen"], [t3.diffs, "Landmarken"], [w && !wacheLeer(core.tagesPlan), "Wache"], ...taeter])
        if (!x) {
            console.log(`⛔ Selbsttest: ${n}-Injektion NICHT erkannt`);
            fails++;
        }
    urteilEnde(fails, "❌ ROT — die Linse ist blind.", `✅ Selbsttest: alle acht injizierten Abweichungen erkannt (${t1.diffs}/${t2.diffs}/${t3.diffs} Treffer, die Wache, vier Täter des Stoßes).`);
}

const r = runVergleich(neuMorph, core.labProportionen, core.labLandmarks);
const leer = wacheLeer(core.tagesPlan);
const st = stossUrteil(core);
urteilEnde(r.points < 500 || r.diffs || leer || st.rot.length, `❌ ROT — Gitter ${r.points} Punkte, ${r.diffs} Abweichungen alt↔neu, ${leer} Proben ohne Wache${st.rot.length ? " · " + st.rot.join(" · ") : ""}`, `✅ DER MENSCH IST EINER — Dial-Gitter ${r.points} Punkte, ${r.values} Werte alt==neu exakt (0 Abweichungen); Proportionen + Landmarken-Urteil identisch; DIE WACHE STEHT zu jeder Stunde; DER STOSS IM GANG: Ausfall ${st.a.ausfall.toFixed(3)} m (Masse ×2 ${st.m.ausfall.toFixed(3)}), erholt ${st.a.erholt.toFixed(3)} s.`);
