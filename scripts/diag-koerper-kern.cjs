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

// DER WEG ZUM WERK FÜHRT ÜBER DEN MARKT (menge-bild, koerper `_morgenGang` im `tagesPlan`; Leser: der Wirt `_bewohnerSoll`, die
// Station mensch.menge.bild#2 um 8 Uhr am Markt): 2000 Samen eines Wohnhauses, je Same sein Aufstehen und sein Werk aus dem Plan
// selbst (die erste Stunde nicht im Schlaf, die erste am Werk, je 0,05 h) — wer vor dem Werk mehr als `morgenPlatzH` Stunden wach
// ist, steht 0,1 h vor dem Werk am Markt und 0,1 h nach dem Aufstehen daheim; Soll ≥ 95 % für beide. Bis menge-bild lag der Gang
// gleich nach dem Aufstehen, vom Markt ging jeder heim und dann zum Werk: am Messort stadt-voll hatten um 7 Uhr 296 den Platz zum
// Ziel, um 8 Uhr 8 (die Station sah 47 im Bild, 21 gehend). Täter (Selbsttest): „nachDemAufstehen" (der Stand vor menge-bild).
const MORGEN_ORTE = { heim: { o: "heim" }, werk: { o: "werk" }, platz: { o: "platz" }, mahl: { o: "mahl" }, abend: { o: "abend" }, besuch: null };
const morgenWenden = (P, s, O) => {
    let [wach, w0] = [null, null];
    for (let h = 3; h < 14 && w0 == null; h += 0.05) {
        const p = P(s, "wohnhaus", h, O);
        if (wach == null && p.akt !== "schlaf") wach = h;
        if (p.akt === "arbeit") w0 = h;
    }
    return { wach, w0 };
};
const morgenGang = (P, mh, O = MORGEN_ORTE, M = null) => {
    let [n, amMarkt, daheim, ausserFenster] = [0, 0, 0, 0];
    for (let s = 0; s < 2000; s++) {
        // (das Fenster, das der Kern dem Wirt nennt — `tagesMarkt`, nach ihm teilt der Wirt den Stand am Platz: trägt es jede
        // Stunde, in der der Plan ihn am Markt sieht?)
        const f = M && M(s, "wohnhaus");
        for (let h = 3; f && h < 14; h += 0.05) if (P(s, "wohnhaus", h, O).ort === O.platz && (h < f[0] - 1e-9 || h >= f[1] + 1e-9)) ausserFenster++;
        const { wach, w0 } = morgenWenden(P, s, O);
        if (wach == null || w0 == null || w0 - wach < mh + 0.2) continue;
        n++;
        if (P(s, "wohnhaus", w0 - 0.1, O).ort === O.platz) amMarkt++;
        if (P(s, "wohnhaus", wach + 0.1, O).ort === O.heim) daheim++;
    }
    return { n, markt: n ? amMarkt / n : 0, daheim: n ? daheim / n : 0, ausserFenster };
};
// der Täter „nachDemAufstehen": der Gang über den Markt gleich nach dem Aufstehen, danach daheim bis zum Werk (der Stand vor menge-bild)
const nachDemAufstehenVon = (P, mh) => (s, r, h, O) => {
    const { wach, w0 } = morgenWenden(P, s, O);
    if (wach == null || w0 == null || h < wach || h >= w0) return P(s, r, h, O);
    return h < wach + mh ? { ort: O.platz, wo: "platz", akt: "morgen", drinnen: false } : { ort: O.heim, wo: "heim", akt: "morgen", drinnen: false };
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

// DIE VERBEN AUS DER GESTALT (nerv-bewegung; Meisterkarte 2 mensch.sport.koerper S1; koerper `leibVerben` · `VERB_TAFEL`): der Leib
// der START_PARAMS, wie der Wirt ihn liest (`leibWerte` über fx.bewegung — dieselben Getter, die `Gesetz("koerper:bewegung.*")`
// trägt), gegen das Profi-Band der Station k2-mensch-sport (die Eichung koerper fx.bewegung: Gehen 1,5 · Sprint 6,8 m/s · Sprung
// 0,53 m, je ± 10 %; Bohannon 1997 · Weyand 2000 · Samozino 2008). V1–V3 die drei Zahlen; V4 der Konsum: die Werte des Leibs SIND
// das Gesetz (kein Literal neben ihm); V5 der Sprint ist ein Punkt des Gangs (tetrapoda `gangSchritt` an der Gang-Zeile des
// Menschen: 2·Tastgrad·Φ = 1 — die Kraft der Beine trägt den Schritt, der Fuß gleitet nie); V6 die Masse kürzt sich (der Abdruck
// eines Leibs von 55–110 kg ist seine Sprungkraft, ± 1e-9 — kein Bezugs-Literal); V7 die Verb-Tafel trägt elf Zeilen, die sechs am
// Gerät sind die Verben des Geräte-Gesetzes (VERB_GESETZ), Gehen und Sprint tragen den Schwung (die zwei Enden der Gang-Pose), keine
// Zeile trägt Prosa (`ziele`/`kontakt` fielen in nerv-schwung: kein Leser steuerte sie, 0 von 11); V8 die Gang-Pose ist EINE Kurve
// auf der Froude-Achse (`leibSchwung`): am Gehen der Schwung des Gehens, am Sprint der des Sprints, dazwischen steigt das Knie
// stetig (kein Sprung über 40 % der Spanne je 1/40 des Tempos, heute 18 %), und die Enden liegen im Profi-Band (Novacheck 1998 · Perry 1992 · Mann & Herman 1985: Knie im Schwung Gehen 52–68°,
// Sprint ≥ 120°, Knie beim Aufsatz des Sprints im Gesetz 25–30° (die Welt trägt mit dem Stand-Lock 4° mehr: 30–40°), der Ellbogen des Sprints 80–100°). Täter (Selbsttest): „Literal" (die
// Eichung vom 17.07.: 1,15 · ×4,5 · 2,6), „refKg" (die Kraft am Bezugs-Leib 89 kg), „gleitet" (der Sprint als Vielfaches des
// Gehens), „Tafel" (fünf Zeilen), „Prosa" (eine Zeile trägt wieder Ziele), „Stufe" (die Pose springt am Wechsel vom Gehen zum Sprint). Leser: der Wirt (`computePlayerStats` → `_statsFromTags`, `_sprungKraft`) und das Körper-Studio.
const VERBEN_SOLL = { gehen: [1.5, 0.15], sprint: [6.8, 0.68], sprung: [0.53, 0.053] };
const VERBEN_TAETER = "koerper-core.js fx.bewegung (speed.base · sprintMul · jumpPower.base) · leibVerben · leibSprungKraft · VERB_TAFEL · leibSchwung";
function verbenUrteil(C0, mutante = null) {
    const rot = [];
    const S = C0.START_PARAMS;
    const ohneGesetz = typeof C0.leibVerben !== "function" || !C0.VERB_TAFEL;
    if (ohneGesetz) rot.push("V4 der Kern trägt kein Gesetz der Verben aus der Gestalt (koerper leibVerben · VERB_TAFEL)");
    const V = ohneGesetz ? null : C0.leibVerben();
    let werte = (d) => C0.leibWerte(d);
    let kraft = (jp, m) => C0.leibSprungKraft(jp, m);
    let tafel = C0.VERB_TAFEL || {};
    if (mutante === "Literal") werte = () => ({ speed: 1.15, sprintSpeed: 1.15 * 4.5, jumpPower: 2.6 });
    if (mutante === "refKg") kraft = (jp) => 89 * (9.81 + (jp * jp) / (2 * 0.4));
    if (mutante === "gleitet") werte = (d) => ((w) => Object.assign({}, w, { sprintSpeed: w.speed * 4.5 }))(C0.leibWerte(d));
    if (mutante === "Tafel") tafel = Object.fromEntries(Object.entries(C0.VERB_TAFEL).slice(0, 5));
    if (mutante === "Prosa") tafel = Object.assign({}, C0.VERB_TAFEL, { gehen: Object.assign({}, C0.VERB_TAFEL.gehen, { ziele: { vor: 1 }, kontakt: ["ferse"] }) });
    let schwung = (fr, lauf) => C0.leibSchwung(fr, lauf, {});
    if (mutante === "Stufe") schwung = (fr, lauf) => C0.leibSchwung(fr, lauf > 0.5 ? 1e6 : 0, {});
    const G = C0.LEIB.sprung.refG;
    const w = werte(S);
    const abdruck = (m) => C0.leibAbdruck(kraft(w.jumpPower, m), m, G);
    const h = abdruck(80.94) ** 2 / (2 * G);
    for (const [n, x, sp] of [["V1 Gehen", w.speed, "gehen"], ["V2 Sprint", w.sprintSpeed, "sprint"], ["V3 Sprung", h, "sprung"]]) {
        const [soll, tol] = VERBEN_SOLL[sp];
        if (!(Math.abs(x - soll) <= tol)) rot.push(`${n} ${x.toFixed(3)} verfehlt ${soll} ± ${tol}`);
    }
    if (ohneGesetz) return { rot, w, h, V };
    const B = C0.PRESETS.mensch.fx.bewegung;
    const nah = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
    if (!(nah(w.speed, V.gehen) && nah(w.sprintSpeed, V.sprint) && nah(w.jumpPower, V.abdruck) && nah(B.speed.base * B.sprintMul, V.sprint)))
        rot.push(`V4 die Werte des Leibs sind nicht das Gesetz (gehen ${w.speed.toFixed(4)}/${V.gehen.toFixed(4)}, sprint ${w.sprintSpeed.toFixed(4)}/${V.sprint.toFixed(4)}, Abdruck ${w.jumpPower.toFixed(4)}/${V.abdruck.toFixed(4)})`);
    const Z = Object.assign({}, B.gang, { g: G });
    const gs = globalThis.__tetrapodaCore.gangSchritt(w.sprintSpeed, V.beinM, Z, "galopp");
    const bilanz = 2 * gs.tast * V.kraft;
    if (!(Math.abs(bilanz - 1) <= 1e-6)) rot.push(`V5 der Sprint ist kein Punkt des Gangs (2·Tastgrad·Φ ${bilanz.toFixed(4)}, Soll 1: Tastgrad ${gs.tast.toFixed(4)}, Φ ${V.kraft.toFixed(3)})`);
    const ab = [55, 70, 80.94, 89, 110].map(abdruck);
    const spanne = Math.max(...ab) / Math.min(...ab) - 1;
    if (!(spanne <= 1e-9 && nah(ab[2], w.jumpPower))) rot.push(`V6 die Masse kürzt sich nicht (Abdruck 55–110 kg ${ab.map((x) => x.toFixed(3)).join("/")} gegen die Sprungkraft ${w.jumpPower.toFixed(3)})`);
    const zeilen = Object.entries(tafel);
    const geraet = zeilen.filter(([, z]) => z.geraet).map(([k]) => k).sort().join(",");
    const prosa = zeilen.filter(([, z]) => "ziele" in z || "kontakt" in z).map(([k]) => k);
    const FELDER = ["knie", "knieAufsatz", "aufsatz", "rumpf", "arm", "ellbogen"];
    const ohneSchwung = ["gehen", "sprint"].filter((k) => !(tafel[k] && tafel[k].schwung && FELDER.every((n) => Number.isFinite(tafel[k].schwung[n]))));
    if (zeilen.length !== 11 || prosa.length || ohneSchwung.length || geraet !== Object.keys(C0.VERB_GESETZ).sort().join(","))
        rot.push(`V7 die Verb-Tafel trägt ${zeilen.length} Zeilen (Soll 11), Prosa ohne Leser [${prosa.join(", ")}], ohne Schwung [${ohneSchwung.join(", ")}], am Gerät [${geraet}]`);
    // V8: die Kurve über die Froude-Achse (das Gang-Gesetz gibt fr und lauf, wie der Takt sie liest: tetrapoda gangSchritt)
    const TC = globalThis.__tetrapodaCore;
    const kurve = [];
    for (let i = 0; i <= 40; i++) {
        const v = 0.5 + ((V.sprint - 0.5) * i) / 40, g = TC.gangSchritt(v, V.beinM, Z, "galopp");
        kurve.push(schwung(g.fr, g.lauf));
    }
    const A = C0.VERB_TAFEL.gehen.schwung, Bs = C0.VERB_TAFEL.sprint.schwung, deg = (x) => (x * 180) / Math.PI;
    const gehK = schwung(TC.gangSchritt(V.gehen, V.beinM, Z, "galopp").fr, TC.gangSchritt(V.gehen, V.beinM, Z, "galopp").lauf), spK = kurve[kurve.length - 1];
    const sprungMax = Math.max(...kurve.slice(1).map((k, i) => Math.abs(k.knie - kurve[i].knie)));
    const faellt = kurve.slice(1).some((k, i) => k.knie < kurve[i].knie - 1e-12);
    const band = [["Knie im Schwung Gehen", deg(gehK.knie), 52, 68], ["Knie im Schwung Sprint", deg(spK.knie), 120, 140], ["Knie beim Aufsatz Sprint", deg(spK.knieAufsatz), 25, 30], ["Ellbogen Sprint", deg(spK.ellbogen), 80, 100]].filter(([, x, a, b]) => !(x >= a && x <= b));
    if (!nah(gehK.knie, A.knie) || !nah(spK.knie, Bs.knie) || faellt || sprungMax > 0.4 * (Bs.knie - A.knie) || band.length)
        rot.push(`V8 die Gang-Pose ist keine Kurve der Froude-Achse (Gehen ${deg(gehK.knie).toFixed(1)}°, Sprint ${deg(spK.knie).toFixed(1)}°, größter Sprung ${deg(sprungMax).toFixed(1)}°${faellt ? ", fällt" : ""}${band.map(([n, x, a, b]) => `, ${n} ${x.toFixed(1)}° außer ${a}–${b}`).join("")})`);
    return { rot, w, h, V, tast: gs.tast };
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

// TEIL E — DIE REGEL-GRAMMATIK (Meisterkarte 2 mensch.sport.regeln#1 · mannschaft#1 · arena#1 · geistspiel#1; koerper
// `SPIEL_GESETZ` · `spielProgramm` · `spielKampf` · `spielBrett` · `spielGeschehen`): ein Treff von 150 Gästen aus dem Samen 9
// (Rollen, Geschlecht, Alter 8–75 J, Gewicht, Bein, Kraft, Übung je Gast aus dem Samen — dieselben Felder, die der Wirt aus
// seinem Satz liest, `_spielProgramm`), ein Feld 40 × 8 m, 150 s je Stunde der Uhr, Abend um Abend ab Tag 1. E1 die Rangfolge
// des Laufs folgt dem Leib, nie ganz: über 20 Läufe die Rang-Korrelation (Spearman) der Laufzeit gegen die Leistung des Leibs
// allein (`spielLeib`) im Band 0,6–0,9; E2 im Zweikampf siegt der Stärkere (die höhere Leistung am Tag) in 60–80 % von 200
// Gängen, und kein Paar gleicher Klasse trägt über 40 Gänge (je 40 Same) 100 %; E3 100 Partien am Brett ohne einen regelwidrigen
// Zug (eigene Prüfung je Zug: im Brett, frei; die Partie endet genau an der ersten Reihe von fünf oder am vollen Brett); E4 im
// Ring stehen ≥ 10 Zuschauer, und ihr Blick (die Wendung des Stands + Kopf und Rumpf, `BEWOHNER.kopfMaxRad + rumpfMaxRad`)
// trifft den Punkt des Geschehens (`spielGeschehen`) in ≥ 80 % der Proben (je Gang 5 Zeitpunkte, ±30° wie die Station);
// E5 der Tag liest das Programm: `tagesPlan` mit `orte.spiel` stellt den Gast zur Stunde seines Auftritts in dessen Akt an
// dessen Stand; E6 der Raum des Stands: je zwei Stände verschiedener Gäste, deren Stunden sich decken (Ring, Tisch, Bahn, Zweikampf),
// stehen ≥ `SPIEL_GESETZ.feld.standM` auseinander, und standM liegt über der Tür-Freiheit des Wirts (BEWOHNER.tuerFreiM 0,9 m: wer
// beiseite trat, kehrt erst zurück, wenn kein Leib näher an seinem Stand steht — bis sport-regeln 3 saßen die zwei am Brett 0,8 m
// auseinander, pfarrhaus #723323 trat dem Kind beiseite und kam nie zurück, Kreatur-Linse bewohner 18,80 Uhr); E7 der Abend trägt
// den Weg: kein Gast geht mit den Ständen seines Abends mehr als 10 Wege am Tag (mensch.K3, 4–10 Wege je Tag) — gezählt am Plan
// der Stunde selbst (`tagesPlan` je 0,05 h und an jeder Grenze eines Auftritts, ein Weg = ein neuer Ort, drinnen oder davor), und
// `tagesGaenge` des Kerns zählt nie weniger (das Raster ist die untere Schranke; bis sport-regeln 3 vergab das Programm Lauf, Gang und Ring obendrauf: Patrizierhaus
// #91693 der Stadt ging 13 Wege). Täter (Selbsttest):
// „gewürfelt" (der Sieger des Laufs ohne den Leib), „immer" (der Stärkere siegt jeden Zug), „starr" (der Zuschauer blickt in eine
// feste Richtung), „ohneRegel" (das Brett setzt auf ein besetztes Feld), „ohneTag" (der Tag liest `orte.spiel` nicht), „eng" (die
// zwei am Brett 0,8 m auseinander, der Tisch vor sport-regeln 3), „ohneWeg" (jeder Auftritt zerfällt in acht Stände hin und her). Leser: der Wirt (`_spielTag`, `_spielProgramm` → `orte.spiel`,
// `_bewohnerKopf` → `S.spielJetzt`; der Rückweg des Beiseitegetretenen an seinen Stand, `_bewohnerPlatz` → BEWOHNER.tuerFreiM).
const SPIEL_KOPF_RAD = 1.65; // BEWOHNER.kopfMaxRad 1,2 + rumpfMaxRad 0,45 (stamm/siedlung-bewohner.js) — die Linse liest den Stamm nicht als Quelltext
const SPIEL_WEGE_MAX = 10; // mensch.K3: 4–10 Wege je Tag (die Kreatur-Linse bewohner „Wege", scripts/lib/kreatur-mensch.cjs)
const SPIEL_FREI_M = 0.9; // BEWOHNER.tuerFreiM (stamm/siedlung-bewohner.js): so nah an seinem Stand steht keiner, wenn der Beiseitegetretene zurückgeht
// die Zahl des Samens der Linse (FNV-1a über Same und Wort, in [0,1)) — die Gäste sind die der Linse, nie die des Kerns
function linseZahl(same, wort) {
    let h = (2166136261 ^ (same >>> 0)) >>> 0;
    for (const c of String(wort)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}
// die Orte eines Gasts der Linse (je Gast eigene, je ein Gang auseinander): Heim, Markt, Werk, Treff, je zur Hälfte Mittagstisch und Besuch
function spielOrte(i, z) {
    const ort = (k) => ({ x: 10 * i, z: 10 * k });
    return { heim: ort(1), platz: ort(2), werk: ort(3), mahl: z("mahl" + i) < 0.5 ? ort(4) : null, abend: ort(5), besuch: z("besuch" + i) < 0.5 ? ort(6) : null }; // prettier-ignore
}
// E7: die Wege eines Tags am Plan der Stunde — je 0,05 h und an jeder Grenze eines Auftritts, ein Weg = ein neuer Ort (drinnen oder davor)
function planWege(C0, g, orte) {
    const t = new Set();
    for (let k = 0; k < 480; k++) t.add(k * 0.05);
    for (const e of orte.spiel || []) t.add(((e.von % 24) + 24) % 24).add(((e.bis % 24) + 24) % 24);
    const u = [...t].sort((a, b) => a - b), wo = []; // prettier-ignore
    const v = (C0.TAGES_GESETZ.rollen[g.rolle] || {}).versatzH || 0;
    for (let i = 0; i < u.length; i++) {
        const [a, b] = [u[i], i + 1 < u.length ? u[i + 1] : u[0] + 24];
        if (b - a > 1e-9) wo.push(C0.tagesPlan(g.same, g.rolle, (a + b) / 2 + v, orte, 0, false));
    }
    return wo.filter((p, k) => { const q = wo[(k + wo.length - 1) % wo.length]; return p.ort !== q.ort || p.drinnen !== q.drinnen; }).length; // prettier-ignore
}
// der Täter „ohneGegner": der Zweikampf wie vor sport-wurzel — der Auftritt heißt wie der Lauf „wettkampf“ und trägt keinen Gegner
function ohneGegnerVon(P) {
    const alt = (e) => (e.akt === "zweikampf" ? Object.assign({}, e, { akt: "wettkampf", gegner: undefined }) : e);
    return Object.assign({}, P, { auftritte: P.auftritte.map((A) => A.map(alt)) });
}
// der Täter „ohneWeg": jeder Auftritt zerfällt in acht Stände, hin und her zwischen seinem Stand und einem Gang daneben
function ohneWegVon(P) {
    const teile = (e) => Array.from({ length: 8 }, (_, k) => Object.assign({}, e, { von: e.von + ((e.bis - e.von) * k) / 8, bis: e.von + ((e.bis - e.von) * (k + 1)) / 8, x: e.x + (k % 2) * 3 })); // prettier-ignore
    return Object.assign({}, P, { auftritte: P.auftritte.map((A) => A.flatMap(teile)) });
}
function spielGaeste(C0, n, same) {
    const z = (w) => linseZahl(same, w);
    const rollen = ["bauer", "handwerk", "haendler", "kind", "gasthaus"];
    return Array.from({ length: n }, (_, i) => {
        const alterJ = 8 + 67 * z("alter" + i);
        const mass = z("masse" + i);
        const tone = z("ton" + i);
        const age = Math.max(0, Math.min(1, (alterJ - 18) / 62));
        const K = C0.leibKoennen(Object.assign({}, C0.START_PARAMS, { mass, tone, age, gender: z("g" + i) }));
        // die Übung der Liebhaber wie im Lebenslauf des Wirts (stamm LEBENSLAUF.uebung: amateurH 2000 Stunden über ueberJ 15 Jahre,
        // das Potenzgesetz guteH 7500 · alpha 0,4; der Zweikampf ab 15 J, das Brett ab 7 J)
        const uebung = (w) => Math.pow(Math.max(1, ((z(w + i) * 2000) / 15) * Math.max(0, alterJ - (w === "kampf" ? 15 : 7))) / 7500, 0.4);
        return { same: (same * 7919 + i * 104729) >>> 0, rolle: alterJ < 15 ? "kind" : rollen[i % 4], mann: z("g" + i) >= 0.5, alterJ, masse: mass, beinM: 0.85 + 0.12 * (z("bein" + i) - 0.5), kraft: K.kraft, kampf: uebung("kampf"), brett: uebung("brett"), orte: spielOrte(i, z) }; // prettier-ignore
    });
}
function spearman(a, b) {
    const rang = (x) => { const o = x.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = []; o.forEach(([, i], k) => (r[i] = k)); return r; }; // prettier-ignore
    const [ra, rb] = [rang(a), rang(b)];
    const m = (a.length - 1) / 2;
    let sab = 0, saa = 0, sbb = 0; // prettier-ignore
    for (let i = 0; i < a.length; i++) (sab += (ra[i] - m) * (rb[i] - m)), (saa += (ra[i] - m) ** 2), (sbb += (rb[i] - m) ** 2);
    return sab / Math.sqrt(saa * sbb);
}
function spielUrteil(C0, mutante = null) {
    const rot = [];
    const fehlt = ["SPIEL_GESETZ", "spielProgramm", "spielKampf", "spielBrett", "brettErlaubt", "spielGeschehen", "spielLeib", "spielTischPartie"].filter((k) => !C0[k]); // prettier-ignore
    if (fehlt.length) {
        rot.push(`E0 der Kern trägt keine Regel-Grammatik (koerper ${fehlt.join(" · ")} fehlt) — kein Bewohner tritt gegen einen anderen an`);
        return { rot };
    }
    const C = Object.assign({}, C0);
    if (mutante === "gewuerfelt") C.spielLeistung = (art, g, tag) => (art === "lauf" ? 6 + linseZahl(g.same, "w" + tag) : C0.spielLeistung(art, g, tag));
    const sek = 150;
    const gaeste = spielGaeste(C0, 150, 9);
    const feld = { L: 40, B: 8 };
    // E1 · E2 · E4: Abend um Abend
    const laeufe = [], kaempfe = [], proben = { n: 0, trifft: 0, seit: 0, seitTrifft: 0 }; // prettier-ignore
    let zuschauerMax = 0;
    const SM = C0.SPIEL_GESETZ.feld.standM;
    const raum = { n: 0, eng: 0, min: Infinity, wo: "—" };
    const wege = { abende: 0, n: 0, ueber: 0, max: 0, wo: "—", anders: 0, andersWo: "—", kurz: 0 }; // prettier-ignore
    const zk = { n: 0, fehl: 0, wo: "—" };
    for (let tag = 1; tag <= 120 && (laeufe.length < 20 || kaempfe.length < 200 || proben.n < 200); tag++) {
        const P = mutante === "gewuerfelt" ? spielProgrammMit(C, gaeste, tag, feld, sek) : C.spielProgramm(4242, tag, gaeste, feld, sek);
        if (!P) continue;
        // E6 der Raum des Stands (der Täter „eng": die zwei am Brett 0,8 m, wie bis sport-regeln 3)
        raumPruefen(mutante === "eng" ? engVon(P, SM) : P, tag, raum, SM);
        // E7 der Abend trägt den Weg (der Täter „ohneWeg": jeder Auftritt in acht Ständen)
        if (wege.abende < 5) wegePruefen(C0, mutante === "ohneWeg" ? ohneWegVon(P) : P, gaeste, tag, wege);
        // E9 der Zweikampf trägt seinen Gegner (der Täter „ohneGegner“): je Gang beide Auftritte im Akt „zweikampf“, jeder mit dem anderen
        const PA = mutante === "ohneGegner" ? ohneGegnerVon(P) : P;
        for (const g of PA.gaenge) {
            if (g.art !== "ringen") continue;
            const [a, b] = g.teil, ea = PA.auftritte[a].find((e) => e.von === g.von), eb = PA.auftritte[b].find((e) => e.von === g.von); // prettier-ignore
            zk.n++;
            if (!(ea && eb && ea.akt === "zweikampf" && eb.akt === "zweikampf" && ea.gegner === b && eb.gegner === a)) (zk.fehl++, zk.wo === "—" && (zk.wo = `Tag ${tag} ${g.klasse}: ${ea ? ea.akt + " gegen " + ea.gegner : "kein Auftritt"} · ${eb ? eb.akt + " gegen " + eb.gegner : "kein Auftritt"}`)); // prettier-ignore
        }
        for (const g of P.gaenge) {
            if (g.art === "lauf" && laeufe.length < 20) laeufe.push(g);
            if (g.art === "ringen" && kaempfe.length < 200) kaempfe.push(g);
            if (g.art === "brett") continue;
            // E4 die Zuschauer dieses Gangs: wer zur Probe im Ring steht
            for (let k = 0; k < 5; k++) {
                const h = g.start + ((k + 0.5) / 5) * (g.bis - g.start);
                const G = C.spielGeschehen(P, h, sek);
                if (!G) continue;
                let n = 0;
                P.auftritte.forEach((A) => {
                    const e = A.find((x) => x.von <= h && h < x.bis);
                    if (!e || e.akt !== "zuschauen") return;
                    n++;
                    // der Kopf des Zuschauers: die Wendung zum Geschehen, gekappt an Kopf + Rumpf (der Leib dreht nach, `_bewohnerKopf`)
                    const soll = Math.atan2(G.x - e.x, G.z - e.z);
                    let da = soll - e.blick;
                    da -= Math.PI * 2 * Math.round(da / (Math.PI * 2));
                    const blick = mutante === "starr" ? e.blick : Math.abs(da) > SPIEL_KOPF_RAD ? soll : e.blick + da;
                    let fehl = soll - blick;
                    fehl -= Math.PI * 2 * Math.round(fehl / (Math.PI * 2));
                    proben.n++;
                    if (Math.abs(fehl) <= Math.PI / 6) proben.trifft++;
                    // (die Proben, in denen das Geschehen seitab des Stands liegt — dort trennt der folgende Blick den starren)
                    if (Math.abs(da) > Math.PI / 6) (proben.seit++, Math.abs(fehl) <= Math.PI / 6 && proben.seitTrifft++);
                });
                zuschauerMax = Math.max(zuschauerMax, n);
            }
        }
    }
    const leib = (gi) => C0.spielLeib("lauf", gaeste[gi].beinM, gaeste[gi].kraft);
    const zeit = [], kraft = []; // prettier-ignore
    for (const g of laeufe) g.teil.forEach((gi, i) => (zeit.push(-g.zeiten[i]), kraft.push(leib(gi))));
    // (die Rangfolge je Lauf: die Paare innerhalb jedes Laufs, gemittelt — der Lauf ordnet nur, wer in ihm läuft)
    let rhoSumme = 0, rhoN = 0; // prettier-ignore
    for (const g of laeufe) {
        const z = g.teil.map((_, i) => -g.zeiten[i]);
        const l = g.teil.map(leib);
        if (g.teil.length >= 3) (rhoSumme += spearman(z, l)), rhoN++;
    }
    const rho = rhoN ? rhoSumme / rhoN : NaN;
    const rhoAlle = zeit.length ? spearman(zeit, kraft) : NaN;
    if (laeufe.length < 20 || !(rhoAlle >= 0.6 && rhoAlle <= 0.9))
        rot.push(`E1 die Rangfolge des Laufs folgt dem Leib nicht im Band: ${laeufe.length} Läufe, ρ (Laufzeit ↔ Leistung des Leibs, ${zeit.length} Läufer) ${rhoAlle.toFixed(3)} (Soll 0,6–0,9; je Lauf gemittelt ${rho.toFixed(3)})`); // prettier-ignore
    // E2 der Stärkere siegt oft, nie immer
    let C2 = C;
    if (mutante === "immer") C2 = Object.assign({}, C, { spielKampf: (a, b) => ({ zuege: [], treffer: [0, 0], sieger: a.s >= b.s ? 0 : 1 }) });
    // (der Ausgang ist der des Programms — der Gang, den das Dorf sieht; der Täter ersetzt ihn)
    const sieg = kaempfe.map((g, i) => (mutante === "immer" ? C2.spielKampf({ s: g.staerke[0] }, { s: g.staerke[1] }, i) : g.kampf)); // prettier-ignore
    const staerker = kaempfe.filter((g, i) => (g.staerke[0] >= g.staerke[1] ? 0 : 1) === sieg[i].sieger).length;
    const quote = kaempfe.length ? staerker / kaempfe.length : NaN;
    let festMax = 0;
    for (const g of kaempfe.slice(0, 20)) {
        let s = 0;
        for (let q = 0; q < 40; q++) s += C2.spielKampf({ s: g.staerke[0], u: gaeste[g.teil[0]].kampf }, { s: g.staerke[1], u: gaeste[g.teil[1]].kampf }, (q * 40503 + 17) >>> 0).sieger === (g.staerke[0] >= g.staerke[1] ? 0 : 1) ? 1 : 0; // prettier-ignore
        festMax = Math.max(festMax, s / 40);
    }
    // (das festeste Paar nennt die Zeile, es urteilt nicht: ein Paar weit ungleicher Stärke siegt in 40 Gängen auch im Gesetz stets)
    if (kaempfe.length < 200 || !(quote >= 0.6 && quote <= 0.8))
        rot.push(`E2 der Stärkere siegt nicht oft und nie immer: ${kaempfe.length} Gänge, Quote ${quote.toFixed(3)} (Soll 0,6–0,8; das festeste der ersten 20 Paare ${festMax.toFixed(3)} über 40 Gänge)`); // prettier-ignore
    // E3 100 Partien ohne regelwidrigen Zug
    let brett = C.spielBrett;
    if (mutante === "ohneRegel")
        brett = (ua, ub, same) => ((p) => (p.zuege.length > 4 ? Object.assign({}, p, { zuege: p.zuege.slice(0, 3).concat([p.zuege[0]], p.zuege.slice(4)) }) : p))(C.spielBrett(ua, ub, same)); // prettier-ignore
    const B = C0.SPIEL_GESETZ.arten.brett;
    const N = B.feld;
    let widrig = 0, siege = 0, zuegeSumme = 0; // prettier-ignore
    for (let q = 0; q < 100; q++) {
        const p = brett(gaeste[q].brett, gaeste[149 - q].brett, (q * 2246822519 + 3) >>> 0);
        const feld = new Array(N * N).fill(0);
        let ende = -1;
        p.zuege.forEach((i, k) => {
            if (ende >= 0) return widrig++; // ein Zug nach dem Ende der Partie
            if (!(Number.isInteger(i) && i >= 0 && i < N * N && feld[i] === 0)) return widrig++;
            feld[i] = 1 + (k % 2);
            if (reiheVon(feld, N, i) >= B.reihe) ende = k;
        });
        const soll = ende >= 0 ? ende % 2 : -1;
        if (p.sieger !== soll || (ende < 0 && p.zuege.length !== N * N)) widrig++;
        if (p.sieger >= 0) siege++;
        zuegeSumme += p.zuege.length;
    }
    if (widrig > 0) rot.push(`E3 das Brett spielt gegen die Regel: ${widrig} regelwidrige Züge oder Urteile in 100 Partien (Soll 0)`);
    // E4 die Arena
    const blick = proben.n ? proben.trifft / proben.n : NaN;
    const seitab = proben.seit ? proben.seitTrifft / proben.seit : NaN;
    if (!(zuschauerMax >= 10) || !(blick >= 0.8) || !(seitab >= 0.8))
        rot.push(`E4 die Zuschauer folgen dem Geschehen nicht: höchstens ${zuschauerMax} im Ring (Soll ≥ 10), Blick trifft ${(100 * blick).toFixed(1)} % von ${proben.n} Proben, seitab des Stands ${(100 * seitab).toFixed(1)} % von ${proben.seit} (Soll je ≥ 80 %)`); // prettier-ignore
    // E5 der Tag liest das Programm
    const P1 = C0.spielProgramm(4242, 1, gaeste, feld, sek);
    let e5 = 0, e5n = 0; // prettier-ignore
    const tag = mutante === "ohneTag" ? (s, r, h, o, n, k) => C0.tagesPlan(s, r, h, Object.assign({}, o, { spiel: null }), n, k) : C0.tagesPlan; // prettier-ignore
    P1.auftritte.forEach((A, gi) => {
        const g = gaeste[gi];
        const orte = Object.assign({}, g.orte, { spiel: A });
        for (const e of A.slice(0, 2)) {
            const h = (e.von + e.bis) / 2;
            const s = tag(g.same, g.rolle, h, orte, false, false);
            e5n++;
            if (s.akt === e.akt && s.ort === e && !s.drinnen) e5++;
        }
    });
    // E7 der Abend trägt den Weg
    if (!C0.tagesGaenge || wege.ueber > 0 || wege.anders > 0 || !wege.n)
        rot.push(`E7 der Abend trägt den Weg nicht: ${wege.ueber} von ${wege.n} Gästen gehen mit dem Abend mehr als ${SPIEL_WEGE_MAX} Wege am Tag (das meiste ${wege.max}, ${wege.wo}); der Kern zählt ${wege.anders}× weniger als der Plan (${wege.andersWo}; koerper tagesGaenge ${C0.tagesGaenge ? "da" : "fehlt"})`); // prettier-ignore
    // E6 der Raum des Stands
    if (!(SM > SPIEL_FREI_M) || raum.eng > 0 || !raum.n)
        rot.push(`E6 die Stände des Abends nehmen einander den Raum: ${raum.eng} von ${raum.n} Paaren näher als standM ${SM} m (das nächste ${raum.min.toFixed(2)} m, ${raum.wo}; standM über der Tür-Freiheit des Wirts ${SPIEL_FREI_M} m) — wer beiseite trat, fände seinen Stand nie frei`); // prettier-ignore
    if (!(e5n > 0 && e5 === e5n)) rot.push(`E5 der Tag liest das Programm nicht: ${e5} von ${e5n} Auftritten stehen im Plan der Stunde (koerper tagesPlan orte.spiel)`);
    // E8 der Platz zieht seine Nachbarschaft (sport-wurzel, koerper `spielGaesteWahl`): ein kleiner Treff wie an stadt-voll (12 mit dem
    // Abend am Platz) und 140 Nachbarn mit dem Abend daheim binnen 95 m, dazu 60 daheim jenseits von 120 m und 30 an einem fernen Treff —
    // Gäste sind die 152 des Platzes, und an jedem von fünf Abenden läuft ein Lauf, ein Gang und ≥ 10 stehen im Ring. Der Täter
    // „nurTreff“: die Wahl vor sport-wurzel (nur wer den Abend am Platz hat — 40 Tage ohne Lauf und Gang an stadt-voll)
    // E9 der Zweikampf trägt seinen Gegner (sport-wurzel: EIN Akt, zwei Leser — die Siegquote des Sports und der Krieg, krieg#1 zählt,
    // wer einen Gegner trägt): jeder Gang des Ringens stellt beide in den Akt „zweikampf“, jeden mit dem Index des anderen
    if (!(zk.n > 0 && zk.fehl === 0)) rot.push(`E9 der Zweikampf trägt seinen Gegner nicht: ${zk.fehl} von ${zk.n} Gängen ohne den Akt „zweikampf“ mit dem anderen (${zk.wo}; koerper spielProgramm auftritte)`); // prettier-ignore
    const e8 = nachbarUrteil(C0, mutante === "nurTreff");
    if (e8.fehlt) rot.push(`E8 der Platz zieht seine Nachbarschaft nicht: ${e8.fehlt}`);
    return { rot, laeufe: laeufe.length, laeufer: zeit.length, rho: rhoAlle, rhoLauf: rho, kaempfe: kaempfe.length, quote, festMax, partien: 100, widrig, siege, zuege: zuegeSumme, zuschauerMax, blick, seitab, seit: proben.seit, proben: proben.n, e5, e5n, standM: SM, raumN: raum.n, raumMin: raum.min, wegeN: wege.n, wegeMax: wege.max, wegeAbende: wege.abende, wegeKurz: wege.kurz };
}
// E8: die Gäste des Abends am Platz (0, 0) mit Rand 20 m — der Treff, die Nachbarn, die Fernen; fünf Abende des Programms
function nachbarUrteil(C0, nurTreff) {
    if (typeof C0.spielGaesteWahl !== "function") return { fehlt: "der Kern trägt keine Wahl der Gäste (koerper spielGaesteWahl fehlt)" };
    const z = (w) => linseZahl(21, w);
    const leiber = spielGaeste(C0, 242, 21);
    const um = (i, r0, r1) => ((a, r) => ({ x: r * Math.cos(a), z: r * Math.sin(a) }))(2 * Math.PI * z("a" + i), r0 + (r1 - r0) * z("r" + i));
    const fernTreff = um(999, 200, 200); // der Treff eines anderen Platzes, 200 m fort
    const kand = leiber.map((g, i) => (i < 12 ? { abend: um(i, 0, 15), heim: um(i + 500, 60, 200) } : i < 152 ? { abend: null, heim: um(i, 20, 95) } : i < 212 ? { abend: null, heim: um(i, 120, 300) } : { abend: fernTreff, heim: um(i, 150, 250) })); // prettier-ignore
    const wahl = nurTreff ? kand.map((k, i) => (k.abend && Math.hypot(k.abend.x, k.abend.z) <= 20 ? i : -1)).filter((i) => i >= 0) : C0.spielGaesteWahl(kand, 0, 0, 20); // prettier-ignore
    const gaeste = wahl.map((i) => Object.assign({}, leiber[i], { orte: Object.assign({}, leiber[i].orte, { abend: kand[i].abend ? leiber[i].orte.abend : null }) })); // prettier-ignore
    const abende = [];
    for (let tag = 1; tag <= 5; tag++) {
        const P = C0.spielProgramm(4242, tag, gaeste, { L: 25, B: 10 }, 150);
        const n = (art) => (P ? P.gaenge.filter((g) => g.art === art).length : 0);
        let ring = 0;
        for (let h = 18; P && h < 21; h += 0.05) ring = Math.max(ring, P.auftritte.filter((A) => A.some((e) => e.akt === "zuschauen" && e.von <= h && h < e.bis)).length); // prettier-ignore
        abende.push({ lauf: n("lauf"), ringen: n("ringen"), ring });
    }
    const leer = abende.filter((a) => !(a.lauf >= 1 && a.ringen >= 1 && a.ring >= 10)).length;
    const zeile = `${wahl.length} Gäste (Soll 152: 12 vom Treff, 140 Nachbarn binnen 95 m), Abende ${abende.map((a) => `${a.lauf} Läufe · ${a.ringen} Gänge · ${a.ring} im Ring`).join(" | ")}`; // prettier-ignore
    return { fehlt: wahl.length !== 152 || leer ? `${zeile} — ${leer} von 5 Abenden ohne Lauf, Gang oder Ring von 10 (koerper spielGaesteWahl, SPIEL_GESETZ.programm.nachbarM)` : null, zeile }; // prettier-ignore
}
// E7: je Gast mit einem Auftritt die Wege seines Tags am Plan (planWege) und im Kern (tagesGaenge)
function wegePruefen(C0, P, gaeste, tag, W) {
    W.abende++;
    P.auftritte.forEach((A, gi) => {
        if (!A.length) return;
        const g = gaeste[gi], orte = Object.assign({}, g.orte, { spiel: A }); // prettier-ignore
        const w = planWege(C0, g, orte), k = C0.tagesGaenge ? C0.tagesGaenge(g.same, g.rolle, orte) : NaN; // prettier-ignore
        W.n++;
        // (das Raster ist die untere Schranke: ein Stück kürzer als 0,05 h sieht nur der Kern an den Wenden des Tags — der Kern
        // zählt nie weniger als der Plan zeigt, sonst vergäbe das Programm Stände über das Band)
        const m = Math.max(w, k);
        if (!(m <= SPIEL_WEGE_MAX)) W.ueber++;
        if (m > W.max) [W.max, W.wo] = [m, `Abend ${tag}: ${g.rolle} #${g.same} mit ${A.length} Ständen (${A.map((e) => e.akt).join(" · ")})`]; // prettier-ignore
        if (!(k >= w) && W.anders++ === 0) W.andersWo = `Abend ${tag}: ${g.rolle} #${g.same} Plan ${w}, Kern ${k}`;
        if (k > w) W.kurz++;
    });
}
// E6: je zwei Stände verschiedener Gäste, deren Stunden sich decken — wie viele näher als standM und das nächste Paar
function raumPruefen(P, tag, R, SM) {
    const st = [];
    P.auftritte.forEach((A, gi) => A.forEach((e) => st.push([gi, e])));
    for (let i = 0; i < st.length; i++)
        for (let j = i + 1; j < st.length; j++) {
            const [[ga, a], [gb, b]] = [st[i], st[j]];
            if (ga === gb || !(a.von < b.bis && b.von < a.bis)) continue;
            const d = Math.hypot(a.x - b.x, a.z - b.z);
            R.n++;
            if (!(d >= SM - 1e-9)) R.eng++;
            if (d < R.min) [R.min, R.wo] = [d, `Abend ${tag}: ${a.akt} ↔ ${b.akt} bei ${a.x.toFixed(1)}/${a.z.toFixed(1)}`];
        }
}
// der Täter „eng": die zwei am Brett rücken auf 0,8 m zusammen (der Tisch vor sport-regeln 3)
function engVon(P, SM) {
    const d = ((SM || 0.8) - 0.8) / 2;
    return Object.assign({}, P, { auftritte: P.auftritte.map((A) => A.map((e) => (e.akt === "brett" ? Object.assign({}, e, { z: e.z + (e.blick === 0 ? d : -d) }) : e))) }); // prettier-ignore
}
// das Programm mit einer fremden Leistung (der Täter „gewürfelt"): der Kern rechnet mit seiner eigenen — der Täter ersetzt die Zeiten
function spielProgrammMit(C, gaeste, tag, feld, sek) {
    const P = C.spielProgramm(4242, tag, gaeste, feld, sek);
    if (!P) return P;
    for (const g of P.gaenge) if (g.art === "lauf") g.zeiten = g.teil.map((gi) => feld.L / C.spielLeistung("lauf", gaeste[gi], tag));
    return P;
}
function reiheVon(feld, N, i) {
    const w = feld[i], x = i % N, z = (i / N) | 0; // prettier-ignore
    let best = 0;
    for (const [dx, dz] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        let n = 1;
        for (const s of [-1, 1]) for (let q = 1; q < N; q++) { const xx = x + s * q * dx, zz = z + s * q * dz; if (xx < 0 || zz < 0 || xx >= N || zz >= N || feld[zz * N + xx] !== w) break; n++; } // prettier-ignore
        best = Math.max(best, n);
    }
    return best;
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
    // die Verben aus der Gestalt: das Gesetz hält, jeder Täter fällt ROT beim Namen
    const vGut = !verbenUrteil(core).rot.length;
    const verbenTaeter = [["Literal", "V1 Gehen"], ["Literal", "V3 Sprung"], ["refKg", "V6 die Masse kürzt sich nicht"], ["gleitet", "V5 der Sprint ist kein Punkt des Gangs"], ["Tafel", "V7 die Verb-Tafel"], ["Prosa", "V7 die Verb-Tafel"], ["Stufe", "V8 die Gang-Pose"]].map(([m, z]) => [vGut && verbenUrteil(core, m).rot.some((r) => r.startsWith(z)), `Verben ${m} ${z}`]);
    // die Regel-Grammatik: das Gesetz hält, jeder Täter fällt ROT beim Namen
    const eGut = !spielUrteil(core).rot.length;
    const spielTaeter = [["gewuerfelt", "E1 die Rangfolge des Laufs"], ["immer", "E2 der Stärkere siegt"], ["ohneRegel", "E3 das Brett spielt gegen die Regel"], ["starr", "E4 die Zuschauer folgen"], ["ohneTag", "E5 der Tag liest das Programm nicht"], ["eng", "E6 die Stände des Abends"], ["ohneWeg", "E7 der Abend trägt den Weg nicht"], ["nurTreff", "E8 der Platz zieht seine Nachbarschaft nicht"], ["ohneGegner", "E9 der Zweikampf trägt seinen Gegner nicht"]].map(([m, z]) => [eGut && spielUrteil(core, m).rot.some((r) => r.startsWith(z)), `Spiel ${m} ${z}`]); // prettier-ignore
    // der Morgengang: das Gesetz hält, der Stand vor menge-bild (der Markt gleich nach dem Aufstehen) fällt ROT beim Namen
    const mh = core.TAGES_GESETZ.morgenPlatzH;
    const mGut = morgenGang(core.tagesPlan, mh, undefined, core.tagesMarkt), mAlt = morgenGang(nachDemAufstehenVon(core.tagesPlan, mh), mh);
    const mVersetzt = morgenGang(core.tagesPlan, mh, undefined, (s, r) => core.tagesMarkt(s, r).map((h) => h + 1));
    const morgenTaeter = [[mGut.n >= 500 && mGut.markt >= 0.95 && mGut.daheim >= 0.95 && !mGut.ausserFenster && mAlt.markt < 0.95, "Morgengang nachDemAufstehen M1 der Weg zum Werk führt nicht über den Markt"], [!mGut.ausserFenster && mVersetzt.ausserFenster > 0, "Morgengang marktVersetzt M2 das Fenster des Markts"]]; // prettier-ignore
    for (const [x, n] of [[t1.diffs, "Morph"], [t2.diffs, "Proportionen"], [t3.diffs, "Landmarken"], [w && !wacheLeer(core.tagesPlan), "Wache"], [verbKlassen(core.tagesPlan, () => null).length < 2 && verbKlassen(core.tagesPlan, core.tagesHaltung).length >= 2, "Verb"], ...taeter, ...bestandTaeter, ...ackerTaeter, ...koennenTaeter, ...stoffTaeter, ...verbenTaeter, ...spielTaeter, ...morgenTaeter])
        if (!x) {
            console.log(`⛔ Selbsttest: ${n}-Injektion NICHT erkannt`);
            fails++;
        }
    urteilEnde(fails, "❌ ROT — die Linse ist blind.", `✅ Selbsttest: alle fünfundvierzig injizierten Abweichungen erkannt (${t1.diffs}/${t2.diffs}/${t3.diffs} Treffer, die Wache, das Verb, fünf Täter des Stoßes, drei Täter des Bestands, drei Täter der Acker-Kette, fünf Täter des Könnens, sechs Täter der Stoffstrom-Kette, sieben Täter der Verben aus der Gestalt, neun Täter der Regel-Grammatik, zwei Täter des Morgengangs).`);
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
const sp = spielUrteil(core);
for (const z of sp.rot) st.rot.push("SPIEL " + z + " — Täter: koerper SPIEL_GESETZ · spielProgramm · spielKampf · spielBrett · spielGeschehen · tagesPlan");
if (!sp.rot.length) console.log(`  SPIEL ${sp.laeufe} Läufe (${sp.laeufer} Läufer): ρ Laufzeit ↔ Leib ${sp.rho.toFixed(3)} (je Lauf ${sp.rhoLauf.toFixed(3)}) · ${sp.kaempfe} Gänge des Zweikampfs: der Stärkere siegt ${(100 * sp.quote).toFixed(1)} % · ${sp.partien} Partien am Brett, ${sp.zuege} Züge, ${sp.widrig} regelwidrig, ${sp.siege} mit Reihe · Ring bis ${sp.zuschauerMax} Zuschauer, Blick am Geschehen ${(100 * sp.blick).toFixed(1)} % von ${sp.proben} (seitab ${(100 * sp.seitab).toFixed(1)} % von ${sp.seit}) · der Tag stellt ${sp.e5}/${sp.e5n} Auftritte · der Raum des Stands: ${sp.raumN} Paare ≥ ${sp.standM} m, das nächste ${sp.raumMin.toFixed(2)} m · der Abend trägt den Weg: ${sp.wegeN} Gäste an ${sp.wegeAbende} Abenden, höchstens ${sp.wegeMax} Wege (${sp.wegeKurz}× sah der Kern ein Stück unter 0,05 h)`); // prettier-ignore
const mg = morgenGang(core.tagesPlan, core.TAGES_GESETZ.morgenPlatzH, undefined, typeof core.tagesMarkt === "function" ? core.tagesMarkt : () => [0, 0]);
if (mg.ausserFenster) st.rot.push(`MORGEN M2 das Fenster des Markts trägt den Gang nicht: ${mg.ausserFenster} Proben (je 0,05 h) am Markt außerhalb von tagesMarkt (Soll 0) — Täter: koerper tagesMarkt · _morgenGang`);
if (mg.n < 500 || mg.markt < 0.95 || mg.daheim < 0.95) st.rot.push(`MORGEN M1 der Weg zum Werk führt nicht über den Markt: ${(100 * mg.markt).toFixed(1)} % vor dem Werk am Markt, ${(100 * mg.daheim).toFixed(1)} % nach dem Aufstehen daheim, von ${mg.n} Samen (Soll ≥ 95 % und ≥ 500) — Täter: koerper _morgenGang · tagesPlan`);
console.log(`  MORGEN der Weg zum Werk über den Markt: ${(100 * mg.markt).toFixed(1)} % 0,1 h vor dem Werk am Markt, ${(100 * mg.daheim).toFixed(1)} % 0,1 h nach dem Aufstehen daheim (${mg.n} von 2000 Samen mit mehr als einer Stunde vor dem Werk) · das Fenster des Markts (tagesMarkt) trägt jede Stunde am Markt (${mg.ausserFenster} außerhalb)`);
const kn = koennenUrteil(core);
for (const z of kn.rot) st.rot.push("KÖNNEN " + z + " — Täter: koerper leibKoennen");
const vb = verbenUrteil(core);
for (const z of vb.rot) st.rot.push("VERBEN " + z + " — Täter: " + VERBEN_TAETER);
console.log(`  VERBEN der Leib der START_PARAMS: Gehen ${vb.w.speed.toFixed(3)} · Sprint ${vb.w.sprintSpeed.toFixed(3)} m/s · Sprung ${vb.h.toFixed(3)} m (Soll 1,5 · 6,8 · 0,53 ± 10 %)${vb.V ? ` · Bein ${vb.V.beinM.toFixed(4)} m, Φ ${vb.V.kraft.toFixed(3)}, Tastgrad des Sprints ${vb.tast.toFixed(4)}` : ""}`);
console.log(`  KÖNNEN lauf über das Gitter ${kn.min.toFixed(3)}–${kn.max.toFixed(3)} (Bezugs-Leib 1: die Mitte der Achsen mit 30 J) · der Median der Dreißigjährigen ${kn.median30.toFixed(4)} · START_PARAMS ${kn.start.toFixed(4)} · der Greis ohne Ton × ${kn.greis.toFixed(3)} des jungen Athleten`);
console.log(`  BESTAND Tausch ${be.sinkt} · Füllung ohne Herstellung ${be.ohneHerstellung} · Wagen ${be.geladen} geladen, ${be.abgeladen} abgeladen · Stand nach 24 h ${be.leer24} · Herstellung ${be.her.toFixed(2)}, Verbrauch ${be.ver.toFixed(2)}`);
urteilEnde(r.points < 500 || r.diffs || leer || st.rot.length, `❌ ROT — Gitter ${r.points} Punkte, ${r.diffs} Abweichungen alt↔neu, ${leer} Proben ohne Wache${st.rot.length ? " · " + st.rot.join(" · ") : ""}`, `✅ DER MENSCH IST EINER — Dial-Gitter ${r.points} Punkte, ${r.values} Werte alt==neu exakt (0 Abweichungen); Proportionen + Landmarken-Urteil identisch; DIE WACHE STEHT zu jeder Stunde; DER STOSS IM GANG: Ausfall ${st.a.ausfall.toFixed(3)} m (Masse ×2 ${st.m.ausfall.toFixed(3)}), erholt ${st.a.erholt.toFixed(3)} s; aus dem Stand ${st.s.map((x) => `${x.dv} m/s → höchstens ${x.vmax.toFixed(2)} m/s, Ruhe nach ${x.ruhe.toFixed(2)} s und ${x.weg.toFixed(1)} m`).join(" · ")}.`);
