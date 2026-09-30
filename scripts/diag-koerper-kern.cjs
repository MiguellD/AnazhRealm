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
//   (b) NEU = der Kern, konsumiert EXAKT wie die neue Shell es tut
//       (labMorph-Closures auf base-Skalen, labLandmarks auf Messwerte),
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

require("../koerper-core.js");
const core = globalThis.__koerperCore;

// ────────────────────────────────────────────────────────────────────────────
// ALT — die eingefrorenen Original-Formeln (verbatim, Lab-Stand V18.451).
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
function neuMorph(params, parts, base, PROP, labMorphFn) {
    const baseArmX = PROP.baseArmX, trochanterY = PROP.trochanterY;
    const M=labMorphFn(params);parts.__character.scale.set(M.charScale.x,M.charScale.y,M.charScale.z);const MU=M.shell;function aply(m,sc){m.scale.set(sc.x,sc.y,sc.z);return sc;}if(parts.ribcage)parts.ribcage.userData.baseScaleY=aply(parts.ribcage,MU.ribcage(base.ribcage)).y;if(parts.pelvis)aply(parts.pelvis,MU.pelvis(base.pelvis));if(parts.waist)aply(parts.waist,MU.waist(base.waist));function pair(name,fn){[-1,1].forEach(sd=>{const k=name+(sd===1?'1':'-1');if(parts[k])fn(parts[k],base[k],sd);});}if(parts.abs)parts.abs.userData.baseScaleY=aply(parts.abs,MU.abs(base.abs)).y;pair('oblique',(m,b)=>aply(m,MU.oblique(b)));pair('glute',(m,b)=>aply(m,MU.glute(b)));pair('quad',(m,b)=>{m.userData.baseScaleY=aply(m,MU.quad(b)).y;});pair('hamstring',(m,b)=>aply(m,MU.hamstring(b)));pair('calf',(m,b)=>{m.userData.baseScaleY=aply(m,MU.calf(b)).y;});pair('bicep',(m,b)=>{m.userData.baseScaleY=aply(m,MU.bicep(b)).y;});pair('tricep',(m,b)=>aply(m,MU.tricep(b)));pair('uarm',(m,b)=>aply(m,MU.uarm(b)));pair('forearm',(m,b)=>aply(m,MU.forearm(b)));pair('deltoid',(m,b)=>aply(m,MU.deltoid(b)));pair('trap',(m,b)=>aply(m,MU.trap(b)));pair('lat',(m,b)=>aply(m,MU.lat(b)));if(parts.upperBack)aply(parts.upperBack,MU.upperBack(base.upperBack));if(parts.chest){var csc=aply(parts.chest,MU.chest(base.chest));parts.chest.userData.baseScaleX=csc.x;parts.chest.userData.baseScaleY=csc.y;parts.chest.userData.baseScaleZ=csc.z;}pair('pec',(m,b)=>aply(m,MU.pec(b)));pair('breast',(m,b)=>aply(m,MU.breast(b)));if(parts.neckMain)aply(parts.neckMain,MU.neck(base.neckMain));if(parts.neckBase)aply(parts.neckBase,MU.neck(base.neckBase));pair('scm',(m,b)=>aply(m,MU.neck(b)));pair('tneck',(m,b)=>aply(m,MU.neck(b)));if(parts.jaw)aply(parts.jaw,MU.jaw(base.jaw));if(parts.chin)aply(parts.chin,MU.chin(base.chin));pair('buccal',(m,b)=>aply(m,MU.buccal(b)));pair('cheekbone',(m,b)=>aply(m,MU.cheekbone(b)));pair('masseter',(m,b)=>aply(m,MU.masseter(b)));[-1,1].forEach(sd=>{const k='arm'+(sd===1?'1':'-1');if(parts[k]){parts[k].position.x=sd*baseArmX*M.armPose.xMul;const bz=sd*M.armPose.rotZ;const bx=M.armPose.rotX;parts[k].rotation.z=bz;parts[k].rotation.x=bx;parts[k].userData.baseRotZ=bz;parts[k].userData.baseRotX=bx;}});if(parts.head){parts.head.position.y=base.headPosY-trochanterY-M.headPose.ageDrop;parts.head.position.z=M.headPose.fwd;}
}

// ────────────────────────────────────────────────────────────────────────────
// Mock-Rig + deterministische base-Skalen (mulberry32 — der Test-Strom).
// ────────────────────────────────────────────────────────────────────────────
const SINGLES = ["ribcage","pelvis","waist","abs","upperBack","chest","neckMain","neckBase","jaw","chin","head"];
const PAIRED = ["oblique","glute","quad","hamstring","calf","bicep","tricep","uarm","forearm","deltoid","trap","lat","pec","breast","scm","tneck","buccal","cheekbone","masseter","arm"];

function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function partNames() {
    const names = SINGLES.slice();
    for (const n of PAIRED) { names.push(n + "1"); names.push(n + "-1"); }
    return names;
}

function mkMock() {
    const rnd = mulberry32(18451);
    const parts = {}, base = {};
    for (const n of partNames()) {
        parts[n] = {
            scale: { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            userData: {},
        };
        base[n] = { x: 0.5 + rnd(), y: 0.5 + rnd(), z: 0.5 + rnd() };
    }
    parts.__character = { scale: { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; } } };
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
function gridValues(dial) { return [dial.min, dial.def, dial.max]; }

function runVergleich(labMorphFn, labPropFn, labLandmarksFn) {
    const P = core.PARAMS_BY_KIND.koerper;
    const byId = {};
    for (const d of P) byId[d.id] = d;
    const dials = ["height", "mass", "tone", "age", "gender", "arms"].map((id) => byId[id]);

    let diffs = 0, values = 0, points = 0;

    // (1) Proportionen — 28 Konstanten, alt vs neu.
    const ap = altProportionen(), np = labPropFn();
    for (const k of Object.keys(ap)) {
        values++;
        if (!Object.is(ap[k], np[k])) { diffs++; if (diffs < 5) console.log(`  ⛔ Proportion ${k}: alt=${ap[k]} neu=${np[k]}`); }
    }

    // (2) Morph — das Dial-Gitter (3^6 = 729 Punkte), alt vs neu auf dem Mock-Rig.
    const [gh, gm, gt, ga, gg, gr] = dials.map(gridValues);
    for (const height of gh) for (const mass of gm) for (const tone of gt)
    for (const age of ga) for (const gender of gg) for (const arms of gr) {
        points++;
        const p = { height, mass, tone, age, gender, arms };
        const A = mkMock(), N = mkMock();
        altMorph(p, A.parts, A.base, ap);
        neuMorph(p, N.parts, N.base, np, labMorphFn);
        const sa = snapshot(A.parts), sn = snapshot(N.parts);
        if (sa.length !== sn.length) { diffs++; continue; }
        for (let i = 0; i < sa.length; i++) {
            values++;
            if (!Object.is(sa[i], sn[i])) {
                diffs++;
                if (diffs < 5) console.log(`  ⛔ Gitter ${JSON.stringify(p)} Wert[${i}] (${sa[i - (i % 1)]}): alt=${sa[i]} neu=${sn[i]}`);
            }
        }
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
        for (const k of Object.keys(la)) {
            values++;
            if (!Object.is(la[k], ln[k])) { diffs++; if (diffs < 5) console.log(`  ⛔ Landmarke ${k}: alt=${la[k]} neu=${ln[k]}`); }
        }
    }

    return { diffs, values, points };
}

// ────────────────────────────────────────────────────────────────────────────
const selftest = process.argv.includes("--selftest");

if (selftest) {
    // Drei injizierte Abweichungen — jede MUSS die Linse zuenden.
    let fails = 0;
    const morphMut = (p) => { const M = core.labMorph(p); const q = M.shell.quad; M.shell.quad = (b) => { const s = q(b); s.x += 1e-9; return s; }; return M; };
    const propMut = () => { const o = core.labProportionen(); o.acromionY += 1e-9; return o; };
    const lmMut = (m) => { const o = core.labLandmarks(m); o.wristFrac += 1e-9; return o; };
    const t1 = runVergleich(morphMut, core.labProportionen, core.labLandmarks);
    const t2 = runVergleich(core.labMorph, propMut, core.labLandmarks);
    const t3 = runVergleich(core.labMorph, core.labProportionen, lmMut);
    if (t1.diffs === 0) { console.log("⛔ Selbsttest: Morph-Injektion NICHT erkannt"); fails++; }
    if (t2.diffs === 0) { console.log("⛔ Selbsttest: Proportionen-Injektion NICHT erkannt"); fails++; }
    if (t3.diffs === 0) { console.log("⛔ Selbsttest: Landmarken-Injektion NICHT erkannt"); fails++; }
    if (fails) { console.error("❌ ROT — die Linse ist blind."); process.exit(1); }
    console.log(`✅ Selbsttest: alle drei injizierten Abweichungen erkannt (${t1.diffs}/${t2.diffs}/${t3.diffs} Treffer).`);
    process.exit(0);
}

const r = runVergleich(core.labMorph, core.labProportionen, core.labLandmarks);
if (r.points < 500) { console.error(`❌ ROT — Gitter zu klein: ${r.points} Punkte (< 500).`); process.exit(1); }
if (r.diffs > 0) { console.error(`❌ ROT — ${r.diffs} Abweichung(en) alt↔neu (auf ${r.values} Werten).`); process.exit(1); }
console.log(`✅ DER MENSCH IST EINER — Dial-Gitter ${r.points} Punkte, ${r.values} Werte alt==neu exakt (0 Abweichungen); Proportionen + Landmarken-Urteil identisch.`);
process.exit(0);
