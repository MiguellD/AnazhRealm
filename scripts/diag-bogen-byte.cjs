#!/usr/bin/env node
"use strict";
// diag-bogen-byte.cjs — V18.491.195 Byte-Beweis: Lab↔core Bogen/Feel wires
// (ARENA.bogen · ARENA.studio.labFovK · ARENA.studio.labReadyK · ARENA.studio.labBobHz/labBobAmp · ARENA.studio.labKickVDecay/labKickDecay/labShakeDecay/labShakeKill · ARENA.studio.labTrailOpacity · labRaiseK/labDrawDecay · labRebuildEps · labTargetNear/Depth · labMuzzleAlongGrip · labEnergieFallback · labLifeSec · ARENA.gefuehl · labFreeze* · labFreezeDtMul · labShake* · labKickFwdMul/labKickYMul/labRecoil* · FOV_VIS · READY_VIS · BOB_VIS · CAM_DECAY_VIS · TRAIL_VIS · FLUG_VIS · SCHUSS_VIS · MUENDUNG_VIS · FREEZE_VIS · SHAKE_VIS · RECOIL_VIS · TARGET_VIS · REBUILD_VIS · AIM_VIS · SCHUSS_DRAG_VIS · STUCK_VIS · HOLD_SWAY_VIS · KICK_VIS · Lab _bogenFov/_fovK/_readyK/_bobHz/_bobAmp/_kickVDecay/_kickDecay/_shakeDecay/_shakeKill/_trailOp/_fMin/_keMul/_fDt/_shakeKe/_kickFwd readers · bladeRadiusM coincidence · labFovK≡labBobHz named coincidence).
// Like diag-grip-byte.cjs .152. Node-only; Lab source = UTF-8 string checks.
//   node scripts/diag-bogen-byte.cjs
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "schmiede-core.js"));
const SC = globalThis.__schmiedeCore;

console.log("=== BOGEN/FEEL BYTE (Lab↔core) V18.491.195 ===");

const B = SC && SC.ARENA && SC.ARENA.bogen;
const G = SC && SC.ARENA && SC.ARENA.gefuehl;
const FV = SC && SC.FLUG_VIS;
const SDV = SC && SC.SCHUSS_DRAG_VIS;

check("ARENA.bogen.mArrow === 0.05", B && B.mArrow === 0.05, String(B && B.mArrow));
check("ARENA.bogen.minAuszugFrac === 0.25", B && B.minAuszugFrac === 0.25, String(B && B.minAuszugFrac));
check("ARENA.bogen.radiusM === 0.12", B && B.radiusM === 0.12, String(B && B.radiusM));
check("ARENA.bogen.maxFlugSec === 5", B && B.maxFlugSec === 5, String(B && B.maxFlugSec));
check("ARENA.bogen.labLuftDrag === 0.0016", B && B.labLuftDrag === 0.0016, String(B && B.labLuftDrag));
check("ARENA.bogen.labXMax === 30", B && B.labXMax === 30, String(B && B.labXMax));
check("ARENA.bogen.labStuckMax === 40", B && B.labStuckMax === 40, String(B && B.labStuckMax));
check("ARENA.bogen.labHoldSec === 0.7", B && B.labHoldSec === 0.7, String(B && B.labHoldSec));
check("ARENA.bogen.labSwayGain === 0.5", B && B.labSwayGain === 0.5, String(B && B.labSwayGain));
check("ARENA.bogen.labSwaySpread === 0.04", B && B.labSwaySpread === 0.04, String(B && B.labSwaySpread));
check("ARENA.bogen.labLifeSec === 9", B && B.labLifeSec === 9, String(B && B.labLifeSec));
check("ARENA.bogen.labEnergieFallback === 40", B && B.labEnergieFallback === 40, String(B && B.labEnergieFallback));
check("ARENA.bogen.labMuzzleAlongGrip === 0.2", B && B.labMuzzleAlongGrip === 0.2, String(B && B.labMuzzleAlongGrip));
check("ARENA.bogen.labKickBack === 5", B && B.labKickBack === 5, String(B && B.labKickBack));
check("ARENA.bogen.labKickY === 1.5", B && B.labKickY === 1.5, String(B && B.labKickY));
check("ARENA.bogen.labKickShake === 0.04", B && B.labKickShake === 0.04, String(B && B.labKickShake));
check("ARENA.bogen.labTargetNear === 0.05", B && B.labTargetNear === 0.05, String(B && B.labTargetNear));
check("ARENA.bogen.labTargetDepth === 0.35", B && B.labTargetDepth === 0.35, String(B && B.labTargetDepth));
check("ARENA.bogen.labRebuildEps === 0.05", B && B.labRebuildEps === 0.05, String(B && B.labRebuildEps));
check("ARENA.bogen.labRaiseK === 8", B && B.labRaiseK === 8, String(B && B.labRaiseK));
check("ARENA.bogen.labDrawDecay === 2", B && B.labDrawDecay === 2, String(B && B.labDrawDecay));
check("ARENA.bogen.muendungM === 1.2", B && B.muendungM === 1.2, String(B && B.muendungM));
check("ARENA.bogen.auszugSec === 0.9", B && B.auszugSec === 0.9, String(B && B.auszugSec));
check("ARENA.bogen.fovZug === 54", B && B.fovZug === 54, String(B && B.fovZug));
check("ARENA.bogen.fovRuhe === 75", B && B.fovRuhe === 75, String(B && B.fovRuhe));

check("ARENA.gefuehl.keRefJ === 114", G && G.keRefJ === 114, String(G && G.keRefJ));
check("ARENA.gefuehl.freezeMinSec === 0.04", G && G.freezeMinSec === 0.04, String(G && G.freezeMinSec));
check("ARENA.gefuehl.freezeMaxSec === 0.2", G && G.freezeMaxSec === 0.2, String(G && G.freezeMaxSec));
check("ARENA.gefuehl.labFreezeKeMul === 0.0011", G && G.labFreezeKeMul === 0.0011, String(G && G.labFreezeKeMul));
check("ARENA.gefuehl.labFreezeCleanAdd === 0.05", G && G.labFreezeCleanAdd === 0.05, String(G && G.labFreezeCleanAdd));
check("ARENA.gefuehl.labFreezeSchlagMul === 1.25", G && G.labFreezeSchlagMul === 1.25, String(G && G.labFreezeSchlagMul));
check("ARENA.gefuehl.labFreezeDtMul === 0.05", G && G.labFreezeDtMul === 0.05, String(G && G.labFreezeDtMul));
check("ARENA.gefuehl.labShakeKeMul === 0.004", G && G.labShakeKeMul === 0.004, String(G && G.labShakeKeMul));
check("ARENA.gefuehl.labShakeSchlagMul === 1.5", G && G.labShakeSchlagMul === 1.5, String(G && G.labShakeSchlagMul));
check("ARENA.gefuehl.labShakeOtherMul === 0.9", G && G.labShakeOtherMul === 0.9, String(G && G.labShakeOtherMul));
check("ARENA.gefuehl.labShakeMin === 0.02", G && G.labShakeMin === 0.02, String(G && G.labShakeMin));
check("ARENA.gefuehl.labShakeMax === 0.42", G && G.labShakeMax === 0.42, String(G && G.labShakeMax));
check("ARENA.gefuehl.labKickFwdMul === 0.012", G && G.labKickFwdMul === 0.012, String(G && G.labKickFwdMul));
check("ARENA.gefuehl.labKickYMul === 0.005", G && G.labKickYMul === 0.005, String(G && G.labKickYMul));
check("ARENA.gefuehl.labRecoilKeMul === 0.008", G && G.labRecoilKeMul === 0.008, String(G && G.labRecoilKeMul));
check("ARENA.gefuehl.labRecoilMin === 0.10", G && G.labRecoilMin === 0.10, String(G && G.labRecoilMin));
check("ARENA.gefuehl.labRecoilMax === 0.7", G && G.labRecoilMax === 0.7, String(G && G.labRecoilMax));
check("ARENA.gefuehl.stossCap === 18", G && G.stossCap === 18, String(G && G.stossCap));
check("ARENA.gefuehl.dipMin === 2.0", G && G.dipMin === 2.0, String(G && G.dipMin));
check("ARENA.gefuehl.dipMax === 6.5", G && G.dipMax === 6.5, String(G && G.dipMax));

check(
    'FLUG_VIS.lab === "life-9" && FLUG_VIS.host === "maxFlugSec-5"',
    FV && FV.lab === "life-9" && FV.host === "maxFlugSec-5",
    FV ? JSON.stringify(FV) : "missing"
);

check(
    'SCHUSS_DRAG_VIS.lab === "luft-0.0016" && SCHUSS_DRAG_VIS.host === "none"',
    SDV && SDV.lab === "luft-0.0016" && SDV.host === "none",
    SDV ? JSON.stringify(SDV) : "missing"
);

const SV = SC && SC.STUCK_VIS;
check(
    'STUCK_VIS.lab === "stuck-40" && STUCK_VIS.host === "MAX_PFEILE-16"',
    SV && SV.lab === "stuck-40" && SV.host === "MAX_PFEILE-16",
    SV ? JSON.stringify(SV) : "missing"
);

const HSV = SC && SC.HOLD_SWAY_VIS;
check(
    'HOLD_SWAY_VIS.lab === "hold-sway" && HOLD_SWAY_VIS.host === "none"',
    HSV && HSV.lab === "hold-sway" && HSV.host === "none",
    HSV ? JSON.stringify(HSV) : "missing"
);

const SCV = SC && SC.SCHUSS_VIS;
check(
    'SCHUSS_VIS.lab === "si-energie" && SCHUSS_VIS.host === "zugJouleRef-product"',
    SCV && SCV.lab === "si-energie" && SCV.host === "zugJouleRef-product",
    SCV ? JSON.stringify(SCV) : "missing"
);

const MV = SC && SC.MUENDUNG_VIS;
check(
    'MUENDUNG_VIS.lab === "grip-offset-0.2" && MUENDUNG_VIS.host === "muendungM-1.2"',
    MV && MV.lab === "grip-offset-0.2" && MV.host === "muendungM-1.2",
    MV ? JSON.stringify(MV) : "missing"
);

const KV = SC && SC.KICK_VIS;
check(
    'KICK_VIS.lab === "release-kick" && KICK_VIS.host === "none"',
    KV && KV.lab === "release-kick" && KV.host === "none",
    KV ? JSON.stringify(KV) : "missing"
);

const FRV = SC && SC.FREEZE_VIS;
check(
    'FREEZE_VIS.lab === "ke-formula" && FREEZE_VIS.host === "hitStop-lerp"',
    FRV && FRV.lab === "ke-formula" && FRV.host === "hitStop-lerp",
    FRV ? JSON.stringify(FRV) : "missing"
);

const SHV = SC && SC.SHAKE_VIS;
check(
    'SHAKE_VIS.lab === "ke-shake" && SHAKE_VIS.host === "dip-lerp"',
    SHV && SHV.lab === "ke-shake" && SHV.host === "dip-lerp",
    SHV ? JSON.stringify(SHV) : "missing"
);

const RRV = SC && SC.RECOIL_VIS;
check(
    'RECOIL_VIS.lab === "ke-kick-recoil" && RECOIL_VIS.host === "stoss-push"',
    RRV && RRV.lab === "ke-kick-recoil" && RRV.host === "stoss-push",
    RRV ? JSON.stringify(RRV) : "missing"
);

const TV = SC && SC.TARGET_VIS;
check(
    'TARGET_VIS.lab === "x-slab" && TARGET_VIS.host === "capsule-radius"',
    TV && TV.lab === "x-slab" && TV.host === "capsule-radius",
    TV ? JSON.stringify(TV) : "missing"
);

const RBV = SC && SC.REBUILD_VIS;
check(
    'REBUILD_VIS.lab === "drawFrac-eps" && REBUILD_VIS.host === "none"',
    RBV && RBV.lab === "drawFrac-eps" && RBV.host === "none",
    RBV ? JSON.stringify(RBV) : "missing"
);

const AV = SC && SC.AIM_VIS;
check(
    'AIM_VIS.lab === "raise-decay" && AIM_VIS.host === "none"',
    AV && AV.lab === "raise-decay" && AV.host === "none",
    AV ? JSON.stringify(AV) : "missing"
);

const STU = SC && SC.ARENA && SC.ARENA.studio;
check("ARENA.studio.labFovK === 9", STU && STU.labFovK === 9, String(STU && STU.labFovK));

const FOV = SC && SC.FOV_VIS;
check(
    'FOV_VIS.lab === "fov-lerp-9" && FOV_VIS.host === "none"',
    FOV && FOV.lab === "fov-lerp-9" && FOV.host === "none",
    FOV ? JSON.stringify(FOV) : "missing"
);

check("ARENA.studio.labReadyK === 16", STU && STU.labReadyK === 16, String(STU && STU.labReadyK));

const READY = SC && SC.READY_VIS;
check(
    'READY_VIS.lab === "ready-lerp-16" && READY_VIS.host === "none"',
    READY && READY.lab === "ready-lerp-16" && READY.host === "none",
    READY ? JSON.stringify(READY) : "missing"
);

check("ARENA.studio.labBobHz === 9", STU && STU.labBobHz === 9, String(STU && STU.labBobHz));
check("ARENA.studio.labBobAmp === 0.012", STU && STU.labBobAmp === 0.012, String(STU && STU.labBobAmp));

const BOB = SC && SC.BOB_VIS;
check(
    'BOB_VIS.lab === "bob-9-0.012" && BOB_VIS.host === "none"',
    BOB && BOB.lab === "bob-9-0.012" && BOB.host === "none",
    BOB ? JSON.stringify(BOB) : "missing"
);
check(
    "named coincidence: labFovK===9 AND labBobHz===9 (fields stay dual; no Fake-merge bob↔fovK)",
    STU && STU.labFovK === 9 && STU.labBobHz === 9 && STU.labFovK !== undefined && STU.labBobHz !== undefined,
    `fovK=${STU && STU.labFovK} bobHz=${STU && STU.labBobHz}`
);

check("ARENA.studio.labKickVDecay === 0.0003", STU && STU.labKickVDecay === 0.0003, String(STU && STU.labKickVDecay));
check("ARENA.studio.labKickDecay === 0.015", STU && STU.labKickDecay === 0.015, String(STU && STU.labKickDecay));
check("ARENA.studio.labShakeDecay === 0.0006", STU && STU.labShakeDecay === 0.0006, String(STU && STU.labShakeDecay));
check("ARENA.studio.labShakeKill === 0.0008", STU && STU.labShakeKill === 0.0008, String(STU && STU.labShakeKill));

const CAMD = SC && SC.CAM_DECAY_VIS;
check(
    'CAM_DECAY_VIS.lab === "kick-shake-decay" && CAM_DECAY_VIS.host === "none"',
    CAMD && CAMD.lab === "kick-shake-decay" && CAMD.host === "none",
    CAMD ? JSON.stringify(CAMD) : "missing"
);

check("ARENA.studio.labTrailOpacity === 0.72", STU && STU.labTrailOpacity === 0.72, String(STU && STU.labTrailOpacity));

const TRAIL = SC && SC.TRAIL_VIS;
check(
    'TRAIL_VIS.lab === "opacity-0.72" && TRAIL_VIS.host === "none"',
    TRAIL && TRAIL.lab === "opacity-0.72" && TRAIL.host === "none",
    TRAIL ? JSON.stringify(TRAIL) : "missing"
);

const SW = SC && SC.ARENA && SC.ARENA.schwung;
check(
    "ARENA.schwung.bladeRadiusM === 0.35 (melee; stays)",
    SW && SW.bladeRadiusM === 0.35,
    String(SW && SW.bladeRadiusM)
);
check(
    "named coincidence: labTargetDepth===0.35 AND bladeRadiusM===0.35 (fields stay dual; no Fake-merge)",
    B && B.labTargetDepth === 0.35 && SW && SW.bladeRadiusM === 0.35 && B.labTargetDepth !== undefined && SW.bladeRadiusM !== undefined,
    `depth=${B && B.labTargetDepth} blade=${SW && SW.bladeRadiusM}`
);

const labPath = path.join(root, "worlds/schmiede/schmiede.js");
const lab = fs.readFileSync(labPath, "utf8");

check("Lab has _bogenFov().minAus (or minAuszugFrac path)", lab.includes("_bogenFov().minAus") || lab.includes("minAuszugFrac"), "reader");
check("Lab has _bogenFov().radius", lab.includes("_bogenFov().radius"), "reader");
check(
    "Lab has freeze _fMin / _fMax (or freezeMinSec reader)",
    (lab.includes("_fMin") && lab.includes("_fMax")) || lab.includes("freezeMinSec"),
    "reader"
);
check(
    "Lab labFreeze coeffs reader (_keMul / _cleanAdd / _schlagMul or labFreezeKeMul)",
    (lab.includes("_keMul") && lab.includes("_cleanAdd") && lab.includes("_schlagMul")) || lab.includes("labFreezeKeMul"),
    "reader"
);
check(
    "Lab labFreezeDtMul reader (_fDt or labFreezeDtMul)",
    lab.includes("_fDt") || lab.includes("labFreezeDtMul"),
    "reader"
);
check(
    "Lab NO bare realDt*0.05 freeze dt gate",
    !/realDt\*0\.05/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare e*0.0011 freeze formula",
    !/e\*0\.0011/.test(lab),
    "bare gone"
);
check(
    "Lab labShake coeffs reader (_shakeKe / _shakeSchlag / _shakeOther / _shakeMin / _shakeMax or labShakeKeMul)",
    (lab.includes("_shakeKe") && lab.includes("_shakeSchlag") && lab.includes("_shakeOther") && lab.includes("_shakeMin") && lab.includes("_shakeMax")) || lab.includes("labShakeKeMul"),
    "reader"
);
check(
    "Lab NO bare e*0.004 shake formula",
    !/e\*0\.004/.test(lab),
    "bare gone"
);
check(
    "Lab labKick/Recoil coeffs reader (_kickFwd / _kickY / _recoilKe / _recoilMin / _recoilMax or labKickFwdMul)",
    (lab.includes("_kickFwd") && lab.includes("_kickY") && lab.includes("_recoilKe") && lab.includes("_recoilMin") && lab.includes("_recoilMax")) || lab.includes("labKickFwdMul"),
    "reader"
);
check(
    "Lab NO bare e*0.012 kickFwd",
    !/e\*0\.012/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare e*0.005 kickY",
    !/e\*0\.005/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare e*0.008 recoil",
    !/e\*0\.008/.test(lab),
    "bare gone"
);
check(
    "Lab lifeSec reader (_bogenFov().lifeSec or labLifeSec / bf.lifeSec)",
    lab.includes("_bogenFov().lifeSec") || lab.includes("labLifeSec") || lab.includes("bf.lifeSec"),
    "reader"
);
check(
    "Lab NO bare a.life>9",
    !/a\.life\s*>\s*9/.test(lab),
    "bare gone"
);
check(
    "Lab xMax reader (_bogenFov().xMax or labXMax / bf.xMax)",
    lab.includes("_bogenFov().xMax") || lab.includes("labXMax") || lab.includes("bf.xMax"),
    "reader"
);
check(
    "Lab NO bare pos.x>30 (reader+failsoft default OK)",
    !/pos\.x\s*>\s*30/.test(lab) || lab.includes("_bogenFov().xMax") || lab.includes("labXMax") || lab.includes("bf.xMax"),
    "bare gone or reader"
);
check(
    "Lab drag reader (_bogenFov().luftDrag or _BG.labLuftDrag)",
    lab.includes("_bogenFov().luftDrag") || lab.includes("_BG.labLuftDrag"),
    "reader"
);
check(
    "Lab NO bare 1-0.0016*sp (reader+failsoft default OK)",
    !/1-0\.0016\*sp/.test(lab) || lab.includes("_bogenFov().luftDrag") || lab.includes("_BG.labLuftDrag"),
    "bare gone or reader"
);
check(
    "Lab stuckMax reader (_bogenFov().stuckMax or labStuckMax / bf.stuckMax)",
    lab.includes("_bogenFov().stuckMax") || lab.includes("labStuckMax") || lab.includes("bf.stuckMax"),
    "reader"
);
check(
    "Lab NO bare stuck.length>40 (reader+failsoft default OK)",
    !/stuck\.length\s*>\s*40/.test(lab) || lab.includes("_bogenFov().stuckMax") || lab.includes("labStuckMax") || lab.includes("bf.stuckMax"),
    "bare gone or reader"
);
check(
    "Lab hold/sway reader (bf.holdSec / bf.swayGain / _bogenFov().swaySpread)",
    (lab.includes("bf.holdSec") && lab.includes("bf.swayGain")) || lab.includes("labHoldSec"),
    "reader"
);
check(
    "Lab swaySpread reader (_bogenFov().swaySpread or bf.swaySpread)",
    lab.includes("_bogenFov().swaySpread") || lab.includes("bf.swaySpread") || lab.includes("labSwaySpread"),
    "reader"
);
check(
    "Lab NO bare (holdT-0.7)*0.5",
    !/\(holdT\s*-\s*0\.7\)\s*\*\s*0\.5/.test(lab) && !/\(arena\.holdT-0\.7\)\*0\.5/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare sway*0.04",
    !/sway\s*\*\s*0\.04/.test(lab),
    "bare gone"
);
check(
    "Lab eFallback reader (_bogenFov().eFallback or labEnergieFallback / bf.eFallback)",
    lab.includes("_bogenFov().eFallback") || lab.includes("labEnergieFallback") || lab.includes("bf.eFallback"),
    "reader"
);
check(
    "Lab NO bare energie||40",
    !/energie\|\|40/.test(lab),
    "bare gone"
);
check(
    "Lab muzzle reader (_bogenFov().muzzle or labMuzzleAlongGrip / bf.muzzle)",
    lab.includes("_bogenFov().muzzle") || lab.includes("labMuzzleAlongGrip") || lab.includes("bf.muzzle"),
    "reader"
);
check(
    "Lab NO bare _gripR addScaledVector(...,0.2) doRelease muzzle",
    !/_gripR\.clone\(\)\.addScaledVector\([^)]*,\s*0\.2\s*\)/.test(lab),
    "bare gone"
);
check(
    "Lab kick reader (bf.kickBack / bf.kickY / bf.kickShake or labKick*)",
    (lab.includes("bf.kickBack") && lab.includes("bf.kickY") && lab.includes("bf.kickShake")) || lab.includes("labKickBack"),
    "reader"
);
check(
    "Lab NO bare doRelease kick cluster multiplyScalar(-5)+y+=1.5+shake=0.04",
    !/multiplyScalar\(-5\)\s*;\s*fx\.kickV\.y\s*\+=\s*1\.5\s*;\s*fx\.shake\s*=\s*0\.04/.test(lab),
    "bare gone"
);
check("Lab NO bare drawFrac<0.25", !/drawFrac\s*<\s*0\.25/.test(lab), "bare gone");
check("Lab NO bare T.R+0.12", !/T\.R\s*\+\s*0\.12/.test(lab), "bare gone");
check(
    "Lab targetNear/Depth reader (_bogenFov().targetNear / targetDepth or labTarget*)",
    (lab.includes("_bogenFov().targetNear") && lab.includes("_bogenFov().targetDepth")) || lab.includes("labTargetNear"),
    "reader"
);
check(
    "Lab NO bare T.pos.x-0.05 target X gate",
    !/T\.pos\.x\s*-\s*0\.05/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare T.pos.x+0.35 target X gate",
    !/T\.pos\.x\s*\+\s*0\.35/.test(lab),
    "bare gone"
);
check(
    "Lab rebuildEps reader (_bogenFov().rebuildEps or labRebuildEps)",
    lab.includes("_bogenFov().rebuildEps") || lab.includes("labRebuildEps"),
    "reader"
);
check(
    "Lab NO bare _builtFrac)>0.05 rebuild gate",
    !/_builtFrac\)\s*>\s*0\.05/.test(lab),
    "bare gone"
);
check(
    "Lab raiseK/drawDecay reader (_bogenFov().raiseK / drawDecay or labRaiseK/labDrawDecay)",
    (lab.includes("_bogenFov().raiseK") && lab.includes("_bogenFov().drawDecay")) || (lab.includes("labRaiseK") && lab.includes("labDrawDecay")),
    "reader"
);
check(
    "Lab NO bare realDt*8 raise lerp",
    !/realDt\*8/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare realDt*2 drawFrac decay",
    !/drawFrac-realDt\*2/.test(lab) && !/arena\.drawFrac=Math\.max\(0,arena\.drawFrac-realDt\*2\)/.test(lab),
    "bare gone"
);
check(
    "Lab FOV lerp reader (_fovK or labFovK)",
    lab.includes("_fovK") || lab.includes("labFovK"),
    "reader"
);
check(
    "Lab NO bare dt*9 in applyCamera FOV lerp",
    !/dt\*9/.test(lab),
    "bare gone"
);
check(
    "Lab ready lerp reader (_readyK or labReadyK)",
    lab.includes("_readyK") || lab.includes("labReadyK"),
    "reader"
);
check(
    "Lab NO bare realDt*16 in melee ready lerp",
    !/arena\.ready=lerp\([^;]*realDt\*16/.test(lab),
    "bare gone"
);
check(
    "Lab bob reader (_bobHz / _bobAmp or labBobHz / labBobAmp)",
    (lab.includes("_bobHz") && lab.includes("_bobAmp")) || (lab.includes("labBobHz") && lab.includes("labBobAmp")),
    "reader"
);
check(
    "Lab NO bare getElapsedTime()*9 in applyCamera bob",
    !/getElapsedTime\(\)\*9/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare arena.bob*0.012 in applyCamera bob",
    !/arena\.bob\*0\.012/.test(lab),
    "bare gone"
);
check(
    "Lab cam decay reader (_kickVDecay / _kickDecay / _shakeDecay / _shakeKill or labKickVDecay)",
    (lab.includes("_kickVDecay") && lab.includes("_kickDecay") && lab.includes("_shakeDecay") && lab.includes("_shakeKill")) || lab.includes("labKickVDecay"),
    "reader"
);
check(
    "Lab NO bare Math.pow(0.0003,dt) kickV decay",
    !/Math\.pow\(0\.0003\s*,\s*dt\)/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare fx.kick.multiplyScalar(Math.pow(0.015,dt))",
    !/fx\.kick\.multiplyScalar\(Math\.pow\(0\.015\s*,\s*dt\)\)/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare Math.pow(0.0006,dt) shake decay",
    !/Math\.pow\(0\.0006\s*,\s*dt\)/.test(lab),
    "bare gone"
);
check(
    "Lab NO bare fx.shake<0.0008 kill",
    !/fx\.shake\s*<\s*0\.0008/.test(lab),
    "bare gone"
);
check(
    "Lab trail opacity reader (_trailOp or labTrailOpacity)",
    lab.includes("_trailOp") || lab.includes("labTrailOpacity"),
    "reader"
);
check(
    "Lab NO bare opacity:0.72 in ensureTrailMesh",
    !/function\s+ensureTrailMesh\s*\([^)]*\)\s*\{[\s\S]*?opacity\s*:\s*0\.72/.test(lab),
    "bare gone"
);

try {
    require(path.join(root, "fachwerk-core.js"));
    const FC = globalThis.__fachwerkCore;
    const BV = FC && FC.BEGEH_VIS;
    const BG = FC && FC.BEGEH_GESETZ;
    check(
        'BEGEH_VIS.lab === "g-20" && BEGEH_GESETZ.g === 20',
        BV && BV.lab === "g-20" && BG && BG.g === 20,
        BV && BG ? `vis=${JSON.stringify(BV)} g=${BG.g}` : "missing"
    );
} catch (e) {
    check("optional fachwerk-core BEGEH_VIS load", false, String(e && e.message));
}

if (errs.length) {
    console.log(`\n❌ ROT — ${errs.length} fail: ${errs.join("; ")}`);
    process.exit(1);
}
console.log("\n✅ GRÜN — Bogen/Feel Byte-Beweis: ARENA.bogen/ARENA.studio.labFovK/labReadyK/labBobHz/labBobAmp/labKickVDecay/labKickDecay/labShakeDecay/labShakeKill/labTrailOpacity/labRaiseK/labDrawDecay/labRebuildEps/labTarget*/labMuzzleAlongGrip/labEnergieFallback/labLifeSec/gefuehl/labFreeze*/labFreezeDtMul/labShake*/labKick*/labRecoil* + FOV_VIS + READY_VIS + BOB_VIS + CAM_DECAY_VIS + TRAIL_VIS + FLUG_VIS + SCHUSS_VIS + MUENDUNG_VIS + FREEZE_VIS + SHAKE_VIS + RECOIL_VIS + TARGET_VIS + REBUILD_VIS + AIM_VIS + SCHUSS_DRAG_VIS + STUCK_VIS + HOLD_SWAY_VIS + KICK_VIS + Lab readers + bladeRadiusM coincidence + labFovK≡labBobHz coincidence + BEGEH_VIS.");
process.exit(0);
